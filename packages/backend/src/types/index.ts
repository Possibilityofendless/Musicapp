// Scene and storyboard types
export type SceneType = "performance" | "broll";
export type LipSyncMethod = "sora_native" | "post_process";

export interface LyricLine {
  text: string;
  startTime: number; // in seconds
  endTime: number;
  wordIndex: number; // starting word index
}

export interface LyricsData {
  lines: LyricLine[];
  words: Array<{ word: string; startTime: number; endTime: number }>;
}

export interface SceneConfig {
  sceneType: SceneType;
  lipSyncEnabled: boolean;
  lipSyncMethod?: LipSyncMethod;
  lyricExcerpt: string;
  mouthVisibilityRequired: boolean;
  referenceImageUrl?: string;
}

export interface PerformancePrompt {
  base: string;
  character: string;
  words: string;
  mood: string;
  mouthVisibility: string;
}

// Job types
export type JobType =
  | "generate_scenes"
  | "vocal_extraction"
  | "forced_alignment"
  | "lip_sync_post_process"
  | "stitch_final"
  | "quality_check";

export interface JobPayload {
  projectId: string;
  sceneId?: string;
  type: JobType;
  data: Record<string, unknown>;
}

export interface ProcessingResult {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
  duration: number; // in milliseconds
}

export interface SoraVideoResponse {
  id: string;
  url: string;
  duration: number;
  createdAt: string;
}
