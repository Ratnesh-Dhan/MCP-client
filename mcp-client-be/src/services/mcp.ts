import { getLiveMcpServer } from "../db/queries.js";
import { mcpManager } from "../lib/manager.js";
import { mcps } from "../lib/mcpManager.js";

export async function connectMCP(
  name: string,
  command: string,
  args: string[],
  env?: Record<string, string>,
  cwd?: string,
  version?: string,
) {
  return mcpManager.connect(name, command, args, env, cwd, version);
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

export async function connectConfiguredMCPServers() {
  const servers = await getLiveMcpServer();
  console.log("This is the live servers from DB : ", servers);
  await Promise.all(
    servers.map(async (server) => {
      try {
        await connectMCP(
          server.name,
          server.command,
          (server.args as string[]) ?? [],
          server.apiKey ?? {},
          server.cwd ?? undefined,
        );
        mcps.addServer({
          id: server.id,
          name: server.name,
          category: server.category,
        });
        return { name: server.name, status: "connected" };
      } catch (error) {
        return {
          name: server.name,
          connected: false,
          error: error instanceof Error ? error.message : "Connection failed",
        };
      }
    }),
  );
}
