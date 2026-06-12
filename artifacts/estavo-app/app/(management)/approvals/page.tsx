"use client";

import { useState } from "react";
import { Plus, Paperclip } from "lucide-react";
import { MOCK_APPROVALS } from "@/lib/mock-data";
import { PageHeader, Badge, Btn, PillFilter, ApprovalTypeBadge } from "@/components/ui";

const FILTERS = ["All","Pending","Approved","Rejected","More Info"];

const STATUS_VARIANT: Record<string, any> = {
  pending:"pending", approved:"approved", rejected:"rejected", more_info:"info",
};

export default function ApprovalsPage() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<typeof MOCK_APPROVALS[0]|null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = MOCK_APPROVALS.filter(a =>
    filter==="All" ||
    (filter==="More Info" && a.status==="more_info") ||
    a.status===filter.toLowerCase()
  );

  const pending = MOCK_APPROVALS.filter(a=>a.status==="pending").length;
  const approved = MOCK_APPROVALS.filter(a=>a.status==="approved").length;
  const rejected = MOCK_APPROVALS.filter(a=>a.status==="rejected").length;

  return (
    <div className="fade-in">
      <PageHeader
        title="Approvals"
        subtitle={`${pending} pending · ${approved} approved · ${rejected} rejected`}
        action={<Btn variant="primary" size="sm" onClick={()=>setShowNew(true)}><Plus size={13}/> New Request</Btn>}
      />

      <div className="mb-4">
        <PillFilter options={FILTERS} value={filter} onChange={setFilter}/>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border:"1px solid var(--border)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)" }}>
              {["Ref","Title","Type","Amount","Status","Submitted","Votes","Actions"].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color:"var(--text-dim)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(a=>(
              <tr key={a.id} style={{ borderBottom:"1px solid var(--border-subtle)" }}
                onMouseEnter={e=>(e.currentTarget.style.background="var(--hover)")}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <td className="px-4 py-3 font-mono text-[12px] font-semibold" style={{ color:"var(--active-text)" }}>{a.id}</td>
                <td className="px-4 py-3 font-medium max-w-48" style={{ color:"var(--text)" }}>{a.title}</td>
                <td className="px-4 py-3"><ApprovalTypeBadge type={a.type}/></td>
                <td className="px-4 py-3 font-mono text-[12px]" style={{ color:"var(--text-muted)" }}>
                  {a.amount ? `R${a.amount.toLocaleString()}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[a.status] ?? "neutral"}>
                    {a.status.replace("_"," ")}
                  </Badge>
                </td>
                <td className="px-4 py-3" style={{ color:"var(--text-muted)" }}>{a.submitted}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background:"var(--border)", minWidth:"40px" }}>
                      <div className="h-1.5 rounded-full" style={{ background:"var(--accent)", width:`${(a.votes/a.required)*100}%` }}/>
                    </div>
                    <span className="text-[11px] font-mono" style={{ color:"var(--text-muted)" }}>{a.votes}/{a.required}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={()=>setSelected(a)} className="text-[12px] font-medium cursor-pointer" style={{ color:"var(--active-text)" }}>
                    View
                  </button>
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
          <div className="ml-auto w-full max-w-lg h-full overflow-y-auto slide-in"
            style={{ background:"var(--bg)", borderLeft:"1px solid var(--border)" }}>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono" style={{ color:"var(--text-dim)" }}>{selected.id}</span>
                    <Badge variant={STATUS_VARIANT[selected.status] ?? "neutral"}>
                      {selected.status.replace("_"," ")}
                    </Badge>
                  </div>
                  <h2 className="text-[16px] font-semibold" style={{ color:"var(--text)" }}>{selected.title}</h2>
                </div>
                <button onClick={()=>setSelected(null)} className="text-[20px] cursor-pointer" style={{ color:"var(--text-dim)" }}>×</button>
              </div>

              <div className="flex gap-2">
                <ApprovalTypeBadge type={selected.type}/>
                {selected.amount && (
                  <span className="text-[13px] font-semibold font-mono" style={{ color:"var(--text)" }}>
                    R{selected.amount.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="text-[13px]" style={{ color:"var(--text-muted)" }}>
                Submitted {selected.submitted} · {selected.votes}/{selected.required} votes required
              </div>

              {selected.description && (
                <div className="text-[13px] leading-relaxed" style={{ color:"var(--text-muted)" }}>
                  {selected.description}
                </div>
              )}

              {selected.aiSummary && (
                <div className="rounded-xl px-4 py-3" style={{ background:"var(--info-bg)", border:"1px solid var(--info-border)" }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-1" style={{ color:"var(--info-text)" }}>AI Summary</div>
                  <div className="text-[13px] leading-relaxed" style={{ color:"var(--info-text)" }}>{selected.aiSummary}</div>
                </div>
              )}

              {selected.attachments.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color:"var(--text-muted)" }}>Attachments</div>
                  <div className="flex flex-wrap gap-2">
                    {selected.attachments.map(f=>(
                      <div key={f} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] cursor-pointer"
                        style={{ background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text-muted)" }}>
                        <Paperclip size={11}/>{f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color:"var(--text-muted)" }}>Trustee Votes</div>
                <div className="space-y-2">
                  {selected.trusteeVotes.map((v,i)=>(
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[13px] font-medium" style={{ color:"var(--text)" }}>{v.name}</span>
                      <div className="flex items-center gap-2">
                        {v.comment && <span className="text-[11px] italic" style={{ color:"var(--text-dim)" }}>"{v.comment}"</span>}
                        <Badge variant={v.status==="approved" ? "approved" : v.status==="rejected" ? "rejected" : v.status==="pending" ? "neutral" : "info"}>
                          {v.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background:"rgba(0,0,0,0.3)" }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowNew(false); }}>
          <div className="rounded-2xl p-6 w-full max-w-lg slide-in"
            style={{ background:"var(--bg)", border:"1px solid var(--border)" }}>
            <h2 className="text-[16px] font-semibold mb-5" style={{ color:"var(--text)" }}>New Approval Request</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--text-muted)" }}>Request Type</label>
                <div className="flex gap-2 flex-wrap">
                  {["Quote","Expense","Policy Change","Vendor Onboard"].map(t=>(
                    <button key={t} className="px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer"
                      style={{ background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text-muted)" }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--text-muted)" }}>Title *</label>
                <input className="w-full px-3 py-2.5 rounded-lg text-[13px]" placeholder="e.g. Pool pump replacement"
                  style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}/>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--text-muted)" }}>Description</label>
                <textarea rows={3} className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none"
                  style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}/>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--text-muted)" }}>Amount (R)</label>
                <input type="number" className="w-full px-3 py-2.5 rounded-lg text-[13px]" placeholder="e.g. 14800 (optional for Policy/Vendor)"
                  style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}/>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--text-muted)" }}>Attach Quotes (PDF, max 10MB)</label>
                <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer"
                  style={{ borderColor:"var(--border-strong)", color:"var(--text-dim)" }}>
                  <Paperclip size={16} className="mx-auto mb-1"/>
                  <div className="text-[12px]">Click to upload or drag & drop</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Btn variant="secondary" onClick={()=>setShowNew(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={()=>setShowNew(false)}>Submit for Approval</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
