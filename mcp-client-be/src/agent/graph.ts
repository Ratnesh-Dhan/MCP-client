import { StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { AgentState } from "./state.js";
import { getAgentTools } from "./tools.js";
import { createOllamaModel } from "./nodes/llm.js";
import { buildAgentGraphType } from "../types/allTypes.js";

export async function buildAgentGraph({
  model,
  serverName,
}: buildAgentGraphType) {
  const tools = await getAgentTools(serverName);

  const llmWithTools = await createOllamaModel(model, tools);

  async function llmNode(state: typeof AgentState.State) {
    console.log("LANGGRAPH: Calling Ollama");
    const response = await llmWithTools.invoke(state.messages);
    console.log("LANGGRAPH: Ollama response: ", response.content);
    console.log("LANGGRAPH: Tool calls: ", response.tool_calls);
    return { messages: [response] };
  }

  const toolNode = new ToolNode(tools);

  return new StateGraph(AgentState)
    .addNode("llm", llmNode)
    .addNode("tools", toolNode)

    .addEdge(START, "llm")

    .addConditionalEdges("llm", toolsCondition, {
      tools: "tools",
      [END]: END,
    })

    .addEdge("tools", "llm")

    .compile();
}
