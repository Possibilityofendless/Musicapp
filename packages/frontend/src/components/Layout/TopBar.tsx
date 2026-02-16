import { useState } from "react";
import { Search, Play, Bell, ChevronDown, User, LogOut, Settings as SettingsIcon } from "lucide-react";
import { useStore } from "../../store";
import { CommandPalette } from "./CommandPalette";

export function TopBar() {
  const { user, logout } = useStore();
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRunMenu, setShowRunMenu] = useState(false);
  const [environment, setEnvironment] = useState<"Dev" | "Staging" | "Prod">("Dev");

  return (
    <>
      <header className="h-16 glass border-b border-slate-600/30 flex items-center px-6 gap-6 sticky top-0 z-40">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Projects</span>
          <span>/</span>
          <span className="text-white">Dashboard</span>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setShowCommandPalette(true)}
          className="flex-1 max-w-md flex items-center gap-2 px-4 py-2 glass rounded-lg border border-slate-600/30 text-gray-400 hover:border-purple-500/50 transition group"
        >
          <Search className="w-4 h-4" />
          <span className="flex-1 text-left">Search projects, runs, commands...</span>
          <kbd className="px-2 py-1 text-xs bg-slate-700/50 rounded border border-slate-600/30 group-hover:border-purple-500/30">
            ⌘K
          </kbd>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Run Button */}
          <div className="relative">
            <button
              onClick={() => setShowRunMenu(!showRunMenu)}
              className="btn-gradient text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:scale-[1.02] transition-all"
            >
              <Play className="w-4 h-4" />
              Run
              <ChevronDown className="w-4 h-4" />
            </button>
            {showRunMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 glass rounded-lg border border-slate-600/30 overflow-hidden z-50">
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white transition">
                  Run full pipeline
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white transition">
                  Plan only (Manager+PM+UX+Tech)
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white transition">
                  Implement only (FE+BE)
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white transition">
                  QA gate only
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white transition">
                  Deploy only
                </button>
              </div>
            )}
          </div>

          {/* Environment Selector */}
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as any)}
            className="px-3 py-2 glass rounded-lg border border-slate-600/30 text-sm text-gray-300 hover:border-purple-500/50 transition cursor-pointer"
          >
            <option value="Dev">Dev</option>
            <option value="Staging">Staging</option>
            <option value="Prod">Prod</option>
          </select>

          {/* Notifications */}
          <button className="p-2 glass rounded-lg border border-slate-600/30 text-gray-400 hover:text-white hover:border-purple-500/50 transition relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 glass rounded-lg border border-slate-600/30 hover:border-purple-500/50 transition"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-56 glass rounded-lg border border-slate-600/30 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-600/30">
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white transition flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white transition flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </button>
                <div className="border-t border-slate-600/30">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <CommandPalette
        open={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />
    </>
  );
}
