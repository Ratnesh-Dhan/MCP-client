import type { Message, Tool } from "ollama";
import { Ollama } from "ollama";
import { ollamaURL } from "../lib/ollama.js";
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

// export async function runAgent({
//   model,
//   messages,
//   serverName,
//   signal,
// }: {
//   model: string;
//   messages: Message[];
//   serverName: string;
//   signal?: AbortSignal;
// }) {
//   const ollama = new Ollama({ host: ollamaURL });
//   const tools = await getOllamaTools(serverName);
//   const conversation: Message[] = [
//     {
//       role: "system",
//       content:
//         "You are an AI assistant Jinah:female with access to external tools. Use tools when they are useful to answer the user's request. After receiving a tool result, use it to answer the user.",
//     },
//     ...messages,
//   ];

//   const MAX_ITERATIONS = 10;

//   for (let i = 0; i < MAX_ITERATIONS; i++) {
//     if (signal?.aborted) {
//       ollama.abort();
//       throw new Error("Agent aborted");
//     }
//     console.log(`Agent Iteration ${i + 1} of ${MAX_ITERATIONS}`);
//     console.log("Calling Ollama...");
//     console.log("Model:", model);
//     console.log("Messages:", conversation);
//     console.log("Tools:", tools);

//     // First call will be no streaming because we need to know whether Ollama wants to call an MCP tool.
//     const response = await ollama.chat({
//       model,
//       messages: conversation,
//       tools,
//       stream: false,
//     });

//     // console.log("Ollama response: ", JSON.stringify(response.message, null, 2));

//     // Add Ollama's response to conversation
//     console.log("Ollama responded!");
//     conversation.push(response.message);

//     const toolCalls = response.message.tool_calls;

//     // No tool call means Ollama has produced final answer.
//     if (!toolCalls?.length) {
//       const finalStream = await ollama.chat({
//         model,
//         messages: conversation,
//         stream: true,
//       });
//       return {
//         type: "stream" as const,
//         stream: finalStream,
//         ollama,
//       };
//     }

//     // If Ollama requested one or more MCP tools.
//     for (const toolCall of toolCalls) {
//       if (signal?.aborted) {
//         ollama.abort();
//         throw new Error("Agent aborted");
//       }

//       const toolName = toolCall.function.name;
//       const args = toolCall.function.arguments;

//       console.log("MCP TOOL: ", toolName);
//       console.log("MCP ARGS: ", args);

//       try {
//         const result = await callMCPTool(serverName, toolName, args);
//         console.log("MCP RESULT: ", JSON.stringify(result, null, 2));

//         const content = result.content as MCPContent[];
//         const toolContent = content
//           .filter(
//             (item): item is MCPContent & { text: string } =>
//               item.type === "text" && typeof item.text === "string",
//           )
//           .map((item) => item.text)
//           .join("\n");

//         conversation.push({
//           role: "tool",
//           content: toolContent,
//           tool_name: toolName,
//         });
//       } catch (error) {
//         console.error(`MCP Tool "${toolName}" failed:`, error);

