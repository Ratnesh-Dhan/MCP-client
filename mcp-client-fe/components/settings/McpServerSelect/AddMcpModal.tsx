"use client";

import { McpServer } from "@/types/allTypes";
import { Loader2, X } from "lucide-react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type AddMcpModalProps = {
  open: boolean;
  onClose: () => void;
  setMcpServers: Dispatch<SetStateAction<McpServer[]>>;
};

export default function AddMcpModal({
  open,
  onClose,
  setMcpServers,
}: AddMcpModalProps) {
  const [name, setName] = useState<string>("");
  const [command, setCommand] = useState<string>("");
  const [args, setArgs] = useState<string>("");
  const [cwd, setCwd] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const submittingRef = useRef(false);

  // const generateNumericId = (): number => {
  //   const buffer = new Uint32Array(1);
  //   crypto.getRandomValues(buffer);
  //   return buffer[0];
  // };

  const addMcpServers = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      const argy: string[] = args.split(",").map((arg) => arg.trim());

      const res = await fetch("/api/mcp/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          command: command.trim(),
          args: argy,
          cwd: cwd,
        }),
      });
      const response = await res.json();
      if (response.success) {
        const newServer: McpServer = {
          id: response.id,
          name: name.trim(),
          command: command.trim(),
          args: argy,
          cwd: cwd,
          enabled: true,
        };

        setMcpServers((prevServers) => {
          const name_exists = prevServers.some(
            (server) => server.name === newServer.name,
          );
          const cwd_exists = prevServers.some(
            (server) => server.cwd === newServer.cwd,
          );

          if (name_exists || cwd_exists) {
            console.warn("A server with this name already exists!");
            return prevServers;
          }
          return [...prevServers, newServer];
        });

        setName("");
        setCommand("");
        setArgs("");
        setCwd("");
      } else {
        throw new Error("DB operation failed.");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      submittingRef.current = false;
      onClose();
    }
  }, [onClose, setMcpServers, name, command, args, cwd]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && !loading) {
        addMcpServers();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, addMcpServers, loading]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Add MCP Server</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Configure a new MCP server.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Server name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Telegram MCP"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Command</label>

            <input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="npx"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Arguments
            </label>

            <input
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              placeholder="start, 3000, @modelcontextprotocol/server-github"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Working directory
              <span className="ml-1 text-zinc-400">(optional)</span>
            </label>

            <input
              value={cwd}
              onChange={(e) => setCwd(e.target.value)}
              placeholder="/path/to/server"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>

          <button
            type="button"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            onClick={addMcpServers}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding
              </>
            ) : (
              <>Add Server</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
