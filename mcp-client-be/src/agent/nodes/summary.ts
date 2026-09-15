import { ChatOllama } from "@langchain/ollama";
import { getCurrentNetwork } from "../../services/currentNetworkDB.js";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { summary_prompt } from "../../lib/prompts.js";
import { AgentState } from "../state.js";
import { getHumanMessageIndices } from "../supports/trimMessages.js";

export const createSummaryModel = async (model: string) => {
  const summaryModel = new ChatOllama({
    model,
    baseUrl: getCurrentNetwork()["url"],
    temperature: 0,
  });
  return summaryModel;
};

const summarizeMessage = async (
  messages: BaseMessage[],
  existingSummary: string,
  summarizerModel: ChatOllama,
) => {
  const summarizerPrompt = `
    ${summary_prompt}
    
    Existing summary:
    ${existingSummary || "(none)"}

    New conversation messages:
    ${messages
      .map((msg) => {
        const content =
          typeof msg.content === "string"
            ? msg.content
            : JSON.stringify(msg.content);
        if (msg instanceof HumanMessage) {
          return `Human:\n${content}`;
        }
        if (msg instanceof AIMessage) {
          let text = `Assistant:\n${content}`;
          if (msg.tool_calls?.length) {
            text += `\nTool Calls:\n${JSON.stringify(msg.tool_calls, null, 2)}`;
          }
          return text;
        }
        if (msg instanceof ToolMessage) {
          return `Tool (${msg.tool_call_id}):\n${content}`;
        }
        if (msg instanceof SystemMessage) {
          return;
          // return `System:\n${content}`;
        }
        return `Unknown:\n${content}`;
      })
      .join("\n\n---\n\n")}
    
    Return ONLY the updated summary.
    `;
  const response = await summarizerModel.invoke([
    new SystemMessage(summarizerPrompt),
  ]);

  return response.content;
};

export const summarizeNode = async (
  state: typeof AgentState.State,
  summarizerModel: ChatOllama,
) => {
  const humanMessageIndices = getHumanMessageIndices(state.messages);

  const unsummarizedHumanCount =
    humanMessageIndices.length - state.summarizedLastHumanMessageCount;

  if (unsummarizedHumanCount < 4) {
    return {};
  }
  const firstUnsummarizedHumanIndex =
    humanMessageIndices[state.summarizedLastHumanMessageCount] ?? 0;

  const secondLastHumanIndex =
    humanMessageIndices[humanMessageIndices.length - 2];

  const summaryMessages = state.messages.slice(
    firstUnsummarizedHumanIndex,
    secondLastHumanIndex,
  );

  if (summaryMessages.length === 0) {
    return {};
  }
  // if (humanMessageIndices.length - state.summarizedLastHumanMessageCount >= 4) {
  //   const summaryMessages = state.messages.slice(
  //     humanMessageIndices[state.summarizedLastHumanMessageCount + 1],
  //     humanMessageIndices[humanMessageIndices.length - 3],
  //   ); // -3 index to catch the last system message before 2nd last HumanMessage.

  console.log("[SUMMARY] Summarizing messages");
  const summary = await summarizeMessage(
    summaryMessages,
    state.summary,
    summarizerModel,
  );
  console.log("[SUMMARY] Update summary:");
  console.log(summary);
  return {
    summary: summary,
    summarizedLastHumanMessageCount: humanMessageIndices.length - 2,
  };
};
