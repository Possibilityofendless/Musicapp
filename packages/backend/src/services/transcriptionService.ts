import fs from "fs";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.SORA_API_KEY;
const USE_AUDIO_MOCK = process.env.USE_AUDIO_MOCK === "true";

if (!OPENAI_API_KEY && !USE_AUDIO_MOCK) {
  throw new Error("OPENAI_API_KEY is required when USE_AUDIO_MOCK is false.");
}

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

export async function transcribeAudio(audioPath: string): Promise<string> {
  if (USE_AUDIO_MOCK) {
    return "[mock transcription]";
  }

  if (!openai) {
    throw new Error("OpenAI client not configured.");
  }

  if (!fs.existsSync(audioPath)) {
    throw new Error("Audio file not found for transcription.");
  }

  const response: any = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1",
    response_format: "verbose_json",
  });

  const text = typeof response?.text === "string" ? response.text : "";
  return text.trim();
}

export function formatTranscriptAsLyrics(transcript: string): string {
  const cleaned = transcript.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return "";
  }

  const words = cleaned.split(" ");
  const lines: string[] = [];
  let current: string[] = [];

  for (const word of words) {
    current.push(word);
    const joined = current.join(" ");

    if (joined.length >= 48 || /[.!?]$/.test(word)) {
      lines.push(joined);
      current = [];
    }
  }

  if (current.length > 0) {
    lines.push(current.join(" "));
  }

  return lines.join("\n");
}
