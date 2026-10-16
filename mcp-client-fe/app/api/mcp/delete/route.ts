import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch("http://localhost:4000/api/mcp/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Error deleting MCP server:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete MCP server",
      },
      { status: 500 },
    );
  }
}
