import prisma from "../lib/prisma";
import { processingQueue } from "../lib/queue";
import { JobPayload, LyricsData, SceneType } from "../types";
import {
  buildPerformancePrompt,
  buildBrollPrompt,
  generateVideoWithSora,
} from "../services/soraService";
import { stitchVideos, addAudioToVideo } from "../lib/videoStitcher";
import {
  extractVocals,
  performForcedAlignment,
  postProcessLipSync,
  detectMouthVisibility,
} from "../lib/audioProcessor";
import path from "path";

/**
 * Register all job processors
 */
export async function registerJobProcessors() {
  processingQueue.process(5, async (job) => {
    const payload = job.data as JobPayload;

    try {
      console.log(
        `[Processor] Processing job: ${payload.type} for project ${payload.projectId}`
      );

      switch (payload.type) {
        case "generate_scenes":
          return await processGenerateScenes(payload, job);
        case "vocal_extraction":
          return await processVocalExtraction(payload, job);
        case "forced_alignment":
          return await processForcedAlignment(payload, job);
        case "lip_sync_post_process":
          return await processLipSyncPostProcess(payload, job);
        case "stitch_final":
          return await processStitchFinal(payload, job);
        case "quality_check":
          return await processQualityCheck(payload, job);
        default:
          throw new Error(`Unknown job type: ${payload.type}`);
      }
    } catch (error) {
      console.error(`[Processor] Job failed:`, error);
      throw error;
    }
  });
}

/**
 * Generate scene storyboard from lyrics
 */
