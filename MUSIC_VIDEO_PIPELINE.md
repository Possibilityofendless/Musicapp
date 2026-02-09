# MusicApp Full Pipeline Documentation

## Overview

This document describes the complete music video generation pipeline, combining:
- **Audio Analysis**: beat detection, tempo, sections, energy curve
- **Scene Generation**: Sora API integration with character persistence
- **Lip-Sync**: post-process mouth-syncing for "performance" scenes
- **A/B Testing**: multi-take version management for each scene
- **Cost Control**: per-scene & project budget caps

---

## Architecture

### Services

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React/Vite)                 │
└────────────────────────┬────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼────────────────┐        ┌──────▼──────────────────┐
│   Backend (Node)       │        │   Workers (Python)      │
│                        │        │                         │
│  Routes:              │        │  Jobs:                  │
│  - /projects          │◄──────┼─- analyze_audio        │
│  - /characters        │        │  - lip_sync_processor  │
│  - /scenes            │        │  - vocal_extraction    │
│  - /storyboard        │        │  - forced_alignment    │
│                        │        │                         │
│  Services:            │        │  Libraries:             │
│  - soraService        │        │  - librosa              │
│  - promptBuilder      │        │  - opencv              │
│                        │        │  - scipy               │
└───────┬────────────────┘        └──────┬──────────────────┘
        │                                 │
        └────────┬──────────────┬─────────┘
                 │              │
        ┌────────▼──┐    ┌──────▼────┐
        │ PostgreSQL │    │   Redis   │
        │  (Prisma)  │    │  (Queue)  │
        └────────────┘    └───────────┘
