import type { Message, Tool } from "ollama";
import { ollama } from "../lib/ollama.js";
import { listMCPTools, callMCPTool } from "./mcp.js";
import { MCPContent } from "../types/allTypes.js";

export async function getOllamaTools(serverName: string): Promise<Tool[]> {
  const mcpTools = await listMCPTools(serverName);

  return mcpTools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description ?? "",
      parameters: tool.inputSchema as Tool["function"]["parameters"],
    },
  }));
}

export async function runAgent(
  model: string,
  messages: Message[],
  serverName: string,
) {
  const tools = await getOllamaTools(serverName);
  const conversation: Message[] = [
    {
      role: "system",
      content:
        "You are an AI assistant with access to external tools. Use tools when they are useful to answer the user's request. After receiving a tool result, use it to answer the user.",
    },
    ...messages,
  ];

  const MAX_ITERATIONS = 10;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    console.log(`Agent Iteration ${i + 1} of ${MAX_ITERATIONS}`);

    const response = await ollama.chat({
      model,
      messages: conversation,
      tools,
      stream: false,
    });

    console.log("Ollama response: ", JSON.stringify(response.message, null, 2));

    // Add Ollama's response to conversation
    conversation.push(response.message);

    const toolCalls = response.message.tool_calls;

    // No tool call - final answer.
    if (!toolCalls?.length) return response;

    // Execute every tool requested by Ollama.
    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name;
      const args = toolCall.function.arguments;
      console.log("MCP TOOL: ", toolName);
      console.log("MCP ARGS: ", args);

      try {
        const result = await callMCPTool(serverName, toolName, args);
        console.log("MCP RESULT: ", JSON.stringify(result, null, 2));

        const content = result.content as MCPContent[];
        const toolContent = content
          .filter(
            (item): item is MCPContent & { text: string } =>
              item.type === "text" && typeof item.text === "string",
          )
          .map((item) => item.text)
          .join("\n");

        conversation.push({
          role: "tool",
          content: toolContent,
          tool_name: toolName,
        });
      } catch (error) {
        console.error(`Tool "${toolName}" failed:`, error);

        conversation.push({
          role: "tool",
          content: `Tool execution failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          tool_name: toolName,
        });
      }
    }
  }
  throw new Error(`Agent exceeded maximum iterations (${MAX_ITERATIONS})`);
}
