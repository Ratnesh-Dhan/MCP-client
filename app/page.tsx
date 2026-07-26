"use client";
import ChatMessages from "@/components/ChatMessages/page";
import TextBox from "@/components/TextBox/page";
import { ChatMessagesProps } from "@/types/allTypes";
import { useState } from "react";

export default function Home() {
  const [chat, setChat] = useState<ChatMessagesProps>({
    messages: [{ id: "1", role: "user", content: "Hello!" }],
  });
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-6xl flex-col items-center justify-between py-20 px-16 bg-white dark:bg-black sm:items-start">
        <ChatMessages messages={chat.messages} />
        <TextBox setChat={setChat} />
      </main>
    </div>
  );
}
