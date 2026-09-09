import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

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

    console.log(`MCP connected: ${name}`);

    return client;
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
    }
  }
}

export const mcpManager = new MCPManager();