```

---

## Data Models

### Project
```prisma
model Project {
  id                  String
  title               String
  audioUrl            String
  duration            Float     // seconds
  format              String    // "landscape" | "portrait"
  clipSeconds         Int       // 4, 8, or 12
  soraModel           String    // "sora-2" | "sora-2-pro"
  performanceDensity  Float     // 0-1
  budgetCapUsd        Float
  actualCostUsd       Float
  
  // Relations
  storyboard          Storyboard?
  scenes              Scene[]
  characters          Character[]
  jobs                ProcessingJob[]
}
```

### Character
```prisma
model Character {
  id                  String
  projectId           String
  name                String
  bible               Json?     // { face, signature, wardrobe_lock, dos, donts }
  referenceImageUrl   String?   // keyframe for Sora consistency
  isPrimary           Boolean
  
  // Metrics
  appearanceCount     Int
}
```

### Scene
```prisma
model Scene {
  id                  String
  projectId           String
  order               Int
  startTime, endTime  Float
  sceneType           String    // "performance" | "broll"
  section             String?   // "verse", "chorus", etc.
  
  // Prompt & generation
  prompt              String    // built from builder
  soraSize            String    // "1280x720", etc.
  characterIds        String[]
  
  // Generation state
  status              String    // "pending" → "generating" → "completed" | "failed"
  selectedVersionId   String?   // which version is final
  
  // Audio for performance scenes
  vocalSegmentAssetId String?
  lipSyncEnabled      Boolean
  lipSyncMethod       String?   // "sora_native" | "post_process"
  
  // Metrics
  estimatedCostUsd    Float
  actualCostUsd       Float
  mouthVisibilityScore Float?
  
  // Relations
  versions            SceneVersion[]
}
```

### SceneVersion (A/B testing)
```prisma
model SceneVersion {
  id                          String
  sceneId                     String
  take                        Int       // 1, 2, 3...
  prompt                      String    // prompt used for this take
  
  // Results
  soraClipId                  String?
  soraClipUrl                 String?
  finalVideoUrl               String?   // after lip-sync
  thumbnailUrl                String?
  
  // QC Scores
  characterConsistencyScore   Float?    // 0-1
  mouthVisibilityScore        Float?    // 0-1
  qualityScore                Float?    // 0-1
  userScore                   Float?    // user rating
  
  // Selection
  isSelected                  Boolean
  selectedAt                  DateTime?
}
```

### Storyboard
```prisma
model Storyboard {
  id                String
  projectId         String
  
  // Audio analysis results
  beatGrid          Json?  // { bpm, beats: [{time, strength}] }
  sections          Json?  // [{name, startTime, endTime, type}]
  energyCurve       Json?  // [{time, energy}] for visualization
  
  // Lyrics
  lyricsData        Json?  // [{text, startTime, endTime}]
}
```

---

## REST API

### Projects

#### `POST /api/projects`
Create a new project.
```json
{
  "title": "Eternal Flame",
  "audioUrl": "s3://bucket/song.mp3",
  "duration": 172.4,
  "format": "landscape",
  "clipSeconds": 8,
  "soraModel": "sora-2",
  "performanceDensity": 0.4,
  "budgetCapUsd": 25.0,
  "lyrics": "Best believe me..."
}
```

#### `GET /api/projects/:id`
Fetch project details with progress.

---

### Characters

#### `POST /api/projects/:id/characters`
Create a persistent character.
```json
{
  "name": "TZELEM",
  "description": "Main protagonist",
  "bible": {
    "face": "tan skin, sharp jawline",
    "signature": "diamond grill, layered chains",
    "wardrobe_lock": "black hoodie + silver jewelry",
    "dos": ["same face structure", "same hair"],
    "donts": ["no hat change", "no beard"]
  },
  "referenceImageUrl": "s3://bucket/tzelem.png",
  "isPrimary": true
}
```

#### `GET /api/projects/:id/characters`
List all characters.

#### `PUT /api/projects/:id/characters/:characterId`
Update character.

#### `DELETE /api/projects/:id/characters/:characterId`
Delete character.

---

### Storyboard

#### `POST /api/projects/:id/storyboard/generate`
Trigger audio analysis & auto-storyboard generation.
- Queues `analyze_audio` job
- Worker detects: tempo, beats, sections, energy curve
- Auto-generates Scene records snapped to beat grid

#### `GET /api/projects/:id/storyboard`
Fetch storyboard metadata (beat grid, sections, energy).

#### `PUT /api/projects/:id/storyboard`
Update storyboard (manual adjustments).

#### `GET /api/projects/:id/storyboard/timeline`
Full timeline view with scenes, beats, and selected versions.
```json
{
  "projectId": "...",
  "duration": 172.4,
  "bpm": 95,
  "sections": [
    { "name": "intro", "start_time": 0, "end_time": 10 },
    { "name": "verse", "start_time": 10, "end_time": 40 }
  ],
  "energyCurve": [
    { "time": 0, "energy": 0.3 },
    { "time": 10, "energy": 0.7 }
  ],
  "scenes": [
    {
      "id": "scene_001",
      "order": 1,
      "startTime": 0,
      "endTime": 8,
      "sceneType": "broll",
      "section": "intro",
      "status": "completed",
      "selectedVersion": { "id": "...", "url": "..." }
    }
  ]
}
```

---

### Scenes

#### `GET /api/projects/:id/scenes`
List all scenes with versions (ordered by take).

#### `GET /api/projects/:id/scenes/:sceneId`
Fetch single scene with all versions.

#### `POST /api/projects/:id/scenes/:sceneId/generate`
Queue scene generation (Sora).
```json
{
  "numTakes": 2
}
```
- Creates `SceneVersion` records with take=1,2,...
- Queues `generate_scene` jobs
- Returns jobIds for polling

#### `POST /api/projects/:id/scenes/:sceneId/remix`
Remix a version (fast re-render with revised prompt).
```json
{
  "versionId": "...",
  "revisedPrompt": "Tighter framing, more dynamic camera"
}
```
- Queues `remix_scene` job via Sora remix endpoint
- Creates new SceneVersion with next take

#### `POST /api/projects/:id/scenes/:sceneId/versions/:versionId/select`
Mark version as final.
- Sets `SceneVersion.isSelected = true`
- Updates `Scene.selectedVersionId`
- Clears other versions' `isSelected`

#### `POST /api/projects/:id/scenes/:sceneId/versions/:versionId/score`
User QC: rate a version.
```json
{
  "qualityScore": 0.85,
  "userScore": 4.5,
  "characterConsistency": 0.9,
  "mouthVisibility": 0.8
}
```

---

## Prompt Builder

### Usage

```typescript
import { buildScenePrompt } from "./lib/promptBuilder";

