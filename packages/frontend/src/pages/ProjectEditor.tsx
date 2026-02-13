import { useEffect, useState } from "react";
import { useStore } from "../store";
import { useToast } from "../lib/useToast";
import { ArrowLeft, Settings, Zap, Edit3, AlertCircle, Download, Video } from "lucide-react";
import { SceneCard } from "../components/SceneCard";
import { SceneEditorModal } from "../components/SceneEditorModal";
import { LoadingSpinner } from "../components/LoadingStates";

interface ProjectEditorProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectEditor({ projectId, onBack }: ProjectEditorProps) {
  const { currentProject, scenes, loadProject, loadScenes, updateProject, generateVideo, stitchVideo } = useStore();
  const toast = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStitching, setIsStitching] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [isSceneEditorOpen, setIsSceneEditorOpen] = useState(false);

  useEffect(() => {
    loadProject(projectId);
    loadScenes(projectId);
  }, [projectId]);

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      await generateVideo(projectId);
      toast.success("Video generation started! Check the projects list for updates.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start video generation";
      setGenerationError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStitchVideo = async () => {
    setIsStitching(true);
    try {
      await stitchVideo(projectId);
      toast.success("Video stitching started! It will be ready for download soon.");
      // Reload project after a delay to get the final video
      setTimeout(async () => {
        await loadProject(projectId);
      }, 5000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to stitch video";
      toast.error(message);
    } finally {
      setIsStitching(false);
    }
  };

  const handlePerformanceDensityChange = async (value: number) => {
    if (!currentProject) return;
    await updateProject(projectId, { performanceDensity: value });
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 mt-4">Loading project...</p>
        </div>
      </div>
    );
  }

  const performanceSceneCount = scenes.filter((s) => s.sceneType === "performance").length;
  const totalScenes = scenes.length;

  return (
    <div>
      {/* Error Alert */}
      {generationError && (
        <div className="mb-6 bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-300">{generationError}</p>
          </div>
          <button
            onClick={() => setGenerationError(null)}
            className="text-red-400 hover:text-red-300 transition"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">{currentProject.title}</h1>
          <p className="text-gray-400">{currentProject.description}</p>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-400 mb-2">Status</div>
          <div className="text-lg font-bold text-green-400 capitalize mb-4">
            {currentProject.status}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSceneEditorOpen(true)}
              disabled={scenes.length === 0}
              className="px-4 py-3 rounded font-medium bg-slate-700 text-white hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Scenes
            </button>
            <button
              onClick={handleStartGeneration}
              disabled={isGenerating || totalScenes === 0}
              className="px-6 py-3 rounded font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate Video
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Scenes</div>
          <div className="text-2xl font-bold text-white">{totalScenes}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Performance Scenes</div>
          <div className="text-2xl font-bold text-purple-400">{performanceSceneCount}</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Duration</div>
          <div className="text-2xl font-bold text-white">{Math.round(currentProject.duration)}s</div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Progress</div>
          <div className="text-2xl font-bold text-white">
            {Math.round(currentProject.progress * 100)}%
          </div>
        </div>
      </div>

      {/* Final Video Section */}
      {currentProject.videos && currentProject.videos.length > 0 && (
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Final Video</h2>
            </div>
            {currentProject.videos.find((v: any) => v.type === "final") && (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full">
                Ready
              </span>
            )}
          </div>
          
          {currentProject.videos.find((v: any) => v.type === "final") ? (
            <div className="space-y-4">
              {currentProject.videos
                .filter((v: any) => v.type === "final")
                .sort((a: any, b: any) => b.version - a.version)
                .map((video: any) => (
                  <div key={video.id} className="bg-black/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-white font-medium">Version {video.version}</p>
                        <p className="text-sm text-gray-400">
                          {video.duration ? `${Math.round(video.duration)}s` : "Duration unknown"}
                        </p>
                      </div>
                      <a
                        href={video.url}
                        download={`${currentProject.title}-v${video.version}.mp4`}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium flex items-center gap-2 transition"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                    </div>
                    {video.thumbnailUrl && (
                      <img
                        src={video.thumbnailUrl}
                        alt="Video thumbnail"
                        className="w-full h-48 object-cover rounded"
                      />
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400 mb-4">
                No final video yet. Generate scenes first, then stitch them together.
              </p>
              <button
                onClick={handleStitchVideo}
                disabled={isStitching || scenes.length === 0}
                className="px-6 py-3 rounded-lg font-medium bg-purple-600 hover:bg-purple-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {isStitching ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Stitching...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    Stitch Final Video
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settings Panel */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Lip-Sync Settings</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Performance Density
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              value={currentProject.performanceDensity}
              onChange={(e) => handlePerformanceDensityChange(Number(e.target.value))}
              min="0"
              max="1"
              step="0.1"
              className="flex-1"
            />
            <span className="text-2xl font-bold text-white w-16 text-right">
              {Math.round(currentProject.performanceDensity * 100)}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {Math.round(
              totalScenes * currentProject.performanceDensity
            )} performance scenes • {Math.round(totalScenes * (1 - currentProject.performanceDensity))} B-roll scenes
          </p>
        </div>
      </div>

      {/* Scenes */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Scenes</h2>

        {scenes.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 bg-opacity-40 rounded-lg border border-dashed border-slate-600">
            <p className="text-gray-400">No scenes generated yet</p>
            <p className="text-sm text-gray-500 mt-2">Create and configure your project to generate scenes</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {scenes.map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                isSelected={selectedSceneId === scene.id}
                onSelect={setSelectedSceneId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Scene Editor Modal */}
      <SceneEditorModal
        projectId={projectId}
        isOpen={isSceneEditorOpen}
        onClose={() => setIsSceneEditorOpen(false)}
      />
    </div>
  );
}
