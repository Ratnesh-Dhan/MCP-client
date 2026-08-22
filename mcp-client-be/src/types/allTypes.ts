export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Chat = {
  messages: Message[];
  model: string;
};
export type MCPContent = {
  type: "text";
  text?: string;
};

export type MCPResource = {
  uri: string;
  name?: string;
  description?: string;
  mimeType?: string;
};

export interface UrlDBSchema {
  url: string;
}

export type MCPTool = {
  name: string;
  description?: string;
  inputSchema: {
    type: "object";
    properties?: Record<string, unknown>;
    required?: string[];
  };
};

export type buildAgentGraphType = {
  model: string;
  serverName: string;
};