const prompt = buildScenePrompt(
  project,
  scene,
  character,
  stylePresetOverride // optional
);
// Returns deterministic, reproducible prompt string
```

### Composition

Each prompt is built from:

1. **Global Style Prefix** (project-wide)
   ```
   Cinematic music video, shallow DOF, natural skin...
   ```

2. **Character Prefix** (character-wide)
   ```
   Persistent main character: TZELEM — tan skin, diamond grill...
   Keep the same face, hair, tattoos, outfit...
   ```

3. **Scene Directive** (scene-specific)
   - **Performance**: "Medium close-up, expressively raps the lyrics..."
   - **B-roll**: "Visual metaphor for the lyric, dynamic cinematography..."

4. **Continuity Rules**
   ```
   CRITICAL: If character appears, maintain exact continuity:
   - Same face structure
   - Same hair color, length, style
   - Same clothing, colors, accessories
   ```

5. **Style Preset** (optional)
   - `cinematic_noir`
   - `anime`
   - `gritty_documentary`
   - `dreamy`
   - `dark_gothic`

### Style Presets

```typescript
presetDirectives = {
  cinematic_noir: "Film noir: high contrast, monochrome, shadow play",
  anime: "Anime-inspired: vibrant colors, stylized, dynamic",
  gritty_documentary: "Naturalistic handheld feel, authentic lighting",
  dreamy: "Surreal: soft focus, ethereal, pastel, floating",
  dark_gothic: "Moody: architectural, mysterious, gothic aesthetic",
}
```

---

## Job Queue

### Job Types

| Type | Worker | Input | Output |
|------|--------|-------|--------|
| `analyze_audio` | Python | audio path | beatGrid, sections, energyCurve |
| `generate_scene` | Sora API | prompt, size, seconds | soraClipId, videoUrl |
| `remix_scene` | Sora API | soraClipId, revisedPrompt | new soraClipId |
| `vocal_extraction` | Python | scene startTime, endTime | audio segment file |
| `forced_alignment` | Python | vocal audio, transcript | phoneme/word timings |
| `lip_sync_post_process` | Python | video, audio, phonemes | mouth-synced video |
| `stitch_final` | Python | video list, audio | final MP4 + optional formats |

### Job Flow (Example)

```
1. User creates project + uploads MP3
   → Job: analyze_audio

2. Audio analysis completes; scenes auto-created
   → User clicks "Generate All Scenes"

3. For each scene:
   → Job: generate_scene (Sora) → SceneVersion created

4. User selects versions, marks for lip-sync
   → For performance scenes:
      → Job: vocal_extraction
      → Job: forced_alignment
      → Job: lip_sync_post_process

5. User clicks "Export"
   → Job: stitch_final (all selected versions + audio overlay)
   → Returns final MP4 URL
```

---

## Python Workers

### Audio Analysis (`packages/workers/src/audio_analysis.py`)

```python
def analyze_audio(audio_path: str) -> dict:
    """
    Returns:
    {
      'bpm': float,
      'duration': float,
      'beats': [{'time': float, 'strength': float}, ...],
      'onsets': [float, ...],
      'energy_curve': [{'time': float, 'energy': float}, ...],
      'sections': [{'name': str, 'start_time': float, 'end_time': float}, ...],
      'spectral_features': {...}
    }
    """
```

Uses **Librosa** for:
- Tempo extraction & beat tracking
- Onset detection (transients)
- Spectral centroid (brightness/mood proxy)
- RMS energy normalization
- Section detection (simplified with spectral flux peaks)

### Lip-Sync Processor (`packages/workers/src/lipsync_processor.py`)

```python
def postprocess_lipsync(
    video_path: str,
    audio_path: str,
    phonemes: List[Dict],
    output_path: str
) -> bool:
    """
    Takes Sora-generated video and morphs mouth region frame-by-frame
    to match phoneme timings from forced alignment.
    
    Returns: True if successful
    """
```

**Simplified Implementation**:
- Detects mouth region (placeholder: center-bottom of face)
- Expands mouth for vowels (~30% stretch)
- Feathers blends to avoid hard edges

**Production Ready**: Replace with:
- **wav2lip** (https://github.com/Rudrabha/Wav2Lip)
- **SadTalker** (https://github.com/OpenTalker/SadTalker)
- **Sync-aware neural rendering** (research)

---

## Cost Estimation

### Pricing Model

Based on Sora 2 API:
- **sora-2**: ~$0.06 / second
- **sora-2-pro**: ~$0.12 / second

### Per-Scene Estimate

```typescript
estimateSceneCost(project):
  pricePerSecond = project.soraModel === "sora-2-pro" ? 0.12 : 0.06
  return pricePerSecond * project.clipSeconds
