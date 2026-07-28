import { NextRequest, NextResponse } from "next/server";
import { Ollama } from "ollama";

const ollama = new Ollama();

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    const stream = await ollama.generate({
      model: "nemotron-mini:4b",
      prompt: message,
      stream: true,
    });

    for await (const chunk of stream) {
      console.log(chunk);
      process.stdout.write(chunk.response);
    }
    console.log();
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
