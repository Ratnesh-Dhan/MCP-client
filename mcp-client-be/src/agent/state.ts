import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export type ToolExecution = {
  toolCallId: string;
  tool: string;
  args: Record<string, unknown>;
  success: boolean;
  error?: string;
};

export const AgentState = Annotation.Root({
  ...MessagesAnnotation.spec,

  toolHistory: Annotation<ToolExecution[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),

  llmCalls: Annotation<number>({
    reducer: (current, update) => current + update,
    default: () => 0,
  }),
});

// export type SubgraphExecution = {
//   id: string;
//   agent: string;
//   success: boolean;
//   result?: unknown;
//   error?: string;
// };
// subgraphResults: Annotation<SubgraphExecution[]>({
//   reducer: (current, update) => [...current, ...update],
//   default: () => [],
// }),
