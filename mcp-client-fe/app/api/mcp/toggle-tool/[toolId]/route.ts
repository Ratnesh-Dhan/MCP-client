import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> },
) {
  try {
    const { toolId } = await params;
    const body = await request.json();
    console.log(toolId, body);
    const response = await fetch(
      `http://localhost:4000/api/mcp/tool/${toolId}/toggle`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );
    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Failed to toggle MCP tool: ", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update MCP tool.",
      },
      { status: 500 },
    );
  }
}
