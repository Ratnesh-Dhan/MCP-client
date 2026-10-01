import { getLiveMcpServer } from "../db/queries.js";

type Server = {
  id: number;
  name: string;
};
class MCP {
  private servers: Server[] = [];
  // Need to make something for tools so we do not save tool on off on db
  async load() {
    const IncommingServers = await getLiveMcpServer();
    this.servers = IncommingServers.map((server) => ({
      id: server.id,
      name: server.name,
    }));
  }
  getServers() {
    return this.servers;
  }

  addServer(server: Server) {
    const isAlready = this.servers.some((s) => s.name === server.name);
    if (!isAlready) {
      this.servers.push(server);
    }
  }
  removeServer(server: string) {
    this.servers = this.servers.filter((s) => s.name !== server);
  }
}

export const mcps = new MCP();
