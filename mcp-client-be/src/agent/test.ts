import { connectMCP } from "../services/mcp.js";
import { buildAgentGraph } from "./graph.js";
import { HumanMessage } from "@langchain/core/messages";

await connectMCP("jinah", "pnpm", ["start"], "D:\\Codes\\jinah");
const graph = await buildAgentGraph({
  model: "qwen3.6:27b",
  serverName: "jinah",
});

const result = await graph.invoke({
  messages: [
    new HumanMessage("Use the available tool to list 'D:\\Models' direcotry"),
  ],
});

console.dir(result, {
  depth: null,
});
