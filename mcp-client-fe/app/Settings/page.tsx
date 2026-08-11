"use client";
import LocalNetwork from "@/components/settings/LocalNetwork";
import ModelSelect from "@/components/settings/ModelSelect";
import React from "react";

const Settings = () => {
  const mcpServerConnect = async () => {
    const res = await fetch("/api/mcp/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "dl-assistant",
        command: "pnpm",
        args: ["start"],
        cwd: "D:\\Codes\\ml-assistant-mcp",
      }),
    });

    console.log(await res.json());
  };
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>

      <div className="rounded-xl border p-6">
        <LocalNetwork />
        <ModelSelect />
        <div className="mt-6">
          <h2>Connect MCP server</h2>
          <button
            onClick={mcpServerConnect}
            className="rounded-xl border px-4 py-2"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
