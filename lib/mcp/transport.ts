import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";

export const trnasport = new StdioClientTransport({
  command: "pnpm",
  args: ["start"],
});
