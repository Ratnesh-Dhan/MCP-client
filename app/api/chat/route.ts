import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "richardyoung/qwen2.5-7b-instruct-abliterated:latest", // change to your model
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to talk to Ollama");
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}