export async function GET() {
  try {
    const res = await fetch("http://localhost:4000/api/ollama/networks", {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json();
    return Response.json(data, {
      status: res.status,
    });
  } catch (error) {
    console.error("Ollama local/LAN netowrk proxy error: ", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch Ollama local/LAN network.",
      },
      {
        status: 500,
      },
    );
  }
}
