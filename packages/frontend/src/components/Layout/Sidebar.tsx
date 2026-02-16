import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Play,
  Workflow,
  Users,
  GitBranch,
  Rocket,
  Database,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/projects", icon: FolderKanban, label: "Projects" },
  { path: "/runs", icon: Play, label: "Runs" },
  { path: "/workflows", icon: Workflow, label: "Workflows" },
  { path: "/agent-studio", icon: Users, label: "Agent Studio" },
  { path: "/repo", icon: GitBranch, label: "Repo & PRs" },
  { path: "/deployments", icon: Rocket, label: "Deployments" },
  { path: "/knowledge", icon: Database, label: "Knowledge" },
  { path: "/billing", icon: CreditCard, label: "Billing & Limits" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [showNewMenu, setShowNewMenu] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-[72px]" : "w-[280px]"
      } h-screen glass border-r border-slate-600/30 flex flex-col transition-all duration-300 fixed left-0 top-0 z-50`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-600/30">
        {!collapsed && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl">🎬</div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                No-i-InTEAM
              </h1>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowNewMenu(!showNewMenu)}
                className="w-full btn-gradient text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
              {showNewMenu && (
                <div className="absolute top-full left-0 right-0 mt-2 glass rounded-lg border border-slate-600/30 overflow-hidden z-50">
                  <Link
                    to="/projects/new"
                    className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white transition"
                    onClick={() => setShowNewMenu(false)}
                  >
                    New Project
                  </Link>
                  <Link
                    to="/workflows/new"
                    className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white transition"
                    onClick={() => setShowNewMenu(false)}
                  >
                    New Workflow
                  </Link>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white transition">
                    Import Repo
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700/50 hover:text-white transition">
                    Create from Spec
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-slate-700/50 rounded-lg text-gray-400 hover:text-white transition ml-auto block"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-slate-700/50"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
