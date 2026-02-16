import { useState } from "react";
import {
  Users,
  FileText,
  Code,
  Wrench,
  Shield,
  Settings,
  Play,
  Edit3,
} from "lucide-react";

const tabs = [
  { id: "agents", label: "Agents", icon: Users },
  { id: "prompts", label: "Prompts", icon: FileText },
  { id: "schemas", label: "Schemas", icon: Code },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "guardrails", label: "Guardrails", icon: Shield },
];

const agents = [
  {
    id: "manager",
    name: "Manager",
    role: "Project Management & Coordination",
    description: "Oversees the entire build process, coordinates between agents, and ensures alignment with project goals.",
    model: "GPT-4 Turbo",
    temperature: 0.3,
    color: "from-blue-600 to-cyan-600",
    icon: "👔",
  },
  {
    id: "pm",
    name: "PM",
    role: "Product Requirements",
    description: "Translates business requirements into detailed technical specifications and user stories.",
    model: "GPT-4 Turbo",
    temperature: 0.5,
    color: "from-green-600 to-emerald-600",
    icon: "📋",
  },
  {
    id: "ux",
    name: "UX/UI Designer",
    role: "User Experience & Interface",
    description: "Creates wireframes, mockups, and design specifications for the user interface.",
    model: "GPT-4 Turbo",
    temperature: 0.7,
    color: "from-pink-600 to-rose-600",
    icon: "🎨",
  },
  {
    id: "tech-lead",
    name: "Tech Lead",
    role: "Architecture & Technical Decisions",
    description: "Defines system architecture, tech stack, and technical implementation strategies.",
    model: "GPT-4 Turbo",
    temperature: 0.4,
    color: "from-purple-600 to-indigo-600",
    icon: "🏗️",
  },
  {
    id: "frontend",
    name: "Frontend Engineer",
    role: "UI Implementation",
    description: "Implements user interfaces using React, Vue, or other frontend frameworks.",
    model: "GPT-4",
    temperature: 0.2,
    color: "from-orange-600 to-amber-600",
    icon: "⚛️",
  },
  {
    id: "backend",
    name: "Backend Engineer",
    role: "API & Server Development",
    description: "Builds APIs, databases, and server-side logic for the application.",
    model: "GPT-4",
    temperature: 0.2,
    color: "from-teal-600 to-cyan-600",
    icon: "⚙️",
  },
  {
    id: "qa",
    name: "QA Engineer",
    role: "Quality Assurance & Testing",
    description: "Creates test plans, writes tests, and validates code quality and functionality.",
    model: "GPT-4",
    temperature: 0.3,
    color: "from-red-600 to-orange-600",
    icon: "🔍",
  },
  {
    id: "devops",
    name: "DevOps Engineer",
    role: "Deployment & Infrastructure",
    description: "Handles deployment pipelines, infrastructure setup, and production monitoring.",
    model: "GPT-4",
    temperature: 0.3,
    color: "from-slate-600 to-gray-600",
    icon: "🚀",
  },
];

