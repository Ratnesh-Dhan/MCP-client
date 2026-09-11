// import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentState } from "./state.js";
import { getAgentTools } from "./tools.js";
import { createOllamaModel } from "./nodes/llm.js";
import { buildAgentGraphType } from "../types/allTypes.js";
import { getCurrentNetwork } from "../services/currentNetworkDB.js";
import { webAgentGraph } from "./subgraphs/webAgent/graph.js";
import { webResearchTool } from "./subgraphs/asTools/webAgentTool.js";
import {
  AIMessage,
  SystemMessage,
  ToolMessage,
  trimMessages,
} from "@langchain/core/messages";
import { MCPToolNode } from "./nodes/MCPToolNode.js";
import { main_prompt } from "../lib/prompts.js";
import { createSummaryModel, summarizeNode } from "./nodes/summary.js";

export async function buildAgentGraph({
  model,
  serverName,
}: buildAgentGraphType) {
  const tools = await getAgentTools(serverName);

  const llmWithTools = await createOllamaModel(model, [
    ...tools,
    webResearchTool,
  ]);

  // Summarizer initialization
  const summarizerModel = await createSummaryModel(model);

  const messageTrimmer = trimMessages({
    maxTokens: 10,
    strategy: "last",
    tokenCounter: (msgs) => msgs.length,
    includeSystem: true,
    startOn: "human",
  });

  async function llmNode(state: typeof AgentState.State) {
    console.log("LANGGRAPH: Calling Ollama");
    // Context History (below)
    const trimmedMessages = await messageTrimmer.invoke(state.messages);
    const systemPrompt = new SystemMessage(main_prompt);
    const summaryPrompt = new SystemMessage(`
      Previous conversation summary:
      ${state.summary || "No previous conversation summary."}
      `);
    const toolHistoryPrompt = new SystemMessage(`
        Recent tool executions:
        ${JSON.stringify(state.toolHistory.slice(-10), null, 2)}
      `);

    const fullPromptArray = [
      systemPrompt,
      summaryPrompt,
      toolHistoryPrompt,
      ...trimmedMessages,
    ];
    // Context History (above)
    const responseMessage = await llmWithTools.invoke(fullPromptArray); //state.messages
    console.log("LANGGRAPH: Ollama response: ", responseMessage.content);
    console.log(
      "LANGGRAPH: Tool calls: ",
      JSON.stringify(responseMessage.tool_calls, null, 2),
    );
    console.log("LANGGRAPH: Message count: ", state.messages.length);

    return { messages: [responseMessage], llmCalls: 1 };
  }

  const webSearchAgent = await webAgentGraph(model, getCurrentNetwork()["url"]);

  // const toolNode = new ToolNode(tools, {
  //   handleToolErrors: true,
  // });
  const mcpToolNode = new MCPToolNode(tools);

  function routeAfterLLM(state: typeof AgentState.State) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
    if (lastMessage.tool_calls?.length) {
      const wantsWebResearch = lastMessage.tool_calls.some(
        (tc) => tc.name === "webResearch",
      );
      if (wantsWebResearch) return "webResearch";
      return "tools";
    }
    return END;
  }

  // Summary router
  const SUMMARY_TRIGGER = 14;
  function routeAfterSummaryCheck(state: typeof AgentState.State) {
    const unsummarizedCount =
      state.messages.length - state.summarizedMessageCount;

    if (unsummarizedCount > SUMMARY_TRIGGER) {
      return "summarize";
    }

    return "llm";
  }
  // Summary router

  return (
    new StateGraph(AgentState)
      .addNode("maybeSummarize", (state) => state)
      .addNode("summarize", (state) => summarizeNode(state, summarizerModel))
      .addNode("llm", llmNode)
      .addNode("tools", mcpToolNode.invoke.bind(mcpToolNode))
      // .addNode("tools", (state) => mcpToolNode.invoke(state))
      .addNode("webResearch", async (state) => {
        console.log("Node webResearch");
        const lastMessage = state.messages[
          state.messages.length - 1
        ] as AIMessage;
        const call = lastMessage.tool_calls!.find(
          (tc) => tc.name === "webResearch",
        );
        if (!call) {
          throw new Error(
            "webResearch node reached without a webResearch call.",
          );
        }

        if (!call.id) {
          throw new Error(
            "Invalid webResearch tool call: missing tool_call_id.",
          );
        }
        const task = (call.args as { task: string }).task;
        console.log("TASK::: ", task);
        try {
          const response = await webSearchAgent.invoke({
            task: task,
          });
          console.log(response);
          return {
            messages: [
              new ToolMessage({
                tool_call_id: call.id,
                content: response.result,
              }),
            ],
            toolHistory: [
              {
                toolCallId: call.id,
                tool: call.name,
                args: call.args,
                success: true,
              },
            ],
          };
        } catch (error) {
          return {
            messages: [
              new ToolMessage({
                tool_call_id: call.id,
                content:
                  error instanceof Error
                    ? error.message
                    : JSON.stringify(error),
              }),
            ],
            toolHistory: [
              {
                toolCallId: call.id,
                tool: "webResearch",
                args: call.args,
                success: false,
                error:
                  error instanceof Error
                    ? error.message
                    : JSON.stringify(error),
              },
            ],
          };
        }
      })

      // .addEdge(START, "llm")
      .addEdge(START, "maybeSummarize")

      .addConditionalEdges("maybeSummarize", routeAfterSummaryCheck, {
        summarize: "summarize",
        llm: "llm",
      })
      .addEdge("summarize", "llm")

      .addConditionalEdges("llm", routeAfterLLM, {
        tools: "tools",
        webResearch: "webResearch",
        [END]: END,
      })

      .addEdge("tools", "llm")
      .addEdge("webResearch", "llm")

      .compile()
  );
}
// Conditional Edge for mcpToolNode if there is no other routing envolved
// .addConditionalEdges("llm", (state) => {
//   const lastMessage = state.messages.at(-1);

//   if (
//     lastMessage?.type === "ai" &&
//     "tool_calls" in lastMessage &&
//     lastMessage.tool_calls?.length
//   ) {
//     return "tools";
//   }

//   return END;
// }, {
//   tools: "tools",
//   [END]: END,
// })

// // Custom Router Node
// function routerCondition(state: typeof AgentState.State) {
//   const lastMessage = state.messages[state.messages.length - 1];
//   // Check if the last message is a tool call
//   if (lastMessage.toolHistory && lastMessage.tool_calls.length > 0) {
//     return "tools";
//   }
//   // Look at the LLM's text content. If it mentions needing deep research, route to the sub-graph
//   if (
//     lastMessage.content &&
//     typeof lastMessage.content === "string" &&
//     lastMessage.content.includes("[TRIGGER_RESEARCH]")
//   ) {
//     return "researcher_agent";
//   }
//   return END;
// }

//      PARENT GRAPH
//           │
//           ▼
//          LLM
//           │
// ┌─────────┴──────────┐
// │                    │
// MCP call          webResearch call
// │                    │
// ▼                    ▼
// MCPToolNode        Research Subgraph
//                      │
//                      ▼
//                Deep Agent
//                      │
//                      ▼
//                Tavily tools
//                      │
//                      ▼
//                  result
//                      │
//            ┌────────────────────┴───────┐
//            │                            │
//            ▼                            ▼
//         ToolMessage                 toolHistory
//        actual result               execution metadata
//            │                            │
//            └────────────┬───────────────┘
//                         ▼
//                        LLM

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
