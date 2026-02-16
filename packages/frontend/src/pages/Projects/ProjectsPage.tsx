import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Plus,
  Filter,
  Search,
  Clock,
  Code,
  Music,
} from "lucide-react";

export function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "archived">("all");
  const [filterStack, setFilterStack] = useState<string>("all");

  // Mock data
  const projects = [
    {
      id: "1",
      name: "E-commerce Redesign",
      description: "Complete UI/UX overhaul with Next.js and Tailwind",
      status: "active",
      stack: "Next.js",
      type: "app",
      updated: "2 hours ago",
      progress: 65,
      tags: ["frontend", "ui/ux"],
    },
    {
      id: "2",
      name: "Music Video Generator",
      description: "AI-powered music video creation with Sora integration",
      status: "active",
      stack: "React + FastAPI",
      type: "music-video",
      updated: "1 day ago",
      progress: 100,
      tags: ["ai", "video"],
    },
    {
      id: "3",
      name: "Dashboard Analytics",
      description: "Real-time analytics dashboard for SaaS product",
      status: "archived",
      stack: "Vue.js",
      type: "app",
      updated: "1 week ago",
      progress: 45,
      tags: ["analytics", "dashboard"],
    },
  ];

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || project.status === filterStatus;
    const matchesStack =
      filterStack === "all" || project.stack.toLowerCase().includes(filterStack.toLowerCase());
    return matchesSearch && matchesStatus && matchesStack;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Projects
          </h1>
          <p className="text-gray-300 text-lg">
            Manage your AI-powered app and media projects
          </p>
        </div>
        <Link
          to="/projects/new"
          className="btn-gradient text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:scale-[1.02] transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          New Project
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="glass rounded-xl p-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg text-gray-300 focus:border-purple-500/50 focus:outline-none transition cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          {/* Stack Filter */}
          <select
            value={filterStack}
            onChange={(e) => setFilterStack(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg text-gray-300 focus:border-purple-500/50 focus:outline-none transition cursor-pointer"
          >
            <option value="all">All Stacks</option>
            <option value="next">Next.js</option>
            <option value="react">React</option>
            <option value="vue">Vue.js</option>
            <option value="fastapi">FastAPI</option>
          </select>

          <button className="px-4 py-2 glass rounded-lg border border-slate-600/30 text-gray-300 hover:text-white hover:border-purple-500/50 transition flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center border-2 border-dashed border-slate-600/50">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Projects Found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Create your first project to get started"}
          </p>
          {!searchQuery && (
            <Link
              to="/projects/new"
              className="inline-flex items-center gap-2 btn-gradient text-white px-6 py-3 rounded-lg font-medium hover:scale-[1.02] transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="glass rounded-2xl p-6 hover:border-purple-400/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition flex-shrink-0">
                  {project.type === "music-video" ? (
                    <Music className="w-7 h-7 text-white" />
                  ) : (
                    <Code className="w-7 h-7 text-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition mb-1">
                        {project.name}
                      </h3>
                      <p className="text-gray-400 text-sm">{project.description}</p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                        project.status === "active"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-gray-800/50 text-gray-400"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-6 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      {project.updated}
                    </div>
                    <span className="px-2 py-1 bg-slate-700/50 text-gray-300 text-xs rounded">
                      {project.stack}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-3">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-purple-900/20 text-purple-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Progress */}
                  {project.progress > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-12 text-right">
                        {project.progress}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <button className="p-3 glass rounded-lg border border-slate-600/30 hover:border-purple-500/50 text-gray-400 hover:text-white transition opacity-0 group-hover:opacity-100">
                  <Play className="w-5 h-5" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      <div className="glass rounded-xl p-6">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-white mb-1">{projects.length}</p>
            <p className="text-gray-400 text-sm">Total Projects</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">
              {projects.filter((p) => p.status === "active").length}
            </p>
            <p className="text-gray-400 text-sm">Active</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white mb-1">
              {projects.filter((p) => p.progress === 100).length}
            </p>
            <p className="text-gray-400 text-sm">Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
