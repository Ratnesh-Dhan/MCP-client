import { ToolMessage, type BaseMessage } from "@langchain/core/messages";

import type { StructuredToolInterface } from "@langchain/core/tools";

import type { ToolExecution } from "../state.js";
import type { AgentState } from "../state.js";

export class MCPToolNode {
  private readonly tools: Map<string, StructuredToolInterface>;

  constructor(tools: StructuredToolInterface[]) {
    this.tools = new Map(tools.map((tool) => [tool.name, tool]));
  }

  async invoke(state: typeof AgentState.State) {
    const lastMessage = state.messages[state.messages.length - 1];

    /*
     * The tool node should only execute tools from
     * an AIMessage.
     */
    if (!lastMessage || lastMessage.type !== "ai") {
      return {};
    }

    const toolCalls = lastMessage.tool_calls ?? [];

    if (toolCalls.length === 0) {
      return {};
    }

    const toolHistory: ToolExecution[] = [];

    /*
     * Execute tool calls in parallel.
     *
     * This preserves the useful behavior of LangGraph's
     * ToolNode without hiding execution metadata from us.
     */
    const toolMessages = await Promise.all(
      toolCalls.map(async (toolCall) => {
        const tool = this.tools.get(toolCall.name);

        if (!tool) {
          const error = `Tool "${toolCall.name}" is not registered.`;

          toolHistory.push({
            tool: toolCall.name,
            args: toolCall.args ?? {},
            success: false,
            error,
          });

          return new ToolMessage({
            content: error,
            tool_call_id: toolCall.id,
            name: toolCall.name,
          });
        }

        try {
          console.log(`LANGGRAPH: Executing tool "${toolCall.name}"`);

          console.log("LANGGRAPH: Tool args:", toolCall.args);

          const result = await tool.invoke(toolCall.args);

          console.log(`LANGGRAPH: Tool "${toolCall.name}" succeeded`);

          toolHistory.push({
            tool: toolCall.name,
            args: toolCall.args ?? {},
            success: true,
          });

          return new ToolMessage({
            content:
              typeof result === "string" ? result : JSON.stringify(result),
            tool_call_id: toolCall.id,
            name: toolCall.name,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          console.error(`LANGGRAPH: Tool "${toolCall.name}" failed:`, error);

          toolHistory.push({
            tool: toolCall.name,
            args: toolCall.args ?? {},
            success: false,
            error: errorMessage,
          });

          /*
           * IMPORTANT:
           *
           * Don't throw here.
           *
           * The LLM needs to receive the failure as a
           * ToolMessage so it can decide whether to retry,
           * use another tool, or tell the user.
           */
          return new ToolMessage({
            content:
              `Tool execution failed.\n` +
              `Tool: ${toolCall.name}\n` +
              `Error: ${errorMessage}`,
            tool_call_id: toolCall.id,
            name: toolCall.name,
          });
        }
      }),
    );

    return {
      messages: toolMessages,

      toolHistory,

      iteration: state.iteration + 1,
    };
  }
}
