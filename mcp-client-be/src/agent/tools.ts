import { listMCPTools, callMCPTool } from "../services/mcp.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

type MCPTool = {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
};

function jsonSchemaToZod(schema: MCPTool["inputSchema"]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [name, property] of Object.entries(schema.properties ?? {})) {
    const p = property as {
      type?: string;
      description?: string;
    };

    let field: z.ZodTypeAny = z.any();

    switch (p.type) {
      case "string":
        field = z.string();
        break;

      case "number":
        field = z.number();
        break;

      case "integer":
        field = z.number().int();
        break;

      case "boolean":
        field = z.boolean();
        break;

      case "array":
        field = z.array(z.any());
        break;

      case "object":
        field = z.record(z.string(), z.any());
        break;
    }

    if (p.description) {
      field = field.describe(p.description);
    }

    if (!schema.required?.includes(name)) {
      field = field.optional();
    }

    shape[name] = field;
  }

  return z.object(shape);
}

export async function getAgentTools(serverName: string) {
  const mcpTools = (await listMCPTools(serverName)) as MCPTool[];

  return mcpTools.map((mcpTool) =>
    tool(
      async (args) => {
        console.log(`MCP TOOL: ${mcpTool.name}`);

        console.log("MCP ARGS:", args);

        const result = await callMCPTool(serverName, mcpTool.name, args);

        console.log("MCP RESULT:", JSON.stringify(result, null, 2));

        const content = result.content as Array<{
          type: string;
          text?: string;
        }>;

        return content
          .filter(
            (item) => item.type === "text" && typeof item.text === "string",
          )
          .map((item) => item.text)
          .join("\n");
      },
      {
        name: mcpTool.name,
        description: mcpTool.description ?? "",
        schema: jsonSchemaToZod(mcpTool.inputSchema),
      },
    ),
  );
}
// import { tool } from "@langchain/core/tools";
// import { z } from "zod";
// import { listMCPTools, callMCPTool } from "../services/mcp.js";
// import { MCPTool } from "../types/allTypes.js";

// export async function getAgentTools(serverName: string) {
//   const mcpTools = (await listMCPTools(serverName)) as MCPTool[];

//   return mcpTools.map((mcpTool) => {
//     const schema = z.object(
//       Object.fromEntries(
//         Object.entries(mcpTool.inputSchema.properties ?? {}).map(
//           ([name, property]) => {
//             const p = property as {
//               type?: string;
//               description?: string;
//             };

//             let field: z.ZodTypeAny = z.any();

//             switch (p.type) {
//               case "string":
//                 field = z.string();
//                 break;

//               case "number":
//                 field = z.number();
//                 break;

//               case "integer":
//                 field = z.number().int();
//                 break;

//               case "boolean":
//                 field = z.boolean();
//                 break;

//               case "array":
//                 field = z.array(z.any());
//                 break;

//               case "object":
//                 field = z.record(z.string(), z.any());
//                 break;
//             }
//             if (p.description) {
//               field = field.describe(p.description);
//             }

//             if (!mcpTool.inputSchema.required?.includes(name)) {
//               field = field.optional();
//             }

//             return [name, field];
//           },
//         ),
//       ),
//     );
//     return tool(
//       async (args) => {
//         console.log(`MCP TOOL: ${mcpTool.name}`);

//         console.log("MCP ARGS:", args);

//         const result = await callMCPTool(serverName, mcpTool.name, args);

//         console.log("MCP RESULT:", JSON.stringify(result, null, 2));

//         const content = result.content as Array<{
//           type: string;
//           text?: string;
//         }>;

//         return content
//           .filter(
//             (item) => item.type === "text" && typeof item.text === "string",
//           )
//           .map((item) => item.text)
//           .join("\n");
//       },
//       {
//         name: mcpTool.name,
//         description: mcpTool.description ?? "",
//         schema,
//       },
//     );
//   });
// }
