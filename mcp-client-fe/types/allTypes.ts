import { Dispatch, SetStateAction } from "react";

export type MessageStatus = "generating" | "done" | "aborted" | "error";
export type AgentActivity =
  | { type: "thinking" }
  | { type: "summarizing" }
  | {
      type: "tool";
      name: string;
      status: "running" | "done" | "error";
    };

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  status?: MessageStatus;
};

export type Chat = {
  messages: Message[];
  model: string;
};

export interface ChatMessagesProps {
  messages: Message[];
  activity?: AgentActivity | null;
  internalSummary?: string;
}

export type TextBoxProps = {
  setChat: Dispatch<SetStateAction<ChatMessagesProps>>;
  chat: ChatMessagesProps;
  setActivity: Dispatch<SetStateAction<AgentActivity | null>>;
  setInternalSummary: Dispatch<SetStateAction<string>>;
};

export type OllamaModel = {
  model: string;
};

export interface SettingsStore {
  mcpStatus: boolean;
  setMcpStatus: (status: boolean) => void;
  model: string;
  setModel: (model: string) => void;
  network: string;
  setNetwork: (network: string) => void;
  networks: ModelNetwork[];
  networksLoaded: boolean;
  setNetworks: (networks: ModelNetwork[]) => void;
  models: OllamaModel[];
  modelsLoadedForNetwork: string;
  setModelsForNetwork: (network: string, models: OllamaModel[]) => void;
}

export interface ModelNetwork {
  id: number;
  url: string;
}

export type McpTool = {
  id: number;
  serverId: number;
  name: string;
  enabled: boolean;
};

export type McpServer = {
  id: number;
  name: string;
  command: string;
  args: string[];
  cwd: string | null;
  enabled: boolean;
  status: "connected" | "connecting" | "failed";
  tools?: McpTool[];
  category?: string;
};

export type StreamChunk =
  | { type: "thinking"; content: string }
  | { type: "content"; content: string }
  | { type: "summary_start" }
  | { type: "summary_end"; summary: string }
  | { type: "summary_error"; message: string }
  | { type: "tool_start"; name: string; args?: unknown }
  | { type: "tool_end"; name: string; output?: string }
  | { type: "error"; message: string };
