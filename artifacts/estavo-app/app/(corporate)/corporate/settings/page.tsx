"use client";
import { PageHeader } from "@/components/ui";
import { MOCK_PORTFOLIO } from "@/lib/mock-data";

function Toggle({ label, description }: { label:string; description?:string }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom:"1px solid var(--border-subtle)" }}>
      <div>
        <div className="text-[13px] font-medium" style={{ color:"var(--text)" }}>{label}</div>
        {description && <div className="text-[12px] mt-0.5" style={{ color:"var(--text-dim)" }}>{description}</div>}
      </div>
      <div className="relative w-9 h-5 rounded-full cursor-pointer" style={{ background:"var(--accent)" }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full shadow" style={{ background:"#fff", transform:"translateX(17px)" }}/>
      </div>
    </div>
  );
}

export default function CorporateSettingsPage() {
  return (
    <div className="fade-in space-y-4">
      <PageHeader title="Settings" subtitle="Account and notification preferences"/>
      <div className="rounded-xl p-5" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-4 pb-2"
          style={{ color:"var(--text-muted)", borderBottom:"1px solid var(--border)" }}>Profile</div>
        <div className="grid grid-cols-3 gap-2 text-[13px]">
          {[
            { label:"Name",         value:"Bryson Anderson" },
            { label:"Email",        value:"bryson@corp.co.za" },
            { label:"Company",      value:"Anderson Property Group" },
          ].map(f=>(
            <>
              <div key={f.label} style={{ color:"var(--text-muted)" }}>{f.label}</div>
              <div className="col-span-2" style={{ color:"var(--text)" }}>{f.value}</div>
            </>
          ))}
        </div>
      </div>
      <div className="rounded-xl p-5" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1 pb-2"
          style={{ color:"var(--text-muted)", borderBottom:"1px solid var(--border)" }}>
          Assigned Estates <span className="text-[10px] ml-1">(read-only — set by superadmin)</span>
        </div>
        <div className="space-y-1 mt-3">
          {MOCK_PORTFOLIO.map(e=>(
            <div key={e.id} className="text-[13px] py-1.5 flex items-center gap-2"
              style={{ color:"var(--text-muted)", borderBottom:"1px solid var(--border-subtle)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background:"var(--success)" }}/>
              {e.name} · {e.address}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl p-5" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1 pb-2"
          style={{ color:"var(--text-muted)", borderBottom:"1px solid var(--border)" }}>Notifications</div>
        <Toggle label="Estate score drops below 70" description="Trigger: nightly performance check"/>
        <Toggle label="Compliance item overdue"/>
        <Toggle label="Document expiring in <30 days"/>
        <Toggle label="Manager inactive for >3 days"/>
      </div>
    </div>
  );
}
