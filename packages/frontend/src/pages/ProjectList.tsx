import { useState, useEffect } from "react";
import { useStore } from "../store";
import { Play, Clock, Film, Trash2, AlertCircle } from "lucide-react";
import { ListLoadingState } from "../components/LoadingStates";
import { useToast } from "../lib/useToast";

interface ProjectListProps {
  onSelectProject: (projectId: string) => void;
}

export function ProjectList({ onSelectProject }: ProjectListProps) {
  const { projects, loadProjects, deleteProject, isLoading, error } = useStore();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadProjects().catch((err) => {
      console.error("Failed to load projects:", err);
    });
  }, [loadProjects]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this project? This cannot be undone.")) {
      setIsDeleting(id);
      try {
        await deleteProject(id);
        toast.success("Project deleted successfully");
      } catch (err) {
        toast.error("Failed to delete project");
      } finally {
        setIsDeleting(null);
      }
    }
  };

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

  const getStatusBg = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-900 bg-opacity-30";
      case "processing":
        return "bg-yellow-900 bg-opacity-30";
      case "failed":
        return "bg-red-900 bg-opacity-30";
      default:
        return "bg-gray-900 bg-opacity-30";
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">Projects</h2>
        <p className="text-gray-300 text-lg">
          Create and manage your AI-generated music videos
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 glass rounded-xl border-red-500/50 text-red-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && projects.length === 0 ? (
        <ListLoadingState count={3} />
      ) : projects.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl border-dashed border-slate-600 glow">
          <Film className="w-16 h-16 text-purple-400 mx-auto mb-6 drop-shadow-lg" />
          <p className="text-gray-300 mb-2 text-xl font-semibold">No projects yet</p>
          <p className="text-gray-400">Create your first music video project</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`glass rounded-2xl p-6 hover:border-purple-400/50 transition-all cursor-pointer group glow-on-hover ${
                isDeleting === project.id ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  onClick={() => onSelectProject(project.id)}
                  className="flex-1"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition">
                      {project.title}
                    </h3>
                    <span
                      className={`text-xs font-semibold uppercase px-3 py-1 rounded-full ${getStatusBg(
                        project.status
                      )} ${getStatusColor(project.status)}`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {project.progress > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                            style={{ width: `${project.progress * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">
                          {Math.round(project.progress * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(project.id);
                    }}
                    className="p-2.5 hover:bg-purple-600/80 rounded-lg text-gray-400 hover:text-white transition-all hover:scale-110"
                    title="Edit project"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                    disabled={isDeleting === project.id}
                    className="p-2.5 hover:bg-red-600/80 rounded-lg text-gray-400 hover:text-red-300 transition-all hover:scale-110 disabled:opacity-50"
                    title="Delete project"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
