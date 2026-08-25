"use client";

import { Loader2, Plug, PlugZap } from "lucide-react";
import {
  fieldLabelClassName,
  primaryButtonClassName,
  selectClassName,
} from "@/components/settings/styles";

export type McpServerConfig = {
  name: string;
  command: string;
  args: string[];
  cwd: string;
};

type McpServerOption = {
  id: string;
  label: string;
  config: McpServerConfig;
};

export const MCP_SERVERS: McpServerOption[] = [
  {
    id: "jinah-windows",
    label: "Jinah (Windows)",
    config: {
      name: "jinah",
      command: "pnpm",
      args: ["start"],
      cwd: "D:\\Codes\\jinah",
    },
  },
  {
    id: "jinah-linux",
    label: "Jinah (Linux)",
    config: {
      name: "jinah",
      command: "pnpm",
      args: ["start"],
      cwd: "/home/zumbie/Codes/PERSONAL/jinah-mcp",
    },
  },
];

type McpServerSelectProps = {
  value: string;
  connecting: boolean;
  onChange: (value: string) => void;
  onConnect: () => void;
};

export default function McpServerSelect({
  value,
  connecting,
  onChange,
  onConnect,
}: McpServerSelectProps) {
  const selected = MCP_SERVERS.find((server) => server.id === value);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="mcp-server" className={fieldLabelClassName}>
          Server instance
        </label>

        <div className="relative">
          <Plug className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <select
            id="mcp-server"
            value={value}
            disabled={connecting}
            onChange={(e) => onChange(e.target.value)}
            className={`${selectClassName} appearance-none pl-10`}
          >
            {MCP_SERVERS.map((server) => (
              <option key={server.id} value={server.id}>
                {server.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selected && (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-950/50">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Working directory
          </p>
          <p className="mt-1 font-mono text-sm text-zinc-700 dark:text-zinc-300">
            {selected.config.cwd}
          </p>
        </div>
      )}

      <button
        type="button"
        className={primaryButtonClassName}
        disabled={connecting || !value}
        onClick={onConnect}
      >
        {connecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <PlugZap className="h-4 w-4" />
            Connect server
          </>
        )}
      </button>
    </div>
  );
}
