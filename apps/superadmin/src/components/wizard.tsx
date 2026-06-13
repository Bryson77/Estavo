"use client";

import { useState } from "react";
import { Check, X, ChevronLeft, ChevronRight, Download, Plus, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge, SimpleTable } from "@/components/shared";

function FormField({ label, placeholder, type = "text", value, mono }: { label: string; placeholder?: string; type?: string; value?: string; mono?: boolean }) {
  return (
    <label className="field">
      <span>{label}</span>
      <Input type={type} placeholder={placeholder} defaultValue={value} className={mono ? "data-text" : ""} />
    </label>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select>{options.map(x => <option key={x}>{x}</option>)}</select>
    </label>
  );
}

function RangeField({ label, min, max, value, suffix }: { label: string; min: string; max: string; value: string; suffix?: string }) {
  return (
    <label className="range-field">
      <span><b>{label}</b><output>{value}{suffix}</output></span>
      <input type="range" min={min} max={max} defaultValue={value} step="0.5" />
    </label>
  );
}

function ToggleRow({ label, description, defaultOn = false }: { label: string; description: string; defaultOn?: boolean }) {
  return (
    <div className="toggle-row">
      <div><b>{label}</b><small>{description}</small></div>
      <Switch defaultChecked={defaultOn} />
    </div>
  );
}

function ConfigGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2>{title}</h2>{children}</section>;
}

const wizardDescriptions = [
  "Tell us the essentials about this estate.",
  "Connect each physical gate to the Estavo platform.",
  "Set estate-wide defaults for access, emergencies and governance.",
  "Bring the resident register into Estavo.",
  "Add the operational team who will use the platform.",
  "Choose a plan and configure the estate’s monthly billing."
];

function WizardProfile() {
  return (
    <div className="wizard-form">
      <div className="form-grid">
        <FormField label="Estate name" placeholder="e.g. Kingswood Park" />
        <SelectField label="Province" options={["GP", "WC", "KZN", "LP", "MP", "NW", "EC", "NC", "FS"]} />
        <FormField label="Physical address" placeholder="Street address" />
        <FormField label="Number of units" type="number" placeholder="0" />
        <FormField label="Google Maps link" placeholder="https://maps.google.com/..." />
        <FormField label="Security contact number" placeholder="+27" />
        <SelectField label="Estate type" options={["Residential", "Lifestyle", "Retirement", "Mixed Use"]} />
        <FormField label="Website (optional)" placeholder="https://" />
      </div>
    </div>
  );
}

function WizardGates() {
  return (
    <div className="wizard-form">
      <SelectField label="Number of gates" options={["1", "2", "3", "4", "5"]} />
      {[1, 2].map(i => (
        <div className="repeat-card" key={i}>
          <div className="panel-header">
            <h3>Gate {i}</h3>
            <Badge>{i === 1 ? "Online" : "Pending"}</Badge>
          </div>
          <div className="form-grid">
            <FormField label="Gate name" value={i === 1 ? "North vehicle gate" : "South pedestrian gate"} />
            <SelectField label="Type" options={["Vehicle", "Pedestrian", "Boom", "Sliding"]} />
            <FormField label="Hardware IP" placeholder="192.168.1.100" />
            <label className="field">
              <span>Device key</span>
              <div className="copy-field">
                <code>EST-{i}A8F-82KQ-91T</code>
                <Button variant="ghost" size="icon"><span className="sr-only">Copy</span></Button>
              </div>
            </label>
          </div>
          <Button variant="outline">Test connection</Button>
        </div>
      ))}
      <Button variant="outline"><Plus />Add another gate</Button>
    </div>
  );
}

