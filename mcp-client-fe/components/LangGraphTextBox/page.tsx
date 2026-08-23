"use client";
// https://medium.com/@jonigl/using-ollama-with-typescript-a-simple-guide-20f5e8d3827c
import { useEffect, useRef, useState } from "react";
import { ArrowUp, CircleStop } from "lucide-react";
import { Message, TextBoxProps } from "@/types/allTypes";
import { useSettingsStore } from "@/store/settings";

export default function LangGraphTextBox({ setChat, chat }: TextBoxProps) {
  const abortController = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState<string>("");
  const [enableAbort, setEnableAbort] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const { model } = useSettingsStore();

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
      thinking: "",
    };

    return message;
  };

  const sendMessage = async () => {
    if (!text?.trim()) return;

    // abort controller setting up
    const controller = new AbortController();
    abortController.current = controller;
    // enable abort state
    setEnableAbort(true);

    try {
      const userMessage = messageBuilder(text, true);

      // Build the full conversation
      const messages = [...chat.messages, userMessage];
      const sendableMessages = messages.map(({ id, role, content }) => ({
        id,
        role,
        content,
      }));

      // Update the UI immediately
      setChat((prev) => ({
        ...prev,
        messages,
      }));
      setText("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "0px";
      }

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: sendableMessages,
        }),
        signal: controller.signal,
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let assistantText: string = "";
      let thinkingText: string = "";
      let buffer = "";
      const id = crypto.randomUUID();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            // const rawJson = trimmed.replace("data: ", "").trim();
            const rawJson = trimmed.slice(6).trim();
            if (!rawJson) continue;

            try {
              const data = JSON.parse(rawJson);
              switch (data.type) {
                case "thinking":
                  thinkingText += data.content;
                  break;
                case "content":
                  assistantText += data.content;
                  break;
                case "tool_start":
                  setActiveTool(`Using tool: ${data.name}`);
                  break;
                case "tool_end":
                  setActiveTool(null);
                  break;
                case "error":
                  console.error("Agent error:", data.message);
                  break;
              }
              setChat((prev) => {
                const updatedMessages = [...prev.messages];
                const lastIndex = updatedMessages.length - 1;
                const lastMessage = updatedMessages[lastIndex];

                if (lastMessage?.id === id) {
                  updatedMessages[lastIndex] = {
                    ...lastMessage,
                    content: assistantText,
                    thinking: thinkingText,
                  };
                } else {
                  updatedMessages.push({
                    id,
                    role: "assistant",
                    content: assistantText,
                    thinking: thinkingText,
                  });
                }

                return { ...prev, messages: updatedMessages };
              });
            } catch (e) {
              console.error("Failed to parse SSE JSON chunk: ", rawJson, e);
            }
          }
        }
      } finally {
        setEnableAbort(false);
        setActiveTool(null);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        console.log("Generation stopped");
        return;
      }
      console.log(err);
    }
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const stopGeneration = () => {
    abortController.current?.abort();
  };

  return (
    <div
      onClick={() => textareaRef.current?.focus()}
      className="absolute translate-x-0 md:-translate-x-10 lg:translate-x-15 bottom-10 w-full max-w-4xl rounded-3xl border border-zinc-700 bg-zinc-900 px-4 py-3"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        placeholder="Chat with Agent..."
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
        {enableAbort ? (
          <button
            onClick={stopGeneration}
            className="
          flex h-9 w-9 items-center justify-center
            rounded-full
            bg-white
            text-black
            hover:bg-zinc-200
            disabled:opacity-40
            "
          >
            <CircleStop size={18} />
          </button>
        ) : (
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
        )}
      </div>
    </div>
  );
}
