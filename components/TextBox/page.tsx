"use client";
// https://medium.com/@jonigl/using-ollama-with-typescript-a-simple-guide-20f5e8d3827c
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

  const messageBuilder = (text: string, role: boolean) => {
    const message: Message = {
      id: crypto.randomUUID(),
      role: role ? "user" : "assistant",
      content: text,
    };

    return message;
  };

  const sendMessage = async () => {
    if (!text?.trim()) return;

    const userMessage = messageBuilder(text, true);

    // Build the full conversation
    const messages = [...chat.messages, userMessage];

    // Update the UI immediately
    setChat((prev) => ({
      ...prev,
      messages,
    }));
    console.log("chat : ", chat.messages);
    setText("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
    }

    const res = await fetch("/api/ollamaChat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "nemotron-mini:4b",
        messages,
      }),
    });

    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let assistantText: string = "";
    const id = crypto.randomUUID();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      assistantText += decoder.decode(value, { stream: true });
      setChat((prev) => {
        const messages = [...prev.messages];
        const lastIndex = messages.length - 1;
        const lastMessage = messages[lastIndex];

        if (lastMessage?.id === id) {
          messages[lastIndex] = { ...lastMessage, content: assistantText };
        } else {
          messages.push({
            id,
            role: "assistant",
            content: assistantText,
          });
        }

        return { ...prev, messages };
      });
    }
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
      className="absolute translate-x-15 bottom-10 w-full max-w-4xl rounded-3xl border border-zinc-700 bg-zinc-900 px-4 py-3"
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
