export async function GET() {
  const response = await fetch("http://localhost:4000/api/mcp/mcpStatusEvents");

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
