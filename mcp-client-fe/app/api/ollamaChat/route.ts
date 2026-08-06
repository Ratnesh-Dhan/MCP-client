import { NextRequest } from "next/server";
import { chat } from "@/services/ollama";

export async function POST(req: NextRequest) {
  const raw = await req.text();


  const { model, messages } = JSON.parse(raw);
  
  // const { model, messages } = await req.json();
  const ollamaStream = await chat({
    messages,
    model,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of ollamaStream) {
          controller.enqueue(encoder.encode(chunk.message.content));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
