export async function GET() {
  try {
    const response = await fetch("http://localhost:4000/api/support", {
      cache: "no-store",
    });
    if (!response.ok) {
      return Response.json({ connected: false }, { status: 503 });
    }
    return Response.json({ connected: true }, { status: 200 });
  } catch {
    return Response.json({ connected: false }, { status: 503 });
  }
}
