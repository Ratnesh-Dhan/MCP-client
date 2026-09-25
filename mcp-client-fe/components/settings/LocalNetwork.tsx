"use client";

import { Globe, Loader2, Plus, Save, X } from "lucide-react";
import {
  fieldLabelClassName,
  primaryButtonClassName,
  selectClassName,
} from "@/components/settings/styles";
import { ModelNetwork } from "@/types/allTypes";
import { useState } from "react";

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
  const [add, setAdd] = useState<boolean>(false);
  const [userEnteredNetwork, setUserEnteredNetwork] = useState<string | null>(
    null,
  );

  const addHandler = () => {
    setAdd(true);
  };
  const addAfterHandler = async () => {
    try {
      if (userEnteredNetwork) {
        const res = await fetch("/api/settings/addNetwork", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ modelNetwork: userEnteredNetwork }),
        });
        const result = await res.json();
        console.log("AddAfterHandler : ", result["message"][0]["modelNetwork"]);
        onChange(result["message"][0]["modelNetwork"]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setAdd(false);
    }
  };
  const handleNetworkInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserEnteredNetwork(e.target.value);
  };

  return (
    <div className="space-y-2">
      <label htmlFor="network" className={fieldLabelClassName}>
        Network endpoint
      </label>
      <div className="flex gap-2">
        {!add ? (
          <div className="relative flex-1">
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
        ) : (
          <input
            type="text"
            placeholder="http://localhost:11434"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 dark:border-zinc-700 dark:bg-zinc-900"
            onChange={handleNetworkInput}
            value={userEnteredNetwork === null ? "" : userEnteredNetwork}
          />
        )}
        {!add ? (
          <button
            type="button"
            onClick={addHandler}
            className={primaryButtonClassName}
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              className={primaryButtonClassName}
              onClick={addAfterHandler}
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            <button
              type="button"
              className={primaryButtonClassName}
              onClick={() => setAdd(false)}
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
