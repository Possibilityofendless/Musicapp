import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

interface VideoSegment {
  url: string;
  duration: number;
  sceneId: string;
}

/**
 * Download a video from URL and return local file path
 * Handles both HTTP URLs and local file:// URLs
 */
async function downloadVideo(url: string, destPath: string): Promise<void> {
  // Handle local file:// URLs
  if (url.startsWith("file://")) {
    const sourcePath = url.replace("file://", "");
    console.log(`[VideoStitcher] Copying local file from ${sourcePath} to ${destPath}`);
    await fs.copyFile(sourcePath, destPath);
    return;
  }
  
  // Handle HTTP(S) URLs
  const cmd = `curl -o "${destPath}" "${url}"`;
  console.log(`[VideoStitcher] Downloading video to ${destPath}`);
  
  try {
    await execAsync(cmd);
  } catch (error) {
    console.error(`[VideoStitcher] Download failed:`, error);
    throw error;
  }
}

/**
 * Create a concat demuxer file for ffmpeg
 */
async function createConcatFile(
  segments: VideoSegment[],
  localPaths: string[],
  concatFilePath: string
): Promise<void> {
  const content = localPaths
    .map((filePath) => `file '${filePath}'`)
    .join("\n");

  await fs.writeFile(concatFilePath, content);
  console.log(`[VideoStitcher] Created concat file with ${localPaths.length} segments`);
}

/**
 * Stitch multiple video segments into a final video with smooth transitions
 */
export async function stitchVideos(
  segments: VideoSegment[],
  outputPath: string,
  options: {
    audioPath?: string;
    transitionDuration?: number; // in seconds, for crossfade
  } = {}
): Promise<string> {
  if (segments.length === 0) {
    throw new Error("No video segments provided");
  }

  const workDir = path.dirname(outputPath);
  const concatFilePath = path.join(workDir, "concat.txt");
  const tempDir = path.join(workDir, "temp");

  try {
    // Create temp directory
    await fs.mkdir(tempDir, { recursive: true });

    // Download all videos locally
    const localPaths: string[] = [];
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const localPath = path.join(tempDir, `scene_${i}.mp4`);
      await downloadVideo(segment.url, localPath);
      localPaths.push(localPath);
    }

    // Create concat demuxer file
    await createConcatFile(segments, localPaths, concatFilePath);

    // Build ffmpeg command for concatenation
    let ffmpegCmd: string;
    
    if (options.audioPath) {
      // Concatenate videos and add audio
      ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${concatFilePath}" -i "${options.audioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 "${outputPath}"`;
    } else {
      // Just concatenate videos
      ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${concatFilePath}" -c copy "${outputPath}"`;
    }

    console.log(`[VideoStitcher] Running ffmpeg: ${ffmpegCmd}`);
    await execAsync(ffmpegCmd);

    console.log(`[VideoStitcher] Successfully stitched video to ${outputPath}`);

    // Cleanup temp files
    await fs.rm(tempDir, { recursive: true, force: true });
    await fs.rm(concatFilePath, { force: true });

    return outputPath;
  } catch (error) {
    console.error(`[VideoStitcher] Stitching failed:`, error);
    // Cleanup on error
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    await fs.rm(concatFilePath, { force: true }).catch(() => {});
    throw error;
  }
}

/**
 * Add audio to a video file
 */
export async function addAudioToVideo(
  videoPath: string,
  audioPath: string,
  outputPath: string
): Promise<string> {
  const cmd = `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 "${outputPath}"`;

  console.log(`[VideoStitcher] Adding audio to video`);

  try {
    await execAsync(cmd);
    console.log(`[VideoStitcher] Successfully added audio`);
    return outputPath;
  } catch (error) {
    console.error(`[VideoStitcher] Audio addition failed:`, error);
    throw error;
  }
}

/**
 * Get video duration in seconds
 */
export async function getVideoDuration(videoPath: string): Promise<number> {
  try {
    const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1:noprint_filename=1 "${videoPath}"`;
    const { stdout } = await execAsync(cmd);
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error(`[VideoStitcher] Failed to get video duration:`, error);
    throw error;
  }
}
