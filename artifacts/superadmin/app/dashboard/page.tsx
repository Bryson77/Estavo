import { supabaseAppAdmin } from "@/lib/supabase-app";
import { type PlatformStats, type Estate } from "@/lib/api";
import {
  Building2,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users,
  Layers,
} from "lucide-react";

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}) {
  return (
    <div
      className="p-5 rounded-lg"
      style={{
        background: "var(--sa-card)",
        border: "1px solid var(--sa-border-subtle)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} strokeWidth={1.5} />
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "var(--sa-text-muted)" }}
        >
          {label}
        </span>
      </div>
      <div
        className="text-2xl font-bold tracking-tight"
        style={{ color: "var(--sa-text)", letterSpacing: "-0.02em" }}
      >
        {value}
      </div>
      {sub && (
        <div
          className="text-xs mt-1"
          style={{ color: "var(--sa-text-dim)" }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; border: string; color: string }> = {
    active: { bg: "var(--status-success-bg)", border: "var(--status-success-border)", color: "var(--status-success)" },
    pilot: { bg: "var(--status-info-bg)", border: "var(--status-info-border)", color: "var(--status-info)" },
    suspended: { bg: "var(--status-danger-bg)", border: "var(--status-danger-border)", color: "var(--status-danger)" },
    cancelled: { bg: "var(--status-neutral-bg)", border: "var(--status-neutral-border)", color: "var(--status-neutral)" },
  };
  const c = cfg[status] ?? cfg.cancelled;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold capitalize"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}
    >
      {status}
    </span>
  );
}

// ─── Dashboard Page ──────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { data, error } = await supabaseAppAdmin
    .from("estates")
    .select(`
      id,
      name,
      unit_count,
      monthly_fee_rands,
      payment_status,
      status,
      plan_notes,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching estates for dashboard:", error);
  }

  // Transform to match the expected Estate interface
  const estates = (data || []).map((e: any) => {
    return {
      id: e.id,
      appEstateId: e.id,
      name: e.name,
      unitCount: e.unit_count || 0,
      subscriptionTier: e.plan_notes?.toLowerCase().includes("enterprise") ? "enterprise" : 
                        e.plan_notes?.toLowerCase().includes("growth") ? "growth" : 
                        e.plan_notes?.toLowerCase().includes("estate") ? "estate" : "starter",
      subscriptionStatus: e.payment_status || "active",
      isActive: e.status === "active",
      managerEmail: null,
      monthlyAmountZar: e.monthly_fee_rands || 0,
      createdAt: e.created_at,
    };
  });

  const stats: PlatformStats = {
    totalEstates: estates.length,
    activeEstates: estates.filter((e) => e.subscriptionStatus === "active").length,
    pilotEstates: estates.filter((e) => e.subscriptionStatus === "pilot").length,
    suspendedEstates: estates.filter((e) => e.subscriptionStatus === "suspended").length,
    totalUnits: estates.reduce((sum, e) => sum + e.unitCount, 0),
    mrrZar: estates.reduce((sum, e) => sum + e.monthlyAmountZar, 0),
  };

  const recentEstates = estates.slice(0, 8);

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--sa-text)", letterSpacing: "-0.02em" }}
        >
          Platform Overview
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--sa-text-muted)" }}>
          Estavo SaaS metrics and estate management
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
        <StatCard label="Total Estates" value={stats.totalEstates} icon={Building2} />
        <StatCard
          label="Active"
          value={stats.activeEstates}
          sub="live estates"
          icon={TrendingUp}
        />
        <StatCard
          label="Pilot"
          value={stats.pilotEstates}
          sub="discounted"
          icon={Layers}
        />
        <StatCard
          label="Suspended"
          value={stats.suspendedEstates}
          icon={AlertTriangle}
        />
        <StatCard
          label="Total Units"
          value={stats.totalUnits.toLocaleString()}
          icon={Users}
        />
        <StatCard
          label="MRR"
          value={`R${stats.mrrZar.toLocaleString("en-ZA", {
            minimumFractionDigits: 0,
          })}`}
          sub="excl. VAT"
          icon={DollarSign}
        />
      </div>

      {/* Recent estates table */}
      <div>
        <h2
          className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-4"
          style={{ color: "var(--sa-text-muted)" }}
        >
          Recent Estates
        </h2>

        {recentEstates.length === 0 ? (
          <div
            className="rounded-lg p-12 text-center text-sm"
            style={{
              background: "var(--sa-card)",
              border: "1px solid var(--sa-border-subtle)",
              color: "var(--sa-text-muted)",
            }}
          >
            No estates provisioned yet.
          </div>
        ) : (
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: "var(--sa-card)",
              border: "1px solid var(--sa-border-subtle)",
            }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--sa-border)" }}>
                  {["Estate", "Units", "Tier", "Status", "MRR"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em]"
                      style={{ color: "var(--sa-text-dim)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentEstates.map((e) => (
                  <tr
                    key={e.id}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid var(--sa-border-subtle)" }}
                    onMouseEnter={(ev) =>
                      (ev.currentTarget.style.background = "var(--sa-hover)")
                    }
                    onMouseLeave={(ev) =>
                      (ev.currentTarget.style.background = "transparent")
                    }
                  >
                    <td className="px-5 py-4">
                      <div
                        className="font-medium"
                        style={{ color: "var(--sa-text)" }}
                      >
                        {e.name}
                      </div>
                      {e.managerEmail && (
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "var(--sa-text-dim)" }}
                        >
                          {e.managerEmail}
                        </div>
                      )}
                    </td>
                    <td
                      className="px-5 py-4"
                      style={{ color: "var(--sa-text-secondary)" }}
                    >
                      {e.unitCount}
                    </td>
                    <td
                      className="px-5 py-4 capitalize"
                      style={{ color: "var(--sa-text-secondary)" }}
                    >
                      {e.subscriptionTier}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={e.subscriptionStatus} />
                    </td>
                    <td
                      className="px-5 py-4"
                      style={{ color: "var(--sa-text-secondary)" }}
                    >
                      {e.monthlyAmountZar
                        ? `R${e.monthlyAmountZar.toLocaleString()}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
