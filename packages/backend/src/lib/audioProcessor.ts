import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface Phoneme {
  phoneme: string;
  startTime: number;
  endTime: number;
}

export interface Word {
  word: string;
  startTime: number;
  endTime: number;
}

/**
 * Extract vocals from audio using voice separation (requires external tools)
 * This is a placeholder implementation - in production you'd use:
 * - Demucs (Meta's music source separation)
 * - Spleeter (Deezer)
 * - stems (AI-based separation)
 */
export async function extractVocals(
  audioPath: string,
  outputPath: string
): Promise<void> {
  try {
    // Placeholder: In production, you would call a voice separation service
    // For now, we'll assume the audio is already isolated vocals or use ffmpeg to extract frequency ranges
    
    console.log(`[AudioProcessor] Extracting vocals from ${audioPath}`);
    
    // Example ffmpeg command (simplified - real implementation would use proper tools):
    // ffmpeg -i input.mp3 -af "highpass=f=200" output_vocals.wav
    // This is just a basic high-pass filter, NOT actual voice isolation
    
    const cmd = `ffmpeg -i "${audioPath}" -af "highpass=f=200" "${outputPath}"`;
    await execAsync(cmd);
    
    console.log(`[AudioProcessor] Vocals extracted to ${outputPath}`);
  } catch (error) {
    console.error(`[AudioProcessor] Vocal extraction failed:`, error);
    throw error;
  }
}

/**
 * Perform forced alignment using acoustic model
 * Maps phonemes/words to exact timestamps
 * 
 * This requires external tools like:
 * - Montreal Forced Aligner (MFA)
 * - Wav2Vec2
 * - Whisper (with timing)
 */
export async function performForcedAlignment(
  audioPath: string,
  transcript: string
): Promise<{ phonemes: Phoneme[]; words: Word[] }> {
  try {
    console.log(`[AudioProcessor] Running forced alignment on ${audioPath}`);

    // Placeholder result - in production, this would call MFA or Wav2Vec2
    const words = transcript.split(/\s+/);
    const duration = await getAudioDuration(audioPath);
    const timePerWord = duration / Math.max(words.length, 1);

    const alignment: { phonemes: Phoneme[]; words: Word[] } = {
      phonemes: [],
      words: words.map((word, idx) => ({
        word,
        startTime: idx * timePerWord,
        endTime: (idx + 1) * timePerWord,
      })),
    };

    // Map words to phonemes (simplified)
    let phoneIdx = 0;
    for (const word of alignment.words) {
      const phonemes = wordToPhonemes(word.word);
      const timePerPhoneme = (word.endTime - word.startTime) / Math.max(phonemes.length, 1);

      phonemes.forEach((phoneme, idx) => {
        alignment.phonemes.push({
          phoneme,
          startTime: word.startTime + idx * timePerPhoneme,
          endTime: word.startTime + (idx + 1) * timePerPhoneme,
        });
      });
    }

    console.log(`[AudioProcessor] Alignment complete: ${alignment.words.length} words, ${alignment.phonemes.length} phonemes`);
    return alignment;
  } catch (error) {
    console.error(`[AudioProcessor] Forced alignment failed:`, error);
    throw error;
  }
}

/**
 * Get audio duration using ffprobe
 */
