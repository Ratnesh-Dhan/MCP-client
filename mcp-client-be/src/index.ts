import express from "express";
import cors from "cors";

// import agentRoutes from "./routes/agent.js";
// import ollamaRoutes from "./routes/ollama.js";
import MCProuter from "./routes/mcp.js";
import OllamaRouter from "./routes/ollama.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use(express.json());

app.use("/api/mcp", MCProuter);
app.use("/api/ollama", OllamaRouter)
// app.use("/api/agent", agentRoutes);
// app.use("/api/ollama", ollamaRoutes);

app.get("/", (_, res) => {
  res.json({
    message: "MCP backend running",
  });
});

app.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});
