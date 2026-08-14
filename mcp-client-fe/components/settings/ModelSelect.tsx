"use client";

type Model = {
  model: string;
};

type ModelSelectProps = {
  models: Model[];
  value: string;
  loading: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
};

export default function ModelSelect({
  models,
  value,
  loading,
  disabled,
  onChange,
}: ModelSelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="model" className="block text-sm font-medium">
        Model
      </label>

      <select
        id="model"
        value={value}
        disabled={disabled || loading}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border bg-background px-3 py-2"
      >
        {loading ? (
          <option value="">Loading models...</option>
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
    </div>
  );
}
// "use client";

// import { useSettingsStore } from "@/store/settings";
// import { useEffect, useState } from "react";

// type Model = {
//   model: string;
// };

// export default function ModelSelect() {
//   const [models, setModels] = useState<Model[]>([]);
//   const { model, setModel, network } = useSettingsStore();
//   const selectClick = () => {
//     console.log("MODEL SELECTION CLICKED");
//   };
//   useEffect(() => {
//     console.log("are we changing", network);
//     // if (network !== "") {
//     //   console.log("We are inside models.get : ", network);
//     //   fetch("/api/models")
//     //     .then((res) => {
//     //       res.json().then((data) => {
//     //         setModels(data.models);
//     //         console.log("this is data", data);
//     //       });
//     //     })
//     //     .catch((err) => {
//     //       console.log(err);
//     //     });
//     // }
//   }, [network]);

//   return (
//     <div className="space-y-2">
//       <label htmlFor="model" className="block text-sm font-medium">
//         Model
//       </label>

//       <select
//         id="model"
//         value={model}
//         onChange={(e) => setModel(e.target.value)}
//         className="w-full rounded-md border bg-background px-3 py-2"
//         onClick={selectClick}
//       >
//         {models !== undefined &&
//           models.map((model) => (
//             <option key={model.model} value={model.model}>
//               {model.model}
//             </option>
//           ))}
//       </select>
//     </div>
//   );
// }

// // const loadModels = async () => {
// //   try {
// //     const res = await fetch("/api/models");
// //     const data = await res.json();
// //     setModels(data.models);
// //     console.log("this is data", data);
// //     if (data.models.length > 0 && model === "") {
// //       setModel(data.models[0].model);
// //     }
// //   } catch (err) {
// //     console.error(err);
// //   }
// // };

// // loadModels();
