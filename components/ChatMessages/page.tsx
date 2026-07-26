"use client";

import { ChatMessagesProps } from "@/types/allTypes";

export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto">
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
                  ? "bg-zinc-800 text-white"
                  : "bg-transparent text-zinc-100"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
