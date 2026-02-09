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

    // Sora is not yet available in public OpenAI API
    // For now, we'll use mock mode by default
    // When Sora becomes available, update this to use the actual API

    if (process.env.USE_SORA_MOCK === "false" && process.env.OPENAI_API_KEY) {
      // TODO: Call actual Sora API when available
      // const response = await openai.beta.videos.generate({...})
      // For now, fall through to mock
    }

    // Use mock response for development
    // TODO: When Sora API becomes available, implement real generation here
    return mockSoraResponse(prompt);
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
