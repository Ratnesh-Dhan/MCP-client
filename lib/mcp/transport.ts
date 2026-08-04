import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio";

const trnasport = new StdioClientTransport({
  command: "pnpm",
  args: ["start"],
});
