import { NextRequest, NextResponse } from "next/server";
import { connectMCP } from "@/services/mcp";

export async function POST(req: NextRequest) {
  try {
    const { name, command, args, cwd } = await req.json();

    await connectMCP(name, command, args ?? [], cwd);

    return NextResponse.json({ success: true, server: name });
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
