import { MemorySaver } from "@langchain/langgraph";
import { buildAgentGraph } from "./graph.js";

const checkpointer = new MemorySaver();
const graphCache = new Map<string, any>();

export async function getAgentGraph(model: string, serverName: string) {
  const key = `${model}:${serverName}`;
  let graph = graphCache.get(key);
  if (!graph) {
    graph = await buildAgentGraph({ model, serverName, checkpointer });
    graphCache.set(key, graph);
  }
  return graph;
}
