import { Router } from "express";
import {
  connectMCP,
  listMCPTools,
  callMCPTool,
  disconnectMCP,
} from "../services/mcp.js";

const MCProuter = Router();

MCProuter.post("/connect", async (req, res) => {
  try {
    const { name, command, args, cwd } = req.body;
    await connectMCP(name, command, args ?? [], cwd);
    res.json({ success: true, server: name });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Connection failed.",
    });
  }
});

MCProuter.get("/tools", async (req, res) => {
  try {
    const server = req.query.server as string;
    const tools = await listMCPTools(server);
    res.json({ server, tools });
  } catch (error) {
    res
      .status(500)
      .json({ error: error instanceof Error ? error.message : "Failed" });
  }
});

MCProuter.post("/call", async (req, res) => {
  try {
    const { server, tool, arguments: args } = req.body;
    const result = await callMCPTool(server, tool, args ?? {});
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Tool calling failed.",
    });
  }
});

MCProuter.post("/disconnect", async (req, res) => {
  try {
    await disconnectMCP(req.body.server);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to Disconnect",
    });
  }
});

export default MCProuter;
