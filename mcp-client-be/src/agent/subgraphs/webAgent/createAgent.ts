import { createDeepAgent } from "deepagents";
import {
  DuckDuckGoSearch,
  SafeSearchType,
} from "@langchain/community/tools/duckduckgo_search";
import { ChatOllama } from "@langchain/ollama";

export const createWebSearchAgent = async (model: string, network: string) => {
  const llm = new ChatOllama({
    baseUrl: network,
    model,
  });

  const duckDuckGoTool = new DuckDuckGoSearch({
    maxResults: 3,
    searchOptions: { safeSearch: SafeSearchType.OFF },
  });
  console.log("Hitting web search");

  console.log("[DDG TEST] invoking");

  const result = await duckDuckGoTool.invoke("What is DuckDuckGo?");

  console.log("[DDG TEST] returned");
  console.dir(result, { depth: null });

  const webSearchAgent = createDeepAgent({
    model: llm,
    tools: [],
    systemPrompt:
      "You are a research expert. Run multiple loops of DuckDuckGo searches to thoroughly answer the user's prompt. Provide a clean summary or files.",
  });
  console.log("deep agent created");
  return webSearchAgent;
};
