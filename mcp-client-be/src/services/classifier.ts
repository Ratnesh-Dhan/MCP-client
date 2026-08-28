// services/classifier.ts
import { ChatOllama } from "@langchain/ollama";
import { getCurrentNetwork } from "./currentNetworkDB.js";
import { typeClassifier } from "../types/agentTypes.js";

export async function classifyIntent({
  model,
  userMessage,
  conversation = [],
  availableTools = [],
  signal,
}: typeClassifier): Promise<"agent" | "chat_fast" | "chat_think"> {
  // 1. Fast path: If no tools are installed/available, force direct chat
  if (!availableTools || availableTools.length === 0) {
    return "chat_fast";
  }

  const conversationContext = conversation.map((message) => {
    const role = message.role.toUpperCase();
    return `${role}: ${message.content}`;
  });
  // 2. Instantiate small/fast call (non-streaming, low token prediction)
  const llm = new ChatOllama({
    model,
    baseUrl: getCurrentNetwork()["url"],
    temperature: 0,
    // numPredict: 400, // Finish as fast as possible,
    streaming: false,
  });
  const prompt = `You are a routing classifier.

Decide whether the user's request should be handled by:

CHAT_FAST:
Use when:
- No external tools or user-specific external data are required.
- The request can be answered directly using existing model knowledge.
- The task is straightforward and does not require extensive multi-step reasoning.
- Examples:
  greetings,
  casual conversation,
  general knowledge,
  normal explanations,
  simple coding,
  code generation,
  Linux commands,
  prompt writing,
  rewriting,
  straightforward debugging.

CHAT_THINK:
Use when:
- No external tool is required ,
- BUT solving the request benefits substantially from deeper multi-step reasoning.
- Unless user specificaly asked to think.
- Examples:
  complex debugging,
  architecture design,
  difficult algorithms,
  difficult mathematics,
  root-cause analysis,
  reasoning across large amounts of supplied information,
  comparing complex technical alternatives,
  solving problems with several dependent reasoning steps.

AGENT:
The request requires accessing external information or performing an action through an available tool.

Important:
- Interpret the current user request using the conversation context.
- Do NOT classify the current request in isolation.
- Short follow-up requests such as "do it", "yes", "go ahead", "send it", "delete that", "open it", or "check it" may depend on the previous assistant message.
- If the user is confirming an action previously proposed or requested by the assistant, choose AGENT.
- If the current request refers to something established in the conversation, use that context to determine whether external access or an external action is required.
- If the user refers to files, folders, messages, databases, applications, devices, accounts, or other external/user-specific data, choose AGENT when that information is not already present in the conversation.
- If the user asks to search, retrieve, inspect, modify, send, create, delete, execute, query, or interact with something external, choose AGENT.
- Normal conversation, greetings, opinions, explanations, general knowledge, coding help, and ordinary reasoning should use CHAT_FAST or CHAT_THINK.
- Choose AGENT only when external access or an external action is actually needed or user requested.
- Respond as quickly as possible.

Recent conversation:
${conversationContext.join("\n")}

User request:
${JSON.stringify(userMessage)}

Available tools:
${availableTools.map((tool) => `- ${tool}`).join("\n")}


Respond with exactly one word:
CHAT_FAST
or
CHAT_THINK
or
AGENT`;
  const prompt_old = `You are a routing classifier.

Decide whether the user's request should be handled by:

CHAT:
The model can answer using the conversation and its existing knowledge.
No external information, user data, files, applications, services, or actions are required.

AGENT:
The request requires accessing external information or performing an action through an available tool.

Important:
- Interpret the current user request using the conversation context.
- Do NOT classify the current request in isolation.
- Short follow-up requests such as "do it", "yes", "go ahead", "send it", "delete that", "open it", or "check it" may depend on the previous assistant message.
- If the user is confirming an action previously proposed or requested by the assistant, choose AGENT.
- If the current request refers to something established in the conversation, use that context to determine whether external access or an external action is required.
- If the user refers to files, folders, messages, databases, applications, devices, accounts, or other external/user-specific data, choose AGENT when that information is not already present in the conversation.
- If the user asks to search, retrieve, inspect, modify, send, create, delete, execute, query, or interact with something external, choose AGENT.
- Normal conversation, greetings, opinions, explanations, general knowledge, coding help, and ordinary reasoning should use CHAT.
- Choose AGENT only when external access or an external action is actually needed or user requested.
- Respond as quickly as possible.

Recent conversation:
${conversationContext.join("\n")}

User request:
${JSON.stringify(userMessage)}

Available tools:
${availableTools.map((tool) => `- ${tool}`).join("\n")}


Respond with exactly one word:
CHAT
or
AGENT`;

  try {
    const response = await llm.invoke(prompt, { signal });
    if (signal?.aborted) throw new Error("Classifier aborted");
    const result = response.content.toString().trim().toUpperCase();
    return result.includes("AGENT") ? "agent" : "chat_fast";
  } catch (error) {
    if (signal?.aborted) {
      console.log(
        error instanceof Error ? error.message : "Classifier aborted",
      );
      throw new Error("Agent aborted");
    }
    console.error("Classifier error, defaulting to agent execution:", error);
    return "agent"; // Fallback to safe agent execution on failure
  }
}
