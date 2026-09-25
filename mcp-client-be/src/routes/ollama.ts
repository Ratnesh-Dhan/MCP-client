import { Router } from "express";

import { listModles, showModel, chat, getLinks } from "../services/ollama.js";
import { setCurrentNetwork } from "../services/currentNetworkDB.js";
import { getUserSettings, updateModel, updateNetwork } from "../db/queries.js";
import { ModelNetwork, ModelOnNetwork } from "../db/zodSchema.js";

const OllamaRouter = Router();

OllamaRouter.get("/networks", async (req, res) => {
  try {
    const [links, userSettings] = await Promise.all([
      getLinks(),
      getUserSettings(),
    ]);
    setCurrentNetwork({ url: links[0]["url"] });
    // res.status(200).json(links);
    console.log({ userSettings, links });
    res.status(200).json({ userSettings, links });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Error while getting links.",
    });
  }
});

OllamaRouter.get("/userSettings", async (req, res) => {
  try {
    const userSettings = await getUserSettings();
    res.status(200).json(userSettings);
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Error while getting user Settings.",
    });
  }
});

OllamaRouter.post("/add-network", async (req, res) => {
  try {
    const result = ModelNetwork.safeParse(req.body);
    if (!result.success) {
      console.log("Fuck happend");
      return res.status(400).json({
        error: result.error,
      });
    }
    console.log("calling add network query", result.data);
    const db_result = await updateNetwork(result.data.modelNetwork);
    console.log("calling add network query/");
    console.log({ db_result });
    res.status(201).json(db_result);
  } catch (error) {
    res.status(422).json({
      error: error instanceof Error ? error.message : "Adding network failed.",
    });
  }
});

OllamaRouter.post("/set-model", async (req, res) => {
  try {
    const result = ModelOnNetwork.safeParse(req.body);
    if (!result.success) {
      console.log("Fuck happend");
      return res.status(400).json({
        error: result.error,
      });
    }
    const db_result = updateModel(result.data);
    res.status(201).json(db_result);
  } catch (error) {
    res.status(422).json({
      error:
        error instanceof Error
          ? error.message
          : "Adding model name in DB failed.",
    });
  }
});

OllamaRouter.post("/set-network", async (req, res) => {
  try {
    console.log("Hitting set-network ROUTE.");
    const { network } = req.body;
    console.log(network);
    setCurrentNetwork({ url: network });
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
