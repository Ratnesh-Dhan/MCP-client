// import { mcpManager } from "@/lib/mcp/manager";

import { mcpManager } from "../lib/manager.js";

export async function connectMCP(
  name: string,
  command: string,
  args: string[],
  cwd?: string,
) {
  return mcpManager.connect(name, command, args, cwd);
}

export async function listMCPTools(server: string) {
  const client = mcpManager.getClient(server);

  if (!client) {
    throw new Error(`MCP server "${server}" is not connected`);
  }

  const result = await client.listTools();

  return result.tools;
}

export async function listResources(server: string) {
  const client = mcpManager.getClient(server);
  if (!client) {
    throw new Error(`MCP server ${server} is not connected.`);
  }
  const result = await client.listResources();
  if (result.resources) return result.resources;
  return [];
}

export async function readResources(server: string, uri: string) {
  const client = mcpManager.getClient(server);
  if (!client) {
    throw new Error(`MCP server ${server} is not connect.`);
  }
  return client.readResource({ uri });
}

export async function callMCPTool(
  server: string,
  tool: string,
  args: Record<string, unknown>,
) {
  const client = mcpManager.getClient(server);

  if (!client) {
    throw new Error(`MCP server "${server}" is not connected`);
  }

  return client.callTool({
    name: tool,
    arguments: args,
  });
}

export async function disconnectMCP(server: string) {
  return mcpManager.disconnect(server);
}
