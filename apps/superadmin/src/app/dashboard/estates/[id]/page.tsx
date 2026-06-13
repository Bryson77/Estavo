"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Gauge, Users, ClipboardList, DoorOpen, TestTube2, Download, UserPlus, MessageSquare, WalletCards, CircleDollarSign, Check, Receipt, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEstates } from "@/lib/api";
import { PageHeader, Badge, StatCard, Panel, SimpleTable, RowActions, statusTone } from "@/components/shared";
import Link from "next/link";
import { use } from "react";

type EstateTab = "Overview" | "Gates" | "Residents" | "Maintenance" | "Manager Activity" | "Billing";

function GatesTab() {
  return (
    <>
      <div className="gate-grid">
        {["North vehicle gate", "South pedestrian gate", "Service boom"].map((x, i) => (
          <article className="panel" key={x}>
            <div className="panel-header">
              <span className="icon-box"><DoorOpen /></span>
              <Badge>{i === 2 ? "Offline" : "Online"}</Badge>
            </div>
            <h3>{x}</h3>
            <p>Last ping: {i === 2 ? "11 Jun 2026 · 22:04" : "12 Jun 2026 · 14:31"}</p>
            <div className="card-actions">
              <Button variant="outline"><TestTube2 />Test connection</Button>
              <Button variant="ghost">Connection log</Button>
            </div>
          </article>
        ))}
      </div>
      <Panel title="Full access log" action={<Button variant="outline"><Download />Export CSV</Button>}>
        <SimpleTable 
          headers={["Timestamp", "Person / unit", "Type", "Gate", "Code"]} 
          rows={[
            ["12 Jun 2026 · 14:31", "Unit 42", "Resident", "North vehicle", "RSD-2048"],
            ["12 Jun 2026 · 14:29", "Visitor · Unit 18", "Guest", "South pedestrian", "G-8821"],
            ["12 Jun 2026 · 14:21", "Delivery", "Guest", "North vehicle", "G-4117"]
          ]} 
        />
      </Panel>
    </>
  );
}

function ResidentsTab() {
  return (
    <Panel title="Residents" action={<div className="header-actions"><Button variant="outline">Import CSV</Button><Button><UserPlus />Add resident</Button></div>}>
      <SimpleTable 
        headers={["Unit", "Name", "Email", "Status", "Last active", "Actions"]} 
        rows={[
          ["12", "Nandi Mokoena", "nandi@example.co.za", <Badge key="1">Active</Badge>, "12 Jun · 14:22", <RowActions key="a1" labels={["Edit unit", "Reset access", "Deactivate"]} />],
          ["18", "James van Wyk", "james@example.co.za", <Badge key="2">Active</Badge>, "12 Jun · 13:51", <RowActions key="a2" labels={["Edit unit", "Reset access", "Deactivate"]} />],
          ["27", "Ayanda Khumalo", "ayanda@example.co.za", <Badge key="3" tone="warning">Invited</Badge>, "Never", <RowActions key="a3" labels={["Edit unit", "Reset access", "Deactivate"]} />]
        ]} 
      />
    </Panel>
  );
}

function MaintenanceTab() {
  return (
    <Panel title="All maintenance tickets" action={<div className="chips"><Button size="sm">Table</Button><Button size="sm" variant="outline">Kanban</Button></div>}>
      <SimpleTable 
        headers={["Ticket", "Category", "Unit", "Priority", "Status", "Assignee", "Actions"]} 
        rows={[
          ["#MT-1042", "Plumbing", "Unit 18", <Badge key="1" tone="error">High</Badge>, "In progress", "T. Naidoo", <RowActions key="a1" labels={["Reassign", "Close", "Escalate"]} />],
          ["#MT-1039", "Electrical", "Unit 72", <Badge key="2" tone="warning">Medium</Badge>, "Submitted", "Unassigned", <RowActions key="a2" labels={["Reassign", "Close", "Escalate"]} />],
          ["#MT-1027", "Landscaping", "Common area", <Badge key="3">Low</Badge>, "Resolved", "M. Jacobs", <RowActions key="a3" labels={["Reassign", "Close", "Escalate"]} />]
        ]} 
      />
    </Panel>
  );
}

