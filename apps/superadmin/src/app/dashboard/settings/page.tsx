"use client";

import { useState } from "react";
import { Building2, Zap, Bell, Shield, AlertTriangle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Badge } from "@/components/shared";

function FormField({ label, value, type = "text", placeholder, mono }: { label: string; value?: string; type?: string; placeholder?: string; mono?: boolean }) {
  return (
    <label className="field">
      <span>{label}</span>
      <Input type={type} placeholder={placeholder} defaultValue={value} className={mono ? "data-text" : ""} />
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

function IntegrationSettings() {
  return (
    <div className="integration-list">
      {[
        ["Twilio", "SMS and WhatsApp delivery"],
        ["Resend", "Transactional email"],
        ["Yoco", "Subscription payments"],
        ["barKoder SDK", "Gate code scanning"]
      ].map(([x, d]) => (
        <div key={x}>
          <span className="icon-box"><Zap /></span>
          <div><b>{x}</b><small>{d}</small></div>
          <Badge>Connected</Badge>
          <Button variant="outline" size="sm">Test</Button>
        </div>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const [open, setOpen] = useState("Branding");
  const sections = ["Branding", "Integrations", "Notification Rules", "Security", "Danger Zone"];

  return (
    <>
      <PageHeader eyebrow="Administration" title="Platform Settings" subtitle="Configure platform-wide defaults, services and security." />
      
      <div className="settings-list">
        {sections.map(section => (
          <section className={`accordion ${section === "Danger Zone" ? "danger-zone" : ""}`} key={section}>
            <button onClick={() => setOpen(open === section ? "" : section)}>
              <span>
                {section === "Branding" && <Building2 />}
                {section === "Integrations" && <Zap />}
                {section === "Notification Rules" && <Bell />}
                {section === "Security" && <Shield />}
                {section === "Danger Zone" && <AlertTriangle />}
                <b>{section}</b>
              </span>
              <ChevronDown className={open === section ? "rotate" : ""} />
            </button>
            
            {open === section && (
              <div className="accordion-content">
                {section === "Branding" && (
                  <div className="form-grid">
                    <FormField label="Platform name" value="Estavo" />
                    <FormField label="Support email" value="support@estavo.co.za" />
                    <div className="upload-box">
                      <Building2 />
                      <span><b>Platform logo</b><small>PNG, SVG or JPG · max 2MB</small></span>
                      <Button variant="outline">Upload</Button>
                    </div>
                    <Button>Save branding</Button>
                  </div>
                )}
                {section === "Integrations" && <IntegrationSettings />}
                {section === "Notification Rules" && (
                  <div className="form-grid">
                    <FormField label="Alert when gate is offline for" value="5 minutes" />
                    <FormField label="Billing overdue alert after" value="3 days" />
                    <FormField label="Health score alert threshold" value="60" />
                    <Button>Save rules</Button>
                  </div>
                )}
                {section === "Security" && (
                  <div className="form-grid">
                    <ToggleRow label="Enforce two-factor authentication" description="Require 2FA for all platform staff." defaultOn />
                    <FormField label="Session timeout (minutes)" value="60" />
                    <FormField label="Audit log retention (days)" value="365" />
                    <Button>Save security settings</Button>
                  </div>
                )}
                {section === "Danger Zone" && (
                  <div>
                    <p>These actions are destructive and cannot be undone.</p>
                    <div className="danger-actions">
                      <div><b>Reset all platform settings</b><small>Restore configuration to defaults.</small></div>
                      <Button variant="destructive">Reset settings</Button>
                    </div>
                    <div className="danger-actions">
                      <div><b>Wipe test data</b><small>Delete all non-production records.</small></div>
                      <Button variant="destructive">Wipe test data</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
