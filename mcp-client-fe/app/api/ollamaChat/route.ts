import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { model, messages } = await req.json();

    const res = await fetch("http://localhost:4000/api/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        server: "jinah",
        // server: "dl-assistant",
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
        {
          error: "Empty response from agent.",
        },
        { status: 500 },
      );
    }

    return new Response(res.body, {
      status: res.status,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Agent request aborted");

      return new Response(null, {
        status: 499,
      });
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

// import { NextRequest } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { model, messages } = await req.json();

//     const res = await fetch("http://localhost:4000/api/ollama/chat", {
//     // const res = await fetch("http://localhost:4000/api/agent", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: model,
//         messages: messages,
//         // server: "dl-assistant",
//       }),
//       signal: req.signal,
//     });

//     if (!res.ok) {
//       const errorText = await res.text();
//       return new Response(errorText, {
//         status: res.status,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//     }

//     if (!res.body) {
//       return new Response(
//         JSON.stringify({ error: "Empty response from backend" }),
//         { status: 500, headers: { "Content-Type": "application/json" } },
//       );
//     }

//     // Passing the stream through.
//     return new Response(res.body, {
//       status: res.status,
//       headers: {
//         "Content-Type": "text/plain; charset=utf-8",
//         "Cache-Control": "no-cache",
//       },
//     });
//   } catch (error) {
//     if (error instanceof Error && error.name === "AbortError") {
//       console.log("Ollama generation stopped");
//       return new Response(null, { status: 499 });
//     }
//     console.log("Ollama proxy error: ", error);

//     return new Response(
//       JSON.stringify({
//         error: error instanceof Error ? error.message : "Ollama request failed",
//       }),
//       {
//         status: 500,
//         headers: {
//           "Content-Type": "application/json",
//         },
//       },
//     );
//   }
// }
