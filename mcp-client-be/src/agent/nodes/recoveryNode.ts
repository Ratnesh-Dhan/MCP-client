import { HumanMessage } from "@langchain/core/messages";
import { AgentState } from "../state.js";

export const recoveryFromPlanOnly = async(state: typeof AgentState.State) => {
    console.log("[RECOVERY] Model described a plan without calling a tool.");

  return {
    messages: [
      new HumanMessage({
        content:
          "Continue executing your plan now. Do not only describe what you will do. " +
          "Call the appropriate tool immediately. If you need to inspect files, " +
          "use the filesystem tool. If no tool is needed, provide the final answer.",
      }),
    ],
    planRetryCount: state.planRetryCount + 1,
  };
}

export function looksLikePlan(content: unknown): boolean {
  if (typeof content !== "string") return false;

  const text = content.toLowerCase();

  const planPatterns = [
    "let me",
    "i'll",
    "i will",
    "first,",
    "first ",
    "next,",
    "i need to",
    "i should",
    "i'm going to",
    "i am going to",
    "let's inspect",
    "let's check",
    "i'll take a look",
    "i need to read",
    "i need to inspect",
  ];

  return planPatterns.some((pattern) => text.includes(pattern));
}