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

  summary: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),

  summarizedMessageCount: Annotation<number>({
    reducer: (_, update) => update,
    default: () => 0,
  }),

  toolHistory: Annotation<ToolExecution[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),

  llmCalls: Annotation<number>({
    reducer: (current, update) => current + update,
    default: () => 0,
  }),
});
