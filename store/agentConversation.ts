import type { Message } from "ollama";
import { create } from "zustand";

export interface AgentConversationStore {
  conversation: Message[];
  setConversation: (conversation: Message[]) => void;
}
export const useAgentConversationStore = create<AgentConversationStore>(
  (set) => ({
    conversation: [],
    setConversation: (conversation) => set({ conversation }),
  }),
);
