"use client";

import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settings";
import LocalNetwork from "@/components/settings/LocalNetwork";
import ModelSelect from "@/components/settings/ModelSelect";

type Network = {
  id: string;
  url: string;
};

type Model = {
  model: string;
};

export default function Settings() {
  const { network, model, setNetwork, setModel } = useSettingsStore();

  const [networks, setNetworks] = useState<Network[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  const [loadingNetworks, setLoadingNetworks] = useState(true);

  const [loadingModels, setLoadingModels] = useState(false);

  // Load networks when settings page opens
  useEffect(() => {
    const loadNetworks = async () => {
      try {
        setLoadingNetworks(true);

        const res = await fetch("/api/modelNetwork/getNetwork");

        if (!res.ok) {
          throw new Error(`Failed to load networks: ${res.status}`);
        }

        const data = await res.json();

        setNetworks(data);

        // Automatically select first network
        if (!network && data.length > 0) {
          setNetwork(data[0].url);
        }
      } catch (error) {
        console.error("Network loading error:", error);
      } finally {
        setLoadingNetworks(false);
      }
    };

    loadNetworks();
  }, []);

  // Load models whenever network changes
  useEffect(() => {
    if (!network) {
      setModels([]);
      setModel("");
      return;
    }

    const loadModels = async () => {
      try {
        setLoadingModels(true);

        const res = await fetch(
          `/api/models?network=${encodeURIComponent(network)}`,
        );

        if (!res.ok) {
          throw new Error(`Failed to load models: ${res.status}`);
        }

        const data = await res.json();

        setModels(data.models ?? []);

        // Automatically select first model
        if (data.models?.length > 0) {
          setModel(
            data.models.some((m: Model) => m.model === model)
              ? model
              : data.models[0].model,
          );
        } else {
          setModel("");
        }
      } catch (error) {
        console.error("Model loading error:", error);

        setModels([]);
        setModel("");
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();
  }, [network]);

  const mcpServerConnect = async () => {
    const res = await fetch("/api/mcp/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // name: "dl-assistant",
        name: "jinah",
        command: "pnpm",
        args: ["start"],
        cwd: "/home/zumbie/Codes/PERSONAL/jinah-mcp",
        // cwd: "D:\\Codes\\ml-assistant-mcp",
      }),
    });

    console.log(await res.json());
  };

  return (
    <div className="rounded-xl border p-6 space-y-6">
      <h2 className="text-lg text-center">
        Judgmental Intelligent Neural Assistant
      </h2>
      <LocalNetwork
        networks={networks}
        value={network}
        loading={loadingNetworks}
        onChange={setNetwork}
      />

      <ModelSelect
        models={models}
        value={model}
        loading={loadingModels}
        disabled={!network}
        onChange={setModel}
      />

      <div className="mt-6">
        <h2>Connect MCP server</h2>

        <button
          className="rounded-xl border px-4 py-2"
          onClick={mcpServerConnect}
        >
          Connect
        </button>
      </div>
    </div>
  );
}
// "use client";
// import LocalNetwork from "@/components/settings/LocalNetwork";
// import ModelSelect from "@/components/settings/ModelSelect";
// import React from "react";

// const Settings = () => {
//   const mcpServerConnect = async () => {
//     const res = await fetch("/api/mcp/connect", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         name: "dl-assistant",
//         command: "pnpm",
//         args: ["start"],
//         cwd: "D:\\Codes\\ml-assistant-mcp",
//       }),
//     });

//     console.log(await res.json());
//   };
//   return (
//     <div className="mx-auto max-w-2xl p-6">
//       <h1 className="mb-6 text-3xl font-bold">Settings</h1>

//       <div className="rounded-xl border p-6">
//         <LocalNetwork />
//         <ModelSelect />
//         <div className="mt-6">
//           <h2>Connect MCP server</h2>
//           <button
//             onClick={mcpServerConnect}
//             className="rounded-xl border px-4 py-2"
//           >
//             Connect
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Settings;
