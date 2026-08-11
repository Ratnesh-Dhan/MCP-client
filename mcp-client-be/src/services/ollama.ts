import { Ollama } from "ollama";
import { ollama, ollamaURL } from "../lib/ollama.js";
import { Chat } from "../types/allTypes.js";
import path from "node:path";
import fs from "node:fs/promises";

export const listModles = () => ollama.list();

export const showModel = (model: string) => ollama.show({ model });

export const chat = async ({ messages, model }: Chat) => {
  const chatOllama = new Ollama({ host: ollamaURL });

  const stream = await chatOllama.chat({
    model,
    messages,
    stream: true,
  });

  return {
    chatOllama,
    stream,
  };
};

export const getLinks = async () => {
  try {
    const db = await fs.readFile(
      path.join(process.cwd(), "/dummy_database/model_network.json"),
      "utf-8",
    );
    return JSON.parse(db);
  } catch (error) {
    console.log("Error reading dummy database file :", error);
    return [];
  }
};
