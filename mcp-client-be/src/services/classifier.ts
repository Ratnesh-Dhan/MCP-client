// services/classifier.ts
import { ChatOllama } from "@langchain/ollama";
import { getCurrentNetwork } from "./currentNetworkDB.js";

export async function classifyIntent({
  model,
  userMessage,
  availableTools = [],
}: {
  model: string;
  userMessage: string;
  availableTools: string[];
}): Promise<"agent" | "chat"> {
  // 1. Fast path: If no tools are installed/available, force direct chat
  if (!availableTools || availableTools.length === 0) {
    return "chat";
  }

  // 2. Instantiate small/fast call (non-streaming, low token prediction)
  const llm = new ChatOllama({
    model,
    baseUrl: getCurrentNetwork()["url"],
    temperature: 0,
    numPredict: 200, // Finish as fast as possible,
    streaming: false,
  });

  console.log("Tools :", availableTools);

  const prompt = `YYou are a routing classifier.

Decide whether the user's request should be handled by:

CHAT:
The model can answer using the conversation and its existing knowledge.
No external information, user data, files, applications, services, or actions are required.

AGENT:
The request requires accessing external information or performing an action through an available tool.

Important:
- Judge what is REQUIRED to answer the request, not what the user explicitly asks the assistant to do.
- Users may describe what they want without mentioning tools.
- If the user refers to files, folders, messages, databases, applications, devices, accounts, or other external/user-specific data, choose AGENT when that information is not already present in the conversation.
- If the user asks to search, retrieve, inspect, modify, send, create, delete, execute, query, or interact with something external, choose AGENT.
- Normal conversation, greetings, opinions, explanations, general knowledge, coding help, and ordinary reasoning should use CHAT.
- Do not choose AGENT merely because a tool exists that could theoretically be useful.
- Choose AGENT only when external access or an external action is actually needed.

Available tools:
${availableTools.map((tool) => `- ${tool}`).join("\n")}

User request:
${JSON.stringify(userMessage)}

Respond with exactly one word:
CHAT
or
AGENT`;

  try {
    const response = await llm.invoke(prompt);
    const result = response.content.toString().trim().toUpperCase();

    return result.includes("AGENT") ? "agent" : "chat";
  } catch (error) {
    console.error("Classifier error, defaulting to agent execution:", error);
    return "agent"; // Fallback to safe agent execution on failure
  }
}
