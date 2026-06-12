"use client";

import { useState } from "react";
import { Plus, Download } from "lucide-react";
import { MOCK_MAINTENANCE } from "@/lib/mock-data";
import { PageHeader, Badge, Btn } from "@/components/ui";

type Status = "submitted"|"under_review"|"assigned"|"in_progress"|"resolved";

const COLUMNS: { id: Status; label: string }[] = [
  { id:"submitted",    label:"Submitted"    },
  { id:"under_review", label:"Under Review" },
  { id:"assigned",     label:"Assigned"     },
  { id:"in_progress",  label:"In Progress"  },
  { id:"resolved",     label:"Resolved"     },
];

function PriorityDot({ priority }: { priority: string }) {
  const c = priority==="high" ? "var(--danger)" : priority==="medium" ? "var(--warning)" : "var(--neutral)";
  return <span className="w-2 h-2 rounded-full inline-block" style={{ background:c }}/>;
}

export default function MaintenancePage() {
  const [selected, setSelected] = useState<typeof MOCK_MAINTENANCE[0]|null>(null);

  return (
    <div className="fade-in">
      <PageHeader
        title="Maintenance"
        subtitle={`${MOCK_MAINTENANCE.filter(m=>m.status!=="resolved").length} open tickets`}
        action={
          <div className="flex gap-2">
            <Btn variant="secondary" size="sm"><Download size={13}/> Download logs</Btn>
            <Btn variant="primary" size="sm"><Plus size={13}/> New Ticket</Btn>
          </div>
        }
      />

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight:"400px" }}>
        {COLUMNS.map(col => {
          const tickets = MOCK_MAINTENANCE.filter(m=>m.status===col.id);
          return (
            <div key={col.id} className="flex-shrink-0 w-64">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color:"var(--text-muted)" }}>
                  {col.label}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                  style={{ background:"var(--surface-2)", color:"var(--text-dim)" }}>
                  {tickets.length}
                </span>
              </div>
              <div className="space-y-2">
                {tickets.map(t=>(
                  <button key={t.id}
                    onClick={()=>setSelected(t)}
                    className="w-full text-left rounded-xl p-3.5 cursor-pointer transition-all"
                    style={{ background:"var(--surface)", border:`1px solid var(--border)` }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <PriorityDot priority={t.priority}/>
                      <span className="text-[10px] font-mono" style={{ color:"var(--text-dim)" }}>{t.id}</span>
                      <Badge variant={t.priority==="high" ? "danger" : t.priority==="medium" ? "warning" : "neutral"}>
                        {t.priority}
                      </Badge>
                    </div>
                    <div className="text-[13px] font-medium leading-tight mb-1" style={{ color:"var(--text)" }}>
                      {t.title}
                    </div>
                    <div className="text-[11px]" style={{ color:"var(--text-dim)" }}>
                      Unit {t.unit} · {t.category} · {t.age}
                    </div>
                    {t.assignee && (
                      <div className="mt-2 text-[11px] px-2 py-1 rounded-md"
                        style={{ background:"var(--accent-muted)", color:"var(--active-text)" }}>
                        → {t.assignee}
                      </div>
                    )}
                  </button>
                ))}
                {tickets.length === 0 && (
                  <div className="rounded-xl p-4 text-center text-[12px]"
                    style={{ border:"1px dashed var(--border)", color:"var(--text-dim)" }}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket detail slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50 flex"
          style={{ background:"rgba(0,0,0,0.2)" }}
          onClick={e=>{ if(e.target===e.currentTarget) setSelected(null); }}>
          <div className="ml-auto w-full max-w-md h-full overflow-y-auto slide-in"
            style={{ background:"var(--bg)", borderLeft:"1px solid var(--border)" }}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[11px] font-mono" style={{ color:"var(--text-dim)" }}>{selected.id}</span>
                  <h2 className="text-[16px] font-semibold mt-0.5" style={{ color:"var(--text)" }}>{selected.title}</h2>
                </div>
                <button onClick={()=>setSelected(null)} className="text-[20px] cursor-pointer" style={{ color:"var(--text-dim)" }}>×</button>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant={selected.priority==="high" ? "danger" : selected.priority==="medium" ? "warning" : "neutral"}>
                    {selected.priority} priority
                  </Badge>
                  <Badge variant="neutral">{selected.category}</Badge>
                </div>
                <div className="text-[13px]" style={{ color:"var(--text-muted)" }}>
                  Unit {selected.unit} · Submitted {selected.age} ago
                </div>
                {selected.assignee && (
                  <div className="px-3 py-2 rounded-lg text-[13px]"
                    style={{ background:"var(--accent-muted)", color:"var(--active-text)" }}>
                    Assigned to: {selected.assignee}
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-2"
                    style={{ color:"var(--text-muted)" }}>Assign to</label>
                  <select className="w-full px-3 py-2.5 rounded-lg text-[13px]"
                    style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}>
                    <option>— Select staff member —</option>
                    <option>James Dlamini</option>
                    <option>Priya Reddy</option>
                    <option>Sipho Khumalo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-2"
                    style={{ color:"var(--text-muted)" }}>Internal Notes</label>
                  <textarea rows={4} className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none"
                    placeholder="Add note…"
                    style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}/>
                </div>
                <div className="flex gap-2 pt-2">
                  <Btn variant="secondary" onClick={()=>setSelected(null)}>Close</Btn>
                  <Btn variant="primary">Mark Resolved</Btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
