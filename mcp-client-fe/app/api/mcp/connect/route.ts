import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const res = await fetch("http://localhost:4000/api/mcp/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
      }),
    });
    if (!res.ok) throw new Error("Error while connecting MCP serer id : ", id);
    const result = await res.json();

    return NextResponse.json({ result: result });
  } catch (error) {
    console.error("MCP Connection Error: ", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to connect MCP",
      },
      { status: 500 },
    );
  }
}
