import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { modelNetwork } = await req.json();
    const res = await fetch("http://localhost:4000/api/ollama/add-network", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        modelNetwork: modelNetwork,
      }),
    });

    const column = await res.json();

    return NextResponse.json({
      success: true,
      message: column,
      status: res.status,
    });
  } catch (error) {
    console.error("Model Network set Error : ", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed save Network.",
      },
      { status: 500 },
    );
  }
}
