import { Router } from "express";
import { runAgent } from "../services/agent.js";

const AgentRouter = Router();

AgentRouter.post("/", async (req, res) => {
  try {
    const { model, messages, server } = req.body;

    if (!model || !messages || !server)
      return res
        .status(400)
        .json({ error: "model, messge & server are required." });

    // Abort controller for specific request.
    const controller = new AbortController();
    // browser disconnected / cancelled request.
    // req.on("close", () => {
    //   if (!res.writableEnded) {
    //     console.log("Client disconnected -> aborting agent");
    //     controller.abort();
    //   }
    // });
    req.on("aborted", () => {
      console.log("Client aborted request");
      controller.abort();
    });

    res.on("close", () => {
      if (!res.writableFinished) {
        console.log("Client connection closed");
        controller.abort();
      }
    });

    const { stream } = await runAgent({
      model,
      messages,
      serverName: server,
      signal: controller.signal,
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Transfer-Encoding", "chunked");

    // Stream final Ollama response
    // for await (const chunk of result.stream) {
    for await (const text of stream) {
      if (controller.signal.aborted) break;
      // res.write(chunk.message.content);
      res.write(text);
    }

    if (!res.writableEnded) res.end();
  } catch (error) {
    if (error instanceof Error && error.message === "Agent aborted") {
      console.log("Agent aborted");
      return;
    }
    console.error("Agent error: ", error);

    if (!res.headersSent) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Agent execution failed.",
      });
    } else {
      res.end();
    }
  }
});

export default AgentRouter;
