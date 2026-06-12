"use client";

import { useState } from "react";
import { MOCK_PORTFOLIO } from "@/lib/mock-data";
import { PageHeader, StatCard, Badge } from "@/components/ui";

const INVOICE_HISTORY: Record<string, { month:string; amount:number; status:string; due:string }[]> = {
  e1: [
    { month:"Jun 2026", amount:12500, status:"paid",    due:"1 Jun 2026" },
    { month:"May 2026", amount:12500, status:"paid",    due:"1 May 2026" },
  ],
  e2: [
    { month:"Jun 2026", amount:8000,  status:"paid",    due:"1 Jun 2026" },
    { month:"May 2026", amount:8000,  status:"paid",    due:"1 May 2026" },
  ],
  e3: [
    { month:"Dec 2025", amount:9500,  status:"overdue", due:"15 Dec 2025" },
    { month:"Nov 2025", amount:9500,  status:"paid",    due:"1 Nov 2025" },
  ],
};

export default function CorporateFinancialsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const total = MOCK_PORTFOLIO.reduce((s, e) => s + e.fee, 0);
  const paid  = MOCK_PORTFOLIO.filter(e => e.payStatus === "paid").reduce((s, e) => s + e.fee, 0);
  const outstanding = total - paid;
  const avgLevy = Math.round(MOCK_PORTFOLIO.reduce((s, e) => s + e.levyRate, 0) / MOCK_PORTFOLIO.length);

  return (
    <div className="fade-in space-y-6">
      <PageHeader title="Financials" subtitle="Portfolio billing and levy collection" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total MRR"         value={`R${total.toLocaleString()}`} sub="per month" />
        <StatCard label="Paid this month"   value={`R${paid.toLocaleString()}`}  sub="confirmed" />
        <StatCard label="Outstanding"       value={`R${outstanding.toLocaleString()}`} sub="awaiting" />
        <StatCard label="Avg levy rate"     value={`${avgLevy}%`}               sub="portfolio avg" />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
              {["Estate","Monthly Fee","Levy Collection","Status","Next Invoice",""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: "var(--text-dim)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_PORTFOLIO.map(e => (
              <>
                <tr key={e.id} style={{ borderBottom: "1px solid var(--border-subtle)", cursor:"pointer" }}
                  onMouseEnter={ev => (ev.currentTarget.style.background = "var(--hover)")}
                  onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text)" }}>{e.name}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: "var(--text)" }}>R{e.fee.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono"
                    style={{ color: e.levyRate < 80 ? "var(--danger-text)" : "var(--success-text)" }}>
                    {e.levyRate}%
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={e.payStatus === "paid" ? "paid" : "overdue"}>
                      {e.payStatus === "paid" ? "✅ Paid" : "⚠️ Overdue"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3" style={{ color: e.payStatus === "overdue" ? "var(--danger-text)" : "var(--text-muted)" }}>
                    {e.payStatus === "overdue" ? "15 Dec 2025 🔴" : "1 Jul 2026"}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                      className="text-[12px] cursor-pointer" style={{ color: "var(--active-text)" }}>
                      {expanded === e.id ? "Hide ↑" : "History ↓"}
                    </button>
                  </td>
                </tr>
                {expanded === e.id && (
                  <tr key={`${e.id}-hist`}>
                    <td colSpan={6} className="px-8 py-3" style={{ background: "var(--surface)" }}>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: "var(--text-muted)" }}>
                        {e.name} — Invoice History
                      </div>
                      <div className="space-y-1.5">
                        {INVOICE_HISTORY[e.id]?.map((inv, i) => (
                          <div key={i} className="flex items-center justify-between text-[12px]">
                            <span style={{ color: "var(--text-muted)" }}>{inv.month}</span>
                            <span className="font-mono" style={{ color: "var(--text)" }}>R{inv.amount.toLocaleString()}</span>
                            <Badge variant={inv.status === "paid" ? "paid" : "overdue"}>
                              {inv.status === "paid" ? "✅ Paid" : "⚠️ OVERDUE"}
                            </Badge>
                            <span style={{ color: "var(--text-dim)" }}>Due {inv.due}</span>
                            {inv.status === "overdue" ? (
                              <button className="text-[11px] font-semibold cursor-pointer" style={{ color: "var(--danger-text)" }}>
                                Send Reminder
                              </button>
                            ) : (
                              <button className="text-[11px] font-semibold cursor-pointer" style={{ color: "var(--active-text)" }}>
                                Download PDF
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
