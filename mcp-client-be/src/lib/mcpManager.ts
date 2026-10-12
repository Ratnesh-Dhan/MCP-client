import { getLiveMcpServer, getMcpTools } from "../db/queries.js";
import { Server } from "../types/allTypes.js";

class MCP {
  // private servers: Server[] = [];
  private servers: Map<number, Server> = new Map();

  async load() {
    const IncommingServers = await getLiveMcpServer();
    // this.servers = IncommingServers.map((server) => ({
    //   id: server.id,
    //   name: server.name,
    // }));
    IncommingServers.forEach((server) => {
      const db = getMcpTools(server.id);
      const tools: string[] = [];
      console.log("DB: ", db);
      this.servers.set(server.id, { name: server.name, tools: tools ?? null });
    });
  }
  getServers() {
    return this.servers;
  }

  addServer(server: { id: number; name: string }) {
    // const isAlready = this.servers.some((s) => s.name === server.name);
    // if (!isAlready) {
    //   this.servers.push(server);
    // }
    if (!this.servers.has(server.id)) {
      this.servers.set(server.id, { name: server.name });
    }
  }

  addTools(serverName: string, tools: string[]) {
    for (const [id, server] of this.servers) {
      if (server.name === serverName) {
        this.servers.set(id, { name: server.name, tools: tools });
      }
    }
  }

  removeServer(serverName: string) {
    // this.servers = this.servers.filter((s) => s.name !== server);
    for (const [id, server] of this.servers) {
      if (server.name === serverName) {
        this.servers.delete(id);
        return;
      }
    }
  }
}

export const mcps = new MCP();
