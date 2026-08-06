import { NextResponse } from "next/server";
import { listModels } from "@/services/ollama";

export async function GET() {
  const data = await listModels();

  return NextResponse.json({
    models: data.models,
  });
}
