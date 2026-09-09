"use client";
// https://medium.com/@jonigl/using-ollama-with-typescript-a-simple-guide-20f5e8d3827c
import { useEffect, useRef, useState } from "react";
import { ArrowUp, CircleStop } from "lucide-react";
import { Message, MessageStatus, TextBoxProps } from "@/types/allTypes";
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
    const id = crypto.randomUUID();

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
            let status: MessageStatus = "thinking";
            const data = JSON.parse(rawJson);
            switch (data.type) {
              case "thinking":
                thinkingText += data.content;
                status = "thinking";
                break;
              case "content":
                assistantText += data.content;
                status = "generating";
                break;
              case "tool_start":
                setActiveTool(`Using tool: ${data.name}`);
                break;
              case "tool_end":
                setActiveTool(null);
                break;
              case "error":
                console.log("Agent error:", data.message);
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
                  status: status,
                };
              } else {
                updatedMessages.push({
                  id,
                  role: "assistant",
                  content: assistantText,
                  thinking: thinkingText,
                  status: status,
                });
              }

              return { ...prev, messages: updatedMessages };
            });
          } catch (e) {
            console.error("Failed to parse SSE JSON chunk: ", rawJson, e);
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        console.log("Generation stopped");
        setChat((prev) => ({
          ...prev,
          messages: prev.messages.map((message) =>
            message.id === id
              ? {
                  ...message,
                  status: "aborted",
                }
              : message,
          ),
        }));
        return;
      }
      console.error("Generation Error : ", err);
    } finally {
      setEnableAbort(false);
      setActiveTool(null);

      if (abortController.current === controller) {
        abortController.current = null;
      }
    }
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const stopGeneration = () => {
    if (!abortController.current) return;
    abortController.current?.abort();
  };

  return (
    <div
      onClick={() => textareaRef.current?.focus()}
      className="fixed bottom-6 left-1/2 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 rounded-[1.75rem] border border-slate-200 bg-white/95 px-4 py-3 shadow-2xl shadow-slate-300/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95 dark:shadow-black/40"
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
        text-slate-950
        placeholder:text-slate-400
        outline-none
        max-h-[200px]
        dark:text-white
        dark:placeholder:text-zinc-500
        "
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0 text-sm font-medium text-emerald-700 dark:text-emerald-300">
          {activeTool && <p className="truncate">{activeTool}</p>}
        </div>
        {enableAbort ? (
          <button
            onClick={stopGeneration}
            className="
          flex h-9 w-9 items-center justify-center
            rounded-full
            bg-slate-950
            text-white
            hover:bg-slate-800
            disabled:opacity-40
            dark:bg-white
            dark:text-black
            dark:hover:bg-zinc-200
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
            bg-emerald-500
            text-slate-950
            hover:bg-emerald-400
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
