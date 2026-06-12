import { supabaseAppAdmin } from "@/lib/supabase-app";
import { DollarSign, TrendingUp, Building2 } from "lucide-react";

export default async function BillingPage() {
  const { data, error } = await supabaseAppAdmin
    .from("estates")
    .select(`
      id,
      name,
      monthly_fee_rands,
      payment_status,
      plan_notes,
      users (
        email,
        role
      )
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching billing estates:", error);
  }

  // Transform to match the expected format
  const estates = (data || []).map((e: any) => {
    const manager = e.users?.find((u: any) => u.role === "manager");

    return {
      id: e.id,
      name: e.name,
      tier: e.plan_notes?.toLowerCase().includes("enterprise") ? "enterprise" : 
            e.plan_notes?.toLowerCase().includes("growth") ? "growth" : 
            e.plan_notes?.toLowerCase().includes("estate") ? "estate" : "starter",
      mrr: e.monthly_fee_rands || 0,
      isPilot: e.plan_notes?.toLowerCase().includes("pilot") || false,
      pilotDiscount: e.plan_notes?.toLowerCase().includes("pilot") ? 50 : 0, // Assumption based on mock
      managerEmail: manager?.email || "—",
    };
  });

  const mrr = estates.reduce((sum, e) => sum + e.mrr, 0);
  const arr = mrr * 12;
  const payingEstates = estates.filter((e) => e.mrr > 0).length;

  const tierBreakdown = ["starter", "growth", "estate", "enterprise"]
    .map((tier) => ({
      tier,
      count: estates.filter((e) => e.tier === tier).length,
      mrr: estates
        .filter((e) => e.tier === tier)
        .reduce((s, e) => s + e.mrr, 0),
    }))
    .filter((t) => t.count > 0);

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--sa-text)", letterSpacing: "-0.02em" }}
        >
          Billing Overview
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--sa-text-muted)" }}>
          Revenue metrics across all estates
        </p>
      </div>

      {/* Revenue cards */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        <div
          className="p-5 rounded-lg"
          style={{
            background: "var(--sa-card)",
            border: "1px solid var(--sa-border-subtle)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={14} strokeWidth={1.5} />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: "var(--sa-text-muted)" }}
            >
              Monthly Recurring Revenue
            </span>
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: "var(--sa-text)" }}
          >
            R{mrr.toLocaleString()}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: "var(--sa-text-dim)" }}
          >
            excl. VAT (15%)
          </div>
        </div>

        <div
          className="p-5 rounded-lg"
          style={{
            background: "var(--sa-card)",
            border: "1px solid var(--sa-border-subtle)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} strokeWidth={1.5} />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: "var(--sa-text-muted)" }}
            >
              Annual Run Rate
            </span>
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: "var(--sa-text)" }}
          >
            R{arr.toLocaleString()}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: "var(--sa-text-dim)" }}
          >
            MRR × 12
          </div>
        </div>

        <div
          className="p-5 rounded-lg"
          style={{
            background: "var(--sa-card)",
            border: "1px solid var(--sa-border-subtle)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={14} strokeWidth={1.5} />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: "var(--sa-text-muted)" }}
            >
              Paying Estates
            </span>
          </div>
          <div
            className="text-2xl font-bold"
            style={{ color: "var(--sa-text)" }}
          >
            {payingEstates}
          </div>
          <div
            className="text-xs mt-1"
            style={{ color: "var(--sa-text-dim)" }}
          >
            of {estates.length} total
          </div>
        </div>
      </div>

      {/* Revenue by tier */}
      {tierBreakdown.length > 0 && (
        <div
          className="rounded-lg overflow-hidden mb-8"
          style={{
            background: "var(--sa-card)",
            border: "1px solid var(--sa-border-subtle)",
          }}
        >
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--sa-border)" }}
          >
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--sa-text-secondary)" }}
            >
              Revenue by Tier
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--sa-border)" }}>
                {["Tier", "Estates", "MRR", "% of MRR"].map((h) => (
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
              {tierBreakdown.map((t) => (
                <tr
                  key={t.tier}
                  style={{
                    borderBottom: "1px solid var(--sa-border-subtle)",
                  }}
                >
                  <td
                    className="px-5 py-4 capitalize font-medium"
                    style={{ color: "var(--sa-text)" }}
                  >
                    {t.tier}
                  </td>
                  <td
                    className="px-5 py-4"
                    style={{ color: "var(--sa-text-secondary)" }}
                  >
                    {t.count}
                  </td>
                  <td
                    className="px-5 py-4"
                    style={{ color: "var(--sa-text-secondary)" }}
                  >
                    R{t.mrr.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-1 rounded-full h-1.5"
                        style={{ background: "var(--sa-border)" }}
                      >
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${
                              mrr > 0
                                ? (t.mrr / mrr) * 100
                                : 0
                            }%`,
                            background: "var(--sa-text-secondary)",
                          }}
                        />
                      </div>
                      <span
                        className="text-xs w-10 text-right"
                        style={{ color: "var(--sa-text-muted)" }}
                      >
                        {mrr > 0 ? Math.round((t.mrr / mrr) * 100) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Per-estate billing */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "var(--sa-card)",
          border: "1px solid var(--sa-border-subtle)",
        }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--sa-border)" }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--sa-text-secondary)" }}
          >
            Per-Estate Billing
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sa-border)" }}>
              {["Estate", "Tier", "MRR", "Pilot"].map((h) => (
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
            {estates.map((e) => (
              <tr
                key={e.id}
                className="transition-colors"
                style={{
                  borderBottom: "1px solid var(--sa-border-subtle)",
                }}
              >
                <td className="px-5 py-4">
                  <div
                    className="font-medium"
                    style={{ color: "var(--sa-text)" }}
                  >
                    {e.name}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "var(--sa-text-dim)" }}
                  >
                    {e.managerEmail}
                  </div>
                </td>
                <td
                  className="px-5 py-4 capitalize"
                  style={{ color: "var(--sa-text-secondary)" }}
                >
                  {e.tier}
                </td>
                <td
                  className="px-5 py-4 font-medium"
                  style={{ color: "var(--sa-text)" }}
                >
                  {e.mrr > 0 ? `R${e.mrr.toLocaleString()}` : "—"}
                </td>
                <td
                  className="px-5 py-4"
                  style={{ color: "var(--sa-text-secondary)" }}
                >
                  {e.isPilot ? (
                    <span style={{ color: "var(--status-info)" }}>
                      {e.pilotDiscount}% off
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
