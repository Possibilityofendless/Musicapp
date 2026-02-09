/**
 * Prompt builder — generates deterministic Sora prompts
 * using project settings, scene metadata, and character info
 */

interface Project {
  id: string;
  format: string;
  clipSeconds: number;
  soraModel: string;
  duration: number;
}

interface Scene {
  id: string;
  sceneType: string;
  lyricExcerpt?: string | null;
  referenceImageUrl?: string | null;
  mood?: Record<string, any> | null;
  prompt: string;
  soraSize: string;
}

interface Character {
  id: string;
  name: string;
  bible?: Record<string, any> | null;
}

interface SceneContext {
  scene: Scene;
  character?: Character;
  stylePreset?: string;
  globalStylePrefix?: string;
}

/**
 * Global style prefix — applied to all prompts in a project
 */
function buildGlobalStylePrefix(project: {
  format: string;
  soraModel: string;
}): string {
  const aesthetic =
    project.format === "portrait"
      ? "vertical music video aesthetic"
      : "cinematic music video, landscape composition";

  return `
High-quality ${aesthetic}. Professional smooth camera motion, shallow depth of field, natural skin tones, soft key lighting. Clean compositions. Cinematic color grading. No on-screen text, no watermarks, no logos.
  `.trim();
}

/**
 * Character prefix — ensures persistence across scenes
 */
function buildCharacterPrefix(character: Character): string {
  const bible = character.bible as any;

  if (!bible || !character.name) {
    return "";
  }

  const { face, signature, wardrobe_lock, dos = [] } = bible;

  let prefix = `\nPersistent main character: **${character.name}**`;

  if (face) prefix += ` — ${face}`;
  if (signature) prefix += `, ${signature}`;
  if (wardrobe_lock) prefix += `. Outfit: ${wardrobe_lock}`;

  prefix += `. Keep the same face structure, hair, tattoos, and outfit across every scene.`;

  if (dos && dos.length > 0) {
    prefix += ` Requirements: ${dos.join(", ")}.`;
  }

  return prefix;
}

/**
 * Performance scene directive — for lip-sync plates
 */
function buildPerformanceDirective(
  scene: Scene,
  character?: Character,
  excerpt?: string
): string {
  const lyricSnippet = excerpt || scene.lyricExcerpt || "[lyrics]";

  let directive = `Medium close-up performance shot. Face mostly forward, clear mouth visibility, minimal occlusion, minimal head movement.`;

  if (character) {
    directive += ` ${character.name} raps expressively with mouth shapes matching: "${lyricSnippet}".`;
  } else {
    directive += ` Expressively performs: "${lyricSnippet}".`;
  }

  directive += ` Keep background cinematic and simple.`;

  // Add mood if available
  const mood = scene.mood as any;
  if (mood && mood.energy) {
    const energyLevel =
      mood.energy > 0.7 ? "high energy" : mood.energy > 0.4 ? "medium energy" : "slow";
    directive += ` Mood: ${energyLevel}.`;
  }

  return directive;
}

/**
 * B-roll scene directive — story/visuals
 */
function buildBrollDirective(scene: Scene, character?: Character): string {
  const lyricSnippet = scene.lyricExcerpt || "[visual theme]";

  let directive = `Visual metaphor for: "${lyricSnippet}". Show dynamic, cinematic storytelling.`;

  if (character) {
    directive += ` Optional: include ${character.name} in silhouette, hands, or wide shot.`;
  }

  directive += ` Use strong compositions and atmospheric lighting.`;

  const mood = scene.mood as any;
  if (mood) {
    const moodLabels = [];
    if (mood.energy > 0.7) moodLabels.push("high-energy");
    if (mood.valence > 0.6) moodLabels.push("uplifting");
    if (mood.valence < 0.4) moodLabels.push("dark");
    if (mood.tension > 0.6) moodLabels.push("tense");

    if (moodLabels.length > 0) {
      directive += ` Mood: ${moodLabels.join(", ")}.`;
    }
  }

  return directive;
}

/**
 * Continuity rules — avoid drift
 */
function buildContinuityRules(character?: Character): string {
  if (!character) return "";

  return `
CRITICAL: If character appears, maintain exact continuity:
- Same face structure and features
- Same hair color, length, and style
- Same clothing, colors, and accessories
- Same tattoos and marks
No outfit changes, no hairstyle changes, no makeup changes.
  `.trim();
}

/**
 * Main prompt builder
 */
export function buildScenePrompt(
  project: Project & { format: string; soraModel: string },
  scene: Scene,
  character?: Character,
  stylePresetOverride?: string
): string {
  const sections: string[] = [];

  // 1. Global style
  sections.push(buildGlobalStylePrefix(project));

  // 2. Character consistency prefix
  if (character) {
    const charPrefix = buildCharacterPrefix(character);
    if (charPrefix) sections.push(charPrefix);
  }

  // 3. Scene-specific directive
  if (scene.sceneType === "performance") {
    sections.push(buildPerformanceDirective(scene, character, scene.lyricExcerpt || undefined));
  } else {
    sections.push(buildBrollDirective(scene, character));
  }

  // 4. Continuity rules
  if (character) {
    sections.push(buildContinuityRules(character));
  }

  // 5. Optional: style preset
  if (stylePresetOverride) {
    const presetDirectives: Record<string, string> = {
      cinematic_noir: "Film noir aesthetic: high contrast, monochrome or selective color, shadow play.",
      anime: "Anime-inspired aesthetic: vibrant colors, stylized features, dynamic action lines.",
      gritty_documentary: "Gritty documentary style: naturalistic, handheld camera feel, authentic lighting.",
      dreamy: "Dreamy, surreal aesthetic: soft focus, ethereal lighting, pastel colors, floating elements.",
      dark_gothic: "Dark gothic aesthetic: moody colors, architectural elements, mysterious atmosphere.",
    };

    const presetText = presetDirectives[stylePresetOverride];
    if (presetText) {
      sections.push(presetText);
    }
  }

  return sections.filter((s) => s.length > 0).join("\n\n");
}

/**
 * Build a cost estimate for a scene
 * Based on Sora 2 pricing: ~$0.06/second for sora-2, ~$0.12/second for sora-2-pro
 */
export function estimateSceneCost(
  project: Project & { clipSeconds: number; soraModel: string }
): number {
  // Very rough estimate; adjust based on actual Sora pricing
  const secondsPerClip = project.clipSeconds || 8;
  const isProModel = project.soraModel === "sora-2-pro";
  const pricePerSecond = isProModel ? 0.12 : 0.06;

  return pricePerSecond * secondsPerClip;
}

/**
 * Estimate total project cost
 */
export function estimateProjectCost(
  project: Project & { clipSeconds: number; soraModel: string },
  sceneCount: number
): number {
  const perSceneCost = estimateSceneCost(project);
  const baseEstimate = perSceneCost * sceneCount;

  // Add 20% buffer for retries/QC
  return baseEstimate * 1.2;
}
