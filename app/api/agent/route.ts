import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/services/agent";

export async function POST(req: NextRequest) {
  try {
    const { model, messages, server } = await req.json();

    const response = await runAgent(model, messages, server);

    // console.log("OLLAMA RESPONSE: ", JSON.stringify(response, null, 2));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error running agent: ", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Agent failed!",
      },
      { status: 500 },
    );
  }
}
