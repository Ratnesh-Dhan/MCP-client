import { Router } from "express";
import {
  connectMCP,
  listMCPTools,
  callMCPTool,
  disconnectMCP,
} from "../services/mcp.js";
import { addMcpServer, getMcpServers } from "../db/queries.js";
import { mcps } from "../lib/mcpManager.js";

const MCProuter = Router();

// Old obsolete connection code
MCProuter.post("/connect_old", async (req, res) => {
  try {
    const { name, command, args, cwd } = req.body;
    await connectMCP(name, command, args ?? [], {}, cwd);
    res.json({ success: true, server: name });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Connection failed.",
    });
  }
});

// Connect MCP server
MCProuter.post("/connect", async (req, res) => {
  try {
    const { name, command, args, cwd } = req.body;
    const client = await connectMCP(name, command, args ?? [], {}, cwd);
    if (client) {
      const data = {
        name: name,
        command: command,
        args: args ?? [],
        cwd: cwd ?? "",
      };
      const [db_result] = await addMcpServer(data);
      mcps.addServer({ id: db_result.id, name: name });
      res.json({ success: true, server: name, id: db_result.id });
    } else {
      res.json({ success: false, server: name });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Connection failed.",
    });
  }
});

// Get tools
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
    mcps.removeServer(req.body.server);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to Disconnect",
    });
  }
});

// GET all MCP servers
MCProuter.get("/get-all", async (req, res) => {
  try {
    const servers = await getMcpServers();
    res.status(200).json({ success: true, servers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error });
  }
});

export default MCProuter;
