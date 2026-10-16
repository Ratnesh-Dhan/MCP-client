import { listMCPTools, callMCPTool } from "../services/mcp.js";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { jsonSchemaToZod } from "json-schema-to-zod";
import { mcps } from "../lib/mcpManager.js";
import { getMcpTools } from "../db/queries.js";

type MCPTool = {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
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
          throw new Error(
            JSON.stringify({
              success: false,
              tool: mcpTool.name,
              error: error?.message ?? "Unknown error",
            }),
          );
          // // 💡 Return error details as text to Ollama rather than throwing
          // return `Error executing tool "${mcpTool.name}": ${
          //   error?.message || "Unknown error occurred while calling MCP server."
          // }. Please double-check your arguments and try again.`;
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

type Tool = {
  serverName: string;
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
};

export async function getMainAgentTools() {
  // Getting enabled tools list to filter
  let enabledTools: Tool[] = [];
  for (const [id, server] of mcps.getServers()) {
    const mcpTools = (await listMCPTools(server.name)) as MCPTool[];
    if (server.tools === undefined) {
      console.log("We got our culprit. ", server.tools);
      const tools = await getMcpTools(id);
      const toolNames = tools.map((tool) => tool.name);
      mcps.addTools(server.name, toolNames);
      // enabledTools = mcpTools.filter((tool) => toolNames.includes(tool.name));
      enabledTools.push(
        ...mcpTools
          .filter((tool) => toolNames.includes(tool.name))
          .map((tool) => ({
            ...tool,
            serverName: server.name,
          })),
      );
    } else {
      // enabledTools = mcpTools.filter((tool) =>
      //   server.tools?.includes(tool.name),
      // );
      enabledTools.push(
        ...mcpTools
          .filter((tool) => server.tools?.includes(tool.name))
          .map((tool) => ({
            ...tool,
            serverName: server.name,
          })),
      );
    }
  }
  // Getting enabled tools list to filter
  return enabledTools.map((mcpTool) =>
    tool(
      async (args) => {
        console.log(`MCP TOOL: ${mcpTool.name}`);

        console.log("MCP ARGS:", args);
        try {
          const result = await callMCPTool(
            mcpTool.serverName,
            mcpTool.name,
            args,
          );

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
          throw new Error(
            JSON.stringify({
              success: false,
              tool: mcpTool.name,
              error: error?.message ?? "Unknown error",
            }),
          );
          // // 💡 Return error details as text to Ollama rather than throwing
          // return `Error executing tool "${mcpTool.name}": ${
          //   error?.message || "Unknown error occurred while calling MCP server."
          // }. Please double-check your arguments and try again.`;
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
