import { NextResponse } from "next/server";
import { listModels } from "@/services/ollama";

export const getModels = async () => {
  const models = await listModels();
  return NextResponse.json(models);
};
