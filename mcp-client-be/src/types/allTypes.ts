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
