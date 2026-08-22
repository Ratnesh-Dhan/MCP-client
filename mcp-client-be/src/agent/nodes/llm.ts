import { getCurrentNetwork } from "../../services/currentNetworkDB.js";
import { ChatOllama } from "@langchain/ollama";
import { StructuredToolInterface } from "@langchain/core/tools";

export async function createOllamaModel(
  model: string,
  tools: StructuredToolInterface[],
) {
  const llm = new ChatOllama({ model, baseUrl: getCurrentNetwork()["url"] });

  return llm.bindTools(tools);
}
