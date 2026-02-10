import { Router, Request, Response } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import prisma from "../lib/prisma";
import { enqueueJob } from "../lib/queue";
import { LyricsData } from "../types";

const router = Router();

// Configure multer for audio uploads
const STORAGE_PATH = process.env.STORAGE_PATH || "/tmp/musicapp_storage";
const AUDIO_DIR = path.join(STORAGE_PATH, "audio");

// Ensure audio directory exists
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, AUDIO_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "audio-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".mp3", ".wav", ".m4a", ".ogg", ".flac"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed (mp3, wav, m4a, ogg, flac)"));
    }
  },
});

// Schema validation
const CreateProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  audioUrl: z.string().min(1), // Can be URL or local path
  duration: z.number().positive(),
  performanceDensity: z.number().min(0).max(1).default(0.4),
  lyrics: z.string().min(1),
});

type CreateProjectRequest = z.infer<typeof CreateProjectSchema>;

/**
 * POST /projects/upload-audio
 * Upload audio file
 */
router.post(
  "/projects/upload-audio",
  upload.single("audio"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file uploaded" });
      }

      // Return the file path
      const audioUrl = path.join(AUDIO_DIR, req.file.filename);
      res.json({ 
        success: true,
        audioUrl, 
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (error) {
      console.error("[API] Error uploading audio:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }
);

/**
 * POST /projects
 * Create a new project
 */
router.post("/projects", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const body = CreateProjectSchema.parse(req.body);

    // Parse lyrics into timed segments
    const lyricsData = parseLyrics(body.lyrics, body.duration);

    const project = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description,
        audioUrl: body.audioUrl,
        duration: body.duration,
        performanceDensity: body.performanceDensity,
        userId: userId,
        storyboard: {
          create: {
            lyricsData: lyricsData as any,
          },
        },
      },
      include: {
        storyboard: true,
      },
    });

    // Enqueue initial scene generation job
    await enqueueJob({
      projectId: project.id,
      type: "generate_scenes",
      data: {
        lyricsData,
        performanceDensity: body.performanceDensity,
      },
    });

    res.json({ success: true, project });
  } catch (error) {
    console.error("[API] Error creating project:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /projects/:id
 * Get project details
 */
router.get("/projects/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        storyboard: true,
        scenes: {
          orderBy: { order: "asc" },
        },
        videos: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check ownership
    if (project.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized - Project not yours" });
    }

    res.json(project);
  } catch (error) {
    console.error("[API] Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

/**
 * PATCH /projects/:id
 * Update project settings
 */
router.patch("/projects/:id", async (req: Request, res: Response) => {
  try {
    const { performanceDensity, title, description } = req.body;

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(performanceDensity !== undefined && { performanceDensity }),
      },
    });

    res.json(project);
  } catch (error) {
    console.error("[API] Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

/**
 * POST /projects/:id/generate
 * Start final video generation
 */
router.post("/projects/:id/generate", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Update project status
    await prisma.project.update({
      where: { id: req.params.id },
      data: { status: "processing" },
    });

    // Enqueue scene generation jobs
    await enqueueJob({
      projectId: req.params.id,
      type: "generate_scenes",
      data: {},
    });

    res.json({ success: true, message: "Generation started" });
  } catch (error) {
    console.error("[API] Error starting generation:", error);
    res.status(500).json({ error: "Failed to start generation" });
  }
});

/**
 * GET /projects/:id/scenes
 * Get all scenes for a project
 */
router.get("/projects/:id/scenes", async (req: Request, res: Response) => {
  try {
    const scenes = await prisma.scene.findMany({
      where: { projectId: req.params.id },
      orderBy: { order: "asc" },
    });

    res.json(scenes);
  } catch (error) {
    console.error("[API] Error fetching scenes:", error);
    res.status(500).json({ error: "Failed to fetch scenes" });
  }
});

/**
 * PATCH /scenes/:id
 * Update individual scene
 */
router.patch("/scenes/:id", async (req: Request, res: Response) => {
  try {
    const { sceneType, lipSyncEnabled, lipSyncMethod, referenceImageUrl } =
      req.body;

    const scene = await prisma.scene.update({
      where: { id: req.params.id },
      data: {
        ...(sceneType && { sceneType }),
        ...(lipSyncEnabled !== undefined && { lipSyncEnabled }),
        ...(lipSyncMethod && { lipSyncMethod }),
        ...(referenceImageUrl && { referenceImageUrl }),
      },
    });

    res.json(scene);
  } catch (error) {
    console.error("[API] Error updating scene:", error);
    res.status(500).json({ error: "Failed to update scene" });
  }
});

/**
 * POST /projects/:id/jobs/:jobId/retry
 * Retry a failed job
 */
router.post(
  "/projects/:id/jobs/:jobId/retry",
  async (req: Request, res: Response) => {
    try {
      const job = await prisma.processingJob.findUnique({
        where: { id: req.params.jobId },
      });

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Re-enqueue the job
      const newJobId = await enqueueJob(
        {
          projectId: req.params.id,
          type: job.type as any,
          payload: (job.resultData || {}) as Record<string, unknown>,
        },
        1 // higher priority for retries
      );

      res.json({ success: true, newJobId });
    } catch (error) {
      console.error("[API] Error retrying job:", error);
      res.status(500).json({ error: "Failed to retry job" });
    }
  }
);

/**
 * GET /projects
 * List all projects for the authenticated user
 */
router.get("/projects", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        storyboard: true,
        scenes: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(projects);
  } catch (error) {
    console.error("[API] Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

/**
 * DELETE /projects/:id
 * Delete a project and all related data
 */
router.delete("/projects/:id", async (req: Request, res: Response) => {
  try {
    const project = await prisma.project.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: "Project deleted", project });
  } catch (error) {
    console.error("[API] Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

/**
 * DELETE /scenes/:id
 * Delete a scene
 */
router.delete("/scenes/:id", async (req: Request, res: Response) => {
  try {
    const scene = await prisma.scene.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: "Scene deleted", scene });
  } catch (error) {
    console.error("[API] Error deleting scene:", error);
    res.status(500).json({ error: "Failed to delete scene" });
  }
});

/**
 * POST /projects/:id/scenes/reorder
 * Reorder scenes within a project
 */
router.post(
  "/projects/:id/scenes/reorder",
  async (req: Request, res: Response) => {
    try {
      const { sceneOrder } = req.body; // Array of { sceneId, newOrder }

      if (!Array.isArray(sceneOrder)) {
        return res.status(400).json({ error: "sceneOrder must be an array" });
      }

      // Update all scenes in transaction
      const updates = sceneOrder.map((item: { sceneId: string; newOrder: number }) =>
        prisma.scene.update({
          where: { id: item.sceneId },
          data: { order: item.newOrder },
        })
      );

      await prisma.$transaction(updates);

      // Recalculate timing for all scenes
      const scenes = await prisma.scene.findMany({
        where: { projectId: req.params.id },
        orderBy: { order: "asc" },
      });

      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
      });

      if (project && scenes.length > 0) {
        const timePerScene = project.duration / scenes.length;
        const timingUpdates = scenes.map(
          (scene: typeof scenes[number], idx: number) =>
            prisma.scene.update({
              where: { id: scene.id },
              data: {
                startTime: idx * timePerScene,
                endTime: (idx + 1) * timePerScene,
              },
            })
        );

        await prisma.$transaction(timingUpdates);
      }

      res.json({
        success: true,
        message: "Scenes reordered and timing updated",
        scenes,
      });
    } catch (error) {
      console.error("[API] Error reordering scenes:", error);
      res.status(500).json({ error: "Failed to reorder scenes" });
    }
  }
);

/**
 * GET /projects/:id/jobs
 * Get all processing jobs for a project
 */
router.get("/projects/:id/jobs", async (req: Request, res: Response) => {
  try {
    const jobs = await prisma.processingJob.findMany({
      where: { projectId: req.params.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(jobs);
  } catch (error) {
    console.error("[API] Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

/**
 * GET /projects/:id/jobs/:jobId
 * Get a specific job status
 */
router.get("/projects/:id/jobs/:jobId", async (req: Request, res: Response) => {
  try {
    const job = await prisma.processingJob.findUnique({
      where: { id: req.params.jobId },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(job);
  } catch (error) {
    console.error("[API] Error fetching job:", error);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

/**
 * Helper: Parse lyrics into timed segments
 */
function parseLyrics(lyrics: string, totalDuration: number): LyricsData {
  const lines = lyrics.split("\n").filter((l) => l.trim());
  const timePerLine = totalDuration / Math.max(lines.length, 1);

  const lyricsData: LyricsData = {
    lines: lines.map((text, i) => ({
      text,
      startTime: i * timePerLine,
      endTime: (i + 1) * timePerLine,
      wordIndex: 0,
    })),
    words: [],
  };

  // Further split into words
  let wordIndex = 0;
  let allWords: Array<{ word: string; startTime: number; endTime: number }> = [];

  lyricsData.lines.forEach((line) => {
    const words = line.text.split(/\s+/);
    const timePerWord = (line.endTime - line.startTime) / Math.max(words.length, 1);

    words.forEach((word, i) => {
      allWords.push({
        word,
        startTime: line.startTime + i * timePerWord,
        endTime: line.startTime + (i + 1) * timePerWord,
      });
      wordIndex++;
    });
  });

  lyricsData.words = allWords;
  return lyricsData;
}

export default router;
