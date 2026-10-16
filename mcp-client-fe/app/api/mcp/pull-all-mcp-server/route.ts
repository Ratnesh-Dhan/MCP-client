import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch("http://localhost:4000/api/mcp/get-all");
    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const response = await res.json();
    if (response.success)
      return NextResponse.json({ servers: response.servers });
    else {
      console.log("DB error : ", response.error);
      return NextResponse.json({ servers: [] });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ servers: [] });
  }
}
