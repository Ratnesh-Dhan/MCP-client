import { AgentActivity } from "@/types/allTypes";
import { Loader2 } from "lucide-react";
import React from "react";

const AgentActivityIndicator = ({
  activity,
}: {
  activity: AgentActivity | null;
}) => {
  if (!activity) return null;
  const label =
    activity.type === "summarizing"
      ? "Condensing conversation history..."
      : activity.type === "thinking"
        ? "Thinking..."
        : activity.status === "running"
          ? `Running ${activity.name}...`
          : activity.status === "done"
            ? `${activity.name} completed`
            : `${activity.name} failed`;

  const isActive =
    activity.type === "summarizing" ||
    activity.type === "thinking" ||
    activity.status === "running";
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 self-start px-2 text-sm text-slate-500 dark:text-zinc-400"
    >
      {isActive && <Loader2 className="h-4 w-4 animate-spin" />}
      <span>{label}</span>
    </div>
  );
};

export default AgentActivityIndicator;
