import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { mcpEvents } from "./mcpEvents.js";

type MCPConnection = {
  client: Client;
  transport: StdioClientTransport;
};

class MCPManager {
  private connections = new Map<string, MCPConnection>();

  async connect(
    name: string,
    command: string,
    args: string[] = [],
    env: Record<string, string> = {},
    cwd?: string,
    version?: string,
  ) {
    // Don't connect twice
    if (this.connections.has(name)) {
      return this.connections.get(name)!.client;
    }
    console.log("Before connecting.");
    mcpEvents.emit("status", {
      name,
      status: "connecting",
    });
    try {
      const client = new Client({
        name: name,
        version: version === undefined ? "1.0.0" : version,
      });

      // Process.env things
      const processEnv: Record<string, string> = {};
      for (const [key, value] of Object.entries(process.env)) {
        if (value !== undefined) {
          processEnv[key] = value;
        }
      }
      // Process.env things
      console.log("ARGS: ", args);
      console.log("COMMAND: ", command);
      console.log("CWD: ", cwd);

      const transport = new StdioClientTransport({
        command,
        args,
        cwd,
        env: {
          ...processEnv,
          ...env,
        },
        // env: {
        //   ...(process.env as Record<string, string>),
        //   ...env,
        // },
      });

      await client.connect(transport);

      this.connections.set(name, {
        client,
        transport,
      });

      console.log("After connecting.");
      mcpEvents.emit("status", {
        name,
        status: "connected",
      });

      console.log(`MCP connected: ${name}`);

      return client;
    } catch (error) {
      mcpEvents.emit("status", {
        name,
        status: "failed",
        error: error instanceof Error ? error.message : "Connection failed",
      });
    }
  }

  getClient(name: string) {
    return this.connections.get(name)?.client;
  }

  isConnected(name: string) {
    return this.connections.has(name);
  }

  async disconnect(name: string) {
    const connection = this.connections.get(name);

    if (!connection) return;

    await connection.client.close();

    this.connections.delete(name);

    console.log(`MCP disconnected: ${name}`);
  }

  async disconnectAll() {
    for (const name of this.connections.keys()) {
      await this.disconnect(name);
      console.log(`${name} Disconnected.`);
    }
  }
}

export const mcpManager = new MCPManager();
