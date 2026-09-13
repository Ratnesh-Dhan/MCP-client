import { HumanMessage } from "@langchain/core/messages";
import { AgentState } from "../state.js";

export const recoveryFromPlanOnly = async(state: typeof AgentState.State) => {
    console.log("[RECOVERY] Model returned a plan or empty response without a tool call.");

  return {
    messages: [
      new HumanMessage({
        content:
          "Your previous response did not execute the next action. " +
          "Continue the task now. Do not return an empty response. " +
          "Do not only describe what you plan to do. " +
          "If you need to inspect the project, immediately call the appropriate " +
          "filesystem tool, such as listDirectory or readFile. " +
          "Use the exact tool arguments required by its schema. " +
          "If the task is complete, provide a useful final answer.",
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