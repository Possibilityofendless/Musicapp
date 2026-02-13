import { useState, useRef } from "react";
import { useStore } from "../store";
import { FileUp, Music, Plus, AlertCircle, Upload, X } from "lucide-react";
import { useToast } from "../lib/useToast";
import { LoadingSpinner } from "../components/LoadingStates";
import { api } from "../lib/api";

interface CreateProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateProjectForm({ onSuccess, onCancel }: CreateProjectFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState(180);
  const [performanceDensity, setPerformanceDensity] = useState(0.4);
  const [lyrics, setLyrics] = useState("");
  const [autoLyrics, setAutoLyrics] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createProject } = useStore();
  const toast = useToast();

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/x-m4a", "audio/ogg", "audio/flac"];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg|flac)$/i)) {
      setValidationError("Please upload a valid audio file (mp3, wav, m4a, ogg, flac)");
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setValidationError("File size must be less than 50MB");
      return;
    }

    setAudioFile(file);
    setValidationError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const data = await api.uploadAudio(file);
      setAudioUrl(data.audioUrl);
      setUploadProgress(100);
      toast.success(`Uploaded ${file.name}`);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to upload audio file";
      setValidationError(errorMsg);
      setAudioFile(null);
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setAudioFile(null);
    setAudioUrl("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!title.trim()) {
      setValidationError("Project title is required");
      return;
    }
    if (!autoLyrics && !lyrics.trim()) {
      setValidationError("Lyrics are required unless auto-lyrics is enabled");
      return;
    }
    if (!audioUrl.trim()) {
      setValidationError("Please upload an audio file or provide an audio URL");
      return;
    }
    if (duration <= 0) {
      setValidationError("Duration must be greater than 0");
      return;
    }

    setIsLoading(true);

    try {
      await createProject({
        title: title.trim(),
        description: description.trim(),
        audioUrl,
        duration,
        performanceDensity,
        lyrics: autoLyrics ? "" : lyrics.trim(),
        autoLyrics,
      });
      toast.success("Project created successfully!");
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create project";
      setValidationError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass rounded-2xl p-8 shadow-2xl glow">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Create New Project</h2>
        <p className="text-gray-300 mb-8">
          Set up a new music video with AI-generated scenes and lip-sync
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation Error */}
          {validationError && (
            <div className="flex items-center gap-3 p-4 glass rounded-xl border-red-500/50">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-100">{validationError}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome Music Video"
              className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all hover:border-slate-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the mood and style of your music video..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all hover:border-slate-500"
            />
          </div>

          {/* Audio URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Audio File *
            </label>

            {/* File Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-slate-600 rounded-xl p-8 hover:border-purple-400 hover:bg-slate-700/30 transition-all duration-300"
            >
              {audioFile || audioUrl ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Music className="w-8 h-8 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">
                        {audioFile?.name || "Audio file uploaded"}
                      </p>
                      <p className="text-sm text-gray-400">
                        {audioFile ? `${(audioFile.size / 1024 / 1024).toFixed(2)} MB` : "Ready"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 hover:bg-red-600/80 rounded-lg text-gray-400 hover:text-red-300 transition-all hover:scale-110"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-300 mb-1">
                    Drag and drop your audio file here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse (MP3, WAV, M4A, OGG, FLAC - Max 50MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".mp3,.wav,.m4a,.ogg,.flac,audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white btn-gradient hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <FileUp className="w-5 h-5" />
                    Choose File
                  </label>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* OR divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 border-t border-slate-600" />
              <span className="text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-slate-600" />
            </div>

            {/* URL Input */}
            <input
              type="text"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://example.com/song.mp3"
              disabled={!!audioFile}
              className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-2">
              Provide a direct URL to an audio file (if not uploading)
            </p>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (seconds) *
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="10"
                max="600"
                className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all hover:border-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Performance Density
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  value={performanceDensity}
                  onChange={(e) => setPerformanceDensity(Number(e.target.value))}
                  min="0"
                  max="1"
                  step="0.1"
                  className="flex-1 accent-purple-500"
                />
                <span className="text-white font-semibold w-12 text-center bg-slate-700/50 rounded-lg px-2 py-1">
                  {Math.round(performanceDensity * 100)}%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Percentage of lip-sync scenes vs cinematic B-roll
              </p>
            </div>
          </div>

          {/* Lyrics */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lyrics *
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-3 cursor-pointer hover:text-purple-400 transition">
              <input
                type="checkbox"
                checked={autoLyrics}
                onChange={(e) => setAutoLyrics(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500"
              />
              <span className="font-medium">Auto-generate lyrics from audio (OpenAI Whisper)</span>
            </label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Paste your song lyrics here, one line per scene..."
              rows={8}
              className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all hover:border-slate-500 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={autoLyrics}
              required={!autoLyrics}
            />
            <p className="text-xs text-gray-400 mt-2">
              {autoLyrics
                ? "Transcription can take a minute and is used for scene generation."
                : "Will be split into scenes. Each line becomes one scene."}
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading || isUploading}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-300 bg-slate-700/50 border border-slate-600/30 hover:bg-slate-600/70 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                isUploading ||
                !title.trim() ||
                !audioUrl.trim() ||
                (!autoLyrics && !lyrics.trim())
              }
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-white btn-gradient hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 glow flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating...
                </>
              ) : isUploading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
