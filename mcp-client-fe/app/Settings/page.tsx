"use client";

import { useCallback, useRef, useState } from "react";
import { Cpu, Settings2, Sparkles } from "lucide-react";
import LocalNetwork from "@/components/settings/LocalNetwork";
import ModelSelect from "@/components/settings/ModelSelect";
import McpServerSelect, {
  MCP_SERVERS,
} from "@/components/settings/McpServerSelect";
import SettingsSection from "@/components/settings/SettingsSection";
import { useSettingsStore } from "@/store/settings";

export default function Settings() {
  const {
    network,
    model,
    setNetwork,
    setModel,
    networks,
    networksLoaded,
    setNetworks,
    models,
    modelsLoadedForNetwork,
    setModelsForNetwork,
  } = useSettingsStore();

  const [loadingNetworks, setLoadingNetworks] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [mcpServer, setMcpServer] = useState(MCP_SERVERS[1].id);
  const [connectingMcp, setConnectingMcp] = useState(false);

  const loadNetworksPromise = useRef<Promise<void> | null>(null);
  const loadModelsPromise = useRef<Promise<void> | null>(null);

  const loadNetworks = useCallback(async () => {
    if (networksLoaded) return;
    if (loadNetworksPromise.current) return loadNetworksPromise.current;

    loadNetworksPromise.current = (async () => {
      try {
        setLoadingNetworks(true);

        const res = await fetch("/api/modelNetwork/getNetwork");

        if (!res.ok) {
          throw new Error(`Failed to load networks: ${res.status}`);
        }

        const data = await res.json();

        setNetworks(data);

        if (!network && data.length > 0) {
          setNetwork(data[0].url);
        }
      } catch (error) {
        console.error("Network loading error:", error);
      } finally {
        setLoadingNetworks(false);
        loadNetworksPromise.current = null;
      }
    })();

    return loadNetworksPromise.current;
  }, [network, networksLoaded, setNetwork, setNetworks]);

  const loadModels = useCallback(async () => {
    if (!network) return;
    if (modelsLoadedForNetwork === network) return;
    if (loadModelsPromise.current) return loadModelsPromise.current;

    loadModelsPromise.current = (async () => {
      try {
        setLoadingModels(true);

        const network_res = await fetch("/api/modelNetwork/setNetwork", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ network }),
        });
        if (!network_res.ok) {
          throw new Error(
            `Failed to set ollama network: ${network_res.status}`,
          );
        }

        const res = await fetch(
          `/api/models?network=${encodeURIComponent(network)}`,
        );

        if (!res.ok) {
          throw new Error(`Failed to load models: ${res.status}`);
        }

        const data = await res.json();
        const loadedModels = data.models ?? [];

        setModelsForNetwork(network, loadedModels);

        if (loadedModels.length > 0) {
          setModel(
            loadedModels.some((m: { model: string }) => m.model === model)
              ? model
              : loadedModels[0].model,
          );
        } else {
          setModel("");
        }
      } catch (error) {
        console.error("Model loading error:", error);
        setModelsForNetwork(network, []);
        setModel("");
      } finally {
        setLoadingModels(false);
        loadModelsPromise.current = null;
      }
    })();

    return loadModelsPromise.current;
  }, [network, model, modelsLoadedForNetwork, setModel, setModelsForNetwork]);

  const mcpServerConnect = async () => {
    const selected = MCP_SERVERS.find((server) => server.id === mcpServer);
    if (!selected) return;

    try {
      setConnectingMcp(true);

      const res = await fetch("/api/mcp/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selected.config),
      });

      console.log(await res.json());
    } catch (error) {
      console.error("MCP connect error:", error);
    } finally {
      setConnectingMcp(false);
    }
  };

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <header className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30">
            <Settings2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Settings
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Configure your model provider and connect MCP servers for JINA —
            Judgmental Intelligent Neural Assistant.
          </p>
        </header>

        <div className="space-y-6">
          <SettingsSection
            title="Model provider"
            description="Pick where your language model runs and which model to use."
            icon={Cpu}
          >
            <LocalNetwork
              networks={networks}
              value={network}
              loading={loadingNetworks}
              onChange={setNetwork}
              onOpen={loadNetworks}
            />

            <ModelSelect
              models={models}
              value={model}
              loading={loadingModels}
              disabled={!network}
              onChange={setModel}
              onOpen={loadModels}
            />
          </SettingsSection>

          <SettingsSection
            title="MCP connection"
            description="Connect a Model Context Protocol server to extend assistant capabilities."
            icon={Sparkles}
          >
            <McpServerSelect
              value={mcpServer}
              connecting={connectingMcp}
              onChange={setMcpServer}
              onConnect={mcpServerConnect}
            />
          </SettingsSection>
        </div>

        {(network || model) && (
          <div className="mt-8 rounded-xl border border-zinc-200/80 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Active configuration
            </p>
            <dl className="mt-3 space-y-2 text-sm">
              {network && (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                  <dt className="shrink-0 font-medium text-zinc-600 dark:text-zinc-400">
                    Network
                  </dt>
                  <dd className="truncate font-mono text-zinc-900 dark:text-zinc-100">
                    {network}
                  </dd>
                </div>
              )}
              {model && (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                  <dt className="shrink-0 font-medium text-zinc-600 dark:text-zinc-400">
                    Model
                  </dt>
                  <dd className="truncate font-mono text-zinc-900 dark:text-zinc-100">
                    {model}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
