import { useState } from "react";
import { useStore } from "../store";
import {
  Trash2,
  GripVertical,
  Save,
  X,
  AlertCircle,
  Music,
  Clapperboard,
} from "lucide-react";

interface SceneEditorModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SceneEditorModal({
  projectId,
  isOpen,
  onClose,
}: SceneEditorModalProps) {
  const { scenes, reorderScenes, deleteScene, updateScene, error } = useStore();
  const [draggedScene, setDraggedScene] = useState<string | null>(null);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDragStart = (sceneId: string) => {
    setDraggedScene(sceneId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetSceneId: string) => {
    if (!draggedScene || draggedScene === targetSceneId) {
      setDraggedScene(null);
      return;
    }

    setIsLoading(true);
    try {
      const draggedIdx = scenes.findIndex((s) => s.id === draggedScene);
      const targetIdx = scenes.findIndex((s) => s.id === targetSceneId);

      if (draggedIdx === -1 || targetIdx === -1) return;

      // Create new order
      const newScenes = [...scenes];
      const [movedScene] = newScenes.splice(draggedIdx, 1);
      newScenes.splice(targetIdx, 0, movedScene);

      // Build reorder payload
      const sceneOrder = newScenes.map((s, idx) => ({
        sceneId: s.id,
        newOrder: idx,
      }));

      await reorderScenes(projectId, sceneOrder);
    } finally {
      setDraggedScene(null);
      setIsLoading(false);
    }
  };

  const handleDelete = async (sceneId: string) => {
    if (window.confirm("Delete this scene? This cannot be undone.")) {
      setIsLoading(true);
      try {
        await deleteScene(sceneId);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditStart = (scene: any) => {
    setEditingSceneId(scene.id);
    setEditData({ ...scene });
  };

  const handleEditSave = async () => {
    if (!editingSceneId) return;
    setIsLoading(true);
    try {
      await updateScene(editingSceneId, {
        sceneType: editData.sceneType,
        lipSyncEnabled: editData.lipSyncEnabled,
        referenceImageUrl: editData.referenceImageUrl,
      });
      setEditingSceneId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getSceneIcon = (type: string) =>
    type === "performance" ? (
      <Music className="w-4 h-4" />
    ) : (
      <Clapperboard className="w-4 h-4" />
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "processing":
        return "text-yellow-400";
      case "failed":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-slate-800 rounded-lg border border-slate-700 max-w-4xl w-full mx-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Scene Editor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900 bg-opacity-50 border border-red-700 text-red-100 px-6 py-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Scene List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {scenes.length === 0 ? (
            <p className="text-center text-gray-400">No scenes to edit</p>
          ) : (
            <div className="space-y-3">
              {scenes.map((scene) => (
                <div
                  key={scene.id}
                  draggable={!isLoading}
                  onDragStart={() => handleDragStart(scene.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(scene.id)}
                  className={`bg-slate-700 rounded-lg p-4 cursor-grab active:cursor-grabbing ${
                    draggedScene === scene.id ? "opacity-50" : ""
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {editingSceneId === scene.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-400">
                          Scene {scene.order + 1}
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Scene Type
                        </label>
                        <select
                          value={editData.sceneType}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              sceneType: e.target.value as "performance" | "broll",
                            })
                          }
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm"
                        >
                          <option value="performance">Performance</option>
                          <option value="broll">B-roll</option>
                        </select>
                      </div>

                      {editData.sceneType === "performance" && (
                        <div>
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            <input
                              type="checkbox"
                              checked={editData.lipSyncEnabled || false}
                              onChange={(e) =>
                                setEditData({
                                  ...editData,
                                  lipSyncEnabled: e.target.checked,
                                })
                              }
                              className="w-4 h-4"
                            />
                            Enable Lip-Sync
                          </label>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Reference Image URL (optional)
                        </label>
                        <input
                          type="url"
                          value={editData.referenceImageUrl || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              referenceImageUrl: e.target.value,
                            })
                          }
                          placeholder="https://example.com/reference.jpg"
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white text-sm placeholder-gray-500"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={handleEditSave}
                          disabled={isLoading}
                          className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingSceneId(null)}
                          className="flex items-center gap-1 px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm font-medium"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-400">
                                Scene {scene.order + 1}
                              </span>
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-600 rounded text-xs">
                                {getSceneIcon(scene.sceneType)}
                                <span className="capitalize text-gray-300">
                                  {scene.sceneType}
                                </span>
                              </div>
                              <span
                                className={`text-xs font-medium capitalize ${getStatusColor(
                                  scene.status
                                )}`}
                              >
                                {scene.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 mt-1">
                              {scene.lyricExcerpt}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          <button
                            onClick={() => handleEditStart(scene)}
                            disabled={isLoading}
                            className="p-2 hover:bg-slate-600 rounded text-gray-400 hover:text-white transition disabled:opacity-50"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(scene.id)}
                            disabled={isLoading}
                            className="p-2 hover:bg-red-900 hover:bg-opacity-50 rounded text-gray-400 hover:text-red-400 transition disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-700 bg-opacity-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded font-medium text-gray-300 hover:text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
