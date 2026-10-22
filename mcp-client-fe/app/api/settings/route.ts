import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch("http://localhost:4000/api/mcp/user-settings");
    if (!res.ok) {
      throw new Error(`Backend error: ${res.status}`);
    }

    const response = await res.json();
    console.log(response.settings)
    return NextResponse.json({ success: true ,settings: response.settings });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, error: error });
  }
}
