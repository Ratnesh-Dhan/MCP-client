import { getCurrentNetwork } from "../../services/currentNetworkDB.js";
import { callOllamaType } from "../../types/allTypes.js";
import { ChatOllama } from "@langchain/ollama";

export async function callOllama({ model, messages, tools }: callOllamaType) {
  const llm = new ChatOllama({ model, baseUrl: getCurrentNetwork()["url"] });

  const llmWithTools = llm.bindTools(tools);
  return await llmWithTools.invoke(messages);
}
// const toolCalls =
//   response.message.tool_calls?.map((call) => ({
//     id: crypto.randomUUID(),
//     name: call.function.name,
//     args: call.function.arguments,
//     type: "tool_call" as const,
//   })) ?? [];

// return new AIMessage({
//   content: response.message.content ?? "",
//   tool_calls: toolCalls,
// });
