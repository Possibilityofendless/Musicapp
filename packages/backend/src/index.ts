import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes, { authMiddleware } from "./routes/auth";
import projectRoutes from "./routes/projects";
import characterRoutes from "./routes/characters";
import sceneRoutes from "./routes/scenes";
import storyboardRoutes from "./routes/storyboard";
import { registerJobProcessors } from "./workers/jobProcessor";
import prisma from "./lib/prisma";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "MusicApp API",
    version: "2.0.0",
    status: "running",
    features: ["audio-analysis", "scene-generation", "lip-sync", "character-persistence"],
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      projects: "/api/projects",
      characters: "/api/projects/:id/characters",
      scenes: "/api/projects/:id/scenes",
      storyboard: "/api/projects/:id/storyboard",
    },
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", authMiddleware, projectRoutes);
app.use("/api", authMiddleware, characterRoutes);
app.use("/api", authMiddleware, sceneRoutes);
app.use("/api", authMiddleware, storyboardRoutes);

// Error handling
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("[Error]", err);
    res.status(500).json({
      error: err.message || "Internal server error",
    });
  }
);

// Start server
async function main() {
  try {
    // Initialize job processors
    await registerJobProcessors();
    console.log("[App] Job processors registered");

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log("[App] Database connected");

    app.listen(PORT, () => {
      console.log(`[App] Server running on http://localhost:${PORT}`);
      console.log(`[App] Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("[App] Startup error:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("[App] Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
});

main();
