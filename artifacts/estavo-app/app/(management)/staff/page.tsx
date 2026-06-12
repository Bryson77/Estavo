"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { MOCK_STAFF } from "@/lib/mock-data";
import { PageHeader, Badge, Btn, PillFilter } from "@/components/ui";

const ROLE_LABEL: Record<string, string> = {
  security_guard:"Security Guard", gate_operator:"Gate Operator",
  maintenance:"Maintenance", cleaner:"Cleaner", other:"Other",
};

export default function StaffPage() {
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = MOCK_STAFF.filter(s =>
    filter === "All" || s.status === filter.toLowerCase()
  );

  return (
    <div className="fade-in">
      <PageHeader
        title="Staff"
        subtitle={`${MOCK_STAFF.filter(s=>s.status==="active").length} active`}
        action={<Btn variant="primary" size="sm" onClick={()=>setShowAdd(true)}><Plus size={13}/> Add Staff</Btn>}
      />

      <div className="mb-4">
        <PillFilter options={["All","Active","Inactive"]} value={filter} onChange={setFilter}/>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border:"1px solid var(--border)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)" }}>
              {["Name","Role","Email","Status","Last Login","Actions"].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color:"var(--text-dim)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s=>(
              <tr key={s.id} style={{ borderBottom:"1px solid var(--border-subtle)" }}
                onMouseEnter={e=>(e.currentTarget.style.background="var(--hover)")}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <td className="px-4 py-3 font-medium" style={{ color:"var(--text)" }}>{s.name}</td>
                <td className="px-4 py-3" style={{ color:"var(--text-muted)" }}>{ROLE_LABEL[s.role]}</td>
                <td className="px-4 py-3" style={{ color:"var(--text-muted)" }}>{s.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={s.status==="active" ? "active" : "inactive"}>{s.status}</Badge>
                </td>
                <td className="px-4 py-3" style={{ color:"var(--text-muted)" }}>{s.lastLogin}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-[12px] font-medium cursor-pointer" style={{ color:"var(--active-text)" }}>View</button>
                    <button className="text-[12px] font-medium cursor-pointer" style={{ color:"var(--active-text)" }}>Edit</button>
                    <button className="text-[12px] font-medium cursor-pointer"
                      style={{ color: s.status==="active" ? "var(--danger-text)" : "var(--success-text)" }}>
                      {s.status==="active" ? "Deactivate" : "Reactivate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background:"rgba(0,0,0,0.3)" }}
          onClick={e=>{ if(e.target===e.currentTarget) setShowAdd(false); }}>
          <div className="rounded-2xl p-6 w-full max-w-md slide-in"
            style={{ background:"var(--bg)", border:"1px solid var(--border)" }}>
            <h2 className="text-[16px] font-semibold mb-5" style={{ color:"var(--text)" }}>Add Staff Member</h2>
            {[
              { label:"Full Name *", placeholder:"e.g. James Dlamini" },
              { label:"Email *",     placeholder:"james@estate.co.za" },
            ].map(f=>(
              <div key={f.label} className="mb-3">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--text-muted)" }}>{f.label}</label>
                <input placeholder={f.placeholder} className="w-full px-3 py-2.5 rounded-lg text-[13px]"
                  style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}/>
              </div>
            ))}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--text-muted)" }}>Role</label>
              <select className="w-full px-3 py-2.5 rounded-lg text-[13px] cursor-pointer"
                style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}>
                {Object.entries(ROLE_LABEL).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Btn variant="secondary" onClick={()=>setShowAdd(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={()=>setShowAdd(false)}>Send Invite</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
