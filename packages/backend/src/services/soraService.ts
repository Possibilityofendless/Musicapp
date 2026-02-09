import OpenAI from "openai";
import { PerformancePrompt, SoraVideoResponse } from "../types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a performance scene prompt for Sora
 * Based on OpenAI's recommendations for lip-sync accuracy
 */
export function buildPerformancePrompt(config: {
  character: string;
  lyrics: string;
  mood: string;
  cameraAngle?: string;
  simplifyMotion?: boolean;
}): string {
  const {
    character,
    lyrics,
    mood,
    cameraAngle = "medium close-up",
    simplifyMotion = true,
  } = config;

  // Key principle: Keep it simple for better lip-sync accuracy
  const motionNote = simplifyMotion
    ? "Simple, minimal head movements. No face occlusion."
    : "";

  return `
Close shot of ${character} rapping/singing these exact words:
"${lyrics}"

Camera: ${cameraAngle}
Mood: ${mood}
Clear mouth visibility at all times. Lips precisely match the words.
${motionNote}
Professional quality cinematic video. High fidelity.
`.trim();
}

/**
 * Generate a B-roll scene prompt for Sora
 */
export function buildBrollPrompt(config: {
  mood: string;
  lyrics: string;
  setting?: string;
}): string {
  const { mood, lyrics, setting = "cinematic backdrop" } = config;

  return `
${setting}. Cinematic B-roll video matching the mood and theme of: "${lyrics}"
Atmospheric, moody, high-quality cinematography.
No text on screen. No faces required.
Professional music video aesthetic.
`.trim();
}

/**
 * Call Sora API to generate a video
 */
export async function generateVideoWithSora(
  prompt: string,
  referenceImageUrl?: string
): Promise<SoraVideoResponse> {
  // Check if we should use mock data for development
  const useMock = process.env.USE_SORA_MOCK === "true";
  
  if (useMock) {
    console.log(`[Sora] Using mock response for development`);
    return mockSoraResponse(prompt);
  }

  try {
    console.log(`[Sora] Generating video with prompt: ${prompt.substring(0, 100)}...`);

    // This uses the actual OpenAI Video API endpoint
    // Note: As of Feb 2026, Sora is available via OpenAI API
    // This code assumes the Video API structure shown below

    const response = await openai.beta.videos.generate({
      model: "sora-1", // Sora model identifier
      prompt: prompt,
      duration: 16, // Up to 60 seconds
      // @ts-ignore - API might not be fully typed yet
      ...(referenceImageUrl && { image_url: referenceImageUrl }),
    });

    // Extract video ID and status
    const videoId = (response as any).id;

    // Poll for completion (Sora generation is async)
    let videoData = response;
    let attempts = 0;
    const maxAttempts = 120; // 2 hour timeout with 60s intervals
    const pollInterval = parseInt(process.env.SORA_POLL_INTERVAL || "60000"); // Default 60s

    while (attempts < maxAttempts) {
      const status = (videoData as any).status;

      if (status === "succeeded") {
        return {
          id: videoId,
          url: (videoData as any).url,
          duration: (videoData as any).duration || 16,
          createdAt: new Date().toISOString(),
        };
      }

      if (status === "failed") {
        throw new Error(
          `Sora video generation failed: ${(videoData as any).error_message}`
        );
      }

      console.log(`[Sora] Waiting for video generation... (attempt ${attempts + 1}/${maxAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, pollInterval));

      // Re-fetch job status
      // videoData = await openai.beta.videos.retrieve(videoId);
      attempts++;
    }

    throw new Error("Sora video generation timeout");
  } catch (error) {
    console.error("[Sora] Video generation error:", error);
    throw error;
  }
}

/**
 * For demonstration: Mock Sora response (use when API not available)
 */
export function mockSoraResponse(prompt: string): SoraVideoResponse {
  return {
    id: `mock_${Date.now()}`,
    url: "https://example.com/video.mp4",
    duration: 16,
    createdAt: new Date().toISOString(),
  };
}
