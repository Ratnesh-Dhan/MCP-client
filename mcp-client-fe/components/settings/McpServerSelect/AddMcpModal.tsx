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
  const [category, setCategory] = useState<string>("main");
  const [loading, setLoading] = useState<boolean>(false);
  const [apiKeyRows, setApiKeyRows] = useState([
    { id: crypto.randomUUID(), name: "", value: "" },
  ]);

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
      const apiKey = Object.fromEntries(
        apiKeyRows
          .filter((row) => row.name.trim() && row.value.trim())
          .map((row) => [row.name.trim(), row.value.trim()]),
      );
      const argy: string[] = args.split(",").map((arg) => arg.trim());

      const res = await fetch("/api/mcp/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          command: command.trim(),
          args: argy,
          cwd: cwd,
          category: category,
          apiKey: apiKey,
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
          status: "connected",
          tools: response.tools,
          category: category,
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
        setCategory("main");
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

  const addApiKeyRow = () => {
    setApiKeyRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", value: "" },
    ]);
  };

  const updateApiKeyRow = (
    id: string,
    field: "name" | "value",
    value: string,
  ) => {
    setApiKeyRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const removeApiKeyRow = (id: string) => {
    setApiKeyRows((prev) => prev.filter((row) => row.id !== id));
  };

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
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Category
              <span className="ml-1 text-zinc-400">
                (MCP server for main/sub graph)
              </span>
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="main"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="mb-1.5 block text-sm font-medium">
                Api Key
                <span className="ml-1 text-zinc-400">(optional)</span>
              </label>
              <button
                type="button"
                onClick={addApiKeyRow}
                className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                + Add
              </button>
            </div>
            <div className="space-y-3">
              {apiKeyRows.map((row) => (
                <div key={row.id} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1 space-y-2">
                    <input
                      value={row.name}
                      onChange={(e) =>
                        updateApiKeyRow(row.id, "name", e.target.value)
                      }
                      placeholder="Environment variable (e.g. TAVILY_API_KEY)"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                    <input
                      type="password"
                      value={row.value}
                      onChange={(e) =>
                        updateApiKeyRow(row.id, "value", e.target.value)
                      }
                      placeholder="API key value"
                      autoComplete="off"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeApiKeyRow(row.id)}
                    aria-label="Remove API key"
                    className="rounded-md px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
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
