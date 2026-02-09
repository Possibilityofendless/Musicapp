import express from "express";
import cors from "express-cors";
import dotenv from "dotenv";
import authRoutes, { authMiddleware } from "./routes/auth";
import projectRoutes from "./routes/projects";
import { registerJobProcessors } from "./workers/jobProcessor";
import prisma from "./lib/prisma";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", authMiddleware, projectRoutes);

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
