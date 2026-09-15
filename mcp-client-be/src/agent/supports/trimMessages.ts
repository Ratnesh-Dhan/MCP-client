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
  if (humanMessageIndices.length <= 4) return state.messages;
  //   const targetIndex =
  //     humanMessageIndices[
  //       Math.max(
  //         0,
  //         humanMessageIndices.length - state.summarizedLastHumanMessageCount - 1,
  //       )
  //     ] ?? 0;
  //   return state.messages.slice(targetIndex);
  const targetIndex =
    humanMessageIndices[state.summarizedLastHumanMessageCount] ?? 0;

  return state.messages.slice(targetIndex);
};

// export const trimMessages = (
//   state: typeof AgentState.State,
// ): {
//   trimmedMessages: BaseMessage[];
//   messagesToSummarize: BaseMessage[];
//   summarizedLastHumanMessageCount: number;
// } => {
//   const humanMessageIndices = getHumanMessageIndices(state.messages);
//   if (humanMessageIndices.length - state.summarizedLastHumanMessageCount >= 4) {
//     const summaryMessages = state.messages.slice(
//       humanMessageIndices[state.summarizedLastHumanMessageCount + 1],
//       humanMessageIndices[humanMessageIndices.length - 3],
//     ); // -3 index to catch the last system message before 2nd last HumanMessage.
//     const trimmedMessages = state.messages.slice(
//       humanMessageIndices[humanMessageIndices.length - 2],
//     );
//     return {
//       trimmedMessages: trimmedMessages,
//       messagesToSummarize: summaryMessages,
//       summarizedLastHumanMessageCount: humanMessageIndices.length - 3,
//     };
//   }
//   const targetIndex =
//     humanMessageIndices[
//       Math.max(
//         0,
//         humanMessageIndices.length - state.summarizedLastHumanMessageCount - 1,
//       )
//     ] ?? 0;
//   return {
//     trimmedMessages: state.messages.slice(targetIndex),
//     messagesToSummarize: [],
//     summarizedLastHumanMessageCount: state.summarizedLastHumanMessageCount,
//   };
// };
