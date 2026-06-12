import { ArrowRight } from "lucide-react";
import { MOCK_APPROVALS, MOCK_MEETINGS } from "@/lib/mock-data";
import { PageHeader, Badge } from "@/components/ui";

export default function TrusteeOverviewPage() {
  const pending = MOCK_APPROVALS.filter(a => a.status === "pending").length;
  const nextMeeting = MOCK_MEETINGS.filter(m => m.status === "scheduled")[0];

  return (
    <div className="fade-in space-y-5">
      <PageHeader title="Estate Overview" subtitle="Read-only governance snapshot" />

      <div className="rounded-2xl" style={{ border: "1px solid var(--border)" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
          <h2 className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>
            The Hudson Lifestyle Estate
          </h2>
          <p className="text-[12px]" style={{ color: "var(--text-dim)" }}>Midrand, Gauteng · 184 units</p>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
          {[
            { label: "Open maintenance tickets",     value: "5",  sub: "2 high priority",    variant: "warning" as const },
            { label: "Unresolved emergency alerts",  value: "0",  sub: "All clear",           variant: "success" as const },
            { label: "Staff on shift",               value: "3",  sub: "Security + gate op", variant: null },
            { label: "Levy collection rate",         value: "94%",sub: "Aggregate only",      variant: "success" as const },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>{row.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold" style={{ color: "var(--text)" }}>{row.value}</span>
                {row.sub && (
                  <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>({row.sub})</span>
                )}
                {row.variant && <Badge variant={row.variant}>{row.variant}</Badge>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meetings */}
      <div className="rounded-2xl p-5" style={{ border: "1px solid var(--border)" }}>
        <h2 className="text-[13px] font-semibold mb-3" style={{ color: "var(--text)" }}>Upcoming Meetings</h2>
        <div className="space-y-3">
          {MOCK_MEETINGS.filter(m => m.status === "scheduled").map(m => (
            <div key={m.id} className="flex items-center justify-between py-2 border-t"
              style={{ borderColor: "var(--border-subtle)" }}>
              <div>
                <div className="text-[13px] font-medium" style={{ color: "var(--text)" }}>{m.title}</div>
                <div className="text-[12px]" style={{ color: "var(--text-dim)" }}>
                  {m.date} · {m.time} · {m.location}
                </div>
              </div>
              <button className="text-[12px] cursor-pointer flex items-center gap-1" style={{ color: "var(--active-text)" }}>
                View <ArrowRight size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pending approvals */}
      {pending > 0 && (
        <div className="rounded-2xl px-5 py-4 flex items-center justify-between"
          style={{ background: "var(--warning-bg)", border: "1px solid var(--warning-border)" }}>
          <span className="text-[13px] font-semibold" style={{ color: "var(--warning-text)" }}>
            {pending} approval{pending > 1 ? "s" : ""} awaiting your vote
          </span>
          <a href="/trustees" className="text-[12px] font-semibold flex items-center gap-1" style={{ color: "var(--warning-text)" }}>
            Review <ArrowRight size={11} />
          </a>
        </div>
      )}

      <div className="rounded-2xl px-4 py-3 text-[12px]"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-dim)" }}>
        🔒 POPIA: Levy collection shown as aggregate percentage only. Individual resident data is not accessible from the trustee portal.
      </div>
    </div>
  );
}
