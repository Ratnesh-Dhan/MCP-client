import type { Message, Tool } from "ollama";
import { ollama } from "@/lib/ollama";
import { callMCPTool, listMCPTools } from "./mcp";
import { convertSegmentPathToStaticExportFilename } from "next/dist/shared/lib/segment-cache/segment-value-encoding";

const getOllamaTools = async (serverName: string): Promise<Tool[]> => {
  const mcpTools = await listMCPTools(serverName);

  return mcpTools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description ?? "",
      parameters: tool.inputSchema as Tool["function"]["parameters"],
    },
  }));
};

export const runAgent = async (
  model: string,
  messages: Message[],
  serverName: string,
) => {
  // get tools from MCP server
  const tools = await getOllamaTools(serverName);

  // Original array wont be disturbed
  const conversation: Message[] = [
    {
      role: "system",
      content:
        "You are an assistant with access to tools. When a tool result is provided, use that result to answer the user's request.",
    },
    ...messages,
  ];

  // Ask Ollama
  const response = await ollama.chat({
    model,
    messages: conversation,
    tools,
    stream: false,
  });

  conversation.push(response.message);
  const toolCalls = response.message.tool_calls;

  // No tools requested -> normal response
  if (!toolCalls?.length) return response;

  // Execute request tools
  for (const toolCall of toolCalls) {
    const toolName = toolCall.function.name;
    const args = toolCall.function.arguments;

    console.log("Calling MCP tool:", toolName);
    console.log("Arguments:", args);

    const result = await callMCPTool(serverName, toolName, args);
    console.log("MCP result: ", result);

    conversation.push({
      role: "tool",
      content: JSON.stringify(result.content ?? result),
      //   tool_name: toolName, // If typescript complains, then remove this line
    });
    console.log("tool content: ", result);

    console.log(
      "CONVERSATION BEFORE FINAL:",
      JSON.stringify(conversation, null, 2),
    );

    // Giving the tool result back to Ollama
    const finalResponse = await ollama.chat({
      model,
      messages: conversation,
      //   tools,
      stream: false,
    });
    return finalResponse;
  }
};
