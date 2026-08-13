"use client";

import { useSettingsStore } from "@/store/settings";
import { useEffect, useState } from "react";

type Model = {
  model: string;
};

export default function ModelSelect() {
  const [models, setModels] = useState<Model[]>([]);
  const { model, setModel, network } = useSettingsStore();

  useEffect(() => {
    console.log("are we changing", network);
    return;
    if (network !== "") {
      fetch("/api/models")
        .then((res) => {
          res.json().then((data) => {
            setModels(data.models);
            console.log("this is data", data);
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
    // const loadModels = async () => {
    //   try {
    //     const res = await fetch("/api/models");
    //     const data = await res.json();
    //     setModels(data.models);
    //     console.log("this is data", data);
    //     if (data.models.length > 0 && model === "") {
    //       setModel(data.models[0].model);
    //     }
    //   } catch (err) {
    //     console.error(err);
    //   }
    // };

    // loadModels();
  }, [network]);

  return (
    <div className="space-y-2">
      <label htmlFor="model" className="block text-sm font-medium">
        Model
      </label>

      <select
        id="model"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="w-full rounded-md border bg-background px-3 py-2"
      >
        {models !== undefined &&
          models.map((model) => (
            <option key={model.model} value={model.model}>
              {model.model}
            </option>
          ))}
      </select>
    </div>
  );
}
