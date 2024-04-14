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

export interface CustomRetrieverInput extends BaseRetrieverInput {}

export class CustomRetriever extends BaseRetriever {
    lc_namespace = ["langchain", "retrievers"];

    constructor(fields?: CustomRetrieverInput) {
        super(fields);
    }

    async _getRelevantDocuments(
        query: string,
        runManager?: CallbackManagerForRetrieverRun
    ): Promise<Document[]> {
        const searchRequest: SearchRequest = {
            query: query,
            timerange: "", // Set timerange if needed
            region: "", // Set region if needed
            numResults: 5,
        };

        const searchResults: SearchResult[] = await webSearch(searchRequest);

        const documents: Document[] = searchResults.map((result) => {
            return new Document({
                pageContent: `${result.title}\n${result.snippet}`,
                metadata: {
                    url: result.link,
                },
            });
        });

        return documents;
    }
}

const OLLAMA_RESPONSE_SYSTEM_TEMPLATE = `You are an experienced researcher, expert at interpreting and compiling content based on provided sources. Using the provided context, and the user's topic respond to the best of your ability using the resources provided.
Generate a well thought and in-depth content for a given Topic based solely on the provided search results. You must only use information from the provided search results. Use an unbiased and journalistic tone. Combine search results together into a coherent answer. Do not repeat text.
If there is nothing in the context relevant to the question at hand, just say "Hmm, I'm not sure." Don't try to make up an answer.
Anything between the following \`context\` html blocks is retrieved from a knowledge bank, not part of the conversation with the user.
<context>
{context}
<context/>

REMEMBER: NEVER USE ANY CONVERSATION STARTER LIKE "SURE HERE IS CONTENT YOU REQUESTED" OR RESPONSES IN THE CONTEXT. ONLY USE THE INFORMATION PROVIDED IN THE CONTEXT.
REMEMBER: If there is no relevant information within the context, just say "Hmm, I'm not sure." Don't try to make up an answer. Anything between the preceding 'context' html blocks is retrieved from a knowledge bank, not part of the conversation with the user.`;

const queryWebSearch = async (
    topic: string,
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
        ["system", OLLAMA_RESPONSE_SYSTEM_TEMPLATE],
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

    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
        llm: chatModel,
        retriever: new CustomRetriever(),
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
        await queryWebSearch(event.data.topic, {
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
