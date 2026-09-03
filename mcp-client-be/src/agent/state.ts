import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export type ToolExecution = {
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

  iteration: Annotation<number>({
    reducer: (_, update) => update,
    default: () => 0,
  }),
});
