import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { model, messages } = await req.json();

    const res = await fetch("http://localhost:4000/api/langGraphagent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        server: "jinah",
      }),
      signal: req.signal,
    });

    if (!res.ok) {
      const error = await res.text();
      return new Response(error, {
        status: res.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    if (!res.body) {
      return Response.json(
        { error: "Empty response from agent." },
        { status: 500 },
      );
    }

    // Pass through SSE stream directly from Express
    return new Response(res.body, {
      status: res.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Agent request aborted");
      return new Response(null, { status: 499 });
    }

    console.error("Agent proxy error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Agent request failed.",
      },
      { status: 500 },
    );
  }
}