function WizardConfig() {
  return (
    <div className="wizard-form config-sections">
      <ConfigGroup title="Access & Gate">
        <RangeField label="Gate hold duration" min="0.5" max="5" value="1.5" suffix="s" />
        <RangeField label="Gate undo window" min="0" max="30" value="5" suffix="s" />
      </ConfigGroup>
      <ConfigGroup title="Emergency">
        <RangeField label="Emergency hold duration" min="3" max="10" value="5" suffix="s" />
        <RangeField label="Emergency undo window" min="0" max="60" value="5" suffix="s" />
      </ConfigGroup>
      <ConfigGroup title="Guest Access">
        <div className="form-grid">
          <FormField label="Guest code length" value="4" />
          <SelectField label="Guest code type" options={["Alphanumeric", "Numeric only"]} />
        </div>
        <RangeField label="Max active guest codes per resident" min="1" max="50" value="10" />
        <RangeField label="Guest code max validity" min="1" max="365" value="30" suffix="days" />
        <ToggleRow label="Require guest ID on entry" description="Guests must present identification." />
      </ConfigGroup>
      <ConfigGroup title="Governance">
        <div className="form-grid">
          <FormField label="Approval threshold (ZAR)" value="5000" />
          <FormField label="Votes required" value="2" />
          <FormField label="Quote minimum" value="3" />
          <FormField label="Unassigned ticket warning (hours)" value="12" />
        </div>
        <ToggleRow label="Emergency auto-notify trustees" description="Notify trustees automatically when an emergency is triggered." defaultOn />
      </ConfigGroup>
      <ConfigGroup title="Community">
        <ToggleRow label="Community board enabled" description="Residents can access the community board." defaultOn />
        <ToggleRow label="Anonymous posting allowed" description="Residents may hide their identity from other residents." defaultOn />
        <ToggleRow label="Events RSVP enabled" description="Allow event responses in the app." defaultOn />
        <ToggleRow label="Amenities booking enabled" description="Allow residents to reserve estate amenities." />
      </ConfigGroup>
    </div>
  );
}

function WizardResidents() {
  const [mode, setMode] = useState("Upload CSV");
  return (
    <div className="wizard-form">
      <div className="segmented">
        <button className={mode === "Upload CSV" ? "active" : ""} onClick={() => setMode("Upload CSV")}>Upload CSV</button>
        <button className={mode === "Add Manually" ? "active" : ""} onClick={() => setMode("Add Manually")}>Add manually</button>
      </div>
      {mode === "Upload CSV" ? (
        <>
          <div className="dropzone">
            <Download />
            <h3>Drop your resident CSV here</h3>
            <p>or click to browse · CSV up to 10MB</p>
            <Button variant="outline">Choose file</Button>
          </div>
          <SimpleTable 
            headers={["Row", "Unit", "Type", "Name", "Email", "Status"]} 
            rows={[
              ["1", "12", "Owner", "Nandi Mokoena", "nandi@example.co.za", <Badge key="1">Valid</Badge>],
              ["2", "18", "Tenant", "James van Wyk", "james@example.co.za", <Badge key="2">Valid</Badge>],
              ["3", "—", "Owner", "Ayanda Khumalo", "ayanda@example.co.za", <Badge key="3" tone="error">Error</Badge>]
            ]} 
          />
          <Button>Confirm import — 184 valid / 1 skipped</Button>
        </>
      ) : (
        <>
          <div className="repeat-card">
            <div className="form-grid">
              <FormField label="Unit" />
              <SelectField label="Type" options={["Owner", "Tenant"]} />
              <FormField label="Name" />
              <FormField label="Email" />
              <FormField label="Phone" />
            </div>
          </div>
          <Button variant="outline"><Plus />Add another resident</Button>
        </>
      )}
    </div>
  );
}

function WizardStaff() {
  return (
    <div className="wizard-form">
      {[1, 2].map(i => (
        <div className="repeat-card" key={i}>
          <div className="panel-header">
            <h3>Staff member {i}</h3>
            {i > 1 && <Button variant="ghost" size="icon"><X /></Button>}
          </div>
          <div className="form-grid">
            <FormField label="Name" />
            <FormField label="Email" />
            <SelectField label="Role" options={["Security Guard", "Gate Operator", "Maintenance", "Cleaner", "Other"]} />
          </div>
        </div>
      ))}
      <div className="header-actions">
        <Button variant="outline"><Plus />Add another</Button>
        <Button variant="ghost">Skip for now</Button>
      </div>
    </div>
  );
}