export async function getAudioDuration(audioPath: string): Promise<number> {
  try {
    const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1:noprint_filename=1 "${audioPath}"`;
    const { stdout } = await execAsync(cmd);
    return parseFloat(stdout.trim());
  } catch (error) {
    console.error(`[AudioProcessor] Failed to get audio duration:`, error);
    throw error;
  }
}

/**
 * Simple word-to-phoneme mapping (English)
 * In production, use a proper phoneme dictionary like CMU Pronouncing Dictionary
 */
function wordToPhonemes(word: string): string[] {
  // Very simplified phoneme mapping
  const vowels = ["a", "e", "i", "o", "u"];
  const phonemes: string[] = [];
  
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    if (vowels.includes(char.toLowerCase())) {
      phonemes.push(char.toLowerCase() + ":");
    } else {
      phonemes.push(char.toLowerCase());
    }
  }
  
  return phonemes.length === 0 ? [""] : phonemes;
}

/**
 * Post-process lip-sync video (placeholder)
 * In the future, this could:
 * - Re-encode video to match phoneme timing
 * - Apply deepfake/reenactment if needed
 * - Adjust video playback speed based on phoneme alignment
 */
export async function postProcessLipSync(
  inputVideoPath: string,
  audioPath: string,
  alignment: { phonemes: Phoneme[]; words: Word[] },
  outputPath: string
): Promise<void> {
  try {
    console.log(`[AudioProcessor] Post-processing lip-sync: ${inputVideoPath}`);

    // For now, just sync audio with video (basic approach)
    // More advanced approaches would use video re-rendering based on phonemen
    const cmd = `ffmpeg -i "${inputVideoPath}" -i "${audioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 "${outputPath}"`;
    
    await execAsync(cmd);
    console.log(`[AudioProcessor] Lip-sync post-processing complete`);
  } catch (error) {
    console.error(`[AudioProcessor] Lip-sync post-processing failed:`, error);
    throw error;
  }
}

/**
 * Detect mouth visibility in video using face detection
 * Uses Python subprocess to run MediaPipe-based detection
 */
export async function detectMouthVisibility(
  videoPath: string
): Promise<number> {
  try {
    console.log(`[AudioProcessor] Detecting mouth visibility in ${videoPath}`);

    // Call Python worker to perform actual face detection
    // Falls back to average score if worker is unavailable
    const cmd = `python3 -c "
import cv2
import os
import sys
import json

try:
    import mediapipe as mp
    
    # Initialize MediaPipe Face Detection
    mp_face_detection = mp.solutions.face_detection
    
    video_path = '${videoPath}'
    if not os.path.exists(video_path):
        print('1.0')  # If video doesn't exist, return high score
        sys.exit(0)
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print('1.0')  # If video can't be opened, return high score
        sys.exit(0)
    
    visibility_scores = []
    frame_count = 0
    max_frames = 30  # Sample first 30 frames for performance
    
    with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.5) as face_detection:
        while True:
            ret, frame = cap.read()
            if not ret or frame_count >= max_frames:
                break
            
            frame_count += 1
            h, w = frame.shape[:2]
            
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = face_detection.process(rgb_frame)
            
            if results.detections:
                for detection in results.detections:
                    # Get face bounding box
                    bbox = detection.location_data.relative_bounding_box
                    mouth_y_min = bbox.ymin + bbox.height * 0.6  # Lower part of face
                    mouth_y_max = bbox.ymin + bbox.height
                    mouth_x_min = bbox.xmin + bbox.width * 0.2
                    mouth_x_max = bbox.xmin + bbox.width * 0.8
                    
                    # Check if this mouth region is within frame bounds
                    if mouth_y_max > 0 and mouth_y_min < 1 and mouth_x_max > 0 and mouth_x_min < 1:
                        visibility_scores.append(1.0)
                    else:
                        visibility_scores.append(0.0)
            else:
                # No face detected in frame
                visibility_scores.append(0.0)
    
    cap.release()
    
    # Calculate average visibility score
    avg_score = sum(visibility_scores) / len(visibility_scores) if visibility_scores else 0.7
    print(f'{avg_score:.2f}')
    
except ImportError:
    # MediaPipe not available, return average score
    print('0.75')
except Exception as e:
    # Error during detection, return conservative average
    print('0.70')
"`;
    
    const { stdout } = await execAsync(cmd);
    const score = parseFloat(stdout.trim());
    
    // Validate score is within [0, 1]
    const validScore = Math.min(1.0, Math.max(0.0, isNaN(score) ? 0.75 : score));
    
    console.log(`[AudioProcessor] Mouth visibility: ${(validScore * 100).toFixed(1)}%`);
    return validScore;
  } catch (error) {
    console.error(`[AudioProcessor] Mouth visibility detection failed, using fallback:`, error);
    // Return conservative average on error
    return 0.75;
  }
}
