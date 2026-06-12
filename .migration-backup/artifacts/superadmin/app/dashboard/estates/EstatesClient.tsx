"use client";

import { useState } from "react";
import Link from "next/link";
import { type Estate } from "@/lib/api";
import { Search, Plus, ExternalLink } from "lucide-react";

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

// ─── Estates Client ────────────────────────────────────────────────────────────

const TIERS = ["all", "starter", "growth", "estate", "enterprise"];

export default function EstatesClient({ initialEstates }: { initialEstates: Estate[] }) {
  const [estates] = useState<Estate[]>(initialEstates);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");

  const filtered = estates
    .filter((e) => tierFilter === "all" || e.subscriptionTier === tierFilter)
    .filter(
      (e) =>
        !search ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.managerEmail ?? "").includes(search)
    );

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--sa-text)", letterSpacing: "-0.02em" }}
          >
            Estates
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--sa-text-muted)" }}>
            {estates.length} total
          </p>
        </div>
        <Link
          href="/dashboard/provision"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: "var(--sa-text)",
            color: "var(--sa-black)",
          }}
        >
          <Plus size={15} />
          Provision New
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--sa-text-dim)" }}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search estates…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
            style={{
              background: "var(--sa-input-bg)",
              border: "1px solid var(--sa-input-border)",
              color: "var(--sa-text)",
              outline: "none",
            }}
          />
        </div>
        <div className="flex gap-1.5">
          {TIERS.map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className="px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer"
              style={{
                background:
                  tierFilter === t ? "var(--sa-text)" : "var(--sa-surface)",
                color:
                  tierFilter === t ? "var(--sa-black)" : "var(--sa-text-muted)",
                border: `1px solid ${
                  tierFilter === t ? "var(--sa-text)" : "var(--sa-border)"
                }`,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div
          className="rounded-lg p-12 text-center text-sm"
          style={{
            background: "var(--sa-card)",
            border: "1px solid var(--sa-border-subtle)",
            color: "var(--sa-text-muted)",
          }}
        >
          No estates found.
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
                {["Estate", "Units", "Tier", "Status", "MRR", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em]"
                      style={{ color: "var(--sa-text-dim)" }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className="transition-colors"
                  style={{
                    borderBottom: "1px solid var(--sa-border-subtle)",
                  }}
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
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "var(--sa-text-dim)" }}
                    >
                      {e.managerEmail ?? "—"}
                    </div>
                    {e.isPilot && e.pilotDiscountPct ? (
                      <div
                        className="text-[11px] mt-0.5"
                        style={{ color: "var(--status-info)" }}
                      >
                        {e.pilotDiscountPct}% pilot discount
                      </div>
                    ) : null}
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
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {e.subscriptionStatus !== "suspended" && (
                        <button
                          className="text-[11px] px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer"
                          style={{
                            background: "var(--status-danger-bg)",
                            border: "1px solid var(--status-danger-border)",
                            color: "var(--status-danger)",
                          }}
                        >
                          Suspend
                        </button>
                      )}
                      <button
                        className="text-[11px] flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer"
                        style={{
                          background: "var(--sa-surface)",
                          border: "1px solid var(--sa-border)",
                          color: "var(--sa-text-secondary)",
                        }}
                      >
                        View <ExternalLink size={10} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
