import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { modelName } = await req.json();
    const res = await fetch("http://localhost:4000/api/ollama/set-model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        modelName: modelName,
      }),
    });

    const column = await res.json();

    return NextResponse.json({
      success: true,
      message: column,
      status: res.status,
    });
  } catch (error) {
    console.error("Model Name set Error : ", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to save Model name.",
      },
      { status: 500 },
    );
  }
}
