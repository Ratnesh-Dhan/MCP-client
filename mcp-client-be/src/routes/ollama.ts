import { Router } from "express";

import { listModles, showModel, chat, getLinks } from "../services/ollama.js";
import { setUrl } from "../store/store.js";

const OllamaRouter = Router();

OllamaRouter.get("/networks", async (req, res) => {
  try {
    const links = await getLinks();
    setUrl(links[0]["url"]);
    res.status(200).json(links);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Error while getting links.",
    });
  }
});

OllamaRouter.post("/set-network", async (req, res) => {
  try {
    const { network } = req.body;
    console.log(network);
    setUrl(network);
    res.status(200).json({ success: true, network: network });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Error while setting network.",
    });
  }
});

OllamaRouter.get("/models", async (req, res) => {
  try {
    const network = req.headers["x-ollama-network"];

    if (!network || Array.isArray(network)) {
      return res.status(400).json({
        error: "Ollama network is required.",
      });
    }

    const models = await listModles(network);
    res.status(200).json(models);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Error while listing models.",
    });
  }
});

OllamaRouter.post("/show", async (req, res) => {
  try {
    const { model } = req.body;
    const result = await showModel(model);
    res.status(200).json({ success: true, result: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Error while showing model.",
    });
  }
});

OllamaRouter.post("/chat", async (req, res) => {
  try {
    const { messages, model } = req.body;
    const { chatOllama, stream } = await chat({ messages, model });

    let finished = false;

    req.on("close", () => {
      if (finished) return;
      console.log("Client disconnected → aborting Ollama");
      chatOllama.abort();
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");

    for await (const chunk of stream) {
      res.write(chunk.message.content);
    }
    finished = true;
    res.end();
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Ollama generation aborted");
      return;
    }
    console.error("Ollama chat error: ", error);
    if (!res.headersSent) {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Error while chatting with ollama.",
      });
    } else {
      res.end();
    }
  }
});

export default OllamaRouter;
