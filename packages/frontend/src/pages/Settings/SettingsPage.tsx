import { Settings as SettingsIcon, User, Bell, Shield, Key } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
          Settings
        </h1>
        <p className="text-gray-300 text-lg">
          Configure your account and application preferences
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* Profile */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Full Name</label>
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Email</label>
              <input
                type="email"
                defaultValue="john@example.com"
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg text-white focus:border-purple-500/50 focus:outline-none transition"
              />
            </div>
            <button className="btn-gradient text-white px-6 py-2 rounded-lg font-medium hover:scale-[1.02] transition-all">
              Save Changes
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: "Run Completion", desc: "Notify when workflow runs complete" },
              { label: "Run Failures", desc: "Alert on workflow failures" },
              { label: "Deployment Updates", desc: "Notify on deployment status changes" },
            ].map((setting) => (
              <div
                key={setting.label}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl"
              >
                <div>
                  <p className="text-white font-medium mb-1">{setting.label}</p>
                  <p className="text-sm text-gray-400">{setting.desc}</p>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-full h-full bg-slate-700 peer-checked:bg-purple-600 rounded-full transition cursor-pointer"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* API Keys */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">API Keys</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <p className="text-white font-medium mb-1">Production Key</p>
                <p className="text-sm text-gray-400 font-mono">pk_live_••••••••••••1234</p>
              </div>
              <button className="px-4 py-2 glass rounded-lg border border-slate-600/30 text-gray-300 hover:text-white hover:border-purple-500/50 transition text-sm">
                Rotate
              </button>
            </div>
          </div>
          <button className="mt-4 btn-gradient text-white px-6 py-2 rounded-lg font-medium hover:scale-[1.02] transition-all">
            Create New Key
          </button>
        </div>
      </div>
    </div>
  );
}
