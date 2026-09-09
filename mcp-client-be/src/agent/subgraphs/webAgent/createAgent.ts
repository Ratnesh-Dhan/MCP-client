import { createDeepAgent } from "deepagents";
import { ChatOllama } from "@langchain/ollama";
import { connectMCP } from "../../../services/mcp.js";
import { getAgentTools } from "../../tools.js";
import "dotenv/config";

export const createWebSearchAgent = async (model: string, network: string) => {
  const llm = new ChatOllama({
    baseUrl: network,
    model,
  });

  // connnecting tavily
  console.log("Tavily shits starts");
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  if (!tavilyApiKey) throw new Error("TAVILY_API_KEY is not configured.");
  console.log("Tavily shits ends");

  await connectMCP(
    "tavily",
    "pnpm",
    ["dlx", "tavily-mcp@latest"],
    { TAVILY_API_KEY: tavilyApiKey },
    undefined,
    "1.0.0",
  );
  const tools = await getAgentTools("tavily");

  // console.log(
  //   "TAVILY TOOLS:",
  //   tools.map((tool) => ({
  //     name: tool.name,
  //     description: tool.description,
  //   })),
  // );

  const webSearchAgent = createDeepAgent({
    model: llm,
    tools: tools,
    systemPrompt: `
    You are a web search expert.

    Use Tavily tools to research the user's task thoroughly.
    Perform multiple searches when necessary.
    Use extraction when additional page content is required.
    Do not fabricate information.
    Base your answer on the retrieved information.

    Return a clean, useful research result.
     `,
  });
  console.log("deep agent created");
  return webSearchAgent;
};
