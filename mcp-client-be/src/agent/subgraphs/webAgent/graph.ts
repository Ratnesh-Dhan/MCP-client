import { END, START, StateGraph } from "@langchain/langgraph";
import { createWebSearchAgent } from "./createAgent.js";
import { ResearchState } from "./state.js";

export const webAgentGraph = async (model: string, network: string) => {
  const webResearchAgent = await createWebSearchAgent(model, network);
  const researchGraph = new StateGraph(ResearchState)
    .addNode("research", async (state) => {
      console.log("[RESEARCH GRAPH] entered");
      console.log("[RESEARCH GRAPH] task:", state.task);

      console.log("[RESEARCH GRAPH] invoking Deep Agent...");

      const response = await webResearchAgent.invoke({
        messages: [
          {
            role: "user",
            content: state.task,
          },
        ],
      });
      console.log("[RESEARCH GRAPH] Deep Agent returned");

      console.dir(response, { depth: null });

      const lastMessage = response.messages[response.messages.length - 1];
      if (!lastMessage) {
        throw new Error("Web research agent returned no messages.");
      }
      const result =
        typeof lastMessage.content === "string"
          ? lastMessage.content
          : JSON.stringify(lastMessage.content);
      console.log("[RESEARCH GRAPH] results: ", result);
      return {
        result,
      };
    })
    .addEdge(START, "research")
    .addEdge("research", END)
    .compile();

  return researchGraph;
};
