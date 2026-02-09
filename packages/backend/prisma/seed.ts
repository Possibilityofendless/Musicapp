import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Initialize database with seed data for development
 */
async function main() {
  console.log("[Seed] Starting database initialization...");

  try {
    // Create default user with hashed password
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await prisma.user.upsert({
      where: { email: "demo@example.com" },
      update: {},
      create: {
        email: "demo@example.com",
        password: hashedPassword,
        name: "Demo User",
      },
    });

    console.log(`[Seed] ✓ User created/exists: ${user.email}`);

    // Create demo project with sample data
    const project = await prisma.project.upsert({
      where: { id: "demo-project-1" },
      update: {},
      create: {
        id: "demo-project-1",
        title: "Demo Music Video",
        description: "Sample project for testing the application",
        userId: user.id,
        audioUrl: "https://example.com/demo.mp3",
        duration: 180,
        performanceDensity: 0.4,
        status: "draft",
        progress: 0,
      },
    });

    console.log(`[Seed] ✓ Project created/exists: ${project.title}`);

    // Create storyboard with sample lyrics
    const storyboard = await prisma.storyboard.upsert({
      where: { projectId: project.id },
      update: {},
      create: {
        projectId: project.id,
        lyricsData: {
          lines: [
            {
              text: "Verse one is here",
              startTime: 0,
              endTime: 5,
              wordIndex: 0,
            },
            {
              text: "Making music loud and clear",
              startTime: 5,
              endTime: 10,
              wordIndex: 3,
            },
            {
              text: "Chorus time now",
              startTime: 10,
              endTime: 15,
              wordIndex: 7,
            },
          ],
          words: [
            {
              word: "Verse",
              startTime: 0,
              endTime: 1.67,
            },
            {
              word: "one",
              startTime: 1.67,
              endTime: 3.33,
            },
            {
              word: "is",
              startTime: 3.33,
              endTime: 5,
            },
            {
              word: "here",
              startTime: 5,
              endTime: 6.67,
            },
            {
              word: "Making",
              startTime: 6.67,
              endTime: 7.78,
            },
            {
              word: "music",
              startTime: 7.78,
              endTime: 8.89,
              },
            {
              word: "loud",
              startTime: 8.89,
              endTime: 10,
            },
          ],
        },
      },
    });

    console.log(`[Seed] ✓ Storyboard created/exists`);

    console.log("[Seed] ✅ Database initialization complete!");
  } catch (error) {
    console.error("[Seed] ❌ Error during initialization:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
