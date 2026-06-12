"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, ChevronRight, ChevronLeft, Check, Plus, Trash2,
  MapPin, Shield, Settings, Users, UserCheck, CreditCard, Loader2,
} from "lucide-react";

interface Gate { name: string; gateType: string; hardwareIp: string; }
interface StaffMember { name: string; email: string; role: string; }

interface WizardData {
  name: string; address: string; province: string; unitCount: string;
  googleMapsUrl: string; securityContactNumber: string; estateType: string; website: string;
  gates: Gate[];
  gateHoldDuration: string; gateUndoWindow: string; emergencyHoldDuration: string;
  approvalThresholdZar: string; votesRequired: string; maxActiveGuestCodes: string;
  communityBoardEnabled: boolean; anonymousPostingAllowed: boolean; amenitiesEnabled: boolean;
  managerName: string; managerEmail: string;
  staff: StaffMember[];
  subscriptionTier: string; isPilot: boolean; pilotDiscountPct: string;
  billingContact: string; billingEmail: string; notes: string;
}

const PROVINCES = ["GP","WC","KZN","LP","MP","NW","EC","NC","FS"];
const ESTATE_TYPES = ["Residential","Lifestyle","Retirement","Mixed Use"];
const GATE_TYPES = ["vehicle","pedestrian","boom","sliding"];
const STAFF_ROLES = [
  { value:"security_guard", label:"Security Guard" },
  { value:"gate_operator", label:"Gate Operator" },
  { value:"maintenance", label:"Maintenance" },
  { value:"cleaner", label:"Cleaner" },
  { value:"other", label:"Other" },
];
const TIERS = [
  { value:"starter", label:"Starter", description:"Up to 100 units", price:"R1,200/mo" },
  { value:"growth", label:"Growth", description:"Up to 250 units", price:"R2,500/mo" },
  { value:"estate", label:"Estate", description:"Up to 500 units", price:"R4,500/mo" },
  { value:"enterprise", label:"Enterprise", description:"500+ units", price:"Custom" },
];
const STEPS = [
  { label:"Estate Profile", icon:Building2 },
  { label:"Gates", icon:Shield },
  { label:"Configurables", icon:Settings },
  { label:"Manager", icon:UserCheck },
  { label:"Staff", icon:Users },
  { label:"Billing", icon:CreditCard },
];

const INITIAL: WizardData = {
  name:"", address:"", province:"GP", unitCount:"",
  googleMapsUrl:"", securityContactNumber:"", estateType:"Residential", website:"",
  gates:[],
  gateHoldDuration:"1.5", gateUndoWindow:"5", emergencyHoldDuration:"5",
  approvalThresholdZar:"5000", votesRequired:"2", maxActiveGuestCodes:"10",
  communityBoardEnabled:true, anonymousPostingAllowed:true, amenitiesEnabled:false,
  managerName:"", managerEmail:"",
  staff:[],
  subscriptionTier:"starter", isPilot:false, pilotDiscountPct:"50",
  billingContact:"", billingEmail:"", notes:"",
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5" style={{ color:"var(--sa-text-muted)" }}>
      {children}
    </label>
  );
}

function Input({ value, onChange, placeholder, type="text", required }: {
  value:string; onChange:(v:string)=>void; placeholder?:string; type?:string; required?:boolean;
}) {
  return (
    <input
      type={type} value={value} onChange={(e)=>onChange(e.target.value)}
      placeholder={placeholder} required={required}
      className="w-full px-3 py-2.5 rounded-lg text-[13px] transition-colors"
      style={{ background:"var(--sa-input-bg)", border:"1px solid var(--sa-input-border)", color:"var(--sa-text)", outline:"none" }}
      onFocus={(e)=>(e.target.style.borderColor="var(--sa-input-focus)")}
      onBlur={(e)=>(e.target.style.borderColor="var(--sa-input-border)")}
    />
  );
}

