import { Ollama } from "ollama";
import { ollama } from "../lib/ollama.js";
import { Chat } from "../types/allTypes.js";

export const listModles = () => ollama.list();

export const showModel = (model: string) => ollama.show({model});

export const chat = async({ messages, model }: Chat) => {
    const chatOllama = new Ollama();

    const stream = await chatOllama.chat({
        model,
        messages,
        stream: true,
    });

    return {
        chatOllama, stream
    }
}