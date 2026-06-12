"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MOCK_PORTFOLIO } from "@/lib/mock-data";
import { PageHeader, Badge, Btn } from "@/components/ui";

const MANAGERS = MOCK_PORTFOLIO.map((e, i) => ({
  id: `m${i}`,
  name: e.manager,
  estate: e.name,
  phone: ["+27 82 111 2233", "+27 73 222 3344", "+27 84 333 4455"][i],
  lastLogin: e.managerLastActive,
  status: "active" as const,
}));

export default function CorporateManagersPage() {
  const [selected, setSelected] = useState<typeof MANAGERS[0] | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="fade-in">
      <PageHeader
        title="Managers"
        subtitle={`${MANAGERS.length} estate managers`}
        action={<Btn variant="primary" size="sm" onClick={() => setShowInvite(true)}><Plus size={13} /> Add Manager</Btn>}
      />

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
              {["Name", "Estate", "Phone", "Last Active", "Status", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: "var(--text-dim)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MANAGERS.map(m => (
              <tr key={m.id} style={{ borderBottom: "1px solid var(--border-subtle)", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--hover)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <td className="px-4 py-3 font-medium" style={{ color: "var(--text)" }}>{m.name}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{m.estate}</td>
                <td className="px-4 py-3 font-mono text-[12px]" style={{ color: "var(--text-muted)" }}>{m.phone}</td>
                <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>{m.lastLogin}</td>
                <td className="px-4 py-3"><Badge variant="active">{m.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setSelected(m)} className="text-[12px] font-medium cursor-pointer" style={{ color: "var(--active-text)" }}>View</button>
                    <button className="text-[12px] font-medium cursor-pointer" style={{ color: "var(--active-text)" }}>Message</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex"
          style={{ background: "rgba(0,0,0,0.2)" }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="ml-auto w-96 h-full p-6 slide-in overflow-y-auto"
            style={{ background: "var(--bg)", borderLeft: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-bold mb-2"
                  style={{ background: "var(--accent-muted)", color: "var(--active-text)" }}>
                  {selected.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <h2 className="text-[16px] font-semibold" style={{ color: "var(--text)" }}>{selected.name}</h2>
                <div className="text-[12px]" style={{ color: "var(--text-muted)" }}>{selected.estate}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-[20px] cursor-pointer" style={{ color: "var(--text-dim)" }}>×</button>
            </div>
            <div className="space-y-2 text-[13px] mb-5" style={{ color: "var(--text-muted)" }}>
              <div>📞 {selected.phone}</div>
              <div>🕒 Last active: {selected.lastLogin}</div>
              <div><Badge variant="active">{selected.status}</Badge></div>
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: "var(--text-muted)" }}>
              Recent Activity
            </div>
            <div className="space-y-1.5 text-[12px] mb-5" style={{ color: "var(--text-dim)" }}>
              <div>· Added resident Unit 047 — 1h ago</div>
              <div>· Closed maintenance ticket TKT-006 — 2h ago</div>
              <div>· Sent announcement to all residents — Yesterday</div>
              <div>· Approved contractor quote — 2 days ago</div>
            </div>
            <div className="flex gap-2">
              <Btn variant="secondary" onClick={() => setSelected(null)}>Close</Btn>
              <Btn variant="primary">Message</Btn>
            </div>
          </div>
        </div>
      )}

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.3)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowInvite(false); }}>
          <div className="rounded-2xl p-6 w-full max-w-md slide-in"
            style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
            <h2 className="text-[16px] font-semibold mb-5" style={{ color: "var(--text)" }}>Invite Manager</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--text-muted)" }}>Full Name *</label>
                <input className="w-full px-3 py-2.5 rounded-lg text-[13px]" placeholder="e.g. Amara Khumalo"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text)", outline: "none" }} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--text-muted)" }}>Email *</label>
                <input type="email" className="w-full px-3 py-2.5 rounded-lg text-[13px]" placeholder="manager@estate.co.za"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text)", outline: "none" }} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--text-muted)" }}>Assign Estate *</label>
                <select className="w-full px-3 py-2.5 rounded-lg text-[13px] cursor-pointer"
                  style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)", color: "var(--text)", outline: "none" }}>
                  {MOCK_PORTFOLIO.map(e => <option key={e.id}>{e.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Btn variant="secondary" onClick={() => setShowInvite(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={() => setShowInvite(false)}>Send Invite</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
