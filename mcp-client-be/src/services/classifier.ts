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
    numPredict: 5, // Finish as fast as possible
  });

  const prompt = `You are an intent router. 
Determine if external tools are NEEDED to answer the user request.

Available Tools:
${availableTools.map((t) => `- ${t}`).join("\n")}

Rules:
- Output "AGENT" ONLY IF the user explicitly requests an operation that requires one of the listed tools (e.g., executing code, reading files, searching web, querying database).
- Output "CHAT" for normal conversations, general knowledge, explanations, writing code, or math problems.

User Request: "${userMessage}"

Respond with EXACTLY ONE WORD ("AGENT" or "CHAT"):`;

  try {
    const response = await llm.invoke(prompt);
    const result = response.content.toString().trim().toUpperCase();

    return result.includes("AGENT") ? "agent" : "chat";
  } catch (error) {
    console.error("Classifier error, defaulting to agent execution:", error);
    return "agent"; // Fallback to safe agent execution on failure
  }
}
