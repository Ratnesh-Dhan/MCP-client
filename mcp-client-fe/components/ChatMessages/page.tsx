"use client";
import ReactMarkDown from "react-markdown";
import { ChatMessagesProps } from "@/types/allTypes";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import ThinkingBlock from "./ThinkingBlock";

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isPinnedToBottomRef = useRef(true);
  const isProgrammaticScrollRef = useRef(false);
  const latestMessage = messages.at(-1);

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
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
    // container.scrollTop = container.scrollHeight;
  }, []);

  useLayoutEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    if (isPinnedToBottomRef.current) {
      const scrollToBottom = () => {
        isProgrammaticScrollRef.current = true;
        bottomRef.current?.scrollIntoView({ block: "end" });
      };

      scrollToBottom();
      const animationFrame = requestAnimationFrame(scrollToBottom);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [
    messages.length,
    latestMessage?.content,
    latestMessage?.thinking,
    latestMessage?.status,
  ]);

  return (
    <div
      ref={chatContainerRef}
      className="custom-scrollbar min-h-0 w-full flex-1 overflow-y-auto rounded-[2rem] border border-white/70 bg-white/70 shadow-xl shadow-slate-200/70 backdrop-blur dark:border-white/10 dark:bg-slate-950/45 dark:shadow-black/20"
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
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-300/80 dark:bg-emerald-400 dark:text-slate-950 dark:shadow-none"
                  : "bg-white text-slate-800 shadow-sm shadow-slate-200/70 dark:bg-white/10 dark:text-zinc-100 dark:shadow-none"
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
        <div ref={bottomRef} className="h-px w-full shrink-0" />
      </div>
    </div>
  );
}