function Sel({ value, onChange, options }: {
  value:string; onChange:(v:string)=>void;
  options: string[] | { value:string; label:string }[];
}) {
  const opts = typeof options[0]==="string"
    ? (options as string[]).map(o=>({ value:o, label:o }))
    : (options as { value:string; label:string }[]);
  return (
    <select value={value} onChange={(e)=>onChange(e.target.value)}
      className="w-full px-3 py-2.5 rounded-lg text-[13px] cursor-pointer"
      style={{ background:"var(--sa-input-bg)", border:"1px solid var(--sa-input-border)", color:"var(--sa-text)", outline:"none" }}>
      {opts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Toggle({ value, onChange, label, description }: {
  value:boolean; onChange:(v:boolean)=>void; label:string; description?:string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div>
        <div className="text-[13px] font-medium" style={{ color:"var(--sa-text)" }}>{label}</div>
        {description && <div className="text-[12px] mt-0.5" style={{ color:"var(--sa-text-dim)" }}>{description}</div>}
      </div>
      <button type="button" onClick={()=>onChange(!value)}
        className="relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0 ml-4"
        style={{ background: value ? "var(--sa-accent)" : "var(--sa-border-strong)" }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-transform"
          style={{ background:"#FFFFFF", transform: value ? "translateX(17px)" : "translateX(2px)" }} />
      </button>
    </div>
  );
}

function Card({ children, title }: { children:React.ReactNode; title?:string }) {
  return (
    <div className="rounded-xl p-5 space-y-4"
      style={{ background:"var(--sa-surface)", border:"1px solid var(--sa-border)" }}>
      {title && (
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] pb-3"
          style={{ color:"var(--sa-text-muted)", borderBottom:"1px solid var(--sa-border)" }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export default function ProvisionPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState(false);
  const [provisioned, setProvisioned] = useState<{ name:string; id:string }|null>(null);

  const set = (k: keyof WizardData, v: any) => setData(d=>({ ...d, [k]:v }));

  const canNext = () => {
    if (step===0) return data.name.trim() && data.address.trim() && data.unitCount;
    if (step===3) return data.managerName.trim() && data.managerEmail.trim();
    return true;
  };

  const handleLaunch = async () => {
    if (!canNext()) return;
    setLoading(true); setError(null);
    try {
      const { provisionEstate } = await import("./actions");
      const result = await provisionEstate({
        name:data.name, address:data.address, province:data.province,
        unitCount:Number(data.unitCount), googleMapsUrl:data.googleMapsUrl,
        securityContactNumber:data.securityContactNumber, estateType:data.estateType,
        website:data.website, gates:data.gates,
        gateHoldDurationMs:Math.round(Number(data.gateHoldDuration)*1000),
        gateUndoWindowMs:Math.round(Number(data.gateUndoWindow)*1000),
        emergencyHoldDurationMs:Math.round(Number(data.emergencyHoldDuration)*1000),
        approvalThresholdZar:Number(data.approvalThresholdZar),
        votesRequired:Number(data.votesRequired),
        maxActiveGuestCodes:Number(data.maxActiveGuestCodes),
        communityBoardEnabled:data.communityBoardEnabled,
        anonymousPostingAllowed:data.anonymousPostingAllowed,
        amenitiesEnabled:data.amenitiesEnabled,
        managerName:data.managerName, managerEmail:data.managerEmail,
        staff:data.staff, subscriptionTier:data.subscriptionTier,
        isPilot:data.isPilot, pilotDiscountPct:Number(data.pilotDiscountPct)||0,
        billingContact:data.billingContact, billingEmail:data.billingEmail, notes:data.notes,
      });
      setProvisioned({ name:data.name, id:result.id });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to provision estate");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success && provisioned) {
    return (
      <div className="flex items-center justify-center min-h-screen animate-fade-in">
        <div className="rounded-2xl p-10 max-w-md w-full text-center"
          style={{ background:"var(--sa-surface)", border:"1px solid var(--sa-border)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background:"var(--sa-accent-muted)" }}>
            <Check size={26} style={{ color:"var(--sa-accent)" }} strokeWidth={2.5} />
          </div>
          <h2 className="text-[20px] font-semibold mb-1" style={{ color:"var(--sa-text)" }}>
            {provisioned.name} is live.
          </h2>
          <p className="text-[13px] mb-8" style={{ color:"var(--sa-text-muted)" }}>
            Estate provisioned. The manager will receive their invite shortly.
          </p>
          <div className="flex gap-3">
            <button onClick={()=>router.push("/dashboard/estates")}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer"
              style={{ background:"var(--sa-accent)", color:"#FFFFFF" }}>
              View Estates
            </button>
            <button onClick={()=>{ setSuccess(false); setData(INITIAL); setStep(0); }}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer"
              style={{ background:"var(--sa-bg)", color:"var(--sa-text)", border:"1px solid var(--sa-border)" }}>
              Add Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const StepIcon = STEPS[step].icon;

  // ── Gate step helpers ───────────────────────────────────────────────────────
  const updateGate = (i:number, f:keyof Gate, v:string) => {
    const g=[...data.gates]; g[i]={...g[i],[f]:v}; set("gates",g);
  };
  const updateStaff = (i:number, f:keyof StaffMember, v:string) => {
    const s=[...data.staff]; s[i]={...s[i],[f]:v}; set("staff",s);
  };

  return (
    <div className="min-h-screen" style={{ background:"var(--sa-bg)" }}>
      <div className="max-w-2xl mx-auto px-6 py-10 animate-fade-in">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={13} style={{ color:"var(--sa-text-dim)" }} />
            <span className="text-[11px] uppercase tracking-[0.1em] font-semibold" style={{ color:"var(--sa-text-dim)" }}>
              Superadmin · New Estate
            </span>
          </div>
          <h1 className="text-[22px] font-semibold" style={{ color:"var(--sa-text)" }}>
            Estate Onboarding
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color:"var(--sa-text-muted)" }}>
            Register a new estate on the Estavo platform
          </p>
          <div className="mt-5" style={{ height:"1px", background:"var(--sa-border)" }} />
        </div>

        {/* Step pills */}
        <div className="flex items-center gap-1 mb-8 flex-wrap">
          {STEPS.map((s,i)=>{
            const Icon=s.icon; const done=i<step; const cur=i===step;
            return (
              <div key={i} className="flex items-center gap-1">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium shrink-0 transition-all"
                  style={{
                    background: cur ? "var(--sa-accent)" : done ? "var(--sa-accent-muted)" : "var(--sa-surface)",
                    color: cur ? "#FFFFFF" : done ? "var(--sa-active-text)" : "var(--sa-text-dim)",
                    border:`1px solid ${cur||done ? "var(--sa-accent)" : "var(--sa-border)"}`,
                  }}>
                  {done ? <Check size={10} strokeWidth={3}/> : <Icon size={10}/>}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{i+1}</span>
                </div>
                {i<STEPS.length-1 && (
                  <div className="w-3 h-px shrink-0" style={{ background: i<step ? "var(--sa-accent)" : "var(--sa-border)" }}/>
                )}
              </div>
            );
          })}
        </div>

        {/* Step title */}
        <div className="flex items-center gap-2 mb-5">
          <StepIcon size={15} style={{ color:"var(--sa-active-text)" }}/>
          <h2 className="text-[15px] font-semibold" style={{ color:"var(--sa-text)" }}>{STEPS[step].label}</h2>
        </div>

        {/* ── Step 0: Estate Profile ─────────────────────────────────────────── */}
        {step===0 && (
          <div className="space-y-4">
            <Card title="Basic Info">
              <div><Label>Estate Name *</Label>
                <Input value={data.name} onChange={v=>set("name",v)} placeholder="e.g. Hillcrest Estate" required/>
              </div>
              <div><Label>Physical Address *</Label>
                <Input value={data.address} onChange={v=>set("address",v)} placeholder="14 Hillcrest Drive, KZN" required/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Province *</Label>
                  <Sel value={data.province} onChange={v=>set("province",v)} options={PROVINCES}/>
                </div>
                <div><Label>Estate Type *</Label>
                  <Sel value={data.estateType} onChange={v=>set("estateType",v)} options={ESTATE_TYPES}/>
                </div>
              </div>
              <div><Label>Number of Units *</Label>
                <Input value={data.unitCount} onChange={v=>set("unitCount",v)} type="number" placeholder="136" required/>
              </div>
            </Card>
            <Card title="Contact & Access">
              <div><Label>Google Maps Link</Label>
                <Input value={data.googleMapsUrl} onChange={v=>set("googleMapsUrl",v)} placeholder="https://maps.google.com/..."/>
              </div>
              <div><Label>Security Contact Number</Label>
                <Input value={data.securityContactNumber} onChange={v=>set("securityContactNumber",v)} placeholder="+27 82 000 0000"/>
              </div>
              <div><Label>Website (optional)</Label>
                <Input value={data.website} onChange={v=>set("website",v)} placeholder="https://hillcrestestate.co.za"/>
              </div>
            </Card>
          </div>
        )}

        {/* ── Step 1: Gates ──────────────────────────────────────────────────── */}
        {step===1 && (
          <div className="space-y-4">
            {data.gates.length===0 && (
              <div className="rounded-xl p-8 text-center text-[13px]"
                style={{ background:"var(--sa-surface)", border:"1px dashed var(--sa-border-strong)", color:"var(--sa-text-muted)" }}>
                No gates yet. Add your first gate below, or skip and configure later.
              </div>
            )}
            {data.gates.map((gate,i)=>(
              <Card key={i}>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color:"var(--sa-text-muted)" }}>
                    Gate {i+1}
                  </span>
                  <button type="button" onClick={()=>set("gates",data.gates.filter((_,idx)=>idx!==i))}
                    className="cursor-pointer p-1 rounded hover:bg-red-50 transition-colors" style={{ color:"var(--sa-text-dim)" }}>
                    <Trash2 size={13}/>
                  </button>
                </div>
                <div><Label>Gate Name *</Label>
                  <Input value={gate.name} onChange={v=>updateGate(i,"name",v)} placeholder="e.g. Main Entry Gate"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Type</Label>
                    <Sel value={gate.gateType} onChange={v=>updateGate(i,"gateType",v)}
                      options={GATE_TYPES.map(t=>({ value:t, label:t.charAt(0).toUpperCase()+t.slice(1) }))}/>
                  </div>
                  <div><Label>Hardware IP</Label>
                    <Input value={gate.hardwareIp} onChange={v=>updateGate(i,"hardwareIp",v)} placeholder="192.168.1.10"/>
                  </div>
                </div>
              </Card>
            ))}
            <button type="button"
              onClick={()=>set("gates",[...data.gates,{ name:"", gateType:"vehicle", hardwareIp:"" }])}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium cursor-pointer transition-colors"
              style={{ background:"var(--sa-accent-muted)", color:"var(--sa-active-text)", border:"1px dashed var(--sa-accent)" }}>
              <Plus size={14}/> Add Gate
            </button>
            <div className="rounded-lg px-4 py-3 text-[12px]"
              style={{ background:"var(--sa-surface)", border:"1px solid var(--sa-border)", color:"var(--sa-text-muted)" }}>
              Gate hardware can be configured post-launch from estate settings.
            </div>
          </div>
        )}

        {/* ── Step 2: Configurables ──────────────────────────────────────────── */}
        {step===2 && (
          <div className="space-y-4">
            <Card title="Access & Gate">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Hold duration (s)</Label>
                  <Input value={data.gateHoldDuration} onChange={v=>set("gateHoldDuration",v)} type="number" placeholder="1.5"/>
                </div>
                <div><Label>Undo window (s)</Label>
                  <Input value={data.gateUndoWindow} onChange={v=>set("gateUndoWindow",v)} type="number" placeholder="5"/>
                </div>
              </div>
              <div><Label>Emergency hold duration (s)</Label>
                <Input value={data.emergencyHoldDuration} onChange={v=>set("emergencyHoldDuration",v)} type="number" placeholder="5"/>
              </div>
            </Card>
            <Card title="Governance">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Approval threshold (ZAR)</Label>
                  <Input value={data.approvalThresholdZar} onChange={v=>set("approvalThresholdZar",v)} type="number" placeholder="5000"/>
                </div>
                <div><Label>Votes required</Label>
                  <Input value={data.votesRequired} onChange={v=>set("votesRequired",v)} type="number" placeholder="2"/>
                </div>
              </div>
            </Card>
            <Card title="Guest Access">
              <div><Label>Max active guest codes per resident</Label>
                <Input value={data.maxActiveGuestCodes} onChange={v=>set("maxActiveGuestCodes",v)} type="number" placeholder="10"/>
              </div>
            </Card>
            <Card title="Community">
              <Toggle value={data.communityBoardEnabled} onChange={v=>set("communityBoardEnabled",v)} label="Community board"/>
              <Toggle value={data.anonymousPostingAllowed} onChange={v=>set("anonymousPostingAllowed",v)} label="Anonymous posting"/>
              <Toggle value={data.amenitiesEnabled} onChange={v=>set("amenitiesEnabled",v)}
                label="Amenities booking" description="Can be enabled post-launch"/>
            </Card>
          </div>
        )}

        {/* ── Step 3: Manager ────────────────────────────────────────────────── */}
        {step===3 && (
          <div className="space-y-4">
            <Card title="Estate Manager Account">
              <div className="text-[12px] rounded-lg px-3 py-2.5"
                style={{ background:"var(--sa-accent-muted)", color:"var(--sa-active-text)", border:"1px solid var(--sa-border)" }}>
                The manager will receive a magic-link invite email to activate their account.
              </div>
              <div><Label>Manager Full Name *</Label>
                <Input value={data.managerName} onChange={v=>set("managerName",v)} placeholder="e.g. Amara Khumalo" required/>
              </div>
              <div><Label>Manager Email *</Label>
                <Input value={data.managerEmail} onChange={v=>set("managerEmail",v)} type="email" placeholder="mgr@estate.co.za" required/>
              </div>
            </Card>
          </div>
        )}

        {/* ── Step 4: Staff ──────────────────────────────────────────────────── */}
        {step===4 && (
          <div className="space-y-4">
            {data.staff.length===0 && (
              <div className="rounded-xl p-8 text-center text-[13px]"
                style={{ background:"var(--sa-surface)", border:"1px dashed var(--sa-border-strong)", color:"var(--sa-text-muted)" }}>
                No staff added. Staff can be set up post-launch.
              </div>
            )}
            {data.staff.map((m,i)=>(
              <Card key={i}>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color:"var(--sa-text-muted)" }}>
                    Staff {i+1}
                  </span>
                  <button type="button" onClick={()=>set("staff",data.staff.filter((_,idx)=>idx!==i))}
                    className="cursor-pointer p-1 rounded" style={{ color:"var(--sa-text-dim)" }}>
                    <Trash2 size={13}/>
                  </button>
                </div>
                <div><Label>Name *</Label>
                  <Input value={m.name} onChange={v=>updateStaff(i,"name",v)} placeholder="Full name"/>
                </div>
                <div><Label>Email *</Label>
                  <Input value={m.email} onChange={v=>updateStaff(i,"email",v)} type="email" placeholder="guard@estate.co.za"/>
                </div>
                <div><Label>Role</Label>
                  <Sel value={m.role} onChange={v=>updateStaff(i,"role",v)} options={STAFF_ROLES}/>
                </div>
              </Card>
            ))}
            <button type="button"
              onClick={()=>set("staff",[...data.staff,{ name:"", email:"", role:"security_guard" }])}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium cursor-pointer"
              style={{ background:"var(--sa-accent-muted)", color:"var(--sa-active-text)", border:"1px dashed var(--sa-accent)" }}>
              <Plus size={14}/> Add Staff Member
            </button>
          </div>
        )}

        {/* ── Step 5: Billing ────────────────────────────────────────────────── */}
        {step===5 && (
          <div className="space-y-4">
            <Card title="Subscription Plan">
              <div className="grid grid-cols-2 gap-3">
                {TIERS.map(t=>(
                  <button key={t.value} type="button" onClick={()=>set("subscriptionTier",t.value)}
                    className="text-left p-4 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: data.subscriptionTier===t.value ? "var(--sa-accent-muted)" : "var(--sa-bg)",
                      border:`1.5px solid ${data.subscriptionTier===t.value ? "var(--sa-accent)" : "var(--sa-border)"}`,
                    }}>
                    <div className="text-[13px] font-semibold"
                      style={{ color: data.subscriptionTier===t.value ? "var(--sa-active-text)" : "var(--sa-text)" }}>
                      {t.label}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color:"var(--sa-text-dim)" }}>{t.description}</div>
                    <div className="text-[12px] font-semibold mt-1.5"
                      style={{ color: data.subscriptionTier===t.value ? "var(--sa-active-text)" : "var(--sa-text-secondary)" }}>
                      {t.price}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
            <Card title="Pilot Pricing">
              <Toggle value={data.isPilot} onChange={v=>set("isPilot",v)}
                label="Pilot pricing" description="Discounted during rollout phase"/>
              {data.isPilot && (
                <div><Label>Discount (%)</Label>
                  <Input value={data.pilotDiscountPct} onChange={v=>set("pilotDiscountPct",v)} type="number" placeholder="50"/>
                </div>
              )}
            </Card>
            <Card title="Billing Contact">
              <div><Label>Contact Name</Label>
                <Input value={data.billingContact} onChange={v=>set("billingContact",v)} placeholder="Finance Manager"/>
              </div>
              <div><Label>Billing Email</Label>
                <Input value={data.billingEmail} onChange={v=>set("billingEmail",v)} type="email" placeholder="billing@estate.co.za"/>
              </div>
            </Card>
            <Card title="Internal Notes">
              <textarea value={data.notes} onChange={e=>set("notes",e.target.value)}
                rows={3} placeholder="Any notes about this onboarding…"
                className="w-full px-3 py-2.5 rounded-lg text-[13px] resize-none"
                style={{ background:"var(--sa-input-bg)", border:"1px solid var(--sa-input-border)", color:"var(--sa-text)", outline:"none" }}/>
            </Card>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg text-[13px]"
            style={{ background:"var(--status-danger-bg)", border:"1px solid var(--status-danger-border)", color:"var(--status-danger)" }}>
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button type="button"
            onClick={()=>step===0 ? router.push("/dashboard/estates") : setStep(s=>s-1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-colors"
            style={{ background:"var(--sa-surface)", color:"var(--sa-text-muted)", border:"1px solid var(--sa-border)" }}>
            <ChevronLeft size={14}/>
            {step===0 ? "Cancel" : "Back"}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[12px]" style={{ color:"var(--sa-text-dim)" }}>{step+1} of {STEPS.length}</span>
            {step<STEPS.length-1 ? (
              <button type="button" onClick={()=>setStep(s=>s+1)} disabled={!canNext()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all disabled:opacity-40"
                style={{ background:"var(--sa-accent)", color:"#FFFFFF" }}>
                Next <ChevronRight size={14}/>
              </button>
            ) : (
              <button type="button" onClick={handleLaunch} disabled={loading||!canNext()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all disabled:opacity-40"
                style={{ background:"var(--sa-accent)", color:"#FFFFFF" }}>
                {loading ? <><Loader2 size={14} className="animate-spin"/>Provisioning…</> : <><Check size={14}/>Launch Estate</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
