import { AlertTriangle, ArrowRight, Activity, Users, Shield, Ticket, Key, UserCheck } from "lucide-react";
import Link from "next/link";
import { MOCK_ACCESS_LOG, MOCK_APPROVALS, MOCK_EMERGENCIES, MOCK_MAINTENANCE } from "@/lib/mock-data";
import { Badge } from "@/components/ui";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color:"var(--text-dim)" }}>{label}</div>
      <div className="text-[26px] font-bold leading-none" style={{ color:"var(--text)" }}>{value}</div>
      {sub && <div className="text-[11px] mt-1" style={{ color:"var(--text-dim)" }}>{sub}</div>}
    </div>
  );
}

const pending = MOCK_APPROVALS.filter(a => a.status === "pending");
const openTickets = MOCK_MAINTENANCE.filter(m => m.status !== "resolved");

export default function DashboardPage() {
  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.1em] font-semibold mb-1" style={{ color:"var(--text-dim)" }}>
            Good morning
          </div>
          <h1 className="text-[20px] font-semibold" style={{ color:"var(--text)" }}>
            The Hudson Lifestyle Estate
          </h1>
          <p className="text-[13px]" style={{ color:"var(--text-muted)" }}>
            Amara Khumalo · Last login: just now
          </p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
          style={{ background:"var(--success-bg)", color:"var(--success-text)", border:"1px solid var(--success-border)" }}>
          ● All systems operational
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Units"       value={184} />
        <StatCard label="Registered"  value={162} sub="residents" />
        <StatCard label="Open tickets" value={openTickets.length} />
        <StatCard label="Active codes" value={12} />
        <StatCard label="Staff on duty" value={3} />
        <StatCard label="Levy rate"    value="94%" />
      </div>

      {/* Pending approvals banner */}
      {pending.length > 0 && (
        <div className="rounded-xl p-4" style={{ background:"var(--warning-bg)", border:"1px solid var(--warning-border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-semibold" style={{ color:"var(--warning-text)" }}>
              {pending.length} Pending Approval{pending.length > 1 ? "s" : ""}
            </span>
            <Link href="/approvals" className="text-[12px] font-semibold flex items-center gap-1"
              style={{ color:"var(--warning-text)" }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {pending.slice(0,2).map(a => (
            <div key={a.id} className="flex items-center justify-between py-1.5 text-[13px]">
              <span style={{ color:"var(--warning-text)" }}>
                {a.id} · {a.title}{a.amount ? ` · R${a.amount.toLocaleString()}` : ""}
              </span>
              <span className="text-[12px]" style={{ color:"var(--warning-text)", opacity:0.7 }}>
                {a.votes}/{a.required} votes
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Gate activity */}
        <div className="rounded-xl" style={{ border:"1px solid var(--border)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom:"1px solid var(--border)" }}>
            <div className="flex items-center gap-2">
              <Activity size={14} style={{ color:"var(--active-text)" }} />
              <span className="text-[13px] font-semibold" style={{ color:"var(--text)" }}>Gate Activity</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                style={{ background:"var(--success-bg)", color:"var(--success-text)" }}>LIVE</span>
            </div>
            <Link href="/gates" className="text-[12px]" style={{ color:"var(--active-text)" }}>View all →</Link>
          </div>
          <div className="divide-y" style={{ borderColor:"var(--border-subtle)" }}>
            {MOCK_ACCESS_LOG.slice(0,5).map(entry => (
              <div key={entry.id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <div className="text-[13px] font-medium" style={{ color:"var(--text)" }}>
                    {entry.person}
                  </div>
                  <div className="text-[11px]" style={{ color:"var(--text-dim)" }}>{entry.gate}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-mono" style={{ color:"var(--text-muted)" }}>{entry.time}</div>
                  <Badge variant={entry.type === "guest" ? "info" : entry.type === "override" ? "warning" : "neutral"}>
                    {entry.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance snapshot */}
        <div className="rounded-xl" style={{ border:"1px solid var(--border)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom:"1px solid var(--border)" }}>
            <div className="flex items-center gap-2">
              <Ticket size={14} style={{ color:"var(--active-text)" }} />
              <span className="text-[13px] font-semibold" style={{ color:"var(--text)" }}>Open Maintenance</span>
            </div>
            <Link href="/maintenance" className="text-[12px]" style={{ color:"var(--active-text)" }}>View all →</Link>
          </div>
          <div className="px-4 py-3 grid grid-cols-2 gap-2">
            {[
              { label:"Submitted",    count: MOCK_MAINTENANCE.filter(m=>m.status==="submitted").length    },
              { label:"Under Review", count: MOCK_MAINTENANCE.filter(m=>m.status==="under_review").length },
              { label:"In Progress",  count: MOCK_MAINTENANCE.filter(m=>m.status==="in_progress").length  },
              { label:"Assigned",     count: MOCK_MAINTENANCE.filter(m=>m.status==="assigned").length     },
            ].map(s => (
              <div key={s.label} className="px-3 py-2.5 rounded-lg"
                style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
                <div className="text-[11px]" style={{ color:"var(--text-dim)" }}>{s.label}</div>
                <div className="text-[22px] font-bold" style={{ color:"var(--text)" }}>{s.count}</div>
              </div>
            ))}
          </div>
          <div className="px-4 pb-3 space-y-2">
            {MOCK_MAINTENANCE.filter(m=>m.status!=="resolved").slice(0,3).map(t => (
              <div key={t.id} className="flex items-center justify-between py-1.5 border-t"
                style={{ borderColor:"var(--border-subtle)" }}>
                <div>
                  <div className="text-[13px] font-medium" style={{ color:"var(--text)" }}>{t.title}</div>
                  <div className="text-[11px]" style={{ color:"var(--text-dim)" }}>{t.id} · Unit {t.unit} · {t.age}</div>
                </div>
                <Badge variant={t.priority==="high" ? "danger" : t.priority==="medium" ? "warning" : "neutral"}>
                  {t.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Announcements prompt */}
      <div className="rounded-xl p-4 flex items-center justify-between"
        style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background:"var(--accent-muted)" }}>
            <Users size={14} style={{ color:"var(--active-text)" }} />
          </div>
          <div>
            <div className="text-[13px] font-semibold" style={{ color:"var(--text)" }}>Announcements</div>
            <div className="text-[12px]" style={{ color:"var(--text-muted)" }}>Last sent 2 days ago · 98 residents</div>
          </div>
        </div>
        <Link href="/announcements"
          className="px-4 py-2 rounded-lg text-[13px] font-semibold"
          style={{ background:"var(--accent)", color:"#FFFFFF" }}>
          Compose →
        </Link>
      </div>
    </div>
  );
}
