import { Database, Upload } from "lucide-react";

export function KnowledgePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
          Knowledge
        </h1>
        <p className="text-gray-300 text-lg">
          Manage documents and knowledge base for your agents
        </p>
      </div>

      <div className="glass rounded-2xl p-16 text-center border-2 border-dashed border-slate-600/50">
        <Database className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Upload Knowledge Documents</h3>
        <p className="text-gray-400 mb-6">
          Add documentation, specs, and guides for your AI agents
        </p>
        <button className="inline-flex items-center gap-2 btn-gradient text-white px-6 py-3 rounded-lg font-medium hover:scale-[1.02] transition-all">
          <Upload className="w-5 h-5" />
          Upload Documents
        </button>
      </div>
    </div>
  );
}
