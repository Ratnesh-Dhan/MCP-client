"use client";
import { ModelNetwork } from "@/types/allTypes";
import React, { useEffect, useState } from "react";

const LocalNetwork = () => {
  const [incomming, setIncomming] = useState<ModelNetwork[]>([]);
  const [network, setNetwork] = useState<string>("");

  useEffect(() => {
    fetch("/api/modelNetwork")
      .then((res) => {
        res.json().then((data) => {
          console.log(data);
          setIncomming(data);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    console.log("network ", network);
  }, [network]);

  return (
    <div className="space-y-2">
      <label htmlFor="incommingModel" className="block text-sm font-medium">
        Local or network model
      </label>
      <select
        id="incommingModel"
        value={network}
        onChange={(e) => setNetwork(e.target.value)}
        className="w-full rounded-md border bg-background px-3 py-2"
      >
        {incomming.map((element) => (
          <option key={element.id} value={element.url}>
            {element.url}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LocalNetwork;
