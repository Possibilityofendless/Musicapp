import { GitBranch, FileText, GitPullRequest } from "lucide-react";

export function RepoPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
          Repo & PRs
        </h1>
        <p className="text-gray-300 text-lg">
          View repository changes and manage pull requests
        </p>
      </div>

      <div className="glass rounded-2xl p-16 text-center">
        <GitBranch className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Repository Features Coming Soon</h3>
        <p className="text-gray-400">
          Browse files, view diffs, and manage pull requests
        </p>
      </div>
    </div>
  );
}
