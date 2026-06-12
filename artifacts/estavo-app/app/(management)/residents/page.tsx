"use client";

import { useState } from "react";
import { Plus, Search, Download, UserPlus } from "lucide-react";
import { MOCK_RESIDENTS } from "@/lib/mock-data";
import { PageHeader, Badge, PillFilter, Btn } from "@/components/ui";

type Filter = "All" | "Active" | "Inactive" | "Vacant";
const FILTERS: Filter[] = ["All","Active","Inactive","Vacant"];

export default function ResidentsPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = MOCK_RESIDENTS.filter(r => {
    const matchF = filter==="All" || r.status===filter.toLowerCase() || (filter==="Vacant" && r.status==="vacant");
    const matchS = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.unit.includes(search);
    return matchF && matchS;
  });

  return (
    <div className="fade-in">
      <PageHeader
        title="Residents"
        subtitle={`${MOCK_RESIDENTS.filter(r=>r.status==="active").length} registered · ${MOCK_RESIDENTS.filter(r=>r.status==="vacant").length} vacant`}
        action={
          <div className="flex gap-2">
            <Btn variant="secondary" size="sm"><Download size={13}/> Export</Btn>
            <Btn variant="primary" size="sm" onClick={()=>setShowAdd(true)}><Plus size={13}/> Add Resident</Btn>
          </div>
        }
      />

      <div className="flex gap-3 mb-4 flex-wrap">
        <PillFilter options={FILTERS} value={filter} onChange={v=>setFilter(v as Filter)} />
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"var(--text-dim)" }} />
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search name or unit…"
            className="pl-8 pr-3 py-1.5 rounded-lg text-[13px] w-56"
            style={{ background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text)", outline:"none" }}
          />
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border:"1px solid var(--border)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)" }}>
              {["Unit","Owner / Name","Email","Type","Status","Last Active","Actions"].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color:"var(--text-dim)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r=>(
              <tr key={r.id} className="transition-colors"
                style={{ borderBottom:"1px solid var(--border-subtle)" }}
                onMouseEnter={e=>(e.currentTarget.style.background="var(--hover)")}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <td className="px-4 py-3 font-mono font-semibold text-[12px]" style={{ color:"var(--active-text)" }}>{r.unit}</td>
                <td className="px-4 py-3 font-medium" style={{ color:"var(--text)" }}>{r.name}</td>
                <td className="px-4 py-3" style={{ color:"var(--text-muted)" }}>{r.email}</td>
                <td className="px-4 py-3" style={{ color:"var(--text-muted)" }}>{r.type}</td>
                <td className="px-4 py-3">
                  <Badge variant={r.status==="active" ? "success" : r.status==="inactive" ? "neutral" : "warning"}>
                    {r.status}
                  </Badge>
                </td>
                <td className="px-4 py-3" style={{ color:"var(--text-muted)" }}>{r.lastActive}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {r.status==="vacant" ? (
                      <button className="text-[12px] font-medium cursor-pointer" style={{ color:"var(--active-text)" }}>
                        Invite
                      </button>
                    ) : (
                      <>
                        <button className="text-[12px] font-medium cursor-pointer" style={{ color:"var(--active-text)" }}>View</button>
                        <button className="text-[12px] font-medium cursor-pointer" style={{ color:"var(--active-text)" }}>Edit</button>
                        {r.status==="active" && (
                          <button className="text-[12px] font-medium cursor-pointer" style={{ color:"var(--danger-text)" }}>Deactivate</button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Resident Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background:"rgba(0,0,0,0.3)" }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowAdd(false); }}>
          <div className="rounded-2xl p-6 w-full max-w-md slide-in"
            style={{ background:"var(--bg)", border:"1px solid var(--border)" }}>
            <h2 className="text-[16px] font-semibold mb-5" style={{ color:"var(--text)" }}>
              <UserPlus size={16} className="inline mr-2" style={{ color:"var(--active-text)" }}/>
              Add Resident
            </h2>
            {[
              { label:"Unit Number *", placeholder:"e.g. 042", type:"text" },
              { label:"Full Name *",   placeholder:"e.g. Thabo Mokoena", type:"text" },
              { label:"Email *",       placeholder:"thabo@email.com",   type:"email" },
              { label:"Phone",         placeholder:"+27 82 000 0000",   type:"tel" },
            ].map(f=>(
              <div key={f.label} className="mb-3">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5"
                  style={{ color:"var(--text-muted)" }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 rounded-lg text-[13px]"
                  style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}/>
              </div>
            ))}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5"
                style={{ color:"var(--text-muted)" }}>Type</label>
              <select className="w-full px-3 py-2.5 rounded-lg text-[13px] cursor-pointer"
                style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}>
                <option>Owner</option>
                <option>Tenant</option>
              </select>
            </div>
            <div className="flex gap-2 mt-5">
              <Btn variant="secondary" onClick={()=>setShowAdd(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={()=>setShowAdd(false)}>Send Invite</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
