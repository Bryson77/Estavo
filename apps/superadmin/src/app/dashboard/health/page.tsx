"use client";

import { useState } from "react";
import { ChevronDown, DoorOpen, Activity, Users, TrendingUp, TrendingDown, Gauge } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { estates, months } from "@/lib/mock-data";
import { PageHeader, StatCard, Panel, SimpleTable, MiniTooltip, statusTone } from "@/components/shared";
import { useRouter } from "next/navigation";

function ChartBars({ dataKey }: { dataKey: "health" | "adoption" }) {
  return (
    <div className="chart-box">
      <ResponsiveContainer>
        <BarChart data={estates} margin={{ left: 0, right: 0 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" hide />
          <YAxis hide domain={[0, 100]} />
          <Tooltip content={<MiniTooltip />} />
          <Bar dataKey={dataKey} radius={[3, 3, 0, 0]}>
            {estates.map((e, i) => (
              <Cell key={i} fill={e[dataKey] >= 80 ? "var(--success)" : e[dataKey] >= 60 ? "var(--warning)" : "var(--error)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ComboChart() {
  return (
    <div className="chart-box">
      <ResponsiveContainer>
        <BarChart data={months}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis hide />
          <Tooltip content={<MiniTooltip />} />
          <Bar dataKey="tickets" fill="var(--chart-muted)" />
          <Line type="monotone" dataKey="resolution" stroke="var(--chart-foreground)" strokeWidth={2} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function HealthPage() {
  const router = useRouter();

  const openEstate = (name: string) => {
    router.push(`/dashboard/estates/${encodeURIComponent(name.toLowerCase().replace(/ /g, '-'))}`);
  };

  return (
    <>
      <PageHeader eyebrow="Analytics" title="Health & Performance" subtitle="Portfolio performance signals and operational health.">
        <Button variant="outline">13 May — 12 Jun 2026 <ChevronDown /></Button>
      </PageHeader>
      
      <div className="stats-grid">
        <StatCard label="Average health score" value="74.4%" note="↑ 2.8 this period" icon={Gauge} />
        <StatCard label="Total gate uptime" value="97.8%" note="Weighted across 12 gates" icon={DoorOpen} />
        <StatCard label="Avg resolution time" value="10.2 hrs" note="↓ 1.8 hrs this period" icon={Activity} />
        <StatCard label="Resident app adoption" value="64.4%" note="Portfolio average" icon={Users} />
      </div>

      <div className="chart-grid-two">
        <Panel title="Estate health scores">
          <div className="health-bars">
            {estates.map(e => (
              <button key={e.name} onClick={() => openEstate(e.name)}>
                <span>{e.name}<b>{e.health}%</b></span>
                <div className="progress">
                  <i className={`status-${statusTone(e.health)}`} style={{ width: `${e.health}%` }} />
                </div>
              </button>
            ))}
          </div>
        </Panel>
        
        <Panel title="Gate uptime by estate">
          <ChartBars dataKey="health" />
        </Panel>
        
        <Panel title="Ticket volume & resolution trend">
          <ComboChart />
        </Panel>
        
        <Panel title="Resident adoption by estate">
          <ChartBars dataKey="adoption" />
        </Panel>
      </div>

      <Panel title="Alerts this period">
        <SimpleTable 
          headers={["Estate", "Alert type", "Count", "Trend", "Last occurred"]} 
          rows={[
            ["Umhlanga Gardens", "Gate offline", "8", <span key="1" className="trend-down"><TrendingUp />+3</span>, "12 Jun · 14:32"],
            ["Atlantic Terraces", "Guest code delivery", "5", <span key="2" className="trend-up"><TrendingDown />-2</span>, "12 Jun · 13:18"],
            ["Silver Lakes North", "Login failures", "3", "—", "12 Jun · 11:04"]
          ]} 
        />
      </Panel>
    </>
  );
}
