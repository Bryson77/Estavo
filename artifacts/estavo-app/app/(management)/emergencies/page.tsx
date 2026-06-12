import { AlertTriangle, Phone } from "lucide-react";
import { MOCK_EMERGENCIES } from "@/lib/mock-data";
import { PageHeader, Badge } from "@/components/ui";

export default function EmergenciesPage() {
  return (
    <div className="fade-in">
      <PageHeader title="Emergencies" subtitle="Alert history and estate emergency settings" />

      <div className="rounded-xl p-5 mb-6" style={{ background:"var(--success-bg)", border:"1px solid var(--success-border)" }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background:"var(--success)" }}/>
          <span className="text-[13px] font-semibold" style={{ color:"var(--success-text)" }}>No active emergencies</span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color:"var(--text-muted)" }}>Alert History</h2>
        <div className="rounded-xl overflow-hidden" style={{ border:"1px solid var(--border)" }}>
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)" }}>
                {["Alert ID","Unit","Triggered","Resolved","Duration","Officer","Outcome","Actions"].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color:"var(--text-dim)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_EMERGENCIES.map(e=>(
                <tr key={e.id} style={{ borderBottom:"1px solid var(--border-subtle)" }}
                  onMouseEnter={ev=>(ev.currentTarget.style.background="var(--hover)")}
                  onMouseLeave={ev=>(ev.currentTarget.style.background="transparent")}>
                  <td className="px-4 py-3 font-mono font-semibold text-[12px]" style={{ color:"var(--danger-text)" }}>{e.id}</td>
                  <td className="px-4 py-3 font-medium" style={{ color:"var(--text)" }}>{e.unit}</td>
                  <td className="px-4 py-3" style={{ color:"var(--text-muted)" }}>{e.triggered}</td>
                  <td className="px-4 py-3" style={{ color:"var(--text-muted)" }}>{e.resolved}</td>
                  <td className="px-4 py-3 font-mono text-[12px]" style={{ color:"var(--text-muted)" }}>{e.duration}</td>
                  <td className="px-4 py-3" style={{ color:"var(--text-muted)" }}>{e.officer}</td>
                  <td className="px-4 py-3">
                    <Badge variant={e.outcome.includes("Police") ? "danger" : e.outcome.includes("False") ? "neutral" : "success"}>
                      {e.outcome}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-[12px] cursor-pointer" style={{ color:"var(--active-text)" }}>Export PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl p-5" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
        <h2 className="text-[13px] font-semibold mb-4" style={{ color:"var(--text)" }}>Estate Emergency Settings</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone size={14} style={{ color:"var(--text-dim)" }}/>
              <div>
                <div className="text-[13px] font-medium" style={{ color:"var(--text)" }}>Security Contact</div>
                <div className="text-[12px]" style={{ color:"var(--text-muted)" }}>+27 11 000 1234</div>
              </div>
            </div>
            <button className="text-[12px] font-semibold cursor-pointer" style={{ color:"var(--active-text)" }}>Edit</button>
          </div>
          <div style={{ borderTop:"1px solid var(--border)", paddingTop:"12px" }}>
            <div className="text-[12px] font-semibold mb-2" style={{ color:"var(--text-muted)" }}>
              ESCALATION CONTACTS (auto-notified)
            </div>
            <div className="space-y-1 text-[13px]" style={{ color:"var(--text-muted)" }}>
              <div>Bryson Anderson — Corporate Agent · +27 82 111 2233</div>
              <div>Estate Security Co — Armed Response · +27 11 999 8877</div>
            </div>
            <button className="mt-2 text-[12px] font-semibold cursor-pointer" style={{ color:"var(--active-text)" }}>+ Add contact</button>
          </div>
        </div>
      </div>
    </div>
  );
}
