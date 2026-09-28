"use client";

import { Bot, Loader2 } from "lucide-react";
import {
  fieldLabelClassName,
  selectClassName,
} from "@/components/settings/styles";
import { OllamaModel } from "@/types/allTypes";

type ModelSelectProps = {
  network: string;
  models: OllamaModel[];
  value: string;
  loading: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
  onOpen: () => void | Promise<void>;
};

export default function ModelSelect({
  network,
  models,
  value,
  loading,
  disabled,
  onChange,
  onOpen,
}: ModelSelectProps) {

  const handlenew = async(value: string)=> {
    try {
      console.log({value})
      const response = await  fetch("/api/settings/addModel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ modelNetwork: network,modelName: value }),
        });
        const res = await response.json();
        console.log(res["message"][0]['modelName'])
        window.localStorage.setItem("modelNetwork", res["message"][0]['modelNetwork'])
        window.localStorage.setItem("modelName", res["message"][0]["modelName"])
        onChange(res["message"][0]['modelName'])
    }
    catch(error) {
      console.log("fuck ", error)
    }
  }

  const fuck = ()=> {
    console.log("FUck this is models : ", models)
  }
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
          disabled={disabled===null? true: disabled || loading===null? true: loading}
          onMouseDown={onOpen}
          // onChange={(e) => onChange(e.target.value)}
          onChange={(e)=> handlenew(e.target.value)}
          className={`${selectClassName} appearance-none pl-10 pr-10`}
        >
          {loading ? (
    <option value="">Loading models...</option>
  ) : !value && models.length === 0 ? (
    <option value="">No models available</option>
  ) : (
    models.map((model) => (
      <option key={model.model} value={model.model}>
        {model.model}
      </option>
    ))
  )}
          {/* {loading ? (
            <option value="">Loading models...</option>
          ) : !value && models.length === 0 ? (
            <option value="">Select a model...</option>
          ) : value? (<option value={value}>{value}</option>

          ): models.length === 0 ? (
            <option value="">No models available</option>
          ) : (
            models.map(( model, idx) => (
              <option key={idx} value={model.model}>
                {model.model}
              </option>
            ))
          )} */}
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
