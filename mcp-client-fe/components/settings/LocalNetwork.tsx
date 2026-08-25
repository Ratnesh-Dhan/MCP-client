"use client";

import { Globe, Loader2 } from "lucide-react";
import { fieldLabelClassName, selectClassName } from "@/components/settings/styles";
import { ModelNetwork } from "@/types/allTypes";

type LocalNetworkProps = {
  networks: ModelNetwork[];
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onOpen: () => void | Promise<void>;
};

export default function LocalNetwork({
  networks,
  value,
  loading,
  onChange,
  onOpen,
}: LocalNetworkProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="network" className={fieldLabelClassName}>
        Network endpoint
      </label>

      <div className="relative">
        <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <select
          id="network"
          value={value}
          disabled={loading}
          onMouseDown={onOpen}
          onChange={(e) => onChange(e.target.value)}
          className={`${selectClassName} appearance-none pl-10 pr-10`}
        >
          {loading ? (
            <option value="">Loading networks...</option>
          ) : !value && networks.length === 0 ? (
            <option value="">Select a network...</option>
          ) : networks.length === 0 ? (
            <option value="">No networks available</option>
          ) : (
            networks.map((network) => (
              <option key={network.id} value={network.url}>
                {network.url}
              </option>
            ))
          )}
        </select>
        {loading && (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-violet-500" />
        )}
      </div>
    </div>
  );
}
