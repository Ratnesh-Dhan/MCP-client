"use client";
import ReactMarkDown from "react-markdown";
import { ChatMessagesProps } from "@/types/allTypes";
import React, { useEffect, useRef } from "react";
import ThinkingBlock from "./ThinkingBlock";

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isPinnedToBottomRef = useRef(true);
  const isProgrammaticScrollRef = useRef(false);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) {
        isProgrammaticScrollRef.current = false;
        return;
      }
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      // Small threshold so it re-pins even if not pixel-perfect at bottom
      const threshold = 40;
      isPinnedToBottomRef.current = distanceFromBottom <= threshold;
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
    // container.scrollTop = container.scrollHeight;
  }, []);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    if (isPinnedToBottomRef.current) {
      isProgrammaticScrollRef.current = true;
      container.scrollTop = container.scrollHeight;
    }
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
              {message.role === "assistant" && (
                <ThinkingBlock
                  thinking={message.thinking ?? ""}
                  isThinking={
                    Boolean(message.thinking) &&
                    !message.content &&
                    message.status !== "aborted"
                  }
                />
              )}
              <ReactMarkDown>{message.content}</ReactMarkDown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
