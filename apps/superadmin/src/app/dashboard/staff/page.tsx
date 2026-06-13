"use client";

import { useState } from "react";
import { UserPlus, ChevronRight, Activity, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, SimpleTable, Badge, RowActions } from "@/components/shared";

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

function ActivityList() {
  return (
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
  );
}

export default function StaffPage() {
  const [tab, setTab] = useState("Estate Managers");
  const [drawer, setDrawer] = useState(false);

  return (
    <>
      <PageHeader eyebrow="People" title="Staff & Managers" subtitle="Control access across the platform and estate teams.">
        <Button><UserPlus />Invite manager</Button>
      </PageHeader>
      
      <nav className="tabs">
        <button className={tab === "Platform Staff" ? "active" : ""} onClick={() => setTab("Platform Staff")}>Platform staff</button>
        <button className={tab === "Estate Managers" ? "active" : ""} onClick={() => setTab("Estate Managers")}>Estate managers</button>
      </nav>

      <Panel title={tab}>
        {tab === "Estate Managers" ? (
          <SimpleTable 
            headers={["Name", "Email", "Assigned estate", "Last login", "Status", "Actions"]} 
            rows={[
              ["Sipho Dlamini", "sipho@kyalamihills.co.za", "Kyalami Hills", "12 Jun · 13:58", <Badge key="1">Active</Badge>, <Button key="a1" variant="ghost" onClick={() => setDrawer(true)}>View <ChevronRight /></Button>],
              ["Thandi Nkosi", "thandi@waterfallridge.co.za", "Waterfall Ridge", "12 Jun · 12:41", <Badge key="2">Active</Badge>, <RowActions key="a2" labels={["View", "Message", "Reassign", "Deactivate"]} />],
              ["Lisa Adams", "lisa@atlanticterraces.co.za", "Atlantic Terraces", "11 Jun · 17:02", <Badge key="3">Active</Badge>, <RowActions key="a3" labels={["View", "Message", "Reassign", "Deactivate"]} />]
            ]} 
          />
        ) : (
          <SimpleTable 
            headers={["Name", "Email", "Role", "Last login", "Status", "Actions"]} 
            rows={[
              ["Bryson Mabilo", "bryson@estavo.co.za", "Superadmin", "12 Jun · 14:28", <Badge key="1">Active</Badge>, <RowActions key="a1" labels={["View", "Edit"]} />],
              ["Naledi Mahlangu", "naledi@estavo.co.za", "Support", "12 Jun · 11:18", <Badge key="2">Active</Badge>, <RowActions key="a2" labels={["View", "Edit", "Deactivate"]} />],
              ["Michael Botha", "michael@estavo.co.za", "Billing Admin", "10 Jun · 09:44", <Badge key="3" tone="neutral">Inactive</Badge>, <RowActions key="a3" labels={["View", "Edit", "Activate"]} />]
            ]} 
          />
        )}
      </Panel>

      {drawer && (
        <Drawer title="Manager profile" close={() => setDrawer(false)}>
          <div className="profile-card">
            <div className="avatar">SD</div>
            <div>
              <h3>Sipho Dlamini</h3>
              <p>sipho@kyalamihills.co.za</p>
              <Badge>Active</Badge>
            </div>
          </div>
          <dl className="definition-list">
            <div><dt>Assigned estate</dt><dd>Kyalami Hills</dd></div>
            <div><dt>Phone</dt><dd>+27 82 555 0142</dd></div>
            <div><dt>Last login</dt><dd>12 Jun · 13:58</dd></div>
          </dl>
          <h3>Last 10 activity entries</h3>
          <ActivityList />
          <div className="stack-actions">
            <Button>Reassign estate</Button>
            <Button variant="outline">Message</Button>
            <Button variant="destructive">Deactivate</Button>
          </div>
        </Drawer>
      )}
    </>
  );
}
