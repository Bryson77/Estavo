"use client";
import { PageHeader } from "@/components/ui";

function Toggle({ label, description, locked }: { label:string; description?:string; locked?:boolean }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom:"1px solid var(--border-subtle)" }}>
      <div>
        <div className="text-[13px] font-medium" style={{ color:"var(--text)" }}>{label}</div>
        {description && <div className="text-[12px] mt-0.5" style={{ color:"var(--text-dim)" }}>{description}</div>}
        {locked && <div className="text-[11px] mt-0.5 font-semibold" style={{ color:"var(--warning-text)" }}>Core function — cannot disable</div>}
      </div>
      <div className="relative w-9 h-5 rounded-full cursor-pointer"
        style={{ background: "var(--accent)", opacity: locked ? 0.6 : 1 }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full shadow" style={{ background:"#fff", transform:"translateX(17px)" }}/>
      </div>
    </div>
  );
}

export default function TrusteeSettingsPage() {
  return (
    <div className="fade-in space-y-4">
      <PageHeader title="Settings" subtitle="Profile and notification preferences" />
      <div className="rounded-xl p-5" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-4 pb-2"
          style={{ color:"var(--text-muted)", borderBottom:"1px solid var(--border)" }}>Profile</div>
        <div className="space-y-2 text-[13px]">
          <div className="grid grid-cols-2 gap-2">
            <div style={{ color:"var(--text-muted)" }}>Name</div>
            <div style={{ color:"var(--text)" }}>John Mokoena</div>
            <div style={{ color:"var(--text-muted)" }}>Email</div>
            <div style={{ color:"var(--text)" }}>john@email.com <span className="text-[11px]" style={{ color:"var(--text-dim)" }}>(read-only)</span></div>
            <div style={{ color:"var(--text-muted)" }}>Estate</div>
            <div style={{ color:"var(--text)" }}>The Hudson Estate <span className="text-[11px]" style={{ color:"var(--text-dim)" }}>(read-only)</span></div>
            <div style={{ color:"var(--text-muted)" }}>Phone</div>
            <div><input defaultValue="+27 82 111 2233" className="px-2 py-1 rounded text-[13px]"
              style={{ background:"var(--input-bg)", border:"1px solid var(--input-border)", color:"var(--text)", outline:"none" }}/></div>
          </div>
        </div>
        <button className="mt-3 text-[12px] font-semibold cursor-pointer" style={{ color:"var(--active-text)" }}>Save changes</button>
      </div>
      <div className="rounded-xl p-5" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-1 pb-2"
          style={{ color:"var(--text-muted)", borderBottom:"1px solid var(--border)" }}>Notifications</div>
        <Toggle label="New approval requests" locked/>
        <Toggle label="Approval threshold reached"/>
        <Toggle label="Meeting scheduled"/>
        <Toggle label="Document expiring"/>
      </div>
      <div className="rounded-xl p-5" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3 pb-2"
          style={{ color:"var(--text-muted)", borderBottom:"1px solid var(--border)" }}>Legal</div>
        {["Privacy Policy","Terms of Service"].map(l=>(
          <button key={l} className="block text-[13px] cursor-pointer w-full text-left py-1.5"
            style={{ color:"var(--active-text)" }}>{l} →</button>
        ))}
      </div>
    </div>
  );
}
