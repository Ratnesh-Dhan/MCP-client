"use client";

import ReactMarkDown from "react-markdown";
import React, { useEffect, useState } from "react";

export default function ThinkingBlock({
  thinking,
  isThinking,
}: {
  thinking: string;
  isThinking: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [frame, setFrame] = useState(0);

  const animationFrames = ["/", "|", "-", "\\"];

  useEffect(() => {
    if (!isThinking) return;

    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % animationFrames.length);
    }, 150);

    return () => clearInterval(interval);
  }, [isThinking]);

  if (!thinking) return null;

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <span className="font-mono w-3">
          {isThinking ? animationFrames[frame] : "✓"}
        </span>

        <span>{isThinking ? "Thinking" : "Thought process"}</span>

        <span
          className={`text-xs transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div className="mt-2 rounded-2xl border border-slate-700 bg-slate-800/70 p-3 text-sm text-zinc-400">
          <ReactMarkDown>{thinking}</ReactMarkDown>
        </div>
      )}
    </div>
  );
}
