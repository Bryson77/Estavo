"use client";

import { useState } from "react";
import { ChevronDown, AlertTriangle, Zap, Bell, Check, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errors } from "@/lib/mock-data";
import { PageHeader, StatCard, Panel, Badge, RowActions } from "@/components/shared";

function Drawer({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) {
  return (
    <div className="overlay" onMouseDown={close}>
      <aside className="drawer" onMouseDown={e => e.stopPropagation()}>
        <div className="panel-header">
          <div><p className="eyebrow">Estavo platform</p><h2>{title}</h2></div>
          <Button variant="ghost" size="icon" onClick={close}><X /></Button>
        </div>
        {children}
      </aside>
    </div>
  );
}

export default function ErrorsPage() {
  const [selected, setSelected] = useState<(typeof errors)[0] | null>(null);
  const [severity, setSeverity] = useState("All");

  return (
    <>
      <PageHeader eyebrow="Analytics" title="System Errors & Failures" subtitle="Investigate failures and resolve platform incidents.">
        <Button variant="outline">13 May — 12 Jun 2026 <ChevronDown /></Button>
      </PageHeader>
      
      <div className="stats-grid">
        <StatCard label="Total errors" value="32" note="This period" icon={AlertTriangle} />
        <StatCard label="Critical" value="7" note="3 unresolved" icon={Zap} alert />
        <StatCard label="Warnings" value="19" note="4 unresolved" icon={Bell} />
        <StatCard label="Resolved" value="25 / 32" note="78% resolution rate" icon={Check} />
      </div>

      <div className="toolbar">
        <div className="chips">
          {["All", "Critical", "Warning", "Info"].map(x => (
            <Button key={x} variant={severity === x ? "default" : "outline"} size="sm" onClick={() => setSeverity(x)}>{x}</Button>
          ))}
        </div>
        <label className="search">
          <Search />
          <Input placeholder="Search errors..." />
        </label>
      </div>

      <Panel title="Error feed">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>{["Timestamp", "Severity", "Category", "Description", "Estate", "Status", "Actions"].map(x => <th key={x}>{x}</th>)}</tr>
            </thead>
            <tbody>
              {errors.filter(e => severity === "All" || e.severity === severity).map(e => (
                <tr className="clickable-row" key={e.time + e.category} onClick={() => setSelected(e)}>
                  <td className="data-text">{e.time}</td>
                  <td><Badge>{e.severity}</Badge></td>
                  <td>{e.category}</td>
                  <td>{e.description}</td>
                  <td>{e.estate}</td>
                  <td><Badge>{e.status}</Badge></td>
                  <td><RowActions labels={["View", "Resolve", "Dismiss"]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {selected && (
        <Drawer title="Error details" close={() => setSelected(null)}>
          <Badge>{selected.severity}</Badge>
          <h3 className="drawer-heading">{selected.description}</h3>
          <p className="drawer-copy">The gate controller stopped responding after three sequential heartbeat requests. Automatic reconnection was unsuccessful.</p>
          <dl className="definition-list">
            <div><dt>Estate</dt><dd>{selected.estate}</dd></div>
            <div><dt>Category</dt><dd>{selected.category}</dd></div>
            <div><dt>Timestamp</dt><dd>{selected.time}</dd></div>
            <div><dt>Affected resource</dt><dd className="data-text">gate_ctrl_NORTH_01</dd></div>
          </dl>
          <div className="code-block">
            <span>STACK INFO</span>
            <code>ConnectionTimeout: heartbeat exceeded 30s<br />at GateClient.poll (gateway.ts:184)<br />retry_count: 3</code>
          </div>
          <Panel title="Resolution log">
            <p className="empty-copy">No resolution logged yet.</p>
          </Panel>
          <label className="field">
            <span>Resolution note</span>
            <Input placeholder="Add investigation notes..." />
          </label>
          <div className="stack-actions">
            <Button><Check />Mark resolved</Button>
            <Button variant="outline">Add note</Button>
            <Button variant="destructive">Escalate</Button>
          </div>
        </Drawer>
      )}
    </>
  );
}