```

### Per-Project Estimate

```typescript
estimateProjectCost(project, sceneCount):
  perSceneCost = estimateSceneCost(project)
  baseEstimate = perSceneCost * sceneCount
  return baseEstimate * 1.2  // 20% retry buffer
```

### Budget Control

- `project.budgetCapUsd`: max spend allowed
- `project.actualCostUsd`: running total
- `scene.estimatedCostUsd` and `scene.actualCostUsd` per scene
- UI warns if estimated > budget (prevent queue job)
- Workers check during generation; cancel if exceeds cap

---

## Workflow: User Perspective

### 1. Create Project

```javascript
// Frontend
const project = await api.post('/api/projects', {
  title: 'My Music Video',
  audioUrl: 's3://bucket/song.mp3',
  duration: 172.4,
  format: 'landscape',
  clipSeconds: 8,
  soraModel: 'sora-2',
  performanceDensity: 0.4,
  budgetCapUsd: 25.0,
  lyrics: 'Best believe me...'
});
```

### 2. Create Characters

```javascript
const char = await api.post(`/api/projects/${project.id}/characters`, {
  name: 'TZELEM',
  bible: { face: '...', signature: '...', ... },
  referenceImageUrl: 's3://bucket/tzelem.png',
  isPrimary: true
});
```

### 3. Generate Storyboard

```javascript
const storyJob = await api.post(`/api/projects/${project.id}/storyboard/generate`);
// Wait for job to complete...
// → Audio analyzed
// → Scenarios auto-created (snapped to beats)
```

### 4. View & Customize Timeline

```javascript
const timeline = await api.get(`/api/projects/${project.id}/storyboard/timeline`);
// Shows beats, sections, auto-generated scenes
// User can edit scene types, lyrics, mood, character assignments
```

### 5. Generate Scene Versions

```javascript
// User selects 3 scenes for generation
await api.post(`/api/projects/${project.id}/scenes/${scene1.id}/generate`, {
  numTakes: 2  // Generate 2 takes per scene
});

await api.post(`/api/projects/${project.id}/scenes/${scene2.id}/generate`, {
  numTakes: 2
});

// Takes ~5-10 min (depends on takes + queue depth)
```

### 6. Review & Update

```javascript
// Fetch all scenes with versions
const scenes = await api.get(`/api/projects/${project.id}/scenes`);

// scenes[0].versions = [{take:1, url:"...", qualityScore: 0.75}, ...]
// User watches takes, picks best take

// Mark take as final
await api.post(
  `/api/projects/${project.id}/scenes/${scene.id}/versions/${versionId}/select`
);

// Rate take
await api.post(
  `/api/projects/${project.id}/scenes/${scene.id}/versions/${versionId}/score`,
  { userScore: 4.2, qualityScore: 0.88 }
);
```

### 7. Apply Lip-Sync (if performance scene)

Backend auto-applies lip-sync to "performance" scenes with `lipSyncEnabled=true`:
1. Extract vocal segment
2. Run forced alignment → phoneme timings
3. Run lip-sync processor
4. Replace video URL with synced version

### 8. Export

```javascript
// Build full video:
// - Stitch selected versions in order
// - Overlay original MP3 audio
// - Add optional: captions, kinetic text, color grading
// - Output: MP4, WebM, vertical (9:16), landscape (16:9)

const exportJob = await api.post(
  `/api/projects/${project.id}/export`,
  {
    formats: ['mp4', 'webm'],
    aspectRatios: ['landscape', 'vertical'],
    includeSubtitles: true
  }
);
```

---

## Configuration & Deployment

### Environment Variables

```bash
# Sora API
SORA_API_KEY="sk-..."
SORA_API_BASE_URL="https://api.openai.com/v1"
USE_SORA_MOCK=false

# Database
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."

# Storage (optional)
AWS_S3_BUCKET="musicapp-videos"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."

# Job queue
REDIS_QUEUE_NAME="musicapp-jobs"
MAX_JOB_RETRIES=3
JOB_TIMEOUT_MS=900000  # 15 min

