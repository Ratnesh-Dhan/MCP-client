"use client";

import { Loader2, Plug, PlugZap, Plus } from "lucide-react";
import {
  fieldLabelClassName,
  primaryButtonClassName,
  selectClassName,
} from "@/components/settings/styles";
import { useEffect, useState } from "react";
import AddMcpModal from "./AddMcpModal";
import { McpServer } from "@/types/allTypes";
import McpServerCard from "./McpServerCard";

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
  const [addMcpOpen, setAddMcpOpen] = useState<boolean>(false);
  const [mcpServers, setMcpServers] = useState<McpServer[]>([]);

  const selected = MCP_SERVERS.find((server) => server.id === value);

  const pullMcpServers = async () => {
    try {
      const res = await fetch("/api/mcp/pull-all-mcp-server");
      if (!res.ok) throw new Error("Unable to pull MCP servers.");
      const response = await res.json();
      console.log("Servers: ", response.servers);

      const servers: McpServer[] = [];
      response.servers.forEach((ele: McpServer) => {
        servers.push({
          id: ele.id,
          name: ele.name,
          command: ele.command,
          args: ele.args,
          cwd: ele.cwd,
          enabled: ele.enabled,
        });
      });
      setMcpServers(servers);
    } catch (error) {
      console.log(error);
      setMcpServers([]);
    }
  };

  useEffect(() => {
    pullMcpServers();
  }, []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {/* <label htmlFor="mcp-server" className={fieldLabelClassName}>
          Server instance
        </label> */}
        <div className="flex flex-row-reverse gap-2">
          <button
            className={primaryButtonClassName}
            onClick={() => setAddMcpOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add MCP
          </button>
        </div>
        <div id="mcp-servers" className="flex flex-col gap-2">
          {mcpServers.length !== 0
            ? mcpServers.map((server) => (
                <McpServerCard
                  key={server.id}
                  server={server}
                  setMcpServers={setMcpServers}
                />
              ))
            : null}
        </div>

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
      <AddMcpModal
        open={addMcpOpen}
        onClose={() => setAddMcpOpen(false)}
        setMcpServers={setMcpServers}
      />
    </div>
  );
}
