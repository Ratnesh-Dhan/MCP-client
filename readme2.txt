$env:OLLAMA_HOST="0.0.0.0:11434" 
ollama serve




const res = await fetch("http://localhost:4000/api/mcp/connect", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "dl-assistant",
    command: "pnpm",
    args: ["start"],
    cwd: "D:\\Codes\\ml-assistant-mcp",
  }),
});

console.log(await res.json());




const res = await fetch("http://localhost:4000/api/agent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "qwen3.6:27b",
    server: "dl-assistant",
    messages: [
      {
  "role": "user",
  "content": "Save a file in './output/' with content of IOT architecture."
}
    ],
  }),
});

const data = await res.json();

console.log(data);
console.log("FINAL:", data.message?.content);



const res = await fetch("http://localhost:4000/api/agent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "qwen3.6:27b",
    server: "dl-assistant",
    messages: [
      {
        role: "user",
        content: "Use the createTxtFile tool to save a file at 'C:\Users\NDT Lab\Documents\poem.txt' with the exact text: 'Hello from MCP! This was created by the agent.'",
      },
    ],
  }),
});

const data = await res.json();

console.log(data);
console.log("FINAL:", data.message?.content);


const res = await fetch("http://localhost:4000/api/agent", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "qwen3.6:27b",
    server: "dl-assistant",
    messages: [
      {
        role: "user",
        content: "Use the available tool to greet John.",
      },
    ],
  }),
});

const data = await res.json();

console.log(data);
console.log("FINAL:", data.message?.content);