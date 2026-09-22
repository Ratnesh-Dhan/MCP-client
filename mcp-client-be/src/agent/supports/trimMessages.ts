import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { AgentState } from "../state.js";

export const getHumanMessageIndices = (messages: BaseMessage[]): number[] => {
  const indices: number[] = [];
  messages.forEach((msg, index) => {
    if (msg instanceof HumanMessage) indices.push(index);
  });
  return indices;
};

export const trimMessages = (state: typeof AgentState.State): BaseMessage[] => {
  const humanMessageIndices = getHumanMessageIndices(state.messages);
  if (humanMessageIndices.length <= 6) return state.messages;
  const targetIndex =
    humanMessageIndices[state.summarizedLastHumanMessageCount] ?? 0;

  return state.messages.slice(targetIndex);
};
