"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MOCK_CONTRACTORS } from "@/lib/mock-data";
import { PageHeader, Badge, Btn, PillFilter, Stars } from "@/components/ui";

const TRADES = ["All","Plumbing","Electrical","Pest Control","Landscaping","General"];

export default function ContractorsPage() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<typeof MOCK_CONTRACTORS[0]|null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = MOCK_CONTRACTORS.filter(c =>
    filter==="All" || c.trade===filter
  );

  return (
    <div className="fade-in">
      <PageHeader
        title="Contractors"
        subtitle={`${MOCK_CONTRACTORS.filter(c=>c.status==="active").length} contractors · ${new Set(MOCK_CONTRACTORS.map(c=>c.trade)).size} trades`}
        action={<Btn variant="primary" size="sm" onClick={()=>setShowAdd(true)}><Plus size={13}/> Add Contractor</Btn>}
      />

      <div className="mb-4">
        <PillFilter options={TRADES} value={filter} onChange={setFilter} />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border:"1px solid var(--border)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)" }}>
              {["Name","Trade","Phone","Rating","Jobs","Status","Actions"].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color:"var(--text-dim)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c=>(
              <tr key={c.id} style={{ borderBottom:"1px solid var(--border-subtle)" }}
                onMouseEnter={e=>(e.currentTarget.style.background="var(--hover)")}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <td className="px-4 py-3 font-medium" style={{ color:"var(--text)" }}>{c.name}</td>
                <td className="px-4 py-3"><Badge variant="neutral">{c.trade}</Badge></td>
                <td className="px-4 py-3 font-mono text-[12px]" style={{ color:"var(--text-muted)" }}>{c.phone}</td>
                <td className="px-4 py-3"><Stars rating={c.rating}/></td>
                <td className="px-4 py-3" style={{ color:"var(--text-muted)" }}>{c.jobs} jobs</td>
                <td className="px-4 py-3"><Badge variant={c.status==="active" ? "active" : "inactive"}>{c.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={()=>setSelected(c)} className="text-[12px] font-medium cursor-pointer" style={{ color:"var(--active-text)" }}>View</button>
                    <button className="text-[12px] font-medium cursor-pointer" style={{ color:"var(--active-text)" }}>Edit</button>
                    <button className="text-[12px] font-medium cursor-pointer" style={{ color:"var(--danger-text)" }}>Deactivate</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail slide-over */}
      {selected && (
        <div className="fixed inset-0 z-50 flex"
          style={{ background:"rgba(0,0,0,0.2)" }}
          onClick={e=>{ if(e.target===e.currentTarget) setSelected(null); }}>
          <div className="ml-auto w-96 h-full overflow-y-auto slide-in p-6"
            style={{ background:"var(--bg)", borderLeft:"1px solid var(--border)" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-[16px] font-semibold" style={{ color:"var(--text)" }}>{selected.name}</h2>
                <Badge variant="neutral">{selected.trade}</Badge>
              </div>
              <button onClick={()=>setSelected(null)} className="text-[20px] cursor-pointer" style={{ color:"var(--text-dim)" }}>×</button>
            </div>
            <div className="space-y-3 text-[13px]" style={{ color:"var(--text-muted)" }}>
              <div><Stars rating={selected.rating}/></div>
              <div>📞 {selected.phone}</div>
              <div>✉️ {selected.email || "—"}</div>
              <div>{selected.jobs} jobs completed</div>
              <Badge variant={selected.status==="active" ? "active" : "inactive"}>{selected.status}</Badge>
            </div>
            <div className="mt-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color:"var(--text-muted)" }}>Quick actions</div>
              <Btn variant="primary">Request Quote</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Add contractor */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background:"rgba(0,0,0,0.3)" }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowAdd(false); }}>
          <div className="rounded-2xl p-6 w-full max-w-md slide-in"
            style={{ background:"var(--bg)", border:"1px solid var(--border)" }}>
            <h2 className="text-[16px] font-semibold mb-5" style={{ color:"var(--text)" }}>Add Contractor</h2>
            {[
              { label:"Contractor Name *", placeholder:"e.g. SA Plumbing Pro" },
              { label:"Phone *",           placeholder:"011 234 5678" },
              { label:"Email",             placeholder:"info@company.co.za (optional)" },
            ].map(f=>(
              <div key={f.label} className="mb-3">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--text-muted)" }}>{f.label}</label>
                <input placeholder={f.placeholder} className="w-full px-3 py-2.5 rounded-lg text-[13px]"
                  style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}/>
              </div>
            ))}
            <div className="mb-3">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--text-muted)" }}>Trade Category</label>
              <select className="w-full px-3 py-2.5 rounded-lg text-[13px] cursor-pointer"
                style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}>
                {["Plumbing","Electrical","Pest Control","Landscaping","General","Other"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--text-muted)" }}>Notes (optional)</label>
              <textarea rows={2} className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none" placeholder="Any notes…"
                style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}/>
            </div>
            <div className="flex gap-2">
              <Btn variant="secondary" onClick={()=>setShowAdd(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={()=>setShowAdd(false)}>Add Contractor</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
