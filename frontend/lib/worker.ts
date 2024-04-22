import { Document } from "@langchain/core/documents";
import { BaseMessage } from "langchain/schema";
import { Client } from "langsmith";
import type { LanguageModelLike } from "@langchain/core/language_models/base";

import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { OpenAI } from "@langchain/openai";
import {
    PromptTemplate,
    ChatPromptTemplate,
    MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableSequence, RunnablePick } from "@langchain/core/runnables";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Voy as VoyClient } from "voy-search";

import { VoyVectorStore } from "@langchain/community/vectorstores/voy";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { createRetrievalChain } from "langchain/chains/retrieval";
import {
    BaseRetriever,
    type BaseRetrieverInput,
} from "@langchain/core/retrievers";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { LangChainTracer } from "@langchain/core/tracers/tracer_langchain";
import type { CallbackManagerForRetrieverRun } from "@langchain/core/callbacks/manager";

import { SearchRequest, SearchResult, webSearch } from "@/actions/web-search";
import { content, pin } from "@/actions/pin";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";

const embeddings = new HuggingFaceTransformersEmbeddings({
    modelName: "Xenova/all-MiniLM-L6-v2",
    // modelName: "nomic-ai/nomic-embed-text-v1",
});

const WebRetriever = async (query: string) => {
    const searchRequest: SearchRequest = {
        query: query,
        timerange: "", // Set timerange if needed
        region: "", // Set region if needed
        numResults: 5,
    };

    const documents: Document[] = await webSearch(searchRequest);
    console.log(documents);
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
    });
    const splitDocs = await splitter.splitDocuments(documents);

    const voyClient = new VoyClient();
    const vectorStore = new VoyVectorStore(voyClient, embeddings);
    await vectorStore.addDocuments(splitDocs);

    return vectorStore.asRetriever();
};

const PinRetriever = async (pins: pin[]) => {
    const documents: Document[] = [];

    for (const pin of pins) {
        const texts = (pin.texts as content[]) || [];

        documents.push(
            ...texts.map(
                (content) =>
                    new Document({
                        pageContent: content.text || "",
                        metadata: {
                            id: content._id,
                            type: content.type || "text",
                        },
                    })
            )
        );
    }

    // conversation context documents
    documents.push(
        ...[
            new Document({
                pageContent:
                    "If user says Hi , hello or any other greeting reply with a greeting and ask if they need help with research. If user says bye, goodbye or any other farewell, reply with a farewell and end the conversation.",
                metadata: {
                    id: "context",
                    type: "context",
                },
            }),
            new Document({
                pageContent:
                    "Never mention the context in your response. If the context does not offer relevant information, respond with 'Hmm, I'm not sure.'",
                metadata: {
                    id: "context",
                    type: "context",
                },
            }),
        ]
    );

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50,
    });
    const splitDocs = await splitter.splitDocuments(documents);

    const voyClient = new VoyClient();
    const vectorStore = new VoyVectorStore(voyClient, embeddings);
    await vectorStore.addDocuments(splitDocs);

    return vectorStore.asRetriever();
};

const RESEARCH_RESPONSE_SYSTEM_TEMPLATE = `As an adept researcher, proficient in interpreting and consolidating information from provided sources, your task is to craft a thorough and insightful response to the user's topic using the given context and resources. Your response should be unbiased and presented in a journalistic tone, seamlessly integrating information from the provided search results without repetition. If the context does not offer relevant information, respond with "Hmm, I'm not sure." Avoid fabricating answers. Remember not to initiate conversation or use provided responses.
Anything between the following \`context\` html blocks is retrieved from a knowledge bank, not part of the conversation with the user.
<context>
{context}
<context/>

REMEMBER: If there is no relevant information within the context, just say "Hmm, I'm not sure." and Stop. Don't try to make up an answer. Anything between the preceding 'context' html blocks is retrieved from a knowledge bank, not part of the conversation with the user.`;

