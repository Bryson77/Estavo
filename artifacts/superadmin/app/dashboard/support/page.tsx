"use client";

import { useState } from "react";
import { Info } from "lucide-react";

const MOCK_LOGS = [
  {
    id: "1",
    action: "Estate provisioned",
    estate: "Hillcrest Estate",
    admin: "admin@estavo.co.za",
    createdAt: new Date().toISOString(),
    notes: "Pilot client — 50% discount",
  },
  {
    id: "2",
    action: "Manager password reset",
    estate: "Pinehurst Village",
    admin: "admin@estavo.co.za",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    notes: "",
  },
  {
    id: "3",
    action: "Subscription tier changed",
    estate: "Oaklands Residential",
    admin: "admin@estavo.co.za",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    notes: "Upgraded from starter to estate",
  },
  {
    id: "4",
    action: "Suspension lifted",
    estate: "Riverside Estate",
    admin: "admin@estavo.co.za",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    notes: "Payment received — account reactivated",
  },
  {
    id: "5",
    action: "Resident account suspended",
    estate: "The Willows",
    admin: "admin@estavo.co.za",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    notes: "POPIA violation — data sharing complaint",
  },
  {
    id: "6",
    action: "Estate provisioned",
    estate: "Greenfield Complex",
    admin: "admin@estavo.co.za",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    notes: "Free pilot — 100% discount for testing",
  },
];

export default function SupportPage() {
  const [logs] = useState(MOCK_LOGS);

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--sa-text)", letterSpacing: "-0.02em" }}
        >
          Support Logs
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--sa-text-muted)" }}>
          Superadmin actions and support interventions
        </p>
      </div>

      {/* Logs */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          background: "var(--sa-card)",
          border: "1px solid var(--sa-border-subtle)",
        }}
      >
        {logs.length === 0 ? (
          <div
            className="text-center py-16 text-sm"
            style={{ color: "var(--sa-text-muted)" }}
          >
            No support actions logged yet.
          </div>
        ) : (
          <div>
            {logs.map((log, i) => (
              <div
                key={log.id}
                className="px-5 py-5 transition-colors"
                style={{
                  borderBottom:
                    i < logs.length - 1
                      ? "1px solid var(--sa-border-subtle)"
                      : "none",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--sa-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--sa-text)" }}
                      >
                        {log.action}
                      </span>
                      <span
                        className="text-[11px] px-2 py-0.5 rounded font-medium"
                        style={{
                          background: "var(--sa-surface)",
                          border: "1px solid var(--sa-border)",
                          color: "var(--sa-text-muted)",
                        }}
                      >
                        {log.estate}
                      </span>
                    </div>
                    {log.notes && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--sa-text-dim)" }}
                      >
                        {log.notes}
                      </p>
                    )}
                    <div
                      className="text-[11px] mt-2 font-mono"
                      style={{ color: "var(--sa-text-dim)" }}
                    >
                      By {log.admin}
                    </div>
                  </div>
                  <div
                    className="text-[11px] whitespace-nowrap font-mono"
                    style={{ color: "var(--sa-text-dim)" }}
                  >
                    {new Date(log.createdAt).toLocaleDateString("en-ZA", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info banner */}
      <div
        className="mt-6 rounded-lg p-4 flex items-start gap-3"
        style={{
          background: "var(--status-warning-bg)",
          border: "1px solid var(--status-warning-border)",
        }}
      >
        <Info
          size={16}
          className="shrink-0 mt-0.5"
          style={{ color: "var(--status-warning)" }}
        />
        <div>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--status-warning)" }}
          >
            Live support logs
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--sa-text-dim)" }}>
            Once the platform Supabase project is configured with the{" "}
            <code
              className="px-1 rounded text-[11px]"
              style={{ background: "var(--sa-surface)" }}
            >
              support_logs
            </code>{" "}
            table, actions will appear here automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
