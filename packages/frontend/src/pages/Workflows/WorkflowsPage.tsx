import { Link } from "react-router-dom";
import { Play, Plus, Workflow as WorkflowIcon } from "lucide-react";

const templates = [
  {
    id: "mvp",
    name: "MVP Builder",
    description: "Complete full-stack application with frontend, backend, and deployment",
    steps: 14,
    duration: "~4 hours",
    color: "from-purple-600 to-pink-600",
  },
  {
    id: "fullstack",
    name: "Full-stack Builder",
    description: "Enterprise-ready application with advanced features and testing",
    steps: 16,
    duration: "~6 hours",
    color: "from-blue-600 to-cyan-600",
  },
  {
    id: "bugfix",
    name: "Bug Fix + PR",
    description: "Automated bug fixing with tests and pull request",
    steps: 8,
    duration: "~1 hour",
    color: "from-green-600 to-emerald-600",
  },
  {
    id: "refactor",
    name: "Refactor + Tests",
    description: "Code refactoring with comprehensive test coverage",
    steps: 10,
    duration: "~2 hours",
    color: "from-orange-600 to-amber-600",
  },
];

export function WorkflowsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
            Workflows
          </h1>
          <p className="text-gray-300 text-lg">
            Choose a template or create custom agent workflows
          </p>
        </div>
        <Link
          to="/workflows/new"
          className="btn-gradient text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:scale-[1.02] transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create Workflow
        </Link>
      </div>

      {/* Templates Gallery */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Workflow Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="glass rounded-2xl p-6 hover:border-purple-400/50 transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition flex-shrink-0`}
                >
                  <WorkflowIcon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">{template.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{template.steps} steps</span>
                    <span>•</span>
                    <span>{template.duration}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex-1 btn-gradient text-white px-4 py-2 rounded-lg font-medium hover:scale-[1.02] transition flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" />
                  Use Template
                </button>
                <button className="px-4 py-2 glass rounded-lg border border-slate-600/30 text-gray-300 hover:text-white hover:border-purple-500/50 transition">
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Workflows */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">My Workflows</h2>
        <div className="glass rounded-2xl p-16 text-center border-2 border-dashed border-slate-600/50">
          <WorkflowIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Custom Workflows Yet</h3>
          <p className="text-gray-400 mb-6">
            Create your first custom workflow to see it here
          </p>
          <Link
            to="/workflows/new"
            className="inline-flex items-center gap-2 btn-gradient text-white px-6 py-3 rounded-lg font-medium hover:scale-[1.02] transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Workflow
          </Link>
        </div>
      </div>
    </div>
  );
}
