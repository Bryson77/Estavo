import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { platformApi, type Estate } from "@/lib/api";

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string }> = {
    active: { bg: "bg-emerald-950 border-emerald-800", text: "text-emerald-400" },
    pilot: { bg: "bg-indigo-950 border-indigo-800", text: "text-indigo-400" },
    suspended: { bg: "bg-red-950 border-red-800", text: "text-red-400" },
    cancelled: { bg: "bg-slate-800 border-slate-700", text: "text-slate-400" },
  };
  const c = cfg[status] ?? cfg.cancelled;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${c.bg} ${c.text}`}>
      {status}
    </span>
  );
}

const TIERS = ["all", "starter", "growth", "estate", "enterprise"];

export default function EstatesPage() {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [suspending, setSuspending] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const { estates } = await platformApi.getEstates();
      setEstates(estates);
    } catch (err: any) {
      setError(err.message ?? "Failed to load estates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSuspend = async (id: string, name: string) => {
    if (!confirm(`Suspend ${name}? Residents will lose app access.`)) return;
    setSuspending(id);
    try {
      await platformApi.suspendEstate(id);
      await load();
    } catch (err: any) {
      alert(err.message ?? "Failed to suspend estate");
    } finally {
      setSuspending(null);
    }
  };

  const filtered = estates
    .filter(e => tierFilter === "all" || e.subscriptionTier === tierFilter)
    .filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()) || (e.managerEmail ?? "").includes(search));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Estates</h1>
          <p className="text-slate-400 text-sm mt-1">{estates.length} total</p>
        </div>
        <Link href="/provision">
          <a className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
            + Provision New
          </a>
        </Link>
      </div>

      <div className="flex gap-3 mb-5">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search estates..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex gap-2">
          {TIERS.map(t => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                tierFilter === t
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-950 border border-red-800 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-slate-400 text-sm text-center py-12">Loading estates...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
          No estates found.
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
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{e.name}</div>
                    <div className="text-slate-500 text-xs">{e.managerEmail ?? "—"}</div>
                    {e.isPilot && e.pilotDiscountPct ? (
                      <div className="text-indigo-400 text-xs">{e.pilotDiscountPct}% pilot discount</div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{e.unitCount}</td>
                  <td className="px-6 py-4 text-slate-300 capitalize">{e.subscriptionTier}</td>
                  <td className="px-6 py-4"><StatusBadge status={e.subscriptionStatus} /></td>
                  <td className="px-6 py-4 text-slate-300">
                    {e.monthlyAmountZar ? `R${e.monthlyAmountZar.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {e.subscriptionStatus !== "suspended" && (
                        <button
                          onClick={() => handleSuspend(e.id, e.name)}
                          disabled={suspending === e.id}
                          className="text-xs text-red-400 hover:text-red-300 bg-red-950 hover:bg-red-900 border border-red-800 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {suspending === e.id ? "..." : "Suspend"}
                        </button>
                      )}
                      <Link href={`/estates/${e.id}`}>
                        <a className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-lg transition-colors">
                          View
                        </a>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
