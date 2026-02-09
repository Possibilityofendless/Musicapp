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
      ? "bg-purple-900 bg-opacity-50 text-purple-200"
      : "bg-blue-900 bg-opacity-50 text-blue-200";
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
      className={`border rounded-lg p-5 cursor-pointer transition ${
        isSelected
          ? "bg-slate-700 border-purple-500"
          : "bg-slate-800 border-slate-600 hover:border-slate-500"
      }`}
      onClick={() => onSelect(isSelected ? null : scene.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-bold text-gray-400">Scene {scene.order + 1}</span>
            {isEditing ? (
              <select
                value={editedType}
                onChange={(e) => setEditedType(e.target.value as "performance" | "broll")}
                className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(editedType)}`}
              >
                <option value="performance">Performance</option>
                <option value="broll">B-roll</option>
              </select>
            ) : (
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getTypeColor(scene.sceneType)}`}>
                {getTypeIcon(scene.sceneType)}
                <span className="capitalize">{scene.sceneType}</span>
              </div>
            )}
          </div>
          <p className="text-white font-medium line-clamp-2">{scene.lyricExcerpt}</p>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {scene.status === "completed" && (
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          )}
          {scene.status === "processing" && (
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          )}
          {scene.status === "failed" && (
            <div className="w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
      </div>

      {scene.soraClipUrl && (
        <div className="mb-4 bg-slate-700 rounded aspect-video flex items-center justify-center">
          <video
            src={scene.soraClipUrl}
            className="w-full h-full rounded object-cover"
            controls
          />
        </div>
      )}

      {isSelected && (
        <div className="mt-4 pt-4 border-t border-slate-600 space-y-3">
          <div className="text-sm">
            <span className="text-gray-400">Status: </span>
            <span className="text-white capitalize font-medium">{scene.status}</span>
          </div>

          {scene.soraClipUrl && (
            <div className="text-xs">
              <a
                href={scene.soraClipUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300"
              >
                View Generated Video →
              </a>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {!isEditing ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="flex-1 px-4 py-2 rounded text-sm font-medium bg-slate-700 text-gray-300 hover:bg-slate-600 transition flex items-center justify-center gap-2"
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
                  className="flex-1 px-4 py-2 rounded text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition flex items-center justify-center gap-2"
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
                  className="flex-1 px-4 py-2 rounded text-sm font-medium bg-slate-700 text-gray-300 hover:bg-slate-600 transition flex items-center justify-center gap-2"
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
