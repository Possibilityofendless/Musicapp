import OpenAI from "openai";
import { PerformancePrompt, SoraVideoResponse } from "../types";

// Prefer an explicit Sora key when available; fall back to OPENAI_API_KEY
const SORA_API_KEY = process.env.SORA_API_KEY || process.env.OPENAI_API_KEY;
const SORA_API_BASE = process.env.SORA_API_BASE_URL || "https://api.openai.com/v1";

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

    // Sora may not be generally available yet. If mock mode is disabled
    // and a Sora/OpenAI API key is present, attempt a real API request.
    if (!useMock && SORA_API_KEY) {
      try {
        // Example HTTP request demonstrating how to call a Sora-style
        // video generation endpoint. Adjust endpoint, payload and response
        // parsing once the official Sora API spec is published.
        const payload = {
          prompt,
          reference_image: referenceImageUrl,
          // additional options could go here
        };

        const res = await fetch(`${SORA_API_BASE}/videos/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SORA_API_KEY}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Sora API error: ${res.status} ${text}`);
        }

        const data = await res.json();

        // Map the expected fields into our SoraVideoResponse
        // NOTE: adapt these paths to the real API response when available
        const videoId = data?.id || data?.clip_id || `sora_${Date.now()}`;
        const videoUrl = data?.url || data?.video_url || data?.result?.url;

        if (!videoUrl) {
          throw new Error("Sora response did not include a video URL");
        }

        return {
          id: videoId,
          url: videoUrl,
          duration: data?.duration || 0,
          createdAt: data?.created_at || new Date().toISOString(),
        } as SoraVideoResponse;
      } catch (err) {
        console.error("[Sora] Real API call failed, falling back to mock:", err);
        return mockSoraResponse(prompt);
      }
    }

    // Fallback: use mock response for development or when no key is present
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
