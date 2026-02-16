import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Settings,
  Code,
  TestTube,
  Rocket,
  FileText,
  Calendar,
  Users,
  GitBranch,
  CheckCircle2,
} from "lucide-react";

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<"overview" | "specs" | "workflows" | "runs" | "repo" | "deploy">("overview");

  // Mock data
  const project = {
    id: id || "1",
    name: "E-commerce Redesign",
    description: "Complete UI/UX overhaul with Next.js and Tailwind CSS",
    status: "active",
    stack: "Next.js + Tailwind + PostgreSQL",
    repo: "github.com/myorg/ecommerce-redesign",
    branch: "main",
    created: "2 weeks ago",
    updated: "2 hours ago",
    team: ["John Doe", "Jane Smith"],
    progress: 65,
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "specs", label: "Specs", icon: Code },
    { id: "workflows", label: "Workflows", icon: Play },
    { id: "runs", label: "Runs", icon: TestTube },
    { id: "repo", label: "Repo", icon: GitBranch },
    { id: "deploy", label: "Deploy", icon: Rocket },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-2xl">
              🎨
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
              <p className="text-gray-400 mb-3">{project.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  {project.stack}
                </span>
                <span>•</span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Updated {project.updated}
                </span>
                <span>•</span>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    project.status === "active"
                      ? "bg-green-900/30 text-green-400"
                      : "bg-gray-800/50 text-gray-400"
                  }`}
                >
                  {project.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 glass rounded-lg border border-slate-600/30 hover:border-purple-500/50 text-gray-300 hover:text-white transition flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button className="btn-gradient text-white px-6 py-2 rounded-lg font-medium hover:scale-[1.02] transition flex items-center gap-2">
              <Play className="w-4 h-4" />
              Run Workflow
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-xl p-2 flex items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                selectedTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="glass rounded-2xl p-6">
        {selectedTab === "overview" && (
          <div className="space-y-6">
            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">Progress</h3>
                <span className="text-gray-400">{project.progress}% complete</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">Workflows</p>
                <p className="text-2xl font-bold text-white">3</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">Total Runs</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-green-400">92%</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">Deployments</p>
                <p className="text-2xl font-bold text-white">8</p>
              </div>
            </div>

            {/* Repository Info */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Repository</h3>
              <div className="p-4 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <GitBranch className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Repository</p>
                    <a
                      href={`https://${project.repo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition"
                    >
                      {project.repo}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Default Branch</p>
                    <p className="text-white">{project.branch}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Team</h3>
              <div className="flex items-center gap-3">
                {project.team.map((member, index) => (
                  <div
                    key={member}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.charAt(0)}
                    </div>
                    <span className="text-white">{member}</span>
                  </div>
                ))}
                <button className="p-3 glass rounded-xl border border-slate-600/30 hover:border-purple-500/50 text-gray-400 hover:text-white transition">
                  <Users className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedTab === "runs" && (
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white mb-4">Recent Runs</h3>
            {[1, 2, 3].map((i) => (
              <Link
                key={i}
                to={`/runs/${i}`}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-600/30 hover:border-purple-500/30 transition group"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium group-hover:text-purple-400 transition">
                      Run #{140 + i}
                    </p>
                    <p className="text-sm text-gray-400">{i} days ago</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-900/30 text-green-400 text-xs font-semibold rounded-full">
                  completed
                </span>
              </Link>
            ))}
          </div>
        )}

        {["specs", "workflows", "repo", "deploy"].includes(selectedTab) && (
          <div className="text-center py-16">
            <p className="text-gray-400">Content for {selectedTab} tab coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
