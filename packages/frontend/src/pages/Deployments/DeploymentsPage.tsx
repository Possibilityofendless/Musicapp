import { Rocket, CheckCircle2, AlertCircle, Clock, RotateCcw } from "lucide-react";

const environments = [
  {
    name: "Development",
    status: "healthy",
    url: "https://dev.noii-team.app",
    lastDeploy: "2 hours ago",
    version: "v1.2.3-dev",
    health: {
      api: "healthy",
      database: "healthy",
      redis: "healthy",
    },
  },
  {
    name: "Staging",
    status: "healthy",
    url: "https://staging.noii-team.app",
    lastDeploy: "1 day ago",
    version: "v1.2.2",
    health: {
      api: "healthy",
      database: "healthy",
      redis: "healthy",
    },
  },
  {
    name: "Production",
    status: "healthy",
    url: "https://app.noii-team.app",
    lastDeploy: "3 days ago",
    version: "v1.2.1",
    health: {
      api: "healthy",
      database: "healthy",
      redis: "degraded",
    },
  },
];

const deployHistory = [
  { id: "1", env: "Production", version: "v1.2.1", status: "success", time: "3 days ago", by: "John Doe" },
  { id: "2", env: "Staging", version: "v1.2.2", status: "success", time: "1 day ago", by: "Jane Smith" },
  { id: "3", env: "Development", version: "v1.2.3-dev", status: "success", time: "2 hours ago", by: "John Doe" },
  { id: "4", env: "Production", version: "v1.2.0", status: "rollback", time: "1 week ago", by: "Jane Smith" },
];

export function DeploymentsPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case "degraded":
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case "down":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-900/30 text-green-400";
      case "degraded":
        return "bg-yellow-900/30 text-yellow-400";
      case "down":
        return "bg-red-900/30 text-red-400";
      default:
        return "bg-slate-800/50 text-gray-400";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
          Deployments
        </h1>
        <p className="text-gray-300 text-lg">
          Monitor and manage your application environments
        </p>
      </div>

      {/* Environments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {environments.map((env) => (
          <div key={env.name} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{env.name}</h3>
              {getStatusIcon(env.status)}
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">URL</p>
                <a
                  href={env.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 transition"
                >
                  {env.url}
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Version</p>
                <p className="text-sm text-white font-mono">{env.version}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Last Deploy</p>
                <p className="text-sm text-white">{env.lastDeploy}</p>
              </div>
            </div>

            {/* Health Checks */}
            <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-gray-400 uppercase mb-2">Health Checks</p>
              <div className="space-y-2">
                {Object.entries(env.health).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between">
                    <span className="text-xs text-gray-300 capitalize">{service}</span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${getStatusColor(status)}`}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="flex-1 btn-gradient text-white px-4 py-2 rounded-lg text-sm font-medium hover:scale-[1.02] transition flex items-center justify-center gap-2">
                <Rocket className="w-4 h-4" />
                Deploy
              </button>
              <button className="px-4 py-2 glass rounded-lg border border-slate-600/30 text-gray-300 hover:text-white hover:border-purple-500/50 transition">
                Logs
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Deployment History */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Deployment History</h2>
        <div className="space-y-3">
          {deployHistory.map((deploy) => (
            <div
              key={deploy.id}
              className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-600/30 hover:border-purple-500/30 transition group"
            >
              <div className="flex items-center gap-4">
                {deploy.status === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <RotateCcw className="w-5 h-5 text-yellow-400" />
                )}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white font-semibold">{deploy.env}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-purple-400 font-mono text-sm">
                      {deploy.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>by {deploy.by}</span>
                    <span>•</span>
                    <span>{deploy.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                {deploy.status === "success" && (
                  <button className="px-3 py-1.5 text-xs glass rounded border border-slate-600/30 text-gray-300 hover:text-white hover:border-purple-500/50 transition">
                    Rollback
                  </button>
                )}
                <button className="px-3 py-1.5 text-xs glass rounded border border-slate-600/30 text-gray-300 hover:text-white hover:border-purple-500/50 transition">
                  View Logs
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
