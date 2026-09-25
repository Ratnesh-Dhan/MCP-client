import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// Application settings
export const userSettings = sqliteTable("user_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  modelNetwork: text("model_network").notNull(),
  modelName: text("model_name"),
});

// MCP Servers
export const mcpServers = sqliteTable("mcp_servers", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  name: text("name").notNull(),
  command: text("command").notNull(),
  args: text("args", { mode: "json" }),
  cwd: text("cwd"),

  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
});

// TOOLS per mcp servers
export const mcpTools = sqliteTable("mcp_tools", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  mcpServerId: integer("mcp_server_id")
    .notNull()
    .references(() => mcpServers.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
});
