import { Router } from "express";
import { runAgentStream } from "../services/langGraphAgentRunner.js";

const LangGraphAgentRouter = Router();

LangGraphAgentRouter.post("/", async (req, res) => {
  try {
    const { model, messages, server } = req.body;

    if (!model || !messages || !server) {
      return res
        .status(400)
        .json({ error: "model, messages & server are required." });
    }

    const controller = new AbortController();
    req.on("aborted", () => {
      console.warn("Client aborted request");
      controller.abort();
    });
    res.on("close", () => {
      if (!res.writableFinished) {
        console.warn("Client connection closed");
        controller.abort();
      }
    });
    // Set Server-Sent Events (SSE) headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const generator = await runAgentStream({
      model,
      messages,
      serverName: server,
      signal: controller.signal,
    });
    for await (const chunk of generator) {
      if (controller.signal.aborted) break;
      // Send as SSE payload
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    if (!res.writableEnded) res.end();
  } catch (error) {
    if (error instanceof Error && error.message === "Agent aborted") {
      console.log("Agent run aborted cleanly.");
      return;
    }
    console.error("Agent execution error: ", error);

    if (!res.headersSent) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Agent execution failed.",
      });
    } else {
      res.write(
        `data: ${JSON.stringify({ type: "error", message: "Execution error occurred." })}]\n\n`,
      );
      res.end();
    }
  }
});

export default LangGraphAgentRouter;
