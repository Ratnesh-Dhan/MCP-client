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

    const result = await runAgent(model, messages, server);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Agent error: ", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Agent execution failed.",
    });
  }
});

export default AgentRouter;
