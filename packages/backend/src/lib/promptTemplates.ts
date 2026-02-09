/**
 * Prompt Templates for Sora Video Generation
 * 
 * Based on OpenAI's recommendations for Sora:
 * - Keep performance scenes simple for better lip-sync accuracy
 * - Describe mouth visibility explicitly
 * - Limit head movements and occlusions
 * - Use specific, concrete descriptors
 */

export interface PerformanceSceneContext {
  characterName: string;
  lyrics: string;
  mood: "energetic" | "melancholic" | "aggressive" | "intimate" | "groovy";
  cameraAngle?: "close-up" | "medium-close-up" | "medium-shot";
  setting?: string;
  clothingStyle?: string;
}

export interface BrollSceneContext {
  lyrics: string;
  mood: "energetic" | "melancholic" | "aggressive" | "intimate" | "groovy";
  setting?: string;
  theme?: string;
  aesthetic?: string;
}

/**
 * Performance Scene Prompt Template
 * Used when lip-sync is enabled and character is visible
 * 
 * Key principles:
 * - "exact words" helps Sora focus on mouth matching
 * - Simple motion improves accuracy
 * - Clear specifications reduce hallucinations
 */
export function buildPerformancePrompt(context: PerformanceSceneContext): string {
  const {
    characterName,
    lyrics,
    mood,
    cameraAngle = "medium-close-up",
    setting = "studio",
    clothingStyle = "modern",
  } = context;

  return `
Close shot of ${characterName} rapping/singing these exact words:
"${lyrics}"

Camera: ${cameraAngle}, centered on face
Setting: ${setting}
Clothing: ${clothingStyle}
Mood: ${mood}

Technical requirements:
- Clear mouth visibility at all times
- Lips precisely match the words
- Minimal head turns, minimal face occlusion
- No text on screen
- Professional quality, high fidelity
- Professional lighting
  `.trim();
}

/**
 * Alternative: Singing Performance Prompt
 * For more melodic content
 */
export function buildSingingPerformancePrompt(context: PerformanceSceneContext): string {
  const { characterName, lyrics, mood, cameraAngle = "medium-close-up" } = context;

  return `
Close shot of ${characterName} singing these exact lyrics:
"${lyrics}"

Camera angle: ${cameraAngle}
Expression: ${mood}
Mouth: Always clearly visible, lips match the melody
Head movement: Minimal, no face turns
Lighting: Professional, cinematic
Quality: Broadcast-ready HD video`.trim();
}

/**
 * Rap/Hip-hop Performance Prompt
 * For rhythmic, faster content
 */
export function buildRapPerformancePrompt(context: PerformanceSceneContext): string {
  const { characterName, lyrics, mood, cameraAngle = "medium-close-up" } = context;

  return `
Professional music video shot of ${characterName} rapping:
"${lyrics}"

Camera: ${cameraAngle}, locked on face
Style: ${mood} hip-hop aesthetic
Mouth: Sharp, clear lip movements matching each word precisely
Head: Slight style movement only, mouth always visible
Background: Professional studio or street setting
Quality: High-fidelity, cinematic lighting`.trim();
}

/**
 * B-roll/Cinematic Scene Prompt
 * Used for atmospheric, non-performance scenes
 * 
 * Key principles:
 * - No characters required (mouth visibility not needed)
 * - Focus on mood and visual style
 * - Can be faster/more dynamic since no lip-sync constraint
 */
export function buildBrollPrompt(context: BrollSceneContext): string {
  const {
    lyrics,
    mood,
    setting = "cinematic urban",
    theme = "narrative",
    aesthetic = "professional",
  } = context;

  return `
Cinematic B-roll video matching the mood and lyrics: "${lyrics}"

Setting: ${setting}
Theme: ${theme}
Mood: ${mood}
Aesthetic: ${aesthetic} music video

Requirements:
- No characters or visible faces required
- No text on screen
- Atmospheric, cinematic cinematography
- High production value
- Color grading and lighting match the mood
- Smooth camera movements
- Perfect for music video montage`.trim();
}

/**
 * Landscape/Nature B-roll
 * For outdoor, scenic B-roll
 */
export function buildNatureB rollPrompt(context: BrollSceneContext): string {
  const { lyrics, mood, aesthetic = "cinematic" } = context;

  return `
Scenic cinematic B-roll for lyrics: "${lyrics}"

Mood: ${mood}
Aesthetic: ${aesthetic} nature cinematography
Style: Slow, contemplative shots with smooth transitions

Include:
- Natural landscapes and scenery
- Atmospheric lighting
- Smooth, professional camera movement
- High-quality 4K cinematography
- Color grade matching the mood`.trim();
}

/**
 * Urban/Street B-roll
 * For city, street, and industrial scenes
 */
