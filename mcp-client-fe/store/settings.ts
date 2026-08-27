import { SettingsStore } from "@/types/allTypes";
import { create } from "zustand";

export const useSettingsStore = create<SettingsStore>((set) => ({
  mcpStatus: false,
  setMcpStatus: (status: boolean) => set({ mcpStatus: status }),
  model: "",
  setModel: (model) =>
    set({
      model,
    }),
  network: "",
  setNetwork: (network) =>
    set((state) => {
      if (state.network === network) return { network };
      return {
        network,
        model: "",
        models: [],
        modelsLoadedForNetwork: "",
      };
    }),
  networks: [],
  networksLoaded: false,
  setNetworks: (networks) => set({ networks, networksLoaded: true }),
  models: [],
  modelsLoadedForNetwork: "",
  setModelsForNetwork: (network, models) =>
    set({ models, modelsLoadedForNetwork: network }),
}));
