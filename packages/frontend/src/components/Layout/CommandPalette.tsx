import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FolderKanban,
  Play,
  GitBranch,
  Rocket,
  Settings,
  X,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const commands = [
  { id: "new-project", label: "New Project", icon: FolderKanban, action: "/projects/new" },
  { id: "run-workflow", label: "Run Workflow", icon: Play, action: "/runs/new" },
  { id: "open-pr", label: "Open PR", icon: GitBranch, action: "/repo/prs" },
  { id: "deploy", label: "Deploy to Staging", icon: Rocket, action: "/deployments" },
  { id: "settings", label: "Settings", icon: Settings, action: "/settings" },
];

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelected(0);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          onClose(); // This will be handled by parent to open
        }
        return;
      }

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => (s + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => (s - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter" && filteredCommands[selected]) {
        e.preventDefault();
        navigate(filteredCommands[selected].action);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selected, filteredCommands, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]">
      <div className="w-full max-w-2xl glass rounded-xl border border-slate-600/30 overflow-hidden shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-600/30">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, runs, commands..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400">
              No results found
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    navigate(cmd.action);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                    index === selected
                      ? "bg-purple-600/20 text-white"
                      : "text-gray-300 hover:bg-slate-700/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{cmd.label}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
