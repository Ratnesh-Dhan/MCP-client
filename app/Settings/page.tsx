import ModelSelect from "@/components/settings/ModelSelect";
import React from "react";

const Settings = () => {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>

      <div className="rounded-xl border p-6">
        <ModelSelect />
      </div>
    </div>
  );
};

export default Settings;
