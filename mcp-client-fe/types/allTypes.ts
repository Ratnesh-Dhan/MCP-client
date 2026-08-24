import { Dispatch, SetStateAction } from "react";

export type MessageStatus = "thinking" | "generating" | "done" | "aborted";

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
}

export type TextBoxProps = {
  setChat: Dispatch<SetStateAction<ChatMessagesProps>>;
  chat: ChatMessagesProps;
};

export type OllamaModel = {
  model: string;
};

export interface SettingsStore {
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
