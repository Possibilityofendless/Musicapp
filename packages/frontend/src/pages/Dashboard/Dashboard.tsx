import { Plus, Activity, TrendingUp, DollarSign, AlertCircle, Play, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export function Dashboard() {
  // Mock data - will be replaced with real data
  const activeRuns = [
    {
      id: "1",
      project: "E-commerce Redesign",
      step: "Frontend Implementation",
      progress: 65,
      status: "running",
    },
    {
      id: "2",
      project: "Music Video Generator",
      step: "QA Testing",
      progress: 85,
      status: "running",
    },
  ];

  const recentProjects = [
    {
      id: "1",
      name: "E-commerce Redesign",
      status: "processing",
      updated: "2 hours ago",
    },
    {
      id: "2",
      name: "Music Video Generator",
      status: "completed",
      updated: "1 day ago",
    },
    {
      id: "3",
      name: "Dashboard Analytics",
      status: "failed",
      updated: "3 days ago",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
          Dashboard
        </h1>
        <p className="text-gray-300 text-lg">
          Monitor your projects, runs, and team performance
        </p>
      </div>

      {/* Create New Project CTA */}
      <Link
        to="/projects/new"
        className="block glass rounded-2xl p-8 border-2 border-dashed border-purple-500/30 hover:border-purple-500/60 transition group"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:scale-110 transition">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition">
              Create New Project
            </h3>
            <p className="text-gray-400">
              Start a new app build or music video generation project
            </p>
          </div>
        </div>
      </Link>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-600/20 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-sm text-green-400">+12%</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Pass Rate</p>
          <p className="text-3xl font-bold text-white">94%</p>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-sm text-purple-400">Live</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Active Runs</p>
          <p className="text-3xl font-bold text-white">{activeRuns.length}</p>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-sm text-gray-400">This month</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Est. Cost</p>
          <p className="text-3xl font-bold text-white">$247</p>
        </div>
      </div>

      {/* Active Runs */}
      {activeRuns.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Active Runs</h2>
            <Link
              to="/runs"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {activeRuns.map((run) => (
              <div
                key={run.id}
                className="p-4 bg-slate-800/50 rounded-xl border border-slate-600/30 hover:border-purple-500/30 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      {run.project}
                    </h3>
                    <p className="text-sm text-gray-400">{run.step}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-900/30 text-yellow-400 text-xs font-semibold rounded-full flex items-center gap-2">
                    <Play className="w-3 h-3" />
                    Running
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${run.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-12 text-right">
                    {run.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Projects */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Projects</h2>
          <Link
            to="/projects"
            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {recentProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-600/30 hover:border-purple-500/30 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium group-hover:text-purple-400 transition">
                    {project.name}
                  </h3>
                  <p className="text-xs text-gray-400">{project.updated}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  project.status === "completed"
                    ? "bg-green-900/30 text-green-400"
                    : project.status === "processing"
                    ? "bg-yellow-900/30 text-yellow-400"
                    : "bg-red-900/30 text-red-400"
                }`}
              >
                {project.status}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Action Needed */}
      <div className="glass rounded-xl p-6 border-l-4 border-yellow-500">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-semibold mb-1">Action Needed</h3>
            <p className="text-gray-300 text-sm mb-3">
              3 runs failed schema validation and need attention
            </p>
            <Link
              to="/runs?status=failed"
              className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition"
            >
              Review failed runs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
