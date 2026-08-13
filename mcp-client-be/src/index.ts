import express from "express";
import cors from "cors";

import MCProuter from "./routes/mcp.js";
import OllamaRouter from "./routes/ollama.js";
import AgentRouter from "./routes/agent.js";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use("/api/mcp", MCProuter);
app.use("/api/ollama", OllamaRouter);
app.use("/api/agent", AgentRouter);

app.get("/", (_, res) => {
  res.json({
    message: "MCP backend running",
  });
});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});
