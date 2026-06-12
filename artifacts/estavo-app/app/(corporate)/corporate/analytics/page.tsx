import { Download } from "lucide-react";
import { MOCK_PORTFOLIO } from "@/lib/mock-data";
import { PageHeader, ScorePill } from "@/components/ui";

export default function CorporateAnalyticsPage() {
  const avgResolution = [2.3, 1.1, 5.4];

  return (
    <div className="fade-in space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Estate performance across your portfolio"
        action={
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold cursor-pointer"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            <Download size={13} /> Download Report PDF
          </button>
        }
      />

      {/* Performance table */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
              {["Estate","Open Tickets","Avg Resolution","Alerts","Levy Rate","Score"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: "var(--text-dim)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_PORTFOLIO.map((e, i) => (
              <tr key={e.id} style={{ borderBottom: "1px solid var(--border-subtle)", cursor: "pointer" }}
                onMouseEnter={ev => (ev.currentTarget.style.background = "var(--hover)")}
                onMouseLeave={ev => (ev.currentTarget.style.background = "transparent")}>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--text)" }}>{e.name}</td>
                <td className="px-4 py-3 font-mono" style={{ color: e.openTickets >= 8 ? "var(--danger-text)" : "var(--text)" }}>
                  {e.openTickets}
                </td>
                <td className="px-4 py-3 font-mono" style={{ color: avgResolution[i] > 4 ? "var(--danger-text)" : "var(--text)" }}>
                  {avgResolution[i]} days
                </td>
                <td className="px-4 py-3 font-mono" style={{ color: e.alerts > 0 ? "var(--danger-text)" : "var(--text)" }}>
                  {e.alerts}
                </td>
                <td className="px-4 py-3 font-mono" style={{ color: e.levyRate < 80 ? "var(--danger-text)" : "var(--success-text)" }}>
                  {e.levyRate}%
                </td>
                <td className="px-4 py-3"><ScorePill score={e.score} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Score formula */}
      <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="text-[12px] font-semibold mb-3" style={{ color: "var(--text-muted)" }}>PERFORMANCE SCORE FORMULA</div>
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          {[
            { rule:"Base score", value:"100 pts" },
            { rule:"−20 per unresolved emergency", value:"penalty" },
            { rule:"−5 per unassigned ticket >24h", value:"penalty" },
            { rule:"+20 if avg resolution <2 days", value:"bonus" },
            { rule:"−10 if avg resolution >5 days", value:"penalty" },
            { rule:"+30 if levy collection >90%", value:"bonus" },
            { rule:"−20 if levy collection <70%", value:"penalty" },
          ].map(r => (
            <div key={r.rule} className="flex justify-between px-3 py-1.5 rounded-lg"
              style={{ background: "var(--bg)" }}>
              <span style={{ color: "var(--text-muted)" }}>{r.rule}</span>
              <span className="font-semibold"
                style={{ color: r.value === "bonus" ? "var(--success-text)" : r.value === "penalty" ? "var(--danger-text)" : "var(--text)" }}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
        <div className="text-[11px] mt-3" style={{ color: "var(--text-dim)" }}>
          Computed nightly. Scores update at 00:00 SAST.
        </div>
      </div>

      {/* Bar chart - levy collection */}
      <div className="rounded-xl p-5" style={{ border: "1px solid var(--border)" }}>
        <div className="text-[13px] font-semibold mb-4" style={{ color: "var(--text)" }}>Levy Collection Rate</div>
        <div className="space-y-3">
          {MOCK_PORTFOLIO.map(e => (
            <div key={e.id}>
              <div className="flex justify-between text-[12px] mb-1">
                <span style={{ color: "var(--text-muted)" }}>{e.name.split(" ").slice(0, 2).join(" ")}</span>
                <span className="font-semibold font-mono"
                  style={{ color: e.levyRate < 80 ? "var(--danger-text)" : "var(--success-text)" }}>
                  {e.levyRate}%
                </span>
              </div>
              <div className="h-2.5 rounded-full" style={{ background: "var(--surface-2)" }}>
                <div className="h-2.5 rounded-full transition-all"
                  style={{
                    width: `${e.levyRate}%`,
                    background: e.levyRate < 80 ? "var(--danger)" : e.levyRate < 90 ? "var(--warning)" : "var(--success)",
                  }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
