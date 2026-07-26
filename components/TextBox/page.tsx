"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Message, TextBoxProps } from "@/types/allTypes";

export default function TextBox({ setChat, chat }: TextBoxProps) {
  const [text, setText] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [text]);

  const sendMessage = async () => {
    if (!text?.trim()) return;

    const message: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setChat((prev) => ({ ...prev, messages: [...prev.messages, message] }));
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
    }
    console.log("this is chat ", chat);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [...chat.messages, message],
      }),
    });
    const data = await res.json();
    console.log("this is data, ", data);
    // const assistantMessage: Message = {
    //   id: crypto.randomUUID(),
    //   role: "assistant",
    //   content: data.message.content,
    // };
    // setChat((prev) => ({
    //   ...prev,
    //   messages: [...prev.messages, assistantMessage],
    // }));
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div
      onClick={() => textareaRef.current?.focus()}
      className="w-full max-w-4xl rounded-3xl border border-zinc-700 bg-zinc-900 px-4 py-3"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        placeholder="Message Local AI..."
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="
          w-full
          resize-none
          overflow-y-auto
          bg-transparent
          text-white
          placeholder:text-zinc-500
          outline-none
          max-h-[200px]
        "
      />

      <div className="mt-3 flex justify-end">
        <button
          onClick={sendMessage}
          className="
            flex h-9 w-9 items-center justify-center
            rounded-full
            bg-white
            text-black
            hover:bg-zinc-200
            disabled:opacity-40
          "
          disabled={!text.trim()}
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </div>
  );
}
