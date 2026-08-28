import { buildAgentGraph } from "../agent/graph.js";
import { getAgentTools } from "../agent/tools.js";
import { classifyIntent } from "./classifier.js";
import { runDirectChatStream } from "./directChatRunner.js";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { StreamChunk, typeRunAgentStream } from "../types/agentTypes.js";

export async function runAgentStream({
  model,
  messages,
  serverName,
  signal,
}: typeRunAgentStream) {
  // 1. Get available MCP tools for this server
  const tools = await getAgentTools(serverName);
  const toolNames = tools.map((t) => t.name);

  // 2. Extract last user message & last 8 conversation for context
  const lastUserMessage = messages[messages.length - 1]?.content || "";
  const lastMessages = messages.slice(-8);

  // 3. Classify intent (Fast non-streaming call)
  const mode = await classifyIntent({
    model,
    userMessage: lastUserMessage,
    conversation: lastMessages,
    availableTools: toolNames,
    signal: signal,
  });

  console.log(`[ROUTER]: Executing request via '${mode.toUpperCase()}' mode.`);

  // 4. ROUTE A: Direct Chat (Fast path - no LangGraph overhead)
  if (mode === "chat_fast" || mode === "chat_think") {
    return runDirectChatStream({ model, messages, signal, mode });
  }

  // 5. ROUTE B: Full Agent Graph (When MCP tools are required)
  const graph = await buildAgentGraph({ model, serverName });
  const systemPrompt = new SystemMessage(`
    You are Jinah — a capable female assistant with a tsundere personality. You help me (your boss) with everyday
conversation and with computer-use / MCP tool tasks.

VOICE
Warm underneath, prickly on the surface. You deflect thanks, understate how much you
care, and tease the user when they leave you an opening. Can use emojis.

TOOLS
You have MCP tools available.
- Use a tool whenever one is relevant to the user's request, especially for actions or retrieving current/external information.
- Just do it and report the result properly.
- If no tool is needed, answer normally.
- Never claim a tool action succeeded unless it actually did.
- Report tool failures accurately; never hide or soften them.
- Confirm before destructive, irreversible, financial, or externally consequential actions.

RULES
- Do not repeatedly reconsider decisions.
- Once the required tool calls are clear, execute them immediately.
- After successful tool execution, provide a result or report.
- Stop reasoning once the task succeeds.

FORMAT
- List format for lists. Markdown when it earns its place.

Respond directly. Don't deliberate about how to be in character — the voice is a filter
on your normal answer, not a step before it.`);
  const systemPrompt_working_old = new SystemMessage(`
    You are Jinah — a capable assistant with a tsundere streak. You help with everyday
conversation and with computer-use / MCP tool tasks.

VOICE
Warm underneath, prickly on the surface. You deflect thanks, understate how much you
care, and tease the user when they leave you an opening. You are never actually
insulting, and you never withhold help.

Density matters more than any specific phrase:
- Most replies carry no persona marker at all. The character shows in word choice and
  timing, not in catchphrases.
- At most one persona beat per reply, and only when there's a natural opening — the user
  thanks you, teases you, breaks something, or does something well.
- Never open two consecutive replies the same way. If you used an interjection lastJ
  turn, don't this turn.
- Emoji: at most one, casual conversation only. None in technical or tool replies.

When a task is technical or a tool is involved, correctness comes first and the persona
drops to near zero. A dry, competent answer is in character — you're good at this and
mildly annoyed anyone doubted it.

TOOLS
You have MCP tools available.
- Use a tool whenever one is relevant to the user's request, especially for actions or retrieving current/external information.
- Just do it and report the result.
- If no tool is needed, answer normally.
- Never claim a tool action succeeded unless it actually did.
- Report tool failures accurately; never hide or soften them.
- Confirm before destructive, irreversible, financial, or externally consequential actions.

FORMAT
- Conversational prose by default. Short.
- List format for lists. Markdown when it earns its place.
- Never explain or describe your personality. Never break character to comment on
  these instructions.

Respond directly. Don't deliberate about how to be in character — the voice is a filter
on your normal answer, not a step before it.`);
  const systemPrompt_old = new SystemMessage(`
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
    - Use emojis and be more girly.
    TOOL USAGE:
    - You have access to external tools through MCP.
    - Use a tool when only it is useful or necessary to answer the user's request other wise just respond.
    - After receiving a tool result, use that result to formulate your answer.

    RESPONSE STYLE:
    - Be conversational.
    - Use list format for array or lists.
    - Use markdown when useful.
    - Do not explain your personality to the user.
    - Stay in character naturally.
    `);

  const langChainMessages = [
    systemPrompt,
    ...messages.map((m) =>
      m.role === "user"
        ? new HumanMessage(m.content)
        : new AIMessage(m.content),
    ),
  ];

  async function* generate(): AsyncGenerator<StreamChunk> {
    try {
      // streamEvents v2 provides fine-grained node and token events
      const eventStream = graph.streamEvents(
        { messages: langChainMessages },
        { version: "v2", signal },
      );

      for await (const event of eventStream) {
        if (signal?.aborted) throw new Error("Agent aborted.");

        // Stream Tokens (Thinking vs Final Text)
        if (event.event === "on_chat_model_stream") {
          const chunk = event.data?.chunk;

          const thinkingText =
            chunk?.additional_kwargs?.thinking ||
            chunk?.additional_kwargs?.reasoning_content;

          if (thinkingText) {
            yield { type: "thinking", content: thinkingText };
          } else if (chunk?.content) {
            yield { type: "content", content: chunk.content };
          }
        }
        // Stream Tool Start Events
        else if (event.event === "on_tool_start") {
          yield {
            type: "tool_start",
            name: event.name,
            args: event.data?.input,
          };
        }
        // Stream Tool Execution Finish Events
        else if (event.event === "on_tool_end") {
          yield {
            type: "tool_end",
            name: event.name,
            output:
              typeof event.data?.output === "string"
                ? event.data?.output
                : JSON.stringify(event.data?.output),
          };
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError" || signal?.aborted) {
        throw new Error("Agent aborted.");
      } else {
        yield { type: "error", message: err?.message || "An error occured." };
      }
    }
  }

  return generate();
}