# Cost control
SORA_PRICING_PER_SECOND_BASE=0.06
SORA_PRICING_PER_SECOND_PRO=0.12
```

### Docker Compose

```yaml
services:
  backend:
    environment:
      SORA_API_KEY: ${SORA_API_KEY}
      USE_SORA_MOCK: ${USE_SORA_MOCK}
      DATABASE_URL: postgresql://...
      REDIS_URL: redis://redis:6379

  workers:
    environment:
      REDIS_URL: redis://redis:6379
      BACKEND_API_BASE: http://backend:3000/api
```

---

## Testing & Development

### Local Testing (with mock Sora)

```bash
# .env
USE_SORA_MOCK=true
SORA_API_KEY=""

docker-compose up

# Frontend: http://localhost:5173
# API: http://localhost:3000
# API Docs: http://localhost:3000/

# Logs
docker-compose logs -f backend workers
```

### Real Sora Testing

```bash
# .env
USE_SORA_MOCK=false
SORA_API_KEY="sk-proj-..."
SORA_API_BASE_URL="https://api.openai.com/v1"

docker-compose up --build
```

---

## Next Steps

1. **Job Processor Integration**
   - Implement handlers for each job type in `packages/backend/src/workers/jobProcessor.ts`
   - Add error handling, retry logic, webhook callbacks

2. **Frontend Timeline Editor**
   - React component: timeline scrubber, scene cards, drag-to-reorder
   - Preview selected versions side-by-side
   - Prompt editor (advanced mode)

3. **Lip-Sync Real Implementation**
   - Integrate `wav2lip` or `SadTalker` (GPU)
   - Per-frame mouth detection + landmark tracking
   - User-friendliness: auto-detect + option to manually tweak

4. **Assembly & Export**
   - `stitch_final` job: FFMPEG + PIL for transitions, captions, color grade
   - Multi-format output (vertical, landscape, shorts)
   - Poster frame extraction for thumbnails

5. **Storage Backend**
   - S3 integration for audio, videos, reference images
   - Lifecycle policies (delete old takes after 30 days, keep finals forever)
   - CDN for playback (CloudFront, BunnyCDN, Fastly)

6. **Analytics & Monitoring**
   - Track cost per project
   - Median generation time per scene
   - User satisfaction (average score)
   - Sora API reliability & uptime

---

## FAQ

**Q: How long does the full pipeline take?**
A: 1-3 min per scene (Sora generation varies), plus ~30s per scene for lip-sync. A 3-minute song (~20 scenes) ≈ 1-2 hours start-to-finish.

**Q: Can I remix a single scene without regenerating the whole project?**
A: Yes. Use `POST /api/projects/:id/scenes/:sceneId/remix` with a revised prompt. The Sora remix endpoint re-renders that clip only (~10-30s).

**Q: Do I need a real Sora API key?**
A: For production, yes. For dev/testing, set `USE_SORA_MOCK=true` to use mock responses.

**Q: How does character persistence actually work?**
A: The prompt builder includes a "Character Prefix" from the `Character.bible` (face, wardrobe, etc.) and an optional `input_reference` image. Sora uses both to keep the character consistent. For drift correction, use remix with a tighter prompt.

**Q: Can I use existing video clips instead of Sora?**
A: Not yet. Future: `SceneVersion` can reference external URLs; assembly pipeline would stitch those instead.

**Q: What about music extraction / stem separation?**
A: Beyond scope for v1. Future: use `spleeter` or `ISSE` to isolate vocals → generate B-roll without vocal overlay.

---

## Architecture Decisions

1. **Why Prisma?** - Type safety, migrations, excellent Postgres support
2. **Why Redis queue?** - Fast, reliable, good Bull.js integration
3. **Why Python workers?** - Librosa, OpenCV, TensorFlow ecosystem
4. **Why SceneVersion?** - Non-destructive A/B testing, rollback capability
5. **Why character "bible"?** - JSON-flexible character continuity rules
6. **Why cost estimation?** - Avoid surprise bills; UX transparency

---

## Support

For issues:
- Check logs: `docker-compose logs backend workers`
- Test audio analysis: `python packages/workers/src/audio_analysis.py <mp3_path>`
- Test lip-sync: `python packages/workers/src/lipsync_processor.py <video> <audio> <phonemes.json> output.mp4`
- Enable debug: `LOG_LEVEL=debug`

