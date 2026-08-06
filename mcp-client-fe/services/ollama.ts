import { ollama } from "@/lib/ollama";
import { Chat } from "@/types/allTypes";

export const listModels = () => ollama.list();

export const chat = ({ messages, model }: Chat) =>
  ollama.chat({
    model,
    messages,
    stream: true,
  });

export const showModel = (model: string) => ollama.show({ model });
