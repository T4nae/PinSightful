import axios from "axios";
import { model } from "@/hooks/useModel";

export async function getOllamaModels(ollamaUrl: string): Promise<model[]> {
    try {
        let models: model[] = [];
        let res = await axios.get(`${ollamaUrl}/api/tags`, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        let data = res.data.models;
        for (let i = 0; i < data.length; i++) {
            models.push({
                name: data[i].name,
                provider: "Ollama",
            });
        }
        return models;
    } catch (error) {
        return [];
    }
}
