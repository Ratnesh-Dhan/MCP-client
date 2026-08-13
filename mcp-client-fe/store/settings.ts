import { SettingsStore } from "@/types/allTypes";
import { create } from "zustand";

export const useSettingsStore = create<SettingsStore>((set) => ({
  model: "",
  setModel: (model) =>
    set({
      model,
    }),
  network: "",
  setNetwork: (network) => set({ network }),
}));
