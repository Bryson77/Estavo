"use client";

import { useState } from "react";
import { Download, Building2, Users, CircleDollarSign, AlertTriangle, ChevronRight } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { estates, months, errors } from "@/lib/mock-data";
import { PageHeader, StatCard, Panel, EstateTable, MiniTooltip, statusTone } from "@/components/shared";
import { useRouter } from "next/navigation";

export default function OverviewPage() {
  const router = useRouter();

  const navigate = (view: string) => {
    router.push(`/dashboard/${view}`);
  };

  return (
    <>
      <PageHeader eyebrow="Portfolio overview" title="Good afternoon, Bryson" subtitle="Here’s what’s happening across Estavo today.">
        <Button variant="outline"><Download /> Export snapshot</Button>
      </PageHeader>
      
      <div className="stats-grid">
        <StatCard label="Total estates" value="5" note="4 active · 1 suspended" icon={Building2} />
        <StatCard label="Total residents" value="3 842" note="2 914 registered · 928 pending" icon={Users} />
        <StatCard label="Monthly recurring revenue" value="R 72 000.00" note="+4.2% from last month" icon={CircleDollarSign} />
        <StatCard label="Active system alerts" value="4" note="2 critical · 2 warnings" icon={AlertTriangle} alert />
      </div>

      <div className="dashboard-split">
        <Panel title="Estate health summary" action={<button className="text-link" onClick={() => navigate("estates")}>View all estates <ChevronRight /></button>}>
          <EstateTable compact />
        </Panel>
        <Panel title="Live system alerts" action={<button className="text-link" onClick={() => navigate("errors")}>View all alerts <ChevronRight /></button>}>
          <div className="alert-feed">
            {errors.slice(0, 4).map((e) => (
              <button className="alert-item" key={e.time + e.category} onClick={() => navigate("errors")}>
                <span className={`alert-dot status-${statusTone(e.severity)}`} />
                <span><strong>{e.description}</strong><small>{e.estate} · {e.time.split(" · ")[1]}</small></span>
                <ChevronRight />
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div className="chart-grid-three">
        <Panel title="Monthly revenue trend">
          <div className="chart-box">
            <ResponsiveContainer>
              <AreaChart data={months}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-foreground)" stopOpacity={.25} />
                    <stop offset="100%" stopColor="var(--chart-foreground)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis hide />
                <Tooltip content={<MiniTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="var(--chart-foreground)" fill="url(#revenueFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Ticket volume">
          <div className="chart-box">
            <ResponsiveContainer>
              <BarChart data={months}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis hide />
                <Tooltip content={<MiniTooltip />} />
                <Bar dataKey="tickets" fill="var(--chart-muted)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Resident app adoption">
          <div className="adoption-list">
            {estates.slice(0, 4).map(e => (
              <div key={e.name}>
                <span><b>{e.name}</b><em>{e.adoption}%</em></span>
                <div className="progress">
                  <i style={{ width: `${e.adoption}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
