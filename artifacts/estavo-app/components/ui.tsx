"use client";

import React from "react";

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({
  label, value, sub, accent,
}: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
      <div className="text-[28px] font-bold tracking-tight leading-none"
        style={{ color: accent ? "var(--accent)" : "var(--text)" }}>
        {value}
      </div>
      {sub && <div className="text-[12px] mt-1.5" style={{ color: "var(--text-dim)" }}>{sub}</div>}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
type BadgeVariant = "success"|"warning"|"danger"|"info"|"neutral"|"sage"|"amber"|"active"|"inactive"|"pilot"|"pending"|"approved"|"rejected"|"more_info"|"online"|"offline"|"overdue"|"paid"|"attention";

const BADGE_STYLES: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  success:   { bg:"var(--success-bg)",  color:"var(--success-text)", border:"var(--success-border)" },
  warning:   { bg:"var(--warning-bg)",  color:"var(--warning-text)", border:"var(--warning-border)" },
  danger:    { bg:"var(--danger-bg)",   color:"var(--danger-text)",  border:"var(--danger-border)"  },
  info:      { bg:"var(--info-bg)",     color:"var(--info-text)",    border:"var(--info-border)"    },
  neutral:   { bg:"var(--neutral-bg)",  color:"var(--neutral-text)", border:"var(--neutral-border)" },
  sage:      { bg:"var(--sage-bg)",     color:"var(--sage)",         border:"var(--sage-border)"    },
  amber:     { bg:"var(--amber-bg)",    color:"var(--amber)",        border:"var(--amber-border)"   },
  active:    { bg:"var(--success-bg)",  color:"var(--success-text)", border:"var(--success-border)" },
  inactive:  { bg:"var(--neutral-bg)",  color:"var(--neutral-text)", border:"var(--neutral-border)" },
  pilot:     { bg:"var(--info-bg)",     color:"var(--info-text)",    border:"var(--info-border)"    },
  pending:   { bg:"var(--warning-bg)",  color:"var(--warning-text)", border:"var(--warning-border)" },
  approved:  { bg:"var(--success-bg)",  color:"var(--success-text)", border:"var(--success-border)" },
  rejected:  { bg:"var(--danger-bg)",   color:"var(--danger-text)",  border:"var(--danger-border)"  },
  more_info: { bg:"var(--info-bg)",     color:"var(--info-text)",    border:"var(--info-border)"    },
  online:    { bg:"var(--success-bg)",  color:"var(--success-text)", border:"var(--success-border)" },
  offline:   { bg:"var(--neutral-bg)",  color:"var(--neutral-text)", border:"var(--neutral-border)" },
  overdue:   { bg:"var(--danger-bg)",   color:"var(--danger-text)",  border:"var(--danger-border)"  },
  paid:      { bg:"var(--success-bg)",  color:"var(--success-text)", border:"var(--success-border)" },
  attention: { bg:"var(--warning-bg)",  color:"var(--warning-text)", border:"var(--warning-border)" },
};

export function Badge({ variant, children, mono }: { variant: BadgeVariant; children: React.ReactNode; mono?: boolean }) {
  const s = BADGE_STYLES[variant] ?? BADGE_STYLES.neutral;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-[0.08em] ${mono ? "font-mono" : ""}`}
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {children}
    </span>
  );
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: "var(--text)" }}>{title}</h1>
        {subtitle && <p className="text-[13px] mt-0.5" style={{ color: "var(--text-muted)" }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, message }: { icon?: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-3 opacity-30">{icon}</div>}
      <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>{message}</p>
    </div>
  );
}

// ── Pill Filter ───────────────────────────────────────────────────────────────
export function PillFilter({
  options, value, onChange,
}: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-[0.06em] cursor-pointer transition-all"
          style={{
            background: value === o ? "var(--accent-muted)" : "var(--surface)",
            color:      value === o ? "var(--active-text)"  : "var(--text-muted)",
            border:     `1px solid ${value === o ? "var(--accent)" : "var(--border)"}`,
          }}>
          {o}
        </button>
      ))}
    </div>
  );
}

// ── Action Button ─────────────────────────────────────────────────────────────
export function Btn({
  children, onClick, variant = "primary", size = "md", disabled,
}: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary"|"secondary"|"ghost"|"danger";
  size?: "sm"|"md"; disabled?: boolean;
}) {
  const styles = {
    primary:   { bg:"var(--accent)",   color:"#FFFFFF",            border:"var(--accent)" },
    secondary: { bg:"var(--surface)",  color:"var(--text-muted)",  border:"var(--border)" },
    ghost:     { bg:"transparent",     color:"var(--text-muted)",  border:"transparent" },
    danger:    { bg:"var(--danger-bg)",color:"var(--danger-text)", border:"var(--danger-border)" },
  }[variant];
  const pd = size === "sm" ? "px-3 py-1.5 text-[11px]" : "px-4 py-2.5 text-[13px]";
  return (
    <button onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-1.5 ${pd} rounded-lg font-semibold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
      style={{ background: styles.bg, color: styles.color, border: `1px solid ${styles.border}` }}>
      {children}
    </button>
  );
}

// ── Score Pill ────────────────────────────────────────────────────────────────
export function ScorePill({ score }: { score: number }) {
  const variant: BadgeVariant = score >= 80 ? "success" : score >= 60 ? "warning" : "danger";
  return <Badge variant={variant}>{score}/100</Badge>;
}

// ── Stars ─────────────────────────────────────────────────────────────────────
export function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-[13px] font-mono" style={{ color: "var(--text-muted)" }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))} {rating.toFixed(1)}
    </span>
  );
}

// ── Type Badge for approvals ──────────────────────────────────────────────────
export function ApprovalTypeBadge({ type }: { type: string }) {
  const map: Record<string, BadgeVariant> = {
    "QUOTE":"sage", "EXPENSE":"amber", "POLICY CHANGE":"danger", "VENDOR ONBOARD":"info",
  };
  return <Badge variant={map[type] ?? "neutral"} mono>{type}</Badge>;
}
