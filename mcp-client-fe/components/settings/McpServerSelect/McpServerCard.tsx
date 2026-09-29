"use client";

import { McpServer } from "@/types/allTypes";
import { ChevronDown, Server, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

export type McpServerCardProps = {
  server: McpServer;
  setMcpServers: Dispatch<SetStateAction<McpServer[]>>;
};

export default function McpServerCard({
  server,
  setMcpServers,
}: McpServerCardProps) {
  const [showTools, setShowTools] = useState(false);

  const onDelete = (id: number) => {
    try {
      setMcpServers((prevServers) =>
        prevServers.filter((server) => server.id !== id),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const onToggleServer = (id: number, status: boolean) => {
    if (status) {
      //start the mcp server
    } else {
      // turn off the mcp server
    }

    setMcpServers((prevServer) =>
      prevServer.map((server) =>
        server.id === id ? { ...server, enabled: status } : server,
      ),
    );
  };

  const onToggleTool = (serverId: number, toolId: number, status: boolean) => {
    setMcpServers((prevServers) =>
      prevServers.map((server) =>
        server.id === serverId
          ? {
              ...server,
              tools: server.tools?.map((tool) =>
                tool.id === toolId ? { ...tool, enabled: status } : tool,
              ),
            }
          : server,
      ),
    );
  };
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Server header */}
      <div className="flex items-center gap-3 p-4">
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
          <Server className="h-5 w-5" />
        </div>

        {/* Server information */}
        <div className="min-w-0 flex-1">
          <div className="font-medium text-zinc-900 dark:text-zinc-100">
            {server.name}
          </div>

          <div className="truncate font-mono text-xs text-zinc-500">
            {server.command} {server.args?.join(" ")}
          </div>
        </div>

        {/* Status */}
        <span
          className={`hidden rounded-full px-2 py-1 text-xs font-medium sm:block ${
            server.enabled
              ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
          }`}
        >
          {server.enabled ? "Enabled" : "Disabled"}
        </span>

        {/* Server switch */}
        <button
          type="button"
          onClick={() => onToggleServer(server.id, !server.enabled)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            server.enabled ? "bg-violet-600" : "bg-zinc-300 dark:bg-zinc-700"
          }`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
              server.enabled ? "left-6" : "left-1"
            }`}
          />
        </button>

        {/* Tools button */}
        <button
          type="button"
          onClick={() => setShowTools((value) => !value)}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              showTools ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(server.id)}
          className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Tools */}
      {server.tools
        ? showTools && (
            <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Tools · {server.tools.length}
              </div>

              {server.tools.length === 0 ? (
                <p className="py-2 text-sm text-zinc-500">
                  No tools available.
                </p>
              ) : (
                <div className="space-y-1">
                  {server.tools.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    >
                      <div className="flex-1">
                        <div className="font-mono text-sm text-zinc-800 dark:text-zinc-200">
                          {tool.name}
                        </div>
                      </div>

                      {/* Tool switch */}
                      <button
                        type="button"
                        onClick={() =>
                          onToggleTool(server.id, tool.id, !tool.enabled)
                        }
                        className={`relative h-5 w-9 rounded-full transition ${
                          tool.enabled
                            ? "bg-violet-600"
                            : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                            tool.enabled ? "left-4.5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        : null}
    </div>
  );
}
