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
    const responseMessage = await llmWithTools.invoke(state.messages);
    console.log("LANGGRAPH: Ollama response: ", responseMessage.content);
    console.log("LANGGRAPH: Tool calls: ", responseMessage.tool_calls);
    return { messages: [responseMessage] };
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

// LangGraph Router Node (Inside the Graph Architecture) IF WE WANT TO ROUTE FROM GRAPH

//           ┌───────────────┐
//           │  START Node   │
//           └───────┬───────┘
//                   │
//           ┌───────▼───────┐
//           │ Classifier    │
//           └───────┬───────┘
//                   │
//     ┌─────────────┴─────────────┐
//     │ Conditional Router Edge   │
//     └──────┬─────────────┬──────┘
//            │             │
// (Needs Tools)         (Direct Chat)
//            │             │
//   ┌────────▼──────┐     ┌▼──────────────┐
//   │ LLM with      │     │ Plain LLM     │
//   │ Tools Node    │     │ Node          │
//   └───────┬───────┘     └────────┬──────┘
//           │                      │
//   ┌───────▼───────┐              │
//   │ Tools Node    │              │
//   └───────┬───────┘              │
//           └──────────────┬───────┘
//                          │
//                   ┌──────▼──────┐
//                   │     END     │
//                   └─────────────┘

// import { StateGraph, START, END } from "@langchain/langgraph";
// import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
// import { ChatOllama } from "@langchain/ollama";
// import { AgentState } from "./state.js";
// import { getAgentTools } from "./tools.js";

// export async function buildAgentGraph({ model, serverName }: buildAgentGraphType) {
//   const tools = await getAgentTools(serverName);

//   // Base LLM without tools bound
//   const plainLlm = new ChatOllama({ model, baseUrl: getCurrentNetwork()["url"] });
//   // LLM with tools bound
//   const llmWithTools = plainLlm.bindTools(tools);

//   // Node 1: Fast Direct Chat (No tool overhead)
//   async function directChatNode(state: typeof AgentState.State) {
//     const response = await plainLlm.stream(state.messages);
//     let fullResponse: any = null;
//     for await (const chunk of response) {
//       fullResponse = fullResponse ? fullResponse.concat(chunk) : chunk;
//     }
//     return { messages: [fullResponse] };
//   }

//   // Node 2: Agent LLM Node (Supports Tool Calls)
//   async function agentLlmNode(state: typeof AgentState.State) {
//     const response = await llmWithTools.stream(state.messages);
//     let fullResponse: any = null;
//     for await (const chunk of response) {
//       fullResponse = fullResponse ? fullResponse.concat(chunk) : chunk;
//     }
//     return { messages: [fullResponse] };
//   }

//   // Router Edge Function
//   function routeMessage(state: typeof AgentState.State) {
//     const lastMessage = state.messages[state.messages.length - 1];
//     const text = typeof lastMessage.content === "string" ? lastMessage.content.toLowerCase() : "";

//     // Regex or simple heuristic check
//     const toolKeywords = ["search", "file", "fetch", "read", "mcp", "execute", "database"];
//     const needsAgent = toolKeywords.some((keyword) => text.includes(keyword));

//     return needsAgent ? "agent_llm" : "direct_chat";
//   }

//   const toolNode = new ToolNode(tools);

//   return new StateGraph(AgentState)
//     .addNode("direct_chat", directChatNode)
//     .addNode("agent_llm", agentLlmNode)
//     .addNode("tools", toolNode)

//     // Start with routing logic
//     .addConditionalEdges(START, routeMessage, {
//       direct_chat: "direct_chat",
//       agent_llm: "agent_llm",
//     })

//     // Direct chat goes straight to END
//     .addEdge("direct_chat", END)

//     // Agent flow loops through tools condition
//     .addConditionalEdges("agent_llm", toolsCondition, {
//       tools: "tools",
//       [END]: END,
//     })
//     .addEdge("tools", "agent_llm")

//     .compile();
// }
