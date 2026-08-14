import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const network = req.nextUrl.searchParams.get("network");

    if (!network) {
      return Response.json({ error: "Network is required." }, { status: 400 });
    }

    const res = await fetch("http://localhost:4000/api/ollama/models", {
      method: "GET",
      headers: {
        "Conent-Type": "application/json",
        "x-ollama-network": network,
      },
      cache: "no-store",
    });

    const data = await res.json();

    return Response.json(data, {
      status: res.status,
    });
  } catch (error) {
    console.error("Ollama models proxy error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Ollama models.",
      },
      { status: 500 },
    );
  }
}
