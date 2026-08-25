// services/directChatRunner.ts
import { ChatOllama } from "@langchain/ollama";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { getCurrentNetwork } from "./currentNetworkDB.js";

export async function runDirectChatStream({
  model,
  messages,
  signal,
}: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  signal?: AbortSignal;
}) {
  const llm = new ChatOllama({
    model,
    baseUrl: getCurrentNetwork()["url"],
    streaming: true,
  });

  const systemPrompt = new SystemMessage(
    `
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

    RESPONSE STYLE:
    - Be conversational.
    - Use list format for array or lists.
    - Use markdown when useful.
    - Do not explain your personality to the user.
    - Stay in character naturally.
    `,
  );

  const langChainMessages = [
    systemPrompt,
    ...messages.map((m) =>
      m.role === "user"
        ? new HumanMessage(m.content)
        : new AIMessage(m.content),
    ),
  ];

  async function* generate() {
    try {
      const stream = await llm.stream(langChainMessages, { signal });

      for await (const chunk of stream) {
        if (signal?.aborted) throw new Error("Aborted");

        const thinkingText =
          chunk?.additional_kwargs?.thinking ||
          chunk?.additional_kwargs?.reasoning_content;

        if (thinkingText) {
          yield { type: "thinking", content: thinkingText };
        } else if (typeof chunk.content === "string" && chunk.content) {
          yield { type: "content", content: chunk.content };
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError" || signal?.aborted) return;
      yield { type: "error", message: err?.message || "Stream error." };
    }
  }

  return generate();
}
