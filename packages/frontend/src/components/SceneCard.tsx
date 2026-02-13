import { useState } from "react";
import { useStore } from "../store";
import { Edit2, Save, X, Mic, Clapperboard } from "lucide-react";

interface Scene {
  id: string;
  projectId: string;
  order: number;
  sceneType: "performance" | "broll";
  lyricExcerpt: string;
  status: string;
  soraClipUrl?: string;
}

interface SceneCardProps {
  scene: Scene;
  isSelected: boolean;
  onSelect: (sceneId: string | null) => void;
}

export function SceneCard({ scene, isSelected, onSelect }: SceneCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedType, setEditedType] = useState<"performance" | "broll">(scene.sceneType);
  const { updateScene } = useStore();

  const handleSave = async () => {
    if (editedType !== scene.sceneType) {
      await updateScene(scene.id, { sceneType: editedType });
    }
    setIsEditing(false);
  };

  const getTypeColor = (type: string) => {
    return type === "performance"
      ? "bg-purple-600/40 text-purple-200 border border-purple-500/30"
      : "bg-blue-600/40 text-blue-200 border border-blue-500/30";
  };

  const getTypeIcon = (type: string) => {
    return type === "performance" ? (
      <Mic className="w-4 h-4" />
    ) : (
      <Clapperboard className="w-4 h-4" />
    );
  };

  return (
    <div
      className={`border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
        isSelected
          ? "glass border-purple-500/70 shadow-lg glow"
          : "glass border-slate-600/30 hover:border-purple-400/50 hover:shadow-md"
      }`}
      onClick={() => onSelect(isSelected ? null : scene.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-bold text-gray-300 bg-slate-700/50 px-3 py-1 rounded-full">Scene {scene.order + 1}</span>
            {isEditing ? (
              <select
                value={editedType}
                onChange={(e) => setEditedType(e.target.value as "performance" | "broll")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${getTypeColor(editedType)} focus:outline-none focus:ring-2 focus:ring-purple-400/50`}
              >
                <option value="performance">Performance</option>
                <option value="broll">B-roll</option>
              </select>
            ) : (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${getTypeColor(scene.sceneType)}`}>
                {getTypeIcon(scene.sceneType)}
                <span className="capitalize">{scene.sceneType}</span>
              </div>
            )}
          </div>
          <p className="text-white font-medium line-clamp-2 text-base">{scene.lyricExcerpt}</p>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {scene.status === "completed" && (
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-lg shadow-green-400/50" />
          )}
          {scene.status === "processing" && (
            <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50" />
          )}
          {scene.status === "failed" && (
            <div className="w-2.5 h-2.5 bg-red-400 rounded-full shadow-lg shadow-red-400/50" />
          )}
        </div>
      </div>

      {scene.soraClipUrl && (
        <div className="mb-4 bg-slate-700/30 rounded-xl aspect-video flex items-center justify-center overflow-hidden border border-slate-600/30">
          <video
            src={scene.soraClipUrl}
            className="w-full h-full object-cover"
            controls
          />
        </div>
      )}

      {isSelected && (
        <div className="mt-4 pt-4 border-t border-slate-600/50 space-y-3">
          <div className="text-sm">
            <span className="text-gray-400">Status: </span>
            <span className="text-white capitalize font-semibold">{scene.status}</span>
          </div>

          {scene.soraClipUrl && (
            <div className="text-xs">
              <a
                href={scene.soraClipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition"
              >
                View Generated Video →
              </a>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {!isEditing ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-700/50 text-gray-300 hover:bg-slate-600/70 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 border border-slate-600/30"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white btn-gradient hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(false);
                    setEditedType(scene.sceneType);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-700/50 text-gray-300 hover:bg-slate-600/70 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 border border-slate-600/30"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
