"use client";

import { PageHeader } from "@/components/ui";

function Toggle({ label, description, defaultOn = true }: { label:string; description?:string; defaultOn?:boolean }) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottom:"1px solid var(--border-subtle)" }}>
      <div>
        <div className="text-[13px] font-medium" style={{ color:"var(--text)" }}>{label}</div>
        {description && <div className="text-[12px] mt-0.5" style={{ color:"var(--text-dim)" }}>{description}</div>}
      </div>
      <div className="relative w-9 h-5 rounded-full cursor-pointer"
        style={{ background: defaultOn ? "var(--accent)" : "var(--border)" }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full shadow transition-transform"
          style={{ background:"#fff", transform: defaultOn ? "translateX(17px)" : "translateX(2px)" }}/>
      </div>
    </div>
  );
}

function Section({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background:"var(--surface)", border:"1px solid var(--border)" }}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-4 pb-2"
        style={{ color:"var(--text-muted)", borderBottom:"1px solid var(--border)" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="fade-in space-y-4">
      <PageHeader title="Settings" subtitle="Estate and account configuration" />

      <Section title="Estate">
        <div className="space-y-3">
          {[
            { label:"Estate Name", value:"The Hudson Lifestyle Estate" },
            { label:"Address",     value:"Midrand, Gauteng" },
            { label:"Province",    value:"GP" },
            { label:"Unit Count",  value:"184" },
          ].map(f=>(
            <div key={f.label} className="grid grid-cols-3 gap-2 items-center py-1.5">
              <div className="text-[12px] font-medium" style={{ color:"var(--text-muted)" }}>{f.label}</div>
              <div className="col-span-2 text-[13px]" style={{ color:"var(--text)" }}>{f.value}</div>
            </div>
          ))}
        </div>
        <button className="mt-4 text-[12px] font-semibold cursor-pointer" style={{ color:"var(--active-text)" }}>Request changes →</button>
      </Section>

      <Section title="Notifications">
        <Toggle label="New maintenance ticket submitted" defaultOn={true}/>
        <Toggle label="Emergency alert triggered" defaultOn={true}/>
        <Toggle label="Approval request pending" defaultOn={true}/>
        <Toggle label="New resident registered" defaultOn={true}/>
        <Toggle label="Gate offline alert" defaultOn={true}/>
        <Toggle label="Weekly report digest" defaultOn={false}/>
      </Section>

      <Section title="Gate Defaults">
        <div className="grid grid-cols-2 gap-3 text-[13px]" style={{ color:"var(--text-muted)" }}>
          <div>Hold duration: <span style={{ color:"var(--text)" }}>1.5 seconds</span></div>
          <div>Undo window: <span style={{ color:"var(--text)" }}>5 seconds</span></div>
          <div>Max guest codes: <span style={{ color:"var(--text)" }}>10 per resident</span></div>
          <div>Emergency hold: <span style={{ color:"var(--text)" }}>5 seconds</span></div>
        </div>
        <button className="mt-3 text-[12px] font-semibold cursor-pointer" style={{ color:"var(--active-text)" }}>Edit gate settings →</button>
      </Section>

      <Section title="Account">
        <div className="space-y-2 text-[13px]" style={{ color:"var(--text-muted)" }}>
          <div>Name: <span style={{ color:"var(--text)" }}>Amara Khumalo</span></div>
          <div>Email: <span style={{ color:"var(--text)" }}>amara@hudson.co.za</span></div>
          <div>Role: <span style={{ color:"var(--text)" }}>Estate Manager</span></div>
        </div>
        <div className="flex gap-2 mt-4">
          <button className="text-[12px] font-semibold cursor-pointer" style={{ color:"var(--active-text)" }}>Change password →</button>
        </div>
      </Section>

      <Section title="Legal">
        <div className="space-y-1">
          {["Privacy Policy","Terms of Service","POPIA Compliance"].map(l=>(
            <button key={l} className="block text-[13px] cursor-pointer text-left w-full py-1"
              style={{ color:"var(--active-text)" }}>{l} →</button>
          ))}
        </div>
      </Section>
    </div>
  );
}