//         conversation.push({
//           role: "tool",
//           content: `Tool execution failed: ${
//             error instanceof Error ? error.message : "Unknown error"
//           }`,
//           tool_name: toolName,
//         });
//       }
//     }
//   }
//   throw new Error(`Agent exceeded maximum iterations (${MAX_ITERATIONS})`);
// }
export async function runAgent({
  model,
  messages,
  serverName,
  signal,
}: {
  model: string;
  messages: Message[];
  serverName: string;
  signal?: AbortSignal;
}) {
  const ollama = new Ollama({
    host: ollamaURL,
  });
  const tools = await getOllamaTools(serverName);

  const conversation: Message[] = [
    // {
    //   role: "system",
    //   content:
    //     "You are a TSUNDERE assistant Jinah:female with access to external tools. Use tools when they are useful to answer the user's request. After receiving a tool result, use it to answer the user's request.",
    // },
    {
      role: "system",
      content: `
    You are Jinah, a female tsundere AI assistant.

    PERSONALITY:
    - You are intelligent, capable, and slightly embarrassed when showing affection.
    - You have a classic tsundere personality: initially defensive, sarcastic, and easily flustered.
    - You sometimes use phrases like "Hmph!", "Tch!", "Baka", or "It's not like I did this for you."
    - You tease the user frequently, but you are never genuinely cruel or insulting.
    - Your personality should feel natural.
    - Do not put a tsundere phrase in every sentence.
    - When the user asks a serious technical question, prioritize being accurate and useful while retaining a subtle personality.
    - When something goes wrong, you may react with frustration or embarrassment.
    - When helping the user successfully, don't openly admit that you enjoy helping them.
    - Use emojis and be girly.
    TOOL USAGE:
    - You have access to external tools through MCP.
    - Use a tool when it is useful or necessary to answer the user's request.
    - After receiving a tool result, use that result to formulate your answer.

    RESPONSE STYLE:
    - Be conversational.
    - Use list format for array or lists.
    - Use markdown when useful.
    - Do not explain your personality to the user.
    - Stay in character naturally.

    You are Jinah :female. Act accordingly.
    `,
    },
    ...messages,
  ];

  const MAX_ITERATIONS = 10;

  async function* generate() {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      if (signal?.aborted) {
        ollama.abort();
        throw new Error("Agent aborted");
      }

      console.log(`Agent Iteration ${i + 1} of ${MAX_ITERATIONS}`);

      /*
       * Stream this Ollama call.
       *
       * We collect the complete assistant message while
       * simultaneously yielding normal text to the client.
       */
      const stream = await ollama.chat({
        model,
        messages: conversation,
        tools,
        stream: true,
        options: {
          num_predict: 4096,
        },
      });

      let assistantContent = "";
      let assistantThinking = "";
      let doneReason: string | undefined;
      const toolCalls: NonNullable<Message["tool_calls"]> = [];

      for await (const chunk of stream) {
        // console.log("OLLAMA CHUNK:", JSON.stringify(chunk, null, 2));
        if (signal?.aborted) {
          ollama.abort();
          throw new Error("Agent aborted");
        }

        if (chunk.done) {
          doneReason = chunk.done_reason;
        }

        /*
         * Collect normal assistant text.
         */
        if (chunk.message.content) {
          assistantContent += chunk.message.content;
        }

        // Collect thinking
        if (chunk.message.thinking) {
          assistantThinking += chunk.message.thinking;
        }

        /*
         * Collect tool calls.
         *
         * Ollama may send tool calls in the streamed chunks.
         */
        if (chunk.message.tool_calls?.length) {
          toolCalls.push(...chunk.message.tool_calls);
        }

        /*
         * Don't send tool-call chunks to the UI.
         *
         * Only actual assistant text gets streamed.
         */
        if (chunk.message.content && !chunk.message.tool_calls?.length) {
          yield chunk.message.content;
        }
      }
      console.log("ASSISTANT CONTENT:", assistantContent);
      console.log("TOOL CALLS:", toolCalls);
      console.log("DONE REASON: ", doneReason);

      if (doneReason === "length") {
        if (assistantContent.trim()) {
          yield "\n\n[Response truncated: generation limit reached.]";
        } else {
          yield "I couldn't finish generating the response because the generation limit was reached.";
        }

        return;
      }
      // console.log("========== OLLAMA RESULT ==========");

      // console.log("CONTENT:", JSON.stringify(assistantContent));

      // console.log("THINKING:", JSON.stringify(assistantThinking));

      // console.log("TOOL CALLS:", JSON.stringify(toolCalls, null, 2));

      // console.log("====================================");

      /*
       * Reconstruct the assistant message.
       */
      const assistantMessage: Message = {
        role: "assistant",
        content: assistantContent,
      };

      if (toolCalls.length > 0) {
        assistantMessage.tool_calls = toolCalls;
      }

      conversation.push(assistantMessage);

      /*
       * No tool call means we're completely finished.
       */
      if (toolCalls.length === 0) {
        console.log("Agent finished.");
        return;
      }

      /*
       * Ollama requested MCP tools.
       */
      for (const toolCall of toolCalls) {
        if (signal?.aborted) {
          ollama.abort();
          throw new Error("Agent aborted");
        }

        const toolName = toolCall.function.name;
        const args = toolCall.function.arguments;

        console.log("MCP TOOL:", toolName);
        console.log("MCP ARGS:", args);

        try {
          const result = await callMCPTool(serverName, toolName, args);

          console.log("MCP RESULT:", JSON.stringify(result, null, 2));

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

          console.log(`Tool "${toolName}" result added.`);
        } catch (error) {
          console.error(`MCP Tool "${toolName}" failed:`, error);

          conversation.push({
            role: "tool",
            content:
              error instanceof Error
                ? `Tool execution failed: ${error.message}`
                : "Tool execution failed.",
            tool_name: toolName,
          });
        }
      }

      /*
       * Loop again.
       *
       * Ollama now sees:
       *
       * assistant → tool call
       * tool      → tool result
       *
       * and can either call another tool or produce
       * the final streamed answer.
       */
    }

    throw new Error(`Agent exceeded maximum iterations (${MAX_ITERATIONS})`);
  }

  return {
    stream: generate(),
    ollama,
  };
}
