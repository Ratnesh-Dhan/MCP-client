import { listMCPTools, callMCPTool } from "../services/mcp.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { jsonSchemaToZod } from "json-schema-to-zod";

type MCPTool = {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
};

function safeJsonSchemaToZod(
  jsonSchema: Record<string, any>,
): z.ZodObject<any> {
  if (!jsonSchema || !jsonSchema.properties) {
    return z.object({});
  }
  try {
    const zodCode = jsonSchemaToZod(jsonSchema);

    const schema = eval(zodCode);
    return schema;
  } catch (error) {
    console.warn(
      "Faild to pase JSON Schema with library, falling back to empty object.",
      error,
    );
    return z.object({});
  }
}

export async function getAgentTools(serverName: string) {
  const mcpTools = (await listMCPTools(serverName)) as MCPTool[];

  return mcpTools.map((mcpTool) =>
    tool(
      async (args) => {
        console.log(`MCP TOOL: ${mcpTool.name}`);

        console.log("MCP ARGS:", args);
        try {
          const result = await callMCPTool(serverName, mcpTool.name, args);

          console.log("MCP RESULT:", JSON.stringify(result, null, 2));

          const content = result.content as Array<{
            type: string;
            text?: string;
          }>;

          const textContnet = content
            .filter(
              (item) => item.type === "text" && typeof item.text === "string",
            )
            .map((item) => item.text)
            .join("\n");

          return textContnet || JSON.stringify(result);
        } catch (error: any) {
          console.error(`MCP TOOL ERROR [${mcpTool.name}]:`, error);

          // 💡 Return error details as text to Ollama rather than throwing
          return `Error executing tool "${mcpTool.name}": ${
            error?.message || "Unknown error occurred while calling MCP server."
          }. Please double-check your arguments and try again.`;
        }
      },
      {
        name: mcpTool.name,
        description: mcpTool.description ?? "",
        schema: safeJsonSchemaToZod(mcpTool.inputSchema),
      },
    ),
  );
}
// function jsonSchemaToZod(schema: MCPTool["inputSchema"]) {
//   const shape: Record<string, z.ZodTypeAny> = {};

//   for (const [name, property] of Object.entries(schema.properties ?? {})) {
//     const p = property as {
//       type?: string;
//       description?: string;
//       enum?: string[];
//     };

//     let field: z.ZodTypeAny = z.any();

//     if (p.enum && Array.isArray(p.enum) && p.enum.length > 0) {
//       field = z.enum(p.enum as [string, ...string[]]);
//     } else {
//       switch (p.type) {
//         case "string":
//           field = z.string();
//           break;

//         case "number":
//           field = z.number();
//           break;

//         case "integer":
//           field = z.number().int();
//           break;

//         case "boolean":
//           field = z.boolean();
//           break;

//         case "array":
//           field = z.array(z.any());
//           break;

//         case "object":
//           field = z.record(z.string(), z.any());
//           break;
//       }
//     }

//     if (p.description) {
//       field = field.describe(p.description);
//     }

//     if (!schema.required?.includes(name)) {
//       field = field.optional();
//     }

//     const isRequired =
//       Array.isArray(schema.required) && schema.required.includes(name);
//     if (!isRequired) field = field.optional();

//     shape[name] = field;
//   }

//   return z.object(shape);
// }
