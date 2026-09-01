export type StreamChunk =
  | { type: "thinking"; content: string }
  | { type: "content"; content: string }
  | { type: "tool_start"; name: string; args: any }
  | { type: "tool_end"; name: string; output: string }
  | { type: "error"; message: string };

export type typeRunAgentStream = {
  model: string;
  messages: Array<{ role: string; content: string }>;
  serverName: string;
  signal?: AbortSignal;
};

export type typeClassifier = {
  model: string;
  userMessage: string;
  conversation: { role: string; content: string }[];
  availableTools: string[];
  signal?: AbortSignal;
};

export type ToolExecution = {
  name: string;
  args?: unknown;
  success?: boolean;
  output?: string;
};
