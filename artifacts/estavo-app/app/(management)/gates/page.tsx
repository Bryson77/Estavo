"use client";

import { useState } from "react";
import { Shield, Activity, Download } from "lucide-react";
import { MOCK_GATES, MOCK_ACCESS_LOG, MOCK_GUEST_CODES } from "@/lib/mock-data";
import { PageHeader, Badge, PillFilter } from "@/components/ui";

export default function GatesPage() {
  const [logFilter, setLogFilter] = useState("All");
  const [codeFilter, setCodeFilter] = useState("All");

  const filteredLog = MOCK_ACCESS_LOG.filter(e =>
    logFilter === "All" || e.type === logFilter.toLowerCase()
  );

  return (
    <div className="fade-in space-y-6">
      <PageHeader title="Gate & Access" subtitle="Live gate status and access log" />

      {/* Gate status */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color:"var(--text-muted)" }}>Gate Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MOCK_GATES.map(g => (
            <div key={g.id} className="rounded-xl p-4" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-[14px] font-semibold" style={{ color:"var(--text)" }}>{g.name}</div>
                  <div className="text-[11px] capitalize" style={{ color:"var(--text-dim)" }}>{g.type}</div>
                </div>
                <Badge variant={g.status === "online" ? "online" : "offline"}>{g.status}</Badge>
              </div>
              <div className="text-[11px] mb-3" style={{ color:"var(--text-dim)" }}>
                Last: {g.lastActivity}
              </div>
              {g.status === "online" && (
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-lg text-[12px] font-semibold cursor-pointer transition-colors"
                    style={{ background:"var(--accent)", color:"#FFFFFF" }}>
                    Hold to Open
                  </button>
                  <button className="px-3 py-2 rounded-lg text-[12px] font-semibold cursor-pointer"
                    style={{ background:"var(--surface-2)", color:"var(--text-muted)", border:"1px solid var(--border)" }}>
                    Lock
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Access Log */}
      <div className="rounded-xl" style={{ border:"1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom:"1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <Activity size={14} style={{ color:"var(--active-text)" }} />
            <span className="text-[13px] font-semibold" style={{ color:"var(--text)" }}>Access Log</span>
            <PillFilter
              options={["All","Resident","Guest","Override"]}
              value={logFilter}
              onChange={setLogFilter}
            />
          </div>
          <button className="flex items-center gap-1.5 text-[12px] cursor-pointer px-3 py-1.5 rounded-lg"
            style={{ color:"var(--text-muted)", border:"1px solid var(--border)" }}>
            <Download size={12}/> Export
          </button>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ borderBottom:"1px solid var(--border-subtle)" }}>
              {["Time","Person","Type","Gate","Code"].map(h=>(
                <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color:"var(--text-dim)", background:"var(--surface)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredLog.map(e=>(
              <tr key={e.id} style={{ borderBottom:"1px solid var(--border-subtle)" }}
                onMouseEnter={ev=>(ev.currentTarget.style.background="var(--hover)")}
                onMouseLeave={ev=>(ev.currentTarget.style.background="transparent")}>
                <td className="px-4 py-3 font-mono text-[12px]" style={{ color:"var(--text-muted)" }}>{e.time}</td>
                <td className="px-4 py-3 font-medium" style={{ color:"var(--text)" }}>{e.person}</td>
                <td className="px-4 py-3">
                  <Badge variant={e.type==="guest" ? "info" : e.type==="override" ? "warning" : "neutral"}>
                    {e.type}
                  </Badge>
                </td>
                <td className="px-4 py-3" style={{ color:"var(--text-muted)" }}>{e.gate}</td>
                <td className="px-4 py-3 font-mono text-[12px]" style={{ color:"var(--text-muted)" }}>{e.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Active Guest Codes */}
      <div className="rounded-xl" style={{ border:"1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom:"1px solid var(--border)" }}>
          <span className="text-[13px] font-semibold" style={{ color:"var(--text)" }}>Active Guest Codes</span>
          <PillFilter options={["All","Active","Inside","Expired"]} value={codeFilter} onChange={setCodeFilter} />
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ borderBottom:"1px solid var(--border-subtle)" }}>
              {["Code","Created By","Guest Name","Validity","Uses","Status"].map(h=>(
                <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color:"var(--text-dim)", background:"var(--surface)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_GUEST_CODES.map(c=>(
              <tr key={c.code} style={{ borderBottom:"1px solid var(--border-subtle)" }}
                onMouseEnter={ev=>(ev.currentTarget.style.background="var(--hover)")}
                onMouseLeave={ev=>(ev.currentTarget.style.background="transparent")}>
                <td className="px-4 py-3 font-mono font-semibold text-[12px]" style={{ color:"var(--active-text)" }}>{c.code}</td>
                <td className="px-4 py-3" style={{ color:"var(--text-muted)" }}>{c.createdBy}</td>
                <td className="px-4 py-3 font-medium" style={{ color:"var(--text)" }}>{c.guestName}</td>
                <td className="px-4 py-3" style={{ color:"var(--text-muted)" }}>{c.validity}</td>
                <td className="px-4 py-3 font-mono text-[12px]" style={{ color:"var(--text-muted)" }}>{c.uses}</td>
                <td className="px-4 py-3">
                  <Badge variant={c.status==="inside" ? "info" : "success"}>{c.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
