"use client";
// https://medium.com/@jonigl/using-ollama-with-typescript-a-simple-guide-20f5e8d3827c
import { useEffect, useRef, useState } from "react";
import { ArrowUp, CircleStop } from "lucide-react";
import {
  AgentActivity,
  Message,
  StreamChunk,
  TextBoxProps,
} from "@/types/allTypes";
import { useSettingsStore } from "@/store/settings";

export default function LangGraphTextBox({
  setChat,
  chat,
  setActivity,
  setInternalSummary,
}: TextBoxProps) {
  const abortController = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState<string>("");
  const [enableAbort, setEnableAbort] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string>("");

  const { model } = useSettingsStore();

  useEffect(() => {
    const threadIdMethod = () => {
      setThreadId(crypto.randomUUID());
    };
    threadIdMethod();
  }, []);
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
    if (!text?.trim() || enableAbort) return;

    // abort controller setting up
    const controller = new AbortController();
    abortController.current = controller;

    const userText = text.trim();
    const userMessage = messageBuilder(userText, true);
    const assistantId = crypto.randomUUID();

    let assistantText: string = "";
    let thinkingText: string = "";

    // enable abort state
    setEnableAbort(true);
    setActivity(null);
    setActiveTool(null);

    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      thinking: "",
      status: "generating",
    };

    setChat((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage, assistantMessage],
    }));
    setText("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
    }

    const updateAssistant = (updates: Partial<Message>) => {
      setChat((prev) => ({
        ...prev,
        messages: prev.messages.map((message) =>
          message.id === assistantId ? { ...message, ...updates } : message,
        ),
      }));
    };

    const handleChunk = (chunk: StreamChunk) => {
      switch (chunk.type) {
        case "thinking":
          thinkingText += chunk.content;
          setActivity({ type: "thinking" });
          updateAssistant({ thinking: thinkingText, status: "generating" });
          break;

        case "content":
          assistantText += chunk.content;
          setActivity(null);
          updateAssistant({ content: assistantText, status: "generating" });
          break;

        case "summary_end":
          setInternalSummary(chunk.summary);
          setActivity(null);
          break;

        case "summary_start":
          setActivity({ type: "summarizing" });
          break;

        case "summary_error":
          setActivity(null);
          console.error("Summary error: ", chunk.message);
          break;

        case "tool_start":
          setActiveTool(`Using tool: ${chunk.name}`);
          setActivity({ type: "tool", name: chunk.name, status: "running" });
          break;

        case "tool_end":
          setActivity(null);
          setActiveTool(null);
          break;

        case "error":
          setActiveTool(null);
          setActivity(null);
          console.error("Agent error: ", chunk.message);
          updateAssistant({ status: "error" });
      }
    };
    try {
      // Include new user message in the request .
      const conversation = [...chat.messages, userMessage];
      const sendableMessages = conversation.map(({ id, role, content }) => ({
        id,
        role,
        content,
      }));

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: sendableMessages,
          threadId: threadId,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`Agent request failed: HTTP ${res.status}`);
      }

      if (!res.body) {
        throw new Error("Agent response has no readable stream.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processFrame = (frame: string) => {
        const dataLines = frame
          .split(/\r?\n/)
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).replace(/^ /, ""));

        if (dataLines.length === 0) return;

        const rawJson = dataLines.join("\n").trim();
        if (!rawJson || rawJson === "[DONE]") return;

        try {
          const chunk = JSON.parse(rawJson) as StreamChunk;
          handleChunk(chunk);
        } catch (error) {
          console.error("Invalid stream event: ", rawJson, error);
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line.
        const frames = buffer.split(/\r?\n\r?\n/);
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          processFrame(frame);
        }
      }
      // Flushing any remaining decoder bytes and process a final frame.
      buffer += decoder.decode();
      if (buffer.trim()) {
        processFrame(buffer);
      }
      updateAssistant({ status: "done" });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        console.log("Generation stopped");
        updateAssistant({ status: "aborted" });
      } else {
        console.error("Generation Error : ", err);
        updateAssistant({ status: "error" });
      }
    } finally {
      setEnableAbort(false);
      setActiveTool(null);
      setActivity(null);
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
