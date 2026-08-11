// import { NextRequest, NextResponse } from "next/server";
// import { connectMCP } from "@/services/mcp.js";

// export async function POST(req: NextRequest) {
//   try {
//     const { name, command, args, cwd } = await req.json();

//     await connectMCP(name, command, args ?? [], cwd);

//     return NextResponse.json({ success: true, server: name });
//   } catch (error) {
//     console.error("MCP Connection Error: ", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: error instanceof Error ? error.message : "Failed to connect MCP",
//       },
//       { status: 500 },
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, command, args, cwd } = await req.json();
    const res = await fetch("http://localhost:4000/api/mcp/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        command: command,
        args: args,
        cwd: cwd,
      }),
    });

    console.log(await res.json());

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
