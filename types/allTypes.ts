export type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
  };
  
  export interface ChatMessagesProps {
    messages: Message[];
  }