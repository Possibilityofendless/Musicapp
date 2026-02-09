import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { enqueueJob } from "../lib/queue";

const router = Router();

/**
 * POST /projects/:id/storyboard/generate
 * Analyze audio and auto-generate storyboard with scenes
 */
router.post(
  "/projects/:id/storyboard/generate",
  async (req: Request, res: Response) => {
    try {
      const projectId = req.params.id;

      // Verify project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Queue audio analysis job
      const jobId = await enqueueJob({
        type: "analyze_audio",
        projectId,
        payload: {
          audioUrl: project.audioUrl,
          audioPath: project.audioPath,
        },
      });

      // Update project status
      await prisma.project.update({
        where: { id: projectId },
        data: {
          status: "processing",
          progress: 0.1,
        },
      });

      res.json({
        success: true,
        message: "Storyboard generation queued",
        jobId,
      });
    } catch (error) {
      console.error("Error queueing storyboard generation:", error);
      res.status(500).json({ error: "Failed to queue storyboard generation" });
    }
  }
);

/**
 * GET /projects/:id/storyboard
 * Get current storyboard metadata
 */
router.get("/projects/:id/storyboard", async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;

    const storyboard = await prisma.storyboard.findUnique({
      where: { projectId },
    });

    if (!storyboard) {
      return res
        .status(404)
        .json({ error: "Storyboard not yet generated" });
    }

    res.json({ storyboard });
  } catch (error) {
    console.error("Error fetching storyboard:", error);
    res.status(500).json({ error: "Failed to fetch storyboard" });
  }
});

/**
 * PUT /projects/:id/storyboard
 * Update storyboard metadata (e.g., manual adjustments)
 */
router.put("/projects/:id/storyboard", async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const updates = req.body;

    const storyboard = await prisma.storyboard.update({
      where: { projectId },
      data: updates,
    });

    res.json({ success: true, storyboard });
  } catch (error) {
    console.error("Error updating storyboard:", error);
    res.status(500).json({ error: "Failed to update storyboard" });
  }
});

/**
 * GET /projects/:id/storyboard/timeline
 * Get full timeline with scenes, beats, and metadata
 */
router.get(
  "/projects/:id/storyboard/timeline",
  async (req: Request, res: Response) => {
    try {
      const projectId = req.params.id;

      const [project, storyboard, scenes] = await Promise.all([
        prisma.project.findUnique({ where: { id: projectId } }),
        prisma.storyboard.findUnique({ where: { projectId } }),
        prisma.scene.findMany({
          where: { projectId },
          include: {
            versions: {
              where: { isSelected: true },
              take: 1,
            },
          },
          orderBy: { order: "asc" },
        }),
      ]);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Build timeline structure
      const beatGrid = storyboard?.beatGrid || {};
      const sections = (storyboard?.sections as any[] | undefined) || [];
      const energyCurve = storyboard?.energyCurve || {};

      const timeline = {
        projectId,
        duration: project.duration,
        bpm: (beatGrid as any)?.bpm || 120,
        sections,
        energyCurve,
        scenes: scenes.map((scene: any) => ({
          id: scene.id,
          order: scene.order,
          startTime: scene.startTime,
          endTime: scene.endTime,
          duration: scene.duration,
          sceneType: scene.sceneType,
          section: scene.section,
          prompt: scene.prompt,
          status: scene.status,
          selectedVersion: scene.versions[0] || null,
        })),
      };

      res.json({ timeline });
    } catch (error) {
      console.error("Error fetching timeline:", error);
      res.status(500).json({ error: "Failed to fetch timeline" });
    }
  }
);

export default router;
