import { NextRequest, NextResponse } from "next/server";
import { listMCPTools } from "@/services/mcp";

export async function GET(req: NextRequest) {
  try {
    const server = req.nextUrl.searchParams.get("server");
    console.log("Server: ", server);

    if (!server) {
      return NextResponse.json(
        { error: "Server is required" },
        { status: 400 },
      );
    }
    const tools = await listMCPTools(server);
    return NextResponse.json({ server, tools });
  } catch (error) {
    console.error("listMCPTools Error: ", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to lilst tools.",
      },
      { status: 500 },
    );
  }
}
