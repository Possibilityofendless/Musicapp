import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Play,
  MoreVertical,
} from "lucide-react";

export function RunsListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Mock data
  const runs = [
    {
      id: "142",
      project: "E-commerce Redesign",
      workflow: "Full-stack Builder",
      status: "running",
      branch: "feature/checkout-redesign",
      author: "John Doe",
      startedAt: "2 hours ago",
      duration: "2h 15m",
      currentStep: "Frontend Implementation",
      progress: 65,
    },
    {
      id: "141",
      project: "Music Video Generator",
      workflow: "MVP Builder",
      status: "completed",
      branch: "main",
      author: "Jane Smith",
      startedAt: "1 day ago",
      duration: "3h 42m",
      currentStep: "Deploy",
      progress: 100,
    },
    {
      id: "140",
      project: "Dashboard Analytics",
      workflow: "Bug Fix + PR",
      status: "failed",
      branch: "fix/memory-leak",
      author: "Bob Johnson",
      startedAt: "2 days ago",
      duration: "1h 8m",
      currentStep: "QA Testing",
      progress: 75,
    },
    {
      id: "139",
      project: "E-commerce Redesign",
      workflow: "Full-stack Builder",
      status: "completed",
      branch: "feature/product-filters",
      author: "John Doe",
      startedAt: "3 days ago",
      duration: "4h 23m",
      currentStep: "Deploy",
      progress: 100,
    },
  ];

  const filteredRuns = runs.filter((run) => {
    const matchesSearch =
      run.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.workflow.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.branch.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || run.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case "running":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-900/30 text-green-400";
      case "running":
        return "bg-yellow-900/30 text-yellow-400";
      case "failed":
        return "bg-red-900/30 text-red-400";
      default:
        return "bg-slate-800/50 text-gray-400";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Runs
          </h1>
          <p className="text-gray-300 text-lg">
            Monitor and manage your workflow executions
          </p>
        </div>
        <Link
          to="/runs/new"
          className="btn-gradient text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:scale-[1.02] transition-all shadow-lg"
        >
          <Play className="w-5 h-5" />
          New Run
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
              placeholder="Search runs by project, workflow, or branch..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500/50 focus:outline-none transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg text-gray-300 focus:border-purple-500/50 focus:outline-none transition cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <button className="px-4 py-2 glass rounded-lg border border-slate-600/30 text-gray-300 hover:text-white hover:border-purple-500/50 transition flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Total Runs</p>
          <p className="text-3xl font-bold text-white">{runs.length}</p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Running</p>
          <p className="text-3xl font-bold text-yellow-400">
            {runs.filter((r) => r.status === "running").length}
          </p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-400">
            {runs.filter((r) => r.status === "completed").length}
          </p>
        </div>
        <div className="glass rounded-xl p-6">
          <p className="text-gray-400 text-sm mb-1">Failed</p>
          <p className="text-3xl font-bold text-red-400">
            {runs.filter((r) => r.status === "failed").length}
          </p>
        </div>
      </div>

      {/* Runs List */}
      <div className="space-y-4">
        {filteredRuns.map((run) => (
          <Link
            key={run.id}
            to={`/runs/${run.id}`}
            className="block glass rounded-xl p-6 hover:border-purple-400/50 transition-all group"
          >
            <div className="flex items-start gap-4">
              {/* Status Icon */}
              <div className="mt-1">{getStatusIcon(run.status)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition">
                        Run #{run.id}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          run.status
                        )}`}
                      >
                        {run.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {run.project} • {run.workflow}
                    </p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-white transition opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-6 text-sm text-gray-400 mb-3">
                  <span>{run.branch}</span>
                  <span>•</span>
                  <span>by {run.author}</span>
                  <span>•</span>
                  <span>{run.startedAt}</span>
                  <span>•</span>
                  <span>{run.duration}</span>
                </div>

                {/* Current Step */}
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">
                    {run.status === "running" ? "Current step:" : "Last step:"}{" "}
                    <span className="text-white">{run.currentStep}</span>
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        run.status === "failed"
                          ? "bg-red-500"
                          : run.status === "completed"
                          ? "bg-green-500"
                          : "bg-gradient-to-r from-purple-500 to-pink-500"
                      }`}
                      style={{ width: `${run.progress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 w-12 text-right">
                    {run.progress}%
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredRuns.length === 0 && (
        <div className="glass rounded-2xl p-16 text-center border-2 border-dashed border-slate-600/50">
          <Play className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Runs Found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Start a new workflow run to see it here"}
          </p>
        </div>
      )}
    </div>
  );
}