function ManagerTab({ estate }: { estate: string }) {
  return (
    <div className="detail-grid">
      <Panel title="Estate manager">
        <div className="profile-card">
          <div className="avatar">SD</div>
          <div>
            <h3>Sipho Dlamini</h3>
            <p>sipho@{estate.toLowerCase().replaceAll(" ", "")}.co.za</p>
            <Badge>Active</Badge>
          </div>
        </div>
        <dl className="definition-list">
          <div><dt>Role</dt><dd>Estate manager</dd></div>
          <div><dt>Last login</dt><dd>12 Jun 2026 · 13:58</dd></div>
        </dl>
        <div className="stack-actions">
          <Button><MessageSquare />Message manager</Button>
          <Button variant="outline">Reassign manager</Button>
          <Button variant="destructive">Revoke access</Button>
        </div>
      </Panel>
      <Panel title="Recent activity">
        <div className="activity-list">
          {[
            ["Updated gate configuration", "12 Jun · 13:42"],
            ["Resolved ticket #MT-1034", "12 Jun · 12:19"],
            ["Invited resident · Unit 81", "12 Jun · 10:07"],
            ["Exported access log", "11 Jun · 16:33"]
          ].map(([a, t]) => (
            <div key={a}>
              <span className="activity-icon"><Activity /></span>
              <div><b>{a}</b><small>{t}</small></div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function EstateBillingTab() {
  return (
    <>
      <div className="stats-grid">
        <StatCard label="Current plan" value="Growth" note="Custom estate plan" icon={WalletCards} />
        <StatCard label="Monthly fee" value="R 18 500.00" note="Next invoice 01 Jul 2026" icon={CircleDollarSign} />
        <StatCard label="Billing status" value="Paid" note="Last paid 01 Jun 2026" icon={Check} />
        <StatCard label="Outstanding" value="R 0.00" note="No overdue invoices" icon={Receipt} />
      </div>
      <Panel title="Invoice history" action={<div className="header-actions"><Button variant="outline">Edit subscription amount</Button><Button>Mark as paid manually</Button></div>}>
        <SimpleTable 
          headers={["Invoice", "Date", "Amount", "Status", "Action"]} 
          rows={[
            ["INV-2026-0612", "01 Jun 2026", "R 18 500.00", <Badge key="1">Paid</Badge>, <Button key="a1" variant="ghost" size="sm"><Download />PDF</Button>],
            ["INV-2026-0511", "01 May 2026", "R 18 500.00", <Badge key="2">Paid</Badge>, <Button key="a2" variant="ghost" size="sm"><Download />PDF</Button>]
          ]} 
        />
      </Panel>
    </>
  );
}

export default function EstateDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const name = decodeURIComponent(unwrappedParams.id).replace(/-/g, ' ');
  const { estates, loading } = useEstates();
  const estate = estates.find(e => e.name.toLowerCase() === name.toLowerCase());
  const [tab, setTab] = useState<EstateTab>("Overview");
  const tabs: EstateTab[] = ["Overview", "Gates", "Residents", "Maintenance", "Manager Activity", "Billing"];

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">Loading estate details...</div>;
  }

  if (!estate) {
    return <div className="p-8 text-center text-muted-foreground">Estate not found.</div>;
  }

  return (
    <>
      <Link href="/dashboard/estates" className="breadcrumb">
        <ChevronLeft /> Estates <span>/</span> {estate.name}
      </Link>
      
      <PageHeader title={estate.name} subtitle={`${estate.province} · ${estate.units} units`}>
        <Badge>{estate.status}</Badge>
        <Button variant="outline">Edit estate</Button>
        <Button variant="destructive">Suspend estate</Button>
        <Button>Open as manager <ChevronRight /></Button>
      </PageHeader>
      
      <nav className="tabs">
        {tabs.map(x => (
          <button className={tab === x ? "active" : ""} onClick={() => setTab(x)} key={x}>{x}</button>
        ))}
      </nav>

      {tab === "Overview" && (
        <>
          <div className="stats-grid">
            <StatCard label="Health score" value={`${estate.health}%`} note="↑ 3 points this month" icon={Gauge} />
            <StatCard label="Registered residents" value="389" note={`${estate.adoption}% adoption`} icon={Users} />
            <StatCard label="Open tickets" value="12" note="3 high priority" icon={ClipboardList} />
            <StatCard label="Gate uptime" value="99.7%" note="Last 30 days" icon={DoorOpen} />
          </div>
          <div className="detail-grid">
            <Panel title="Estate health">
              <div className="health-focus">
                <strong>{estate.health}</strong>
                <Badge tone={statusTone(estate.health)}>Healthy</Badge>
                <p>Performance is trending upwards across gate uptime, response time and resident adoption.</p>
              </div>
            </Panel>
            <Panel title="Quick access">
              <div className="quick-links">
                {tabs.slice(1).map(x => (
                  <Button variant="outline" key={x} onClick={() => setTab(x)}>{x}<ChevronRight /></Button>
                ))}
              </div>
            </Panel>
          </div>
        </>
      )}

      {tab === "Gates" && <GatesTab />}
      {tab === "Residents" && <ResidentsTab />}
      {tab === "Maintenance" && <MaintenanceTab />}
      {tab === "Manager Activity" && <ManagerTab estate={estate.name} />}
      {tab === "Billing" && <EstateBillingTab />}
    </>
  );
}
