import React, { useEffect, useState } from "react";
import { platformApi, type PlatformStats, type Estate } from "@/lib/api";

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-6`}>
      <div className={`text-xs font-semibold uppercase tracking-wider mb-3 ${color}`}>{label}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {sub && <div className="text-sm text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string }> = {
    active: { bg: "bg-emerald-950 border-emerald-800", text: "text-emerald-400" },
    pilot: { bg: "bg-indigo-950 border-indigo-800", text: "text-indigo-400" },
    suspended: { bg: "bg-red-950 border-red-800", text: "text-red-400" },
    cancelled: { bg: "bg-slate-800 border-slate-700", text: "text-slate-400" },
  };
  const c = cfg[status] ?? cfg.cancelled;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${c.bg} ${c.text}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentEstates, setRecentEstates] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [statsData, estatesData] = await Promise.all([
          platformApi.getStats(),
          platformApi.getEstates(),
        ]);
        setStats(statsData);
        setRecentEstates(estatesData.estates.slice(0, 8));
      } catch (err: any) {
        setError(err.message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-slate-400 text-sm">Loading dashboard...</div>
    </div>
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Platform Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">EstateHQ SaaS overview</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-950 border border-red-800 text-red-300 px-4 py-3 rounded-xl text-sm">
          {error} — API may not be configured yet. <a href="/provision" className="underline">Provision an estate</a> to get started.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Estates" value={stats?.totalEstates ?? 0} color="text-slate-400" />
        <StatCard label="Active" value={stats?.activeEstates ?? 0} sub="live estates" color="text-emerald-400" />
        <StatCard label="Pilot" value={stats?.pilotEstates ?? 0} sub="discounted" color="text-indigo-400" />
        <StatCard label="Suspended" value={stats?.suspendedEstates ?? 0} color="text-red-400" />
        <StatCard label="Total Units" value={stats?.totalUnits?.toLocaleString() ?? 0} color="text-slate-400" />
        <StatCard
          label="MRR"
          value={`R${((stats?.mrrZar ?? 0) / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`}
          sub="excl. VAT"
          color="text-amber-400"
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Recent Estates</h2>
        {recentEstates.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-slate-500 text-sm">No estates provisioned yet.</p>
            <a href="/provision" className="inline-block mt-3 text-indigo-400 text-sm hover:underline">
              Provision your first estate →
            </a>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estate</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Units</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tier</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">MRR</th>
                </tr>
              </thead>
              <tbody>
                {recentEstates.map(e => (
                  <tr key={e.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{e.name}</div>
                      {e.managerEmail && <div className="text-slate-500 text-xs">{e.managerEmail}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{e.unitCount}</td>
                    <td className="px-6 py-4 text-slate-300 capitalize">{e.subscriptionTier}</td>
                    <td className="px-6 py-4"><StatusBadge status={e.subscriptionStatus} /></td>
                    <td className="px-6 py-4 text-slate-300">
                      {e.monthlyAmountZar ? `R${e.monthlyAmountZar.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
