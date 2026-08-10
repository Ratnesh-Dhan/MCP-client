import { Ollama } from "ollama";

export const ollamaURL = "http://172.19.6.68:11434";

export const ollama = new Ollama({
  //   host: "http//127.0.0.1:11434",
  host: ollamaURL,
});

// export const ollama = new Ollama();
