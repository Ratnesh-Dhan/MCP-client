import { eq, and } from "drizzle-orm";
import { db } from "./client.js";
import { userSettings, mcpServers, mcpTools } from "./schema.js";

// Get all user Settings
export async function getUserSettings() {
  return db.select().from(userSettings).limit(1);
}

// Update user Settings
export async function updateModelNetwork(modelNetwork: string, modelName: string) {
    const existing = await getUserSettings();

    if(existing.length === 0) {
        return db.insert(userSettings).values({modelNetwork, modelName}).returning();
    }
    return db.update(userSettings).set({ modelNetwork, modelName}).where(eq(userSettings.id, existing[0].id)).returning();
}

// Get all MCP Servers
export async function getMcpServers() {
    return db.select().from(mcpServers);
}

// Get only Live MCP Servers
export async function getLiveMcpServer() {
    return db.select().from(mcpServers).where(eq(mcpServers.enabled, true));
}

// Get one MCP Server
export async function getMcpServer(id: number) {
    return db.select().from(mcpServers).where(eq(mcpServers.id, id)).limit(1);
}

// Add MCP Server
export async function addMcpServer(data: {name: string; command: string; args?: string[]; cwd?: string;}){
    return db.insert(mcpServers).values(data).returning();
}

// Update MCP Server
export async function updateMcpServer(id: number, data: {name?: string; command?: string; args?: string[], cwd?: string;}){
    return db.update(mcpServers).set(data).where(eq(mcpServers.id, id)).returning();
}

// Delete MCP Server
export async function deleteMcpServer(id: number) {
    return db.delete(mcpServers).where(eq(mcpServers.id, id)).returning();
}

// Get all enabled tools for an enabled MCP Server
export async function getMcpTools(serverId: number) {
    return db.select().from(mcpTools)
    .innerJoin(mcpServers, eq(mcpTools.mcpServerId, serverId))
    .where(and(
        eq(mcpTools.mcpServerId, serverId), 
        eq(mcpTools.enabled, true),
        eq(mcpServers.enabled, true)
    ));
}

// Add a tool
export async function addMcpTool(data: {mcpServerId: number; name: string; enabled?: boolean}){
    return db.insert(mcpTools).values(data).returning();
}

// Enable or Disable a tool
export async function setMcpToolEnabled( toolId: number, enabled: boolean) {
    return db.update(mcpTools).set({enabled}).where(eq(mcpTools.id, toolId)).returning();
}

export async function deleteMcpTool(toolId: number) {
    return db.delete(mcpTools).where(eq(mcpTools.id, toolId)).returning();
}