export function buildUrbanBrollPrompt(context: BrollSceneContext): string {
  const { lyrics, mood, aesthetic = "gritty" } = context;

  return `
Urban cinematic B-roll for: "${lyrics}"

Mood: ${mood}
Aesthetic: ${aesthetic} street cinematography
Style: Dynamic but smooth, professional music video pacing

Include:
- City streets, buildings, crowds
- Street culture elements
- Professional lighting and color grading
- Smooth gimbal/steadicam movements
- High production value HD/4K quality`.trim();
}

/**
 * Abstract/Experimental B-roll
 * For artistic or abstract visual content
 */
export function buildAbstractBrollPrompt(context: BrollSceneContext): string {
  const { lyrics, mood, aesthetic = "experimental" } = context;

  return `
Abstract cinematic B-roll for: "${lyrics}"

Mood: ${mood}
Aesthetic: ${aesthetic} art direction
Style: Creative, artistic visual expression

Include:
- Abstract patterns, light, color, texture
- Artistic visual metaphors
- Smooth transitions and morphing
- Professional color grading
- High-quality cinematography
- Artistic but professional music video aesthetic`.trim();
}

/**
 * Prompt picker - automatically selects appropriate template
 */
export function generatePrompt(
  sceneType: "performance" | "broll",
  lyrics: string,
  mood: string,
  additionalContext?: Record<string, unknown>
): string {
  if (sceneType === "performance") {
    return buildPerformancePrompt({
      characterName: (additionalContext?.characterName as string) || "vocalist",
      lyrics,
      mood: mood as PerformanceSceneContext["mood"],
      cameraAngle: (additionalContext?.cameraAngle as any) || "medium-close-up",
      setting: (additionalContext?.setting as string) || "studio",
    });
  } else {
    const setting = (additionalContext?.setting as string) || "cinematic urban";
    const theme = (additionalContext?.theme as string) || "narrative";

    if (setting.toLowerCase().includes("nature") || setting.toLowerCase().includes("landscape")) {
      return buildNatureBrollPrompt({
        lyrics,
        mood: mood as BrollSceneContext["mood"],
      });
    } else if (setting.toLowerCase().includes("urban") || setting.toLowerCase().includes("street")) {
      return buildUrbanBrollPrompt({
        lyrics,
        mood: mood as BrollSceneContext["mood"],
      });
    } else if (setting.toLowerCase().includes("abstract")) {
      return buildAbstractBrollPrompt({
        lyrics,
        mood: mood as BrollSceneContext["mood"],
      });
    } else {
      return buildBrollPrompt({
        lyrics,
        mood: mood as BrollSceneContext["mood"],
        setting,
        theme,
      });
    }
  }
}

/**
 * Mood mappings for different music genres
 */
export const MOOD_MAPPINGS: Record<string, PerformanceSceneContext["mood"]> = {
  "hip-hop": "aggressive",
  "rap": "aggressive",
  "trap": "aggressive",
  "pop": "energetic",
  "dance": "energetic",
  "edm": "energetic",
  "rock": "aggressive",
  "indie-rock": "energetic",
  "ballad": "melancholic",
  "acoustic": "intimate",
  "soul": "intimate",
  "r&b": "groovy",
  "funk": "groovy",
  "reggae": "groovy",
  "ambient": "melancholic",
  "classical": "melancholic",
};

/**
 * Scene type distribution helper
 * Based on total scenes and performance density
 */
export function distributeSceneTypes(
  totalScenes: number,
  performanceDensity: number
): Array<"performance" | "broll"> {
  const performanceCount = Math.ceil(totalScenes * performanceDensity);
  const brollCount = totalScenes - performanceCount;

  const types: Array<"performance" | "broll"> = [
    ...Array(performanceCount).fill("performance"),
    ...Array(brollCount).fill("broll"),
  ];

  // Shuffle to distribute evenly across timeline
  return types.sort(() => Math.random() - 0.5);
}

/**
 * Example usage in scene generation
 */
export function exampleSceneGeneration() {
  // Performance scene
  const performanceContext: PerformanceSceneContext = {
    characterName: "DJ Alex",
    lyrics: "Yeah, we keep it real all night",
    mood: "aggressive",
    cameraAngle: "medium-close-up",
    setting: "futuristic club",
    clothingStyle: "tech streetwear",
  };

  const perfPrompt = buildPerformancePrompt(performanceContext);
  console.log("Performance Prompt:\n", perfPrompt);

  // B-roll scene
  const brollContext: BrollSceneContext = {
    lyrics: "City lights and endless night",
    mood: "groovy",
    setting: "urban downtown",
    theme: "nightlife",
    aesthetic: "neon",
  };

  const brollPrompt = buildUrbanBrollPrompt(brollContext);
  console.log("\nB-roll Prompt:\n", brollPrompt);
}
