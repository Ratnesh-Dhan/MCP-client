export async function GET(request: Request) {
  try {
    const response = await fetch(
      "http://localhost:4000/api/mcp/mcpStatusEvents",
      {
        headers: {
          Accept: "text/event-stream",
        },
        cache: "no-store",
        signal: request.signal,
      },
    );

    if (!response.ok || !response.body) {
      console.error("Backend SSE failed:", response.status);
      return new Response("Backend SSE unavailable", {
        status: 502,
      });
    }

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("SSE upstream connection failed:", error);

    return new Response("Backend SSE connection failed", {
      status: 502,
    });
  }
}
