import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { server } = await req.json();
    const res = await fetch("http://localhost:4000/api/mcp/disconnect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: server,
      }),
    });
    if (!res.ok)
      throw new Error("Error while disconnecting MCP serer: ", server);
    const result = await res.json();

    return NextResponse.json({ success: result.success });
  } catch (error) {
    console.error("MCP Disconnection Error: ", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to disconnect MCP",
      },
      { status: 500 },
    );
  }
}
