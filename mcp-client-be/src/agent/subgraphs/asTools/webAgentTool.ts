import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const webResearchTool = tool(
  async () => "handled by graph routing", // never actually executed
  {
    name: "webResearch",
    description:
      "Delegate to a web research agent to answer questions needing for web Search. (IMPORTANT: webResearch tool must be called alone.)",
    schema: z.object({
      task: z
        .string()
        .describe(
          "provide the task by user to be web searched or web researched.",
        ),
    }),
  },
);
