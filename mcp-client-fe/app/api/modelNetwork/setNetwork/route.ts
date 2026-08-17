import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { network } = await req.json();
    console.log("network", network);
    const res = await fetch("http://localhost:4000/api/ollama/set-network", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ network }),
    });
    console.log("Trying to hit on set-network ROUTE.");
    return NextResponse.json(res.json(), { status: res.status });
  } catch (error) {
    console.error("Ollama local/LAN network proxy setting error: ", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to set ollama network on serverside",
      },
      {
        status: 500,
      },
    );
  }
}
