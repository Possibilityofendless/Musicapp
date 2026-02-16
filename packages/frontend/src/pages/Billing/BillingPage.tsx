import { DollarSign, TrendingUp, AlertCircle } from "lucide-react";

export function BillingPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
          Billing & Limits
        </h1>
        <p className="text-gray-300 text-lg">
          Monitor usage, costs, and manage your subscription
        </p>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-sm text-gray-400">This month</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Spend</p>
          <p className="text-3xl font-bold text-white">$247.50</p>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-600/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-sm text-green-400">↑ 12%</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">API Calls</p>
          <p className="text-3xl font-bold text-white">15.2k</p>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-600/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-sm text-gray-400">Limit</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Budget</p>
          <p className="text-3xl font-bold text-white">$500</p>
        </div>
      </div>

      {/* Usage Chart Placeholder */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Usage Over Time</h2>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-600/50 rounded-xl">
          <p className="text-gray-400">Chart visualization coming soon</p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Current Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Pro Plan</h3>
            <p className="text-gray-400">Unlimited projects and team members</p>
          </div>
          <button className="btn-gradient text-white px-6 py-3 rounded-lg font-medium hover:scale-[1.02] transition-all">
            Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}
