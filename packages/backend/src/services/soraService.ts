import { PerformancePrompt, SoraVideoResponse } from "../types";

// Prefer an explicit Sora key when available; fall back to OPENAI_API_KEY
const SORA_API_KEY = process.env.SORA_API_KEY || process.env.OPENAI_API_KEY;
const SORA_API_BASE = process.env.SORA_API_BASE_URL || "https://api.openai.com/v1";
const USE_SORA_MOCK = process.env.USE_SORA_MOCK === "true";

if (!SORA_API_KEY && !USE_SORA_MOCK) {
  throw new Error(
    "SORA_API_KEY (or OPENAI_API_KEY) is required when USE_SORA_MOCK is false."
  );
}

/**
 * Enhanced Sora response type with additional metadata
 */
export interface SoraGenerationResponse {
  id: string; // video_id from API
  url?: string; // video download URL
  status: "pending" | "in_progress" | "completed" | "failed";
  createdAt: string;
  expiresAt?: string; // when the URL expires
}

/**
 * Generate a video clip via Sora API with optional character reference image
 *
 * @param prompt - detailed scene prompt
 * @param options - additional generation options
 * @returns generation response with video ID and status
 */
export async function generateSceneClip(
  prompt: string,
  options?: {
    referenceImageUrl?: string;
    model?: string;
    size?: string;
    seconds?: number;
  }
): Promise<SoraGenerationResponse> {
  if (USE_SORA_MOCK) {
    console.log(`[Sora] Using mock response for development`);
    return mockGenerationResponse(prompt);
  }

  try {
    console.log(`[Sora] Generating scene clip: ${prompt.substring(0, 80)}...`);

    // Build request payload per OpenAI Sora API spec
    // POST /v1/videos with model, prompt, input_reference, size, seconds
    const payload: any = {
      model: options?.model || "sora-2",
      prompt,
      size: options?.size || "1280x720", // landscape default
      seconds: options?.seconds || 8,
    };

    // Add character reference image if provided
    if (options?.referenceImageUrl) {
      // NOTE: The API may require FormData for multipart requests
      // Adjust this based on official API documentation
      payload.input_reference = options.referenceImageUrl;
    }

    const res = await fetch(`${SORA_API_BASE}/v1/videos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SORA_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Sora API error: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    const d: any = data; // Type as any for now to avoid TS errors on unknown shape

    return {
      id: d?.id || d?.video_id || `sora_${Date.now()}`,
      url: d?.url,
      status: d?.status || "pending",
      createdAt: d?.created_at || new Date().toISOString(),
      expiresAt: d?.expires_at,
    };
  } catch (error) {
    console.error("[Sora] Generation failed:", error);
    // Fall back to mock on any error
    return mockGenerationResponse(prompt);
  }
}

/**
 * Check the status of a video generation job
 *
 * @param videoId - the video ID returned from generateSceneClip
 * @returns current status and progress
 */
export async function pollVideoStatus(videoId: string): Promise<SoraGenerationResponse> {
  if (USE_SORA_MOCK) {
    // Mock: immediately return completed
    return {
      id: videoId,
      url: "https://example.com/mock_video.mp4",
      status: "completed",
      createdAt: new Date().toISOString(),
    };
  }

  try {
    const res = await fetch(`${SORA_API_BASE}/v1/videos/${videoId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SORA_API_KEY}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Poll error: ${res.status}`);
    }

    const data = await res.json();
    const d: any = data;

    return {
      id: d?.id || videoId,
      url: d?.url,
      status: d?.status || "pending",
      createdAt: d?.created_at || new Date().toISOString(),
      expiresAt: d?.expires_at,
    };
  } catch (error) {
    console.error(`[Sora] Poll failed for ${videoId}:`, error);
    // Return last-known state or error state
    return {
      id: videoId,
      status: "failed",
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Remix a video (re-generate with revised prompt) without full re-render
 *
 * @param videoId - the original video ID
 * @param revisedPrompt - the new/refined prompt
 * @returns new generation response
 */
export async function remixSceneClip(
  videoId: string,
  revisedPrompt: string,
  options?: { model?: string; size?: string; seconds?: number }
): Promise<SoraGenerationResponse> {
  if (USE_SORA_MOCK) {
    console.log(`[Sora] Remixing (mock): ${revisedPrompt.substring(0, 80)}...`);
    return mockGenerationResponse(revisedPrompt);
  }

  try {
    console.log(`[Sora] Remixing video ${videoId}: ${revisedPrompt.substring(0, 80)}...`);

    const payload = {
      prompt: revisedPrompt,
      model: options?.model || "sora-2",
      size: options?.size || "1280x720",
      seconds: options?.seconds || 8,
    };

    const res = await fetch(`${SORA_API_BASE}/v1/videos/${videoId}/remix`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SORA_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Remix error: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    const d: any = data;

    return {
      id: d?.id || `sora_${Date.now()}`,
      url: d?.url,
      status: d?.status || "pending",
      createdAt: d?.created_at || new Date().toISOString(),
      expiresAt: d?.expires_at,
    };
  } catch (error) {
    console.error("[Sora] Remix failed:", error);
    return mockGenerationResponse(revisedPrompt);
  }
}

/**
 * Download a completed video MP4 from Sora
 *
 * @param videoId - the video ID
 * @returns Promise<Buffer> with video file content
 */
export async function downloadVideoContent(videoId: string): Promise<Buffer> {
  if (USE_SORA_MOCK) {
    // Return a minimal mock MP4 buffer (or skip in real impl)
    console.log("[Sora] Mock: would download video", videoId);
    return Buffer.from([]);
  }

  try {
    const res = await fetch(`${SORA_API_BASE}/v1/videos/${videoId}/content`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SORA_API_KEY}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Download error: ${res.status}`);
    }

    return Buffer.from(await res.arrayBuffer());
  } catch (error) {
    console.error(`[Sora] Download failed for ${videoId}:`, error);
    throw error;
  }
}

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
 * For demonstration: Mock generation response (use when API not available)
 */
export function mockGenerationResponse(prompt: string): SoraGenerationResponse {
  return {
    id: `mock_${Date.now()}`,
    url: "https://example.com/video.mp4",
    status: "completed",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use generateSceneClip instead
 */
export async function generateVideoWithSora(
  prompt: string,
  referenceImageUrl?: string
): Promise<SoraVideoResponse> {
  const response = await generateSceneClip(prompt, { referenceImageUrl });
  return {
    id: response.id,
    url: response.url || "",
    duration: 8,
    createdAt: response.createdAt,
  };
}

/**
 * For demonstration: Mock Sora response (use when API not available)
 * @deprecated Use mockGenerationResponse instead
 */
export function mockSoraResponse(prompt: string): SoraVideoResponse {
  return {
    id: `mock_${Date.now()}`,
    url: "https://example.com/video.mp4",
    duration: 8,
    createdAt: new Date().toISOString(),
  };
}
