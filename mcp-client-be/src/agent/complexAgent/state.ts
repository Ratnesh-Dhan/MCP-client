import { Annotation } from "@langchain/langgraph";

export const ComplexAgentState = Annotation.Root({
  goal: Annotation<string>(),

  tasks: Annotation<AgentTask[]>({
    default: () => [],
    reducer: (_, next) => next,
  }),

  currentTaskId: Annotation<string | null>({
    default: () => null,
    reducer: (_, next) => next,
  }),

  executionHistory: Annotation<ExecutionRecord[]>({
    default: () => [],
    reducer: (current, next) => [...current, ...next],
  }),

  status: Annotation<
    "planning" | "executing" | "completed" | "failed"
  >({
    default: () => "planning",
    reducer: (_, next) => next,
  }),

  replanCount: Annotation<number>({
    default: () => 0,
    reducer: (_, next) => next,
  }),
});

interface AgentTask {
  id: string;
  title: string;
  description: string;
  successCriteria: string[];
  dependsOn: string[];

  status:
    | "pending"
    | "in_progress"
    | "completed"
    | "failed"
    | "blocked";

  attempts: number;
  result?: string;
  error?: string;
}

interface AgentPlan {
  goal: string;
  tasks: AgentTask[];
  currentTaskId: string | null;
  status: "planning" | "executing" | "completed" | "failed";
}