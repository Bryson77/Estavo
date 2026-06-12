"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { MOCK_COMPLIANCE, MOCK_PORTFOLIO } from "@/lib/mock-data";
import { PageHeader } from "@/components/ui";

type CellStatus = "valid"|"submitted"|"in_progress"|"warning"|"expired";

const CELL_STYLES: Record<CellStatus, { bg:string; color:string; icon:string }> = {
  valid:       { bg:"var(--success-bg)",  color:"var(--success-text)",  icon:"✅" },
  submitted:   { bg:"var(--success-bg)",  color:"var(--success-text)",  icon:"✅" },
  in_progress: { bg:"var(--info-bg)",     color:"var(--info-text)",     icon:"⏳" },
  warning:     { bg:"var(--warning-bg)",  color:"var(--warning-text)",  icon:"⚠️" },
  expired:     { bg:"var(--danger-bg)",   color:"var(--danger-text)",   icon:"🔴" },
};

export default function CorporateCompliancePage() {
  const [focused, setFocused] = useState<{ item:string; estate:string; status:CellStatus; label:string }|null>(null);

  return (
    <div className="fade-in">
      <PageHeader
        title="Compliance"
        subtitle="Compliance matrix across all estates"
        action={
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold cursor-pointer"
            style={{ background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text-muted)" }}>
            <Download size={13}/> Export PDF
          </button>
        }
      />

      <div className="rounded-xl overflow-x-auto" style={{ border:"1px solid var(--border)" }}>
        <table className="w-full text-[12px]" style={{ minWidth:"600px" }}>
          <thead>
            <tr style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)" }}>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
                style={{ color:"var(--text-dim)" }}>Compliance Item</th>
              {MOCK_PORTFOLIO.map(e=>(
                <th key={e.id} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color:"var(--text-dim)" }}>
                  {e.name.split(" ").slice(0,2).join(" ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_COMPLIANCE.map(row=>(
              <tr key={row.item} style={{ borderBottom:"1px solid var(--border-subtle)" }}>
                <td className="px-4 py-3 font-medium" style={{ color:"var(--text)" }}>{row.item}</td>
                {MOCK_PORTFOLIO.map(e=>{
                  const cell = row.estates[e.id as keyof typeof row.estates];
                  const style = CELL_STYLES[cell.status as CellStatus];
                  const isAction = cell.status === "warning" || cell.status === "expired";
                  return (
                    <td key={e.id} className="px-4 py-3">
                      <button
                        onClick={()=>isAction ? setFocused({ item:row.item, estate:e.name, status:cell.status as CellStatus, label:cell.label }) : undefined}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap ${isAction ? "cursor-pointer" : "cursor-default"}`}
                        style={{ background:style.bg, color:style.color }}>
                        {style.icon} {cell.label}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail slide-over */}
      {focused && (
        <div className="fixed inset-0 z-50 flex"
          style={{ background:"rgba(0,0,0,0.2)" }}
          onClick={e=>{ if(e.target===e.currentTarget) setFocused(null); }}>
          <div className="ml-auto w-96 h-full p-6 slide-in overflow-y-auto"
            style={{ background:"var(--bg)", borderLeft:"1px solid var(--border)" }}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-[15px] font-semibold" style={{ color:"var(--text)" }}>{focused.item}</h2>
              <button onClick={()=>setFocused(null)} className="text-[20px] cursor-pointer" style={{ color:"var(--text-dim)" }}>×</button>
            </div>
            <div className="text-[13px] mb-3" style={{ color:"var(--text-muted)" }}>{focused.estate}</div>
            <div className="px-3 py-2.5 rounded-lg text-[13px] mb-5"
              style={{
                background: CELL_STYLES[focused.status].bg,
                color: CELL_STYLES[focused.status].color,
              }}>
              {focused.label}
            </div>
            <p className="text-[13px] mb-5" style={{ color:"var(--text-muted)" }}>
              {focused.status === "expired"
                ? "This compliance item has expired and requires immediate attention. Upload the updated document to the estate's document vault."
                : "This compliance item is due soon. Please ensure the document is uploaded before the deadline."}
            </p>
            <button className="w-full py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer"
              style={{ background:"var(--accent)", color:"#fff" }}>
              Upload Document →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
