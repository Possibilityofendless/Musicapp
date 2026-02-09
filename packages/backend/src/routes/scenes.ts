import { Router, Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { enqueueJob } from "../lib/queue";
import { buildScenePrompt } from "../lib/promptBuilder";

const router = Router();

/**
 * GET /projects/:id/scenes
 * List all scenes for a project with their versions
 */
router.get("/projects/:id/scenes", async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;

    const scenes = await prisma.scene.findMany({
      where: { projectId },
      include: {
        versions: {
          orderBy: { take: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    res.json({ scenes });
  } catch (error) {
    console.error("Error fetching scenes:", error);
    res.status(500).json({ error: "Failed to fetch scenes" });
  }
});

/**
 * GET /projects/:id/scenes/:sceneId
 * Get a specific scene with all versions
 */
router.get(
  "/projects/:id/scenes/:sceneId",
  async (req: Request, res: Response) => {
    try {
      const { sceneId } = req.params;

      const scene = await prisma.scene.findUnique({
        where: { id: sceneId },
        include: {
          versions: {
            orderBy: { take: "asc" },
          },
        },
      });

      if (!scene) {
        return res.status(404).json({ error: "Scene not found" });
      }

      res.json({ scene });
    } catch (error) {
      console.error("Error fetching scene:", error);
      res.status(500).json({ error: "Failed to fetch scene" });
    }
  }
);

/**
 * POST /projects/:id/scenes/:sceneId/generate
 * Generate new version(s) of a scene via Sora
 */
router.post(
  "/projects/:id/scenes/:sceneId/generate",
  async (req: Request, res: Response) => {
    try {
      const { sceneId } = req.params;
      const { numTakes = 1 } = req.body;

      const scene = await prisma.scene.findUnique({
        where: { id: sceneId },
        include: {
          project: true,
        },
      });

      if (!scene || !scene.project) {
        return res.status(404).json({ error: "Scene or project not found" });
      }

      // Queue generation jobs for each take
      const jobIds = [];
      for (let i = 0; i < numTakes; i++) {
        const jobId = await enqueueJob({
          type: "generate_scene",
          projectId: scene.projectId,
          sceneId,
          payload: {
            promptText: scene.prompt,
            characterIds: scene.characterIds || [],
            size: scene.soraSize,
            seconds: scene.project.clipSeconds,
          },
        });
        jobIds.push(jobId);
      }

      // Update scene status
      await prisma.scene.update({
        where: { id: sceneId },
        data: { status: "generating" },
      });

      res.json({
        success: true,
        message: `Queued ${numTakes} generation job(s)`,
        jobIds,
      });
    } catch (error) {
      console.error("Error queuing scene generation:", error);
      res.status(500).json({ error: "Failed to queue generation job" });
    }
  }
);

/**
 * POST /projects/:id/scenes/:sceneId/remix
 * Remix a specific version with a revised prompt
 */
router.post(
  "/projects/:id/scenes/:sceneId/remix",
  async (req: Request, res: Response) => {
    try {
      const { sceneId } = req.params;
      const { versionId, revisedPrompt } = req.body;

      const version = await prisma.sceneVersion.findUnique({
        where: { id: versionId },
        include: {
          scene: {
            include: {
              project: true,
            },
          },
        },
      });

      if (!version || !version.soraClipId) {
        return res
          .status(404)
          .json({ error: "Version or clip not found" });
      }

      // Queue remix job
      const jobId = await enqueueJob({
        type: "remix_scene",
        projectId: version.scene.projectId,
        sceneId,
        payload: {
          versionId,
          soraClipId: version.soraClipId,
          revisedPrompt: revisedPrompt || version.prompt,
          size: version.scene.soraSize,
          seconds: version.scene.project.clipSeconds,
        },
      });

      res.json({
        success: true,
        message: "Remix job queued",
        jobId,
      });
    } catch (error) {
      console.error("Error queueing remix:", error);
      res.status(500).json({ error: "Failed to queue remix job" });
    }
  }
);

/**
 * POST /projects/:id/scenes/:sceneId/versions/:versionId/select
 * Mark a version as the selected/final version
 */
router.post(
  "/projects/:id/scenes/:sceneId/versions/:versionId/select",
  async (req: Request, res: Response) => {
    try {
      const { sceneId, versionId } = req.params;

      // Clear previous selection
      await prisma.sceneVersion.updateMany({
        where: { sceneId },
        data: { isSelected: false, selectedAt: null },
      });

      // Set new selection
      const version = await prisma.sceneVersion.update({
        where: { id: versionId },
        data: {
          isSelected: true,
          selectedAt: new Date(),
        },
      });

      // Update scene's selectedVersionId
      await prisma.scene.update({
        where: { id: sceneId },
        data: { selectedVersionId: versionId },
      });

      res.json({ success: true, version });
    } catch (error) {
      console.error("Error selecting version:", error);
      res.status(500).json({ error: "Failed to select version" });
    }
  }
);

/**
 * POST /projects/:id/scenes/:sceneId/versions/:versionId/score
 * Rate or score a version (user QC)
 */
router.post(
  "/projects/:id/scenes/:sceneId/versions/:versionId/score",
  async (req: Request, res: Response) => {
    try {
      const { versionId } = req.params;
      const { qualityScore, userScore, characterConsistency, mouthVisibility } =
        req.body;

      const version = await prisma.sceneVersion.update({
        where: { id: versionId },
        data: {
          qualityScore: qualityScore ?? undefined,
          userScore: userScore ?? undefined,
          characterConsistencyScore: characterConsistency ?? undefined,
          mouthVisibilityScore: mouthVisibility ?? undefined,
        },
      });

      res.json({ success: true, version });
    } catch (error) {
      console.error("Error scoring version:", error);
      res.status(500).json({ error: "Failed to score version" });
    }
  }
);

export default router;