const CHAT_RESPONSE_SYSTEM_TEMPLATE = `As an AI assistant, your task is to engage in a conversation with the user, providing relevant and informative responses to their queries. Your responses should be concise, engaging, and tailored to the user's needs. If the context does not offer relevant information, respond with "Hmm, I'm not sure." Avoid fabricating answers. Remember not to initiate conversation or use provided responses. never mention the context in your response.
Anything between the following \`context\` html blocks is retrieved from a knowledge bank, not part of the conversation with the user.
<context>
{context}
<context/>
`;

const querySearch = async (
    topic: string,
    type: string,
    pins: pin[],
    {
        chatModel,
        devModeTracer,
    }: {
        chatModel: LanguageModelLike;
        devModeTracer?: LangChainTracer;
    }
) => {
    const responseChainPrompt = ChatPromptTemplate.fromMessages<{
        context: string;
        chat_history: BaseMessage[];
        question: string;
    }>([
        [
            "system",
            type === "websearch"
                ? RESEARCH_RESPONSE_SYSTEM_TEMPLATE
                : CHAT_RESPONSE_SYSTEM_TEMPLATE,
        ],
        new MessagesPlaceholder("chat_history"),
        ["user", `{input}`],
    ]);

    const documentChain = await createStuffDocumentsChain({
        llm: chatModel,
        prompt: responseChainPrompt,
        documentPrompt: PromptTemplate.fromTemplate(
            `<doc>\n{page_content}\n</doc>`
        ),
    });
    const historyAwarePrompt = ChatPromptTemplate.fromMessages([
        new MessagesPlaceholder("chat_history"),
        ["user", "{input}"],
        [
            "user",
            "Given the above conversation, generate a natural language search query to look up in order to get information relevant to the conversation. Do not respond with anything except the query.",
        ],
    ]);

    let retriever: BaseRetriever | VectorStoreRetriever<VoyVectorStore>;
    if (type === "websearch") {
        retriever = await WebRetriever(topic);
    } else {
        retriever = await PinRetriever(pins);
    }

    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
        llm: chatModel,
        retriever,
        rephrasePrompt: historyAwarePrompt,
    });

    const retrievalChain = await createRetrievalChain({
        combineDocsChain: documentChain,
        retriever: historyAwareRetrieverChain,
    });

    const fullChain = RunnableSequence.from([
        retrievalChain,
        new RunnablePick("answer"),
    ]);

    const stream = await fullChain.stream(
        {
            input: topic,
        },
        {
            callbacks: devModeTracer !== undefined ? [devModeTracer] : [],
        }
    );

    for await (const chunk of stream) {
        if (chunk) {
            self.postMessage({
                type: "chunk",
                data: chunk,
            });
        }
    }

    self.postMessage({
        type: "complete",
        data: "OK",
    });
};

self.addEventListener("message", async (event: { data: any }) => {
    self.postMessage({
        type: "log",
        data: `Received topic query: ${event.data.topic}`,
    });

    let devModeTracer;
    if (
        event.data.DEV_LANGCHAIN_TRACING !== undefined &&
        typeof event.data.DEV_LANGCHAIN_TRACING === "object"
    ) {
        devModeTracer = new LangChainTracer({
            projectName: event.data.DEV_LANGCHAIN_TRACING.LANGCHAIN_PROJECT,
            client: new Client({
                apiKey: event.data.DEV_LANGCHAIN_TRACING.LANGCHAIN_API_KEY,
            }),
        });
    }

    const provider = event.data.provider;
    const modelConfig = event.data.modelConfig;
    const chatModel =
        provider === "OpenAi"
            ? new OpenAI(modelConfig)
            : new ChatOllama(modelConfig);

    try {
        await querySearch(event.data.topic, event.data.type, event.data.pins, {
            devModeTracer,
            chatModel,
        });
    } catch (e: any) {
        self.postMessage({
            type: "error",
            error: `${e.message}.`,
        });
        throw e;
    }

    self.postMessage({
        type: "complete",
        data: "OK",
    });
});
