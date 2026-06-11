import React, { useEffect, useState } from "react";
import { platformApi, type Estate } from "@/lib/api";

export default function BillingPage() {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    platformApi.getEstates()
      .then(({ estates }) => setEstates(estates))
      .finally(() => setLoading(false));
  }, []);

  const activeEstates = estates.filter(e => e.subscriptionStatus !== "cancelled");
  const mrr = activeEstates.reduce((sum, e) => sum + (e.monthlyAmountZar ?? 0), 0);
  const arr = mrr * 12;

  const tierBreakdown = ["starter", "growth", "estate", "enterprise"].map(tier => ({
    tier,
    count: estates.filter(e => e.subscriptionTier === tier).length,
    mrr: estates.filter(e => e.subscriptionTier === tier).reduce((s, e) => s + (e.monthlyAmountZar ?? 0), 0),
  })).filter(t => t.count > 0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Billing Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Revenue metrics across all estates</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-3">Monthly Recurring Revenue</div>
          <div className="text-3xl font-bold text-white">R{mrr.toLocaleString()}</div>
          <div className="text-sm text-slate-500 mt-1">excl. VAT (15%)</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Annual Run Rate</div>
          <div className="text-3xl font-bold text-white">R{arr.toLocaleString()}</div>
          <div className="text-sm text-slate-500 mt-1">MRR × 12</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3">Paying Estates</div>
          <div className="text-3xl font-bold text-white">{activeEstates.length}</div>
          <div className="text-sm text-slate-500 mt-1">of {estates.length} total</div>
        </div>
      </div>

      {tierBreakdown.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-300">Revenue by Tier</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tier</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estates</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">MRR</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">% of MRR</th>
              </tr>
            </thead>
            <tbody>
              {tierBreakdown.map(t => (
                <tr key={t.tier} className="border-b border-slate-800/50">
                  <td className="px-6 py-4 text-white capitalize font-medium">{t.tier}</td>
                  <td className="px-6 py-4 text-slate-300">{t.count}</td>
                  <td className="px-6 py-4 text-slate-300">R{t.mrr.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${mrr > 0 ? (t.mrr / mrr * 100) : 0}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-xs w-10 text-right">
                        {mrr > 0 ? Math.round(t.mrr / mrr * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300">Per-Estate Billing</h2>
        </div>
        {loading ? (
          <div className="text-slate-400 text-sm text-center py-8">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estate</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tier</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">MRR</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pilot</th>
              </tr>
            </thead>
            <tbody>
              {estates.map(e => (
                <tr key={e.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{e.name}</div>
                    {e.managerEmail && <div className="text-slate-500 text-xs">{e.managerEmail}</div>}
                  </td>
                  <td className="px-6 py-4 text-slate-300 capitalize">{e.subscriptionTier}</td>
                  <td className="px-6 py-4 text-white font-medium">
                    {e.monthlyAmountZar ? `R${e.monthlyAmountZar.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {e.isPilot ? (
                      <span className="text-indigo-400">{e.pilotDiscountPct}% off</span>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
