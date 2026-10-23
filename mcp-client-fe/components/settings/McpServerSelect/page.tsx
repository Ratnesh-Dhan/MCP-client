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

  const pullMcpServers = async () => {
    try {
      const res = await fetch("/api/mcp/pull-all-mcp-server");
      if (!res.ok) throw new Error("Unable to pull MCP servers.");
      const response = await res.json();
      console.log("this is the server fromt he DB : ", response.servers);
      setMcpServers(response.servers);
    } catch (error) {
      console.log(error);
      setMcpServers([]);
    }
  };

  useEffect(() => {
    pullMcpServers();
    const MCPStatusEvents = new EventSource(
      "/api/mcp/mcp-server-status-events",
    );

    MCPStatusEvents.addEventListener("mcp-status", (event) => {
      const status = JSON.parse(event.data);
      setMcpServers((prev) =>
        prev.map((server) =>
          server.name === status.name
            ? {
                ...server,
                status: status.status,
                error: status.error,
              }
            : server,
        ),
      );
    });

    return () => {
      MCPStatusEvents.close();
    };
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
      </div>
      <AddMcpModal
        open={addMcpOpen}
        onClose={() => setAddMcpOpen(false)}
        setMcpServers={setMcpServers}
      />
    </div>
  );
}
