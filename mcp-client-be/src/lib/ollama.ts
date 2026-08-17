import { Ollama } from "ollama";
import { getCurrentNetwork } from "../services/currentNetworkDB.js";

// export const ollamaURL = "http://172.19.6.68:11434";
// export const ollamaURL = "http://172.19.6.242:11434";

export const ollama = new Ollama({
  //   host: "http//127.0.0.1:11434",
  host:
    getCurrentNetwork()["url"] !== ""
      ? getCurrentNetwork()["url"]
      : "http://127.0.0.1:11434",
});

// export const ollama = new Ollama();
