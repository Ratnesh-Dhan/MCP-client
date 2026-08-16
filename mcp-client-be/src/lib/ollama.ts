import { Ollama } from "ollama";
import { getUrl } from "../store/store.js";

// export const ollamaURL = "http://172.19.6.68:11434";
// export const ollamaURL = "http://172.19.6.242:11434";

export const ollamaURL = getUrl() !== "" ? getUrl() : "http://127.0.0.1:11434";

export const ollama = new Ollama({
  //   host: "http//127.0.0.1:11434",
  host: ollamaURL,
});

// export const ollama = new Ollama();