async function processGenerateScenes(payload: JobPayload, job: any) {
  const { projectId } = payload;

  // Record job in database
  let dbJob = await prisma.processingJob.create({
    data: {
      projectId,
      type: "generate_scenes",
      status: "processing",
      queueJobId: job.id.toString(),
    },
  });

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { storyboard: true },
    });

    if (!project || !project.storyboard) {
      throw new Error("Project or storyboard not found");
    }

    const lyricsData = project.storyboard.lyricsData as LyricsData;
    const totalScenes = Math.ceil(lyricsData.lines.length);

    // Calculate performance vs broll split
    const performanceCount = Math.ceil(totalScenes * project.performanceDensity);
    const brollCount = totalScenes - performanceCount;

    // Distribute scene types across timeline
    const sceneTypes: SceneType[] = [];
    for (let i = 0; i < performanceCount; i++) {
      sceneTypes.push("performance");
    }
    for (let i = 0; i < brollCount; i++) {
      sceneTypes.push("broll");
    }
    // Shuffle to distribute throughout video
    sceneTypes.sort(() => Math.random() - 0.5);

    // Create scenes
    const scenes = await Promise.all(
      lyricsData.lines.map((line, index) => {
        const sceneType = sceneTypes[index] || "broll";

        const prompt =
          sceneType === "performance"
            ? buildPerformancePrompt({
                character: "vocalist",
                lyrics: line.text,
                mood: "energetic",
                simplifyMotion: true,
              })
            : buildBrollPrompt({
                lyrics: line.text,
                mood: "cinematic",
              });

        return prisma.scene.create({
          data: {
            projectId,
            order: index,
            startTime: line.startTime,
            endTime: line.endTime,
            sceneType,
            prompt,
            lyricExcerpt: line.text,
            lipSyncEnabled: sceneType === "performance",
            lipSyncMethod: sceneType === "performance" ? "sora_native" : undefined,
          },
        });
      })
    );

    await prisma.processingJob.update({
      where: { id: dbJob.id },
      data: {
        status: "completed",
        resultData: {
          sceneCount: scenes.length,
          performanceCount,
          brollCount,
        },
      },
    });

    // Enqueue scene rendering jobs with priority
    for (const scene of scenes) {
      if (scene.sceneType === "performance") {
        // Higher priority for performance scenes (they need post-processing)
        // We'll enqueue individual scene processing instead of vocal extraction first
        // since Sora-native doesn't need vocal extraction
        await processingQueue.add(
          {
            projectId,
            sceneId: scene.id,
            type: "lip_sync_post_process",
            data: {
              sceneType: "performance",
            },
          },
          { priority: 1 }
        );
      } else {
        // Lower priority for broll
        await processingQueue.add(
          {
            projectId,
            sceneId: scene.id,
            type: "lip_sync_post_process",
            data: {
              sceneType: "broll",
            },
          },
          { priority: 2 }
        );
      }
    }

    return { success: true, sceneCount: scenes.length };
  } catch (error) {
    await prisma.processingJob.update({
      where: { id: dbJob.id },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

/**
 * Extract vocal audio from project audio
 * Called when using post-process lip-sync
 */
async function processVocalExtraction(payload: JobPayload, job: any) {
  const { projectId, sceneId } = payload;

  let dbJob = await prisma.processingJob.create({
    data: {
      projectId,
      sceneId,
      type: "vocal_extraction",
      status: "processing",
      queueJobId: job.id.toString(),
    },
  });

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    const scene = await prisma.scene.findUnique({
      where: { id: sceneId! },
    });

    if (!project || !scene) {
      throw new Error("Project or scene not found");
    }

    console.log(`[Processor] Extracting vocals for scene ${sceneId}...`);

    // Create temp directories
    const workDir = process.env.WORK_DIR || "/tmp/processing";
    const projectDir = path.join(workDir, projectId);
    const sceneDir = path.join(projectDir, sceneId);

    // Extract vocals from project audio
    const vocalPath = path.join(sceneDir, "vocals.wav");
    
    // In production, this would extract from the actual audio file stored locally
    // For now, we'll skip if no audio path is available
    if (project.audioPath) {
      await extractVocals(project.audioPath, vocalPath);
    }

    // Create vocal segment record
    const vocalSegment = await prisma.vocalSegment.create({
      data: {
        sceneId: sceneId!,
        audioPath: vocalPath,
        audioUrl: process.env.AUDIO_BASE_URL
          ? `${process.env.AUDIO_BASE_URL}/project_${projectId}/scene_${sceneId}/vocals.wav`
          : `file://${vocalPath}`,
        duration: scene.endTime - scene.startTime,
        format: "wav",
        phonemes: [],
        words: [],
      },
    });

    await prisma.processingJob.update({
      where: { id: dbJob.id },
      data: {
        status: "completed",
        resultData: {
          vocalSegmentId: vocalSegment.id,
          vocalPath: vocalPath,
        },
      },
    });

    // Enqueue forced alignment
    await processingQueue.add(
      {
        projectId,
        sceneId,
        type: "forced_alignment",
        data: {
          vocalSegmentId: vocalSegment.id,
          lyricExcerpt: scene.lyricExcerpt,
        },
      },
      { priority: 2 }
    );

    return { success: true, vocalSegmentId: vocalSegment.id };
  } catch (error) {
    await prisma.processingJob.update({
      where: { id: dbJob.id },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

/**
 * Run forced alignment on vocals
 * Maps phonemes/words to exact timestamps
 */
async function processForcedAlignment(payload: JobPayload, job: any) {
  const { sceneId } = payload;
  const { vocalSegmentId, lyricExcerpt } = payload.data as any;

  let dbJob = await prisma.processingJob.create({
    data: {
      sceneId,
      projectId: payload.projectId,
      type: "forced_alignment",
      status: "processing",
      queueJobId: job.id.toString(),
    },
  });

  try {
    const vocalSegment = await prisma.vocalSegment.findUnique({
      where: { id: vocalSegmentId },
    });

    if (!vocalSegment) {
      throw new Error(`Vocal segment ${vocalSegmentId} not found`);
    }

    console.log(`[Processor] Running forced alignment for scene ${sceneId}...`);

    // Perform forced alignment
    const alignment = await performForcedAlignment(
      vocalSegment.audioPath,
      lyricExcerpt || ""
    );

    // Update vocal segment with alignment data
    await prisma.vocalSegment.update({
      where: { id: vocalSegmentId },
      data: {
        phonemes: alignment.phonemes as any,
        words: alignment.words as any,
      },
    });

    await prisma.processingJob.update({
      where: { id: dbJob.id },
      data: {
        status: "completed",
        resultData: {
          phonemeCount: alignment.phonemes.length,
          wordCount: alignment.words.length,
        },
      },
    });

    return { success: true, ...alignment };
  } catch (error) {
    await prisma.processingJob.update({
      where: { id: dbJob.id },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

/**
 * Generate video with Sora and optionally apply post-process lip-sync
 */
async function processLipSyncPostProcess(payload: JobPayload, job: any) {
  const { projectId, sceneId } = payload;
  const sceneType = (payload.data as any).sceneType as SceneType;

  let dbJob = await prisma.processingJob.create({
    data: {
      projectId,
      sceneId,
      type: "lip_sync_post_process",
      status: "processing",
      queueJobId: job.id.toString(),
    },
  });

  try {
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId! },
    });

    if (!scene) {
      throw new Error(`Scene ${sceneId} not found`);
    }

    // Generate video with Sora
    console.log(`[Processor] Generating Sora video for scene ${sceneId}...`);

    // Call actual Sora API (or mock if USE_SORA_MOCK is true)
    const videoResponse = await generateVideoWithSora(
      scene.prompt,
      scene.referenceImageUrl || undefined
    );

    // Update scene with video
    const updatedScene = await prisma.scene.update({
      where: { id: sceneId! },
      data: {
        soraClipId: videoResponse.id,
        soraClipUrl: videoResponse.url,
        status: "completed",
      },
    });

    // Save generated video
    await prisma.generatedVideo.create({
      data: {
        projectId,
        type: "sora_raw",
        url: videoResponse.url,
      },
    });

    // If post-process lip-sync enabled, would enqueue that here
    if (
      scene.lipSyncEnabled &&
      scene.lipSyncMethod === "post_process"
    ) {
      console.log(`[Processor] Would enqueue post-process lip-sync for scene ${sceneId}`);
      // Would need vocal segment and forced alignment first
    }

    // Update project progress
    const totalScenes = await prisma.scene.count({ where: { projectId } });
    const completedScenes = await prisma.scene.count({
      where: { projectId, status: "completed" },
    });
    const progress = completedScenes / totalScenes;

    await prisma.project.update({
      where: { id: projectId },
      data: { progress },
    });

    await prisma.processingJob.update({
      where: { id: dbJob.id },
      data: {
        status: "completed",
        resultData: {
          videoUrl: videoResponse.url,
          videoId: videoResponse.id,
        },
      },
    });

    return { success: true, videoUrl: videoResponse.url };
  } catch (error) {
    await prisma.scene.update({
      where: { id: sceneId! },
      data: { status: "failed", error: error instanceof Error ? error.message : "Unknown error" },
    });

    await prisma.processingJob.update({
      where: { id: dbJob.id },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

/**
 * Stitch all scene videos into final output
 */
async function processStitchFinal(payload: JobPayload, job: any) {
  const { projectId } = payload;

  let dbJob = await prisma.processingJob.create({
    data: {
      projectId,
      type: "stitch_final",
      status: "processing",
      queueJobId: job.id.toString(),
    },
  });

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const scenes = await prisma.scene.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
    });

    const completedScenes = scenes.filter((s) => s.soraClipUrl);

    if (completedScenes.length === 0) {
      throw new Error("No completed scenes to stitch");
    }

    console.log(
      `[Processor] Stitching ${completedScenes.length} scenes into final video...`
    );

    // Prepare video segments for stitching
    const segments = completedScenes.map((scene) => ({
      url: scene.soraClipUrl!,
      duration: scene.endTime - scene.startTime,
      sceneId: scene.id,
    }));

    // Create output directory if it doesn't exist
    const outputDir = process.env.OUTPUT_VIDEO_DIR || "/tmp/videos";
    const finalVideoPath = path.join(outputDir, `project_${projectId}_final.mp4`);

    // Stitch videos together
    await stitchVideos(segments, finalVideoPath, {
      audioPath: project.audioPath || undefined,
    });

    // Upload final video (would typically upload to cloud storage)
    // For now, we assume it's saved locally and has a public URL
    const finalVideoUrl = process.env.VIDEO_BASE_URL
      ? `${process.env.VIDEO_BASE_URL}/project_${projectId}_final.mp4`
      : `file://${finalVideoPath}`;

    const finalVideo = await prisma.generatedVideo.create({
      data: {
        projectId,
        type: "final",
        url: finalVideoUrl,
        thumbnailUrl: finalVideoUrl, // Could generate thumbnail here
        duration: project.duration,
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "completed",
        progress: 1.0,
      },
    });

    await prisma.processingJob.update({
      where: { id: dbJob.id },
      data: {
        status: "completed",
        resultData: {
          finalVideoUrl,
          videoId: finalVideo.id,
          localPath: finalVideoPath,
        },
      },
    });

    return { success: true, finalVideoUrl };
  } catch (error) {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: "failed",
        progress: 0,
      },
    });

    await prisma.processingJob.update({
      where: { id: dbJob.id },
      data: {
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    throw error;
  }
}

/**
 * Quality check: Verify mouth visibility in performance scenes
 */
async function processQualityCheck(payload: JobPayload, job: any) {
  const { sceneId } = payload;

  try {
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId! },
    });

    if (!scene) {
      throw new Error(`Scene ${sceneId} not found`);
    }

    console.log(`[Processor] Running QC check on scene ${sceneId}...`);

    // TODO: Run face detection + mouth visibility scoring model
    // Would return visibility score 0-1

    // Mock result
    const mouthVisibilityScore = Math.random() * 0.3 + 0.7; // Demo: 70-100%

    const requiresRetry =
      scene.mouthVisibilityRequired &&
      mouthVisibilityScore < 0.8;

    await prisma.scene.update({
      where: { id: sceneId! },
      data: {
        mouthVisibilityScore,
        status: requiresRetry ? "pending" : "completed",
        retryCount: requiresRetry ? scene.retryCount + 1 : scene.retryCount,
      },
    });

    return {
      success: true,
      mouthVisibilityScore,
      requiresRetry,
    };
  } catch (error) {
    console.error(`[Processor] QC check failed:`, error);
    throw error;
  }
}
