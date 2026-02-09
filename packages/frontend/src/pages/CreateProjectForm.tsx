import { useState } from "react";
import { useStore } from "../store";
import { FileUp, Music, Plus, AlertCircle } from "lucide-react";
import { useToast } from "../lib/useToast";
import { LoadingSpinner } from "../components/LoadingStates";

interface CreateProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateProjectForm({ onSuccess, onCancel }: CreateProjectFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [duration, setDuration] = useState(180);
  const [performanceDensity, setPerformanceDensity] = useState(0.4);
  const [lyrics, setLyrics] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { createProject } = useStore();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!title.trim()) {
      setValidationError("Project title is required");
      return;
    }
    if (!lyrics.trim()) {
      setValidationError("Lyrics are required");
      return;
    }
    if (!audioUrl.trim()) {
      setValidationError("Audio URL is required");
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
        lyrics: lyrics.trim(),
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
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
        <h2 className="text-3xl font-bold mb-2 text-white">Create New Project</h2>
        <p className="text-gray-400 mb-8">
          Set up a new music video with AI-generated scenes and lip-sync
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation Error */}
          {validationError && (
            <div className="flex items-center gap-3 p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg">
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
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
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
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Audio URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Audio URL *
            </label>
            <input
              type="url"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://example.com/song.mp3"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              MP3, WAV, or other common audio format (must be publicly accessible)
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
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-purple-500"
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
                  className="flex-1"
                />
                <span className="text-white font-medium w-10 text-center">
                  {Math.round(performanceDensity * 100)}%
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Percentage of lip-sync scenes vs cinematic B-roll
              </p>
            </div>
          </div>

          {/* Lyrics */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lyrics *
            </label>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Paste your song lyrics here, one line per scene..."
              rows={8}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Will be split into scenes. Each line becomes one scene.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-6 py-3 rounded font-medium text-gray-300 border border-slate-600 hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !audioUrl.trim() || !lyrics.trim()}
              className="flex-1 px-6 py-3 rounded font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
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
