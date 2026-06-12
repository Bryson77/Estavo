"use client";

import { useState } from "react";
import { ArrowRight, AlertCircle } from "lucide-react";
import { MOCK_PORTFOLIO } from "@/lib/mock-data";
import { PageHeader, Badge, PillFilter, ScorePill } from "@/components/ui";

const FILTERS = ["All", "Healthy", "Needs Attention", "Suspended"];

function HealthBorder({ status }: { status: string }) {
  const color = status === "attention" ? "var(--danger)" : "var(--border)";
  return color;
}

export default function CorporatePortfolioPage() {
  const [filter, setFilter] = useState("All");

  const filtered = MOCK_PORTFOLIO.filter(e => {
    if (filter === "All") return true;
    if (filter === "Needs Attention") return e.status === "attention";
    if (filter === "Healthy") return e.status === "active" && e.score >= 80;
    if (filter === "Suspended") return e.status === "suspended";
    return true;
  });

  const healthy = MOCK_PORTFOLIO.filter(e => e.status === "active" && e.score >= 80).length;
  const attention = MOCK_PORTFOLIO.filter(e => e.status === "attention").length;

  return (
    <div className="fade-in">
      <PageHeader
        title="Portfolio"
        subtitle={`${MOCK_PORTFOLIO.length} estates · ${healthy} healthy · ${attention} need${attention !== 1 ? "" : "s"} attention`}
      />

      <div className="mb-5">
        <PillFilter options={FILTERS} value={filter} onChange={setFilter} />
      </div>

      <div className="space-y-3">
        {filtered.map(e => (
          <div key={e.id} className="rounded-2xl overflow-hidden"
            style={{
              border: `1.5px solid ${e.status === "attention" ? "var(--danger)" : "var(--border)"}`,
            }}>
            <div className="px-5 py-4" style={{ background: e.status === "attention" ? "var(--danger-bg)" : "var(--bg)" }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[15px] font-semibold" style={{ color: "var(--text)" }}>{e.name}</h3>
                    {e.status === "attention" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                        style={{ background: "var(--danger)", color: "#fff" }}>Needs Attention</span>
                    )}
                  </div>
                  <div className="text-[12px]" style={{ color: "var(--text-dim)" }}>
                    {e.address} · {e.units} units
                  </div>
                  <div className="text-[12px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Manager: {e.manager} · Last active {e.managerLastActive}
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer"
                  style={{ background: "var(--accent)", color: "#fff" }}>
                  View Estate <ArrowRight size={12} />
                </button>
              </div>
            </div>

            <div className="px-5 py-3 grid grid-cols-2 md:grid-cols-5 gap-3"
              style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--surface)" }}>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--text-dim)" }}>Open Tickets</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[16px] font-bold" style={{ color: e.openTickets >= 5 ? "var(--danger)" : "var(--text)" }}>
                    {e.openTickets}
                  </span>
                  {e.unassigned > 0 && (
                    <span className="text-[11px]" style={{ color: "var(--warning-text)" }}>⚠ {e.unassigned} unassigned</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--text-dim)" }}>Alerts / month</div>
                <div className="text-[16px] font-bold mt-0.5"
                  style={{ color: e.alerts > 0 ? "var(--danger)" : "var(--text)" }}>
                  {e.alerts > 0 ? `🚨 ${e.alerts}` : "0"}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--text-dim)" }}>Levy Rate</div>
                <div className="text-[16px] font-bold mt-0.5"
                  style={{ color: e.levyRate < 80 ? "var(--danger)" : "var(--text)" }}>
                  {e.levyRate}%
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--text-dim)" }}>Monthly Fee</div>
                <div className="text-[16px] font-bold mt-0.5 flex items-center gap-2" style={{ color: "var(--text)" }}>
                  R{e.fee.toLocaleString()}
                  <Badge variant={e.payStatus === "paid" ? "paid" : "overdue"}>
                    {e.payStatus === "paid" ? "✅ Paid" : "⚠️ Overdue"}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--text-dim)" }}>Performance</div>
                <div className="mt-1"><ScorePill score={e.score} /></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
