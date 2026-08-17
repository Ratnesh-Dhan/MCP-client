import fs from "fs";
import path from "path";
import { UrlDBSchema } from "../types/allTypes.js";

const DB_PATH = path.join(
  process.cwd(),
  "dummy_database",
  "current_network.json",
);

export const getCurrentNetwork = (): UrlDBSchema => {
  if (!fs.existsSync(DB_PATH)) {
    return { url: "" };
  }
  const fileData = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(fileData);
};

export const setCurrentNetwork = (data: UrlDBSchema): void => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
};