function WizardBilling() {
  const [plan, setPlan] = useState("Growth");
  return (
    <div className="wizard-form">
      <div className="plan-grid">
        {[
          ["Starter", "Core access tools"],
          ["Growth", "Operations & governance"],
          ["Enterprise", "Advanced portfolio controls"]
        ].map(([p, d]) => (
          <button className={plan === p ? "selected" : ""} onClick={() => setPlan(p)} key={p}>
            <span>{plan === p ? <Check /> : <WalletCards />}</span>
            <h3>{p}</h3>
            <p>{d}</p>
          </button>
        ))}
      </div>
      <FormField label="Custom monthly fee (ZAR)" value="R 18 500.00" mono />
      <div className="form-grid">
        <FormField label="Billing contact name" />
        <FormField label="Billing email" />
        <FormField label="Phone" />
        <FormField label="Company name (optional)" />
      </div>
      <div className="segmented">
        <button className="active">Connect Yoco</button>
        <button>Invoice monthly</button>
      </div>
      <FormField label="Billing start date" type="date" />
    </div>
  );
}

export function Wizard({ close }: { close: () => void }) {
  const [step, setStep] = useState(1);
  const [launched, setLaunched] = useState(false);
  const labels = ["Estate profile", "Gate configuration", "App configurables", "Resident import", "Staff setup", "Billing setup"];

  if (launched) {
    return (
      <div className="wizard-overlay">
        <div className="success-screen">
          <div className="success-mark"><Check /></div>
          <p className="eyebrow">Estate launched</p>
          <h1>Kingswood Park is ready</h1>
          <p>Everything is configured. The estate manager can now begin onboarding residents.</p>
          <div className="launch-checks">
            {["Estate created", "2 gates configured", "184 residents imported", "6 staff members added", "Billing set at R 18 500.00 / month"].map(x => (
              <span key={x}><Check />{x}</span>
            ))}
          </div>
          <div className="success-actions">
            <Button onClick={close}>Open estate <ChevronRight /></Button>
            <Button variant="outline" onClick={() => { setStep(1); setLaunched(false); }}>Add another estate</Button>
            <Button variant="ghost" onClick={close}>Go to overview</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-overlay">
      <aside className="wizard-sidebar">
        <div className="brand"><span>E</span><b>ESTAVO</b></div>
        <p>New estate setup</p>
        <ol>
          {labels.map((x, i) => (
            <li className={step === i + 1 ? "active" : step > i + 1 ? "complete" : ""} key={x}>
              <span>{step > i + 1 ? <Check /> : i + 1}</span>
              <div><b>{x}</b><small>Step {i + 1} of 6</small></div>
            </li>
          ))}
        </ol>
        <button className="wizard-exit" onClick={close}><X />Exit setup</button>
      </aside>
      <main className="wizard-main">
        <div className="wizard-progress"><i style={{ width: `${(step / 6) * 100}%` }} /></div>
        <div className="wizard-content">
          <p className="eyebrow">Step {step} of 6</p>
          <h1>{labels[step - 1]}</h1>
          <p className="wizard-intro">{wizardDescriptions[step - 1]}</p>
          
          {step === 1 && <WizardProfile />}
          {step === 2 && <WizardGates />}
          {step === 3 && <WizardConfig />}
          {step === 4 && <WizardResidents />}
          {step === 5 && <WizardStaff />}
          {step === 6 && <WizardBilling />}
          
          <div className="wizard-actions">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep(step - 1)}><ChevronLeft />Back</Button>
            <Button onClick={() => step === 6 ? setLaunched(true) : setStep(step + 1)}>
              {step === 6 ? "Confirm & launch estate" : "Continue"}<ChevronRight />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
