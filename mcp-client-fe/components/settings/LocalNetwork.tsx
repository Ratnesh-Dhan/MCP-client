"use client";

type Network = {
  id: string;
  url: string;
};

type LocalNetworkProps = {
  networks: Network[];
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
};

export default function LocalNetwork({
  networks,
  value,
  loading,
  onChange,
}: LocalNetworkProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="network" className="block text-sm font-medium">
        Local or network model
      </label>

      <select
        id="network"
        value={value}
        disabled={loading}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border bg-background px-3 py-2"
      >
        {loading ? (
          <option value="">Loading networks...</option>
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
    </div>
  );
}
// "use client";
// import { ModelNetwork } from "@/types/allTypes";
// import React, { useEffect, useState } from "react";
// import { useSettingsStore } from "@/store/settings";

// const LocalNetwork = () => {
//   const [incomming, setIncomming] = useState<ModelNetwork[]>([]);
//   const { network, setNetwork } = useSettingsStore();

//   useEffect(() => {
//     fetch("/api/modelNetwork/getNetwork")
//       .then((res) => {
//         res.json().then((data) => {
//           console.log(data);
//           setIncomming(data);
//         });
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }, []);

//   useEffect(() => {
//     if (network !== "") {
//       fetch("/api/modelNetwork/setNetwork", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ network }),
//       })
//         .then((res) => {
//           res.json().then((data) => {
//             console.log({ data });
//           });
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     }
//   }, [network]);

//   return (
//     <div className="space-y-2">
//       <label htmlFor="incommingModel" className="block text-sm font-medium">
//         Local or network model
//       </label>
//       <select
//         id="incommingModel"
//         value={network}
//         onChange={(e) => setNetwork(e.target.value)}
//         className="w-full rounded-md border bg-background px-3 py-2"
//       >
//         {incomming.length !== 0
//           ? incomming.map((element) => (
//               <option key={element.id} value={element.url}>
//                 {element.url}
//               </option>
//             ))
//           : null}
//       </select>
//     </div>
//   );
// };

// export default LocalNetwork;
