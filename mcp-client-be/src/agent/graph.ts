// import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { StateGraph, START, END } from "@langchain/langgraph";
import { AgentState, ToolExecution } from "./state.js";
import { getAgentTools } from "./tools.js";
import { createOllamaModel } from "./nodes/llm.js";
import { buildAgentGraphType } from "../types/allTypes.js";
import { getCurrentNetwork } from "../services/currentNetworkDB.js";
import { webAgentGraph } from "./subgraphs/webAgent/graph.js";
import { webResearchTool } from "./subgraphs/asTools/webAgentTool.js";
import { AIMessage, SystemMessage, ToolMessage, trimMessages } from "@langchain/core/messages";
import { MCPToolNode } from "./nodes/MCPToolNode.js";
import { main_prompt } from "../lib/prompts.js";

export async function buildAgentGraph({
  model,
  serverName,
}: buildAgentGraphType) {
  const tools = await getAgentTools(serverName);

  const llmWithTools = await createOllamaModel(model, [
    ...tools,
    webResearchTool,
  ]);

  const messageTrimmer = trimMessages({maxTokens: 10, strategy: "last", tokenCounter: (msgs)=>msgs.length, includeSystem: true, startOn: "human"})

  async function llmNode(state: typeof AgentState.State) {
    console.log("LANGGRAPH: Calling Ollama");
    const trimmedMessages = await messageTrimmer.invoke(state.messages)
    const systemPrompt = new SystemMessage(main_prompt);
    const toolHistoryPrompt = new SystemMessage(`
        Previous tool executions:
        ${JSON.stringify(state.toolHistory, null, 2)}
      `)

    const fullPromptArray = [systemPrompt, toolHistoryPrompt, ...trimmedMessages];
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

  return (
    new StateGraph(AgentState)
      .addNode("llm", llmNode)
      // .addNode("tools", toolNode)
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
        const response = await webSearchAgent.invoke({
          task: task,
        });
        console.log(response);
          const executionRecord: ToolExecution = {
            toolCallId: call.id,
            tool: call.name,
            args: call.args,
            success: true
          };
        return {
          // subgraphResults: [
          //   {
          //     id: call.id,
          //     agent: "webResearch",
          //     success: true,
          //     result: response.result,
          //   },
          // ],
          messages: [
            new ToolMessage({
              tool_call_id: call.id,
              content: response.result,
            }),
          ],
          // 2. Triggers the custom array reducer: [...current, ...update]
          toolHistory: [executionRecord]
        };
      })

      .addEdge(START, "llm")

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

// latest Graph Architecture
//       ┌─────────────────────┐
//       │     Parent Graph    │
//       │                     │
//       │ AgentState          │
//       │                     │
//       │ messages            │
//       │ toolHistory         │
//       │ iteration           │
//       │ subgraphResults     │
//       └──────────┬──────────┘
//                  │
//          routing decision
//                  │
// ┌────────────────┼────────────────┐
// │                │                │
// ▼                ▼                ▼
// tools         webResearch           END
// │                │
// │                ▼
// │       ┌──────────────────┐
// │       │ Research Graph   │
// │       │                  │
// │       │ ResearchState    │
// │       │                  │
// │       │ task             │
// │       │ result           │
// │       └────────┬─────────┘
// │                │
// │                ▼
// │       ┌──────────────────┐
// │       │   Deep Agent     │
// │       │                  │
// │       │ private state    │
// │       │ planning         │
// │       │ tools            │
// │       │ messages         │
// │       │ etc.             │
// │       └────────┬─────────┘
// │                │
// └────────────────┼───────────────┐
//                  ▼               │
//             Parent LLM ◄─────────┘
//                  │
//                  ▼
//                 END

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
