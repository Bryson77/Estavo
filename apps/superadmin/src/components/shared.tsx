import React from "react";
import { Activity, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { estates } from "@/lib/mock-data";
import Link from "next/link";

export function statusTone(value: string | number) {
  if (typeof value === "number") return value >= 80 ? "success" : value >= 60 ? "warning" : "error";
  if (["Active", "Online", "Paid", "Resolved", "Connected", "Valid"].includes(value)) return "success";
  if (["Warning", "Pending", "Setup Incomplete", "Degraded", "Investigating"].includes(value)) return "warning";
  if (["Critical", "Offline", "Suspended", "Overdue", "Open"].includes(value)) return "error";
  return "neutral";
}

export function Badge({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return <span className={`status-badge status-${tone ?? statusTone(String(children))}`}>{children}</span>;
}

export function StatCard({ label, value, note, icon: Icon, alert }: { label: string; value: string; note: string; icon: typeof Activity; alert?: boolean }) {
  return (
    <article className="metric-card">
      <div className="metric-top"><span>{label}</span><Icon className={alert ? "text-error" : "text-muted-foreground"} /></div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-note">{note}</span>
    </article>
  );
}

export function PageHeader({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <header className="page-header">
      <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{subtitle && <p className="page-subtitle">{subtitle}</p>}</div>
      {children && <div className="header-actions">{children}</div>}
    </header>
  );
}

export function Panel({ title, action, children, className = "" }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-header"><h2>{title}</h2>{action}</div>{children}</section>;
}

export function MiniTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><span>{label}</span>{payload.map((item) => <strong key={item.name}>{item.name}: {item.value.toLocaleString("en-ZA")}</strong>)}</div>;
}

export function EstateTable({ compact = false }: { compact?: boolean }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Estate name</th>
            {!compact && <th>Province</th>}
            <th>Units</th>
            <th>Health</th>
            {!compact && <th>Manager</th>}
            <th>Gate</th>
            {!compact && <th>MRR</th>}
            <th>{compact ? "Last activity" : "Status"}</th>
            {!compact && <th />}
          </tr>
        </thead>
        <tbody>
          {estates.map((estate) => (
            <tr key={estate.name} className="clickable-row">
              <td><Link href={`/dashboard/estates/${encodeURIComponent(estate.name.toLowerCase().replace(/ /g, '-'))}`} className="table-link">{estate.name}</Link></td>
              {!compact && <td>{estate.province}</td>}
              <td className="data-text">{estate.units}</td>
              <td><Badge tone={statusTone(estate.health)}>{estate.health}%</Badge></td>
              {!compact && <td>{estate.manager}</td>}
              <td><Badge>{estate.gate}</Badge></td>
              {!compact && <td className="data-text">{estate.mrr}</td>}
              <td>{compact ? "4 min ago" : <Badge>{estate.status}</Badge>}</td>
              {!compact && <td><Button variant="ghost" size="icon" aria-label="More actions"><MoreHorizontal /></Button></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SimpleTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="table-scroll">
      <table>
        <thead><tr>{headers.map(x => <th key={x}>{x}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function RowActions({ labels }: { labels: string[] }) {
  return (
    <div className="row-actions">
      {labels.slice(0, 2).map(x => <Button variant="ghost" size="sm" key={x}>{x}</Button>)}
      {labels.length > 2 && <Button variant="ghost" size="icon" title={labels.slice(2).join(", ")}><MoreHorizontal /></Button>}
    </div>
  );
}
