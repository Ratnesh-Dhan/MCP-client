"use client";

import { Bot, Loader2 } from "lucide-react";
import { fieldLabelClassName, selectClassName } from "@/components/settings/styles";
import { OllamaModel } from "@/types/allTypes";

type ModelSelectProps = {
  models: OllamaModel[];
  value: string;
  loading: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
  onOpen: () => void | Promise<void>;
};

export default function ModelSelect({
  models,
  value,
  loading,
  disabled,
  onChange,
  onOpen,
}: ModelSelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="model" className={fieldLabelClassName}>
        Language model
      </label>

      <div className="relative">
        <Bot className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <select
          id="model"
          value={value}
          disabled={disabled || loading}
          onMouseDown={onOpen}
          onChange={(e) => onChange(e.target.value)}
          className={`${selectClassName} appearance-none pl-10 pr-10`}
        >
          {loading ? (
            <option value="">Loading models...</option>
          ) : !value && models.length === 0 ? (
            <option value="">Select a model...</option>
          ) : models.length === 0 ? (
            <option value="">No models available</option>
          ) : (
            models.map((model) => (
              <option key={model.model} value={model.model}>
                {model.model}
              </option>
            ))
          )}
        </select>
        {loading && (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-violet-500" />
        )}
      </div>

      {disabled && !loading && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Choose a network first to load available models.
        </p>
      )}
    </div>
  );
}
