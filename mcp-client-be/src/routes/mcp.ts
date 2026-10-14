import { Router } from "express";
import {
  connectMCP,
  listMCPTools,
  callMCPTool,
  disconnectMCP,
} from "../services/mcp.js";
import {
  addMcpServer,
  addMcpTool,
  deleteMcpServer,
  getMcpServer,
  getMcpServers,
  getMcpTools,
  toggleMCPServer,
} from "../db/queries.js";
import { mcps } from "../lib/mcpManager.js";
import { DbMCPServer, DbTool } from "../types/allTypes.js";
import { mcpEvents } from "../lib/mcpEvents.js";

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

// Connect MCP server on new ADD
MCProuter.post("/add", async (req, res) => {
  try {
    const { name, command, args, cwd } = req.body;
    const client = await connectMCP(name, command, args ?? [], {}, cwd);
    console.log("Client connected.");
    const rawTools = await listMCPTools(name);

    if (client) {
      const data = {
        name: name,
        command: command,
        args: args ?? [],
        cwd: cwd ?? "",
        enabled: true,
      };
      const [db_result] = await addMcpServer(data);
      const tools: DbTool[] = [];

      for (const tool of rawTools) {
        const [db_tool] = await addMcpTool({
          mcpServerId: db_result.id,
          name: tool.name,
          enabled: true,
        });
        tools.push({
          id: db_tool.id,
          mcpServerId: db_tool.mcpServerId,
          name: db_tool.name,
          enabled: db_tool.enabled,
        });
      }
      mcps.addServer({ id: db_result.id, name: name });
      res.json({ success: true, server: name, id: db_result.id, tools: tools });
    } else {
      res.json({ success: false, server: name });
    }
  } catch (error) {
    console.log("Connection failed.");
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

// Toggle disconnect
MCProuter.post("/disconnect", async (req, res) => {
  try {
    await disconnectMCP(req.body.name);
    console.log(`MCP server $${req.body.name} disconnected.`);
    mcps.removeServer(req.body.name);
    await toggleMCPServer(req.body.id, false);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to Disconnect",
    });
  }
});

// Toggle connect
MCProuter.post("/connect", async (req, res) => {
  try {
    const { id } = req.body;
    const server = await getMcpServer(id);
    if (server.length < 1) throw new Error("MCP server not found in DB.");
    const { name, command, args, cwd } = server[0];
    await connectMCP(
      name,
      command,
      (args as string[]) ?? [],
      {},
      cwd ?? undefined,
    );
    const result = await toggleMCPServer(id, true);
    console.log(`MCP server id connected. \n ${result}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to Connect",
    });
  }
});

// GET all MCP servers
MCProuter.get("/get-all", async (req, res) => {
  try {
    const servers: DbMCPServer[] = await getMcpServers();
    for (const server of servers) {
      const tools: DbTool[] = await getMcpTools(server.id);
      server.tools = tools;
    }
    res.status(200).json({ success: true, servers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error });
  }
});

// Delete MCP server
MCProuter.delete("/delete", async (req, res) => {
  try {
    const { serverName, id } = req.body;
    await disconnectMCP(serverName);
    mcps.removeServer(serverName);
    const [result] = await deleteMcpServer(id);
    console.log("Deleted MCP server: ", result);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to Delete MCP Server",
    });
  }
});

// MCP server status events
MCProuter.get("/mcpStatusEvents", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  const sendStatus = (status: unknown) => {
    res.write(`event: mcp-status\n`);
    res.write(`data: ${JSON.stringify(status)}\n\n`);
  };

  mcpEvents.on("status", sendStatus);

  req.on("close", () => {
    mcpEvents.off("status", sendStatus);
  });
});

export default MCProuter;
