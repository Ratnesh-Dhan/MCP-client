import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";

export const transport = new StdioClientTransport({
  command: "pnpm",
  args: ["start"],
});
