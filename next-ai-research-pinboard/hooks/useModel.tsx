import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { getOllamaModels } from "@/actions/get-ollama";

export interface model {
    name: string;
    provider: string;
}

interface useModel {
    models: model[];
    setModels: () => void;
    currentModel: model;
    setCurrentModel: (model: model) => void;
    chatGptApiKey: string;
    setChatGptApiKey: (key: string) => void;
    chatGptApi: string;
    setChatGptApi: (api: string) => void;
    ollamaApiUrl: string;
    setOllamaApiUrl: (url: string) => void;
}

export const useModel = create(
    persist<useModel>(
        (set, get) => ({
            models: [],
            setModels: async () => {
                const cachedModels = get().models;
                if (cachedModels.length === 0) {
                    const models = await getOllamaModels(get().ollamaApiUrl);
                    if (models.length !== 0) {
                        set({ models });
                        set({ currentModel: models[0] });
                    } else {
                        set({
                            currentModel: {
                                name: "gpt-3.5-turbo-instruct", // Defaults to "gpt-3.5-turbo-instruct" if no model provided.",
                                provider: "OpenAI",
                            },
                        });
                    }
                }
            },
            currentModel: { name: "", provider: "" },
            setCurrentModel: (model: model) => {
                set({ currentModel: model });
            },
            chatGptApiKey: "",
            setChatGptApiKey: (key: string) => {
                set({ chatGptApiKey: key });
            },
            chatGptApi: "",
            setChatGptApi: (api: string) => {
                set({ chatGptApi: api });
            },
            ollamaApiUrl: process.env.NEXT_PUBLIC_OLLAMA_BASE_URL || "",
            setOllamaApiUrl: (url: string) => {
                set({ ollamaApiUrl: url });
                set({ models: [] });
                get().setModels();
            },
        }),
        {
            name: "model-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
