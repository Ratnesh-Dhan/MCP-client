import { AIMessage, ToolMessage } from "@langchain/core/messages";
import type { StructuredToolInterface } from "@langchain/core/tools";
import type { ToolExecution } from "../state.js";
import type { AgentState } from "../state.js";

export class MCPToolNode {
  private readonly tools: Map<string, StructuredToolInterface>;

  constructor(tools: StructuredToolInterface[]) {
    this.tools = new Map(tools.map((tool) => [tool.name, tool]));
  }

  async invoke(state: typeof AgentState.State) {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;

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

    // Gathering promise before adding on state
    const executions = await Promise.all(
      toolCalls.map(async (toolCall) => {
        const args = (toolCall.args ?? {}) as Record<string, unknown>;

        if (!toolCall.id) {
          const error = `Tool call "${toolCall.name}" is missing a tool call ID.`;

          console.error(`LANGGRAPH: ${error}`);
          throw new Error(
            `Invalid tool call: "${toolCall.name}" is missing tool_call_id.`,
          );
        }

        const tool = this.tools.get(toolCall.name);
        if (!tool) {
          const error = `Tool "${toolCall.name}" is not registered.`;
          return {
            message: new ToolMessage({
              content: error,
              tool_call_id: toolCall.id,
              name: toolCall.name,
            }),
            history: {
              toolCallId: toolCall.id,
              tool: toolCall.name,
              args,
              success: false,
              error,
            } satisfies ToolExecution,
          };
        }
        try {
          console.log(`LANGGRAPH: Executing tool "${toolCall.name}"`);
          console.log("LANGGRAPH: Tool args:", args);
          const result = await tool.invoke(args);
          console.log(`LANGGRAPH: Tool "${toolCall.name}" succeeded`);
          return {
            message: new ToolMessage({
              content:
                typeof result === "string" ? result : JSON.stringify(result),
              tool_call_id: toolCall.id,
              name: toolCall.name,
            }),
            history: {
              toolCallId: toolCall.id,
              tool: toolCall.name,
              args,
              success: true,
            } satisfies ToolExecution,
          };
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.error(`LANGGRAPH: Tool "${toolCall.name}" failed.`, error);
          return {
            message: new ToolMessage({
              content:
                `Tool execution failed.\n` +
                `Tool: ${toolCall.name}\n` +
                `Error: ${errorMessage}`,
              tool_call_id: toolCall.id,
              name: toolCall.name,
            }),
            history: {
              toolCallId: toolCall.id,
              tool: toolCall.name,
              args,
              success: false,
              error: errorMessage,
            } satisfies ToolExecution,
          };
        }
      }),
    );
    // Gathering promise before adding on state
    return {
      messages: executions.map((execution) => execution.message),
      toolHistory: executions.map((execution) => execution.history),
    };
  }
}
