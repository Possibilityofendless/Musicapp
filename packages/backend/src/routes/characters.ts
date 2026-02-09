import { Router, Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { enqueueJob } from "../lib/queue";

const router = Router();

/**
 * POST /projects/:id/characters
 * Create or update a persistent character
 */
router.post("/projects/:id/characters", async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;
    const { name, description, bible, referenceImageUrl, isPrimary } = req.body;

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const character = await prisma.character.create({
      data: {
        projectId,
        name,
        description,
        bible: bible || {},
        referenceImageUrl,
        isPrimary: isPrimary || false,
      },
    });

    res.json({ success: true, character });
  } catch (error) {
    console.error("Error creating character:", error);
    res.status(500).json({ error: "Failed to create character" });
  }
});

/**
 * GET /projects/:id/characters
 * List all characters for a project
 */
router.get("/projects/:id/characters", async (req: Request, res: Response) => {
  try {
    const projectId = req.params.id;

    const characters = await prisma.character.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ characters });
  } catch (error) {
    console.error("Error fetching characters:", error);
    res.status(500).json({ error: "Failed to fetch characters" });
  }
});

/**
 * PUT /projects/:id/characters/:characterId
 * Update a character
 */
router.put(
  "/projects/:id/characters/:characterId",
  async (req: Request, res: Response) => {
    try {
      const { id: projectId, characterId } = req.params;
      const updates = req.body;

      const character = await prisma.character.update({
        where: { id: characterId },
        data: updates,
      });

      res.json({ success: true, character });
    } catch (error) {
      console.error("Error updating character:", error);
      res.status(500).json({ error: "Failed to update character" });
    }
  }
);

/**
 * DELETE /projects/:id/characters/:characterId
 * Delete a character
 */
router.delete(
  "/projects/:id/characters/:characterId",
  async (req: Request, res: Response) => {
    try {
      const { characterId } = req.params;

      await prisma.character.delete({
        where: { id: characterId },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting character:", error);
      res.status(500).json({ error: "Failed to delete character" });
    }
  }
);

export default router;
