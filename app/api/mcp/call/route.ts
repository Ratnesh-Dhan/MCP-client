import { NextRequest, NextResponse } from "next/server";
import { callMCPTool } from "@/services/mcp";

export async function POST(req: NextRequest) {
  try {
    const { server, tools, argumetns: args } = await req.json();
    const result = await callMCPTool(server, tools, args ?? {});

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("callMCPTool Error: ", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to call MCP tool.",
      },
      { status: 500 },
    );
  }
}
