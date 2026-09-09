import { Annotation } from "@langchain/langgraph";

export const ResearchState = Annotation.Root({
  task: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),
  result: Annotation<string>({
    reducer: (_, update) => update,
    default: () => "",
  }),
});
