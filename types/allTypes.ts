import { Dispatch, SetStateAction } from "react";

export type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
  };
  
  export interface ChatMessagesProps {
    messages: Message[];
  }

  export type TextBoxProps = {
    setChat: Dispatch<SetStateAction<ChatMessagesProps>>;
    chat: ChatMessagesProps;
  };
  