export function AgentStudioPage() {
  const [selectedTab, setSelectedTab] = useState("agents");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
          Agent Studio
        </h1>
        <p className="text-gray-300 text-lg">
          Configure your AI team members and their capabilities
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 glass rounded-xl p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                selectedTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {selectedTab === "agents" && (
        <div className="space-y-6">
          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="glass rounded-2xl p-6 hover:border-purple-400/50 transition-all group cursor-pointer"
                onClick={() =>
                  setSelectedAgent(selectedAgent === agent.id ? null : agent.id)
                }
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${agent.color} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition flex-shrink-0`}
                  >
                    {agent.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-400 transition">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-purple-400 font-medium mb-2">{agent.role}</p>
                    <p className="text-sm text-gray-400">{agent.description}</p>
                  </div>
                </div>

                {/* Agent Details */}
                {selectedAgent === agent.id && (
                  <div className="mt-4 pt-4 border-t border-slate-600/30 space-y-4">
                    {/* Model Settings */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase mb-2 block">
                        Model
                      </label>
                      <select className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg text-white">
                        <option>GPT-4 Turbo</option>
                        <option>GPT-4</option>
                        <option>Claude 3 Opus</option>
                        <option>Claude 3 Sonnet</option>
                      </select>
                    </div>

                    {/* Temperature */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase mb-2 block flex items-center justify-between">
                        <span>Temperature</span>
                        <span className="text-white">{agent.temperature}</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        defaultValue={agent.temperature}
                        className="w-full"
                      />
                    </div>

                    {/* System Prompt */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase mb-2 block">
                        System Prompt
                      </label>
                      <textarea
                        className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg text-white text-sm resize-none"
                        rows={4}
                        placeholder="Enter system prompt..."
                      />
                    </div>

                    {/* Output Schema */}
                    <div>
                      <label className="text-xs text-gray-400 uppercase mb-2 block">
                        Output Schema
                      </label>
                      <select className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg text-white">
                        <option>Default Schema</option>
                        <option>Custom Schema v1</option>
                        <option>Custom Schema v2</option>
                      </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button className="flex-1 btn-gradient text-white px-4 py-2 rounded-lg font-medium hover:scale-[1.02] transition">
                        Save Changes
                      </button>
                      <button className="px-4 py-2 glass rounded-lg border border-slate-600/30 text-gray-300 hover:text-white hover:border-purple-500/50 transition flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Test Agent
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === "prompts" && (
        <div className="glass rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Prompt Library</h3>
            <p className="text-gray-400">
              Manage and version your agent prompts
            </p>
          </div>
          <div className="space-y-3">
            {["Manager System Prompt v2", "PM Requirements Template", "UX Design Brief"].map(
              (prompt) => (
                <div
                  key={prompt}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-600/30 hover:border-purple-500/30 transition group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-white font-medium">{prompt}</span>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-white transition opacity-0 group-hover:opacity-100">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {selectedTab === "schemas" && (
        <div className="glass rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Output Schemas</h3>
            <p className="text-gray-400">
              Define and validate agent output structures
            </p>
          </div>
          <div className="space-y-3">
            {["PRD Schema v1", "API Specification Schema", "UI Component Schema"].map(
              (schema) => (
                <div
                  key={schema}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-600/30 hover:border-purple-500/30 transition group"
                >
                  <div className="flex items-center gap-3">
                    <Code className="w-5 h-5 text-gray-400" />
                    <span className="text-white font-medium">{schema}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button className="px-3 py-1.5 text-xs bg-purple-600/20 text-purple-300 rounded hover:bg-purple-600/30 transition">
                      Validate
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {selectedTab === "tools" && (
        <div className="glass rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Agent Tools</h3>
            <p className="text-gray-400">
              Enable or disable tools for each agent
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "File Search", enabled: true },
              { name: "GitHub Connector", enabled: true },
              { name: "Repo Patch Tool", enabled: true },
              { name: "Test Runner", enabled: false },
              { name: "Deployment Tool (Railway)", enabled: true },
              { name: "Database Query", enabled: false },
            ].map((tool) => (
              <div
                key={tool.name}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-600/30"
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-gray-400" />
                  <span className="text-white font-medium">{tool.name}</span>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    defaultChecked={tool.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-full h-full bg-slate-700 peer-checked:bg-purple-600 rounded-full transition cursor-pointer"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === "guardrails" && (
        <div className="glass rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-2">Safety Guardrails</h3>
            <p className="text-gray-400">
              Configure safety rules and constraints
            </p>
          </div>
          <div className="space-y-6">
            <div>
              <label className="text-sm text-white font-medium mb-3 block">
                Max Diff Lines Per Iteration
              </label>
              <input
                type="number"
                defaultValue={500}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg text-white"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <p className="text-white font-medium mb-1">No File Deletion</p>
                <p className="text-sm text-gray-400">
                  Prevent agents from deleting files
                </p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-full h-full bg-slate-700 peer-checked:bg-purple-600 rounded-full transition cursor-pointer"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <p className="text-white font-medium mb-1">Block Secret Leakage</p>
                <p className="text-sm text-gray-400">
                  Prevent committing secrets and API keys
                </p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-full h-full bg-slate-700 peer-checked:bg-purple-600 rounded-full transition cursor-pointer"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></div>
              </label>
            </div>
            <div>
              <label className="text-sm text-white font-medium mb-3 block">
                Allowed Directories
              </label>
              <textarea
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg text-white text-sm resize-none"
                rows={4}
                placeholder="src/&#10;lib/&#10;tests/"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
