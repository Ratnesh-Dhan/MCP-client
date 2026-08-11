"use client";
import ReactMarkDown from "react-markdown";
import { ChatMessagesProps } from "@/types/allTypes";
import { useEffect, useRef } from "react";

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);
  return (
    <div
      ref={chatContainerRef}
      className="flex-1 w-full overflow-y-auto max-h-[640px] custom-scrollbar"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-3xl px-5 py-3 whitespace-pre-wrap wrap-break-word ${
                message.role === "user"
                  ? "bg-[#215E61] text-[#FF9E20]"
                  : "bg-transparent text-zinc-100"
              }`}
            >
              <ReactMarkDown>{message.content}</ReactMarkDown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
