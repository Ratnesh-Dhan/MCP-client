"use client";
import ChatMessages from "@/components/ChatMessages/page";
import TextBox from "@/components/TextBox/page";
import { ChatMessagesProps } from "@/types/allTypes";
import { useState } from "react";

export default function Home() {
  const [chat, setChat] = useState<ChatMessagesProps>({
    messages: [],
  });
  return (
    <div className="flex flex-col flex-1 justify-center items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-6xl flex-col items-center justify-between pt-3 px-16 bg-white dark:bg-black sm:items-start">
        <ChatMessages messages={chat.messages} />
        <TextBox setChat={setChat} chat={chat} />
      </main>
    </div>
  );
}
