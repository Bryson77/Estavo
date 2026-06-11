"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

const TIERS = [
  { value: "starter", label: "Starter", description: "Up to 100 units · R1,200/mo", price: 1200 },
  { value: "growth", label: "Growth", description: "Up to 250 units · R2,500/mo", price: 2500 },
  { value: "estate", label: "Estate", description: "Up to 500 units · R4,500/mo", price: 4500 },
  { value: "enterprise", label: "Enterprise", description: "500+ units · Custom pricing", price: null },
];

export default function ProvisionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    address: "",
    unitCount: "",
    subscriptionTier: "starter",
    managerEmail: "",
    isPilot: false,
    pilotDiscountPct: "50",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const set = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Estate name is required.");
      return;
    }
    if (!form.unitCount || isNaN(Number(form.unitCount))) {
      setError("Unit count must be a number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { provisionEstate } = await import("./actions");
      await provisionEstate({
        name: form.name,
        address: form.address,
        unitCount: Number(form.unitCount),
        subscriptionTier: form.subscriptionTier,
        managerEmail: form.managerEmail,
        isPilot: form.isPilot,
        pilotDiscountPct: Number(form.pilotDiscountPct) || 0,
        notes: form.notes,
      });

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/estates"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to provision estate");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-full animate-fade-in">
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "var(--sa-text)",
              color: "var(--sa-black)",
            }}
          >
            <Check size={24} strokeWidth={3} />
          </div>
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--sa-text)" }}
          >
            Estate Provisioned
          </h2>
          <p
            className="text-sm mt-2"
            style={{ color: "var(--sa-text-muted)" }}
          >
            Redirecting to estates list…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--sa-text)", letterSpacing: "-0.02em" }}
        >
          Provision New Estate
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--sa-text-muted)" }}>
          Register a new estate on the EstateHQ platform
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            className="px-4 py-3 rounded-lg text-sm"
            style={{
              background: "var(--status-danger-bg)",
              border: "1px solid var(--status-danger-border)",
              color: "var(--status-danger)",
            }}
          >
            {error}
          </div>
        )}

        {/* Estate Details */}
        <div
          className="rounded-lg p-6 space-y-4"
          style={{
            background: "var(--sa-card)",
            border: "1px solid var(--sa-border-subtle)",
          }}
        >
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--sa-text-secondary)" }}
          >
            Estate Details
          </h2>
          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
              style={{ color: "var(--sa-text-muted)" }}
            >
              Estate Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              placeholder="e.g. Hillcrest Estate"
              className="w-full px-4 py-3 rounded-lg text-sm"
              style={{
                background: "var(--sa-input-bg)",
                border: "1px solid var(--sa-input-border)",
                color: "var(--sa-text)",
                outline: "none",
              }}
            />
          </div>
          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
              style={{ color: "var(--sa-text-muted)" }}
            >
              Address
            </label>
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="14 Hillcrest Drive, KZN"
              className="w-full px-4 py-3 rounded-lg text-sm"
              style={{
                background: "var(--sa-input-bg)",
                border: "1px solid var(--sa-input-border)",
                color: "var(--sa-text)",
                outline: "none",
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
                style={{ color: "var(--sa-text-muted)" }}
              >
                Unit Count *
              </label>
              <input
                type="number"
                min="1"
                value={form.unitCount}
                onChange={(e) => set("unitCount", e.target.value)}
                required
                placeholder="136"
                className="w-full px-4 py-3 rounded-lg text-sm"
                style={{
                  background: "var(--sa-input-bg)",
                  border: "1px solid var(--sa-input-border)",
                  color: "var(--sa-text)",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
                style={{ color: "var(--sa-text-muted)" }}
              >
                Manager Email
              </label>
              <input
                type="email"
                value={form.managerEmail}
                onChange={(e) => set("managerEmail", e.target.value)}
                placeholder="mgr@estate.co.za"
                className="w-full px-4 py-3 rounded-lg text-sm"
                style={{
                  background: "var(--sa-input-bg)",
                  border: "1px solid var(--sa-input-border)",
                  color: "var(--sa-text)",
                  outline: "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* Subscription Tier */}
        <div
          className="rounded-lg p-6"
          style={{
            background: "var(--sa-card)",
            border: "1px solid var(--sa-border-subtle)",
          }}
        >
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: "var(--sa-text-secondary)" }}
          >
            Subscription Tier
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {TIERS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set("subscriptionTier", t.value)}
                className="text-left p-4 rounded-lg transition-all cursor-pointer"
                style={{
                  background:
                    form.subscriptionTier === t.value
                      ? "var(--sa-active-bg)"
                      : "var(--sa-surface)",
                  border: `1px solid ${
                    form.subscriptionTier === t.value
                      ? "var(--sa-text-muted)"
                      : "var(--sa-border)"
                  }`,
                }}
              >
                <div
                  className="text-sm font-semibold"
                  style={{
                    color:
                      form.subscriptionTier === t.value
                        ? "var(--sa-text)"
                        : "var(--sa-text-secondary)",
                  }}
                >
                  {t.label}
                </div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: "var(--sa-text-dim)" }}
                >
                  {t.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pilot toggle */}
        <div
          className="rounded-lg p-6 space-y-4"
          style={{
            background: "var(--sa-card)",
            border: "1px solid var(--sa-border-subtle)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--sa-text-secondary)" }}
              >
                Pilot Pricing
              </h2>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--sa-text-dim)" }}
              >
                Discounted during rollout phase
              </p>
            </div>
            <button
              type="button"
              onClick={() => set("isPilot", !form.isPilot)}
              className="relative w-11 h-6 rounded-full transition-colors cursor-pointer"
              style={{
                background: form.isPilot
                  ? "var(--sa-text)"
                  : "var(--sa-border)",
              }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full shadow transition-transform"
                style={{
                  background: form.isPilot
                    ? "var(--sa-black)"
                    : "var(--sa-text-muted)",
                  transform: form.isPilot
                    ? "translateX(22px)"
                    : "translateX(2px)",
                }}
              />
            </button>
          </div>
          {form.isPilot && (
            <div>
              <label
                className="block text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
                style={{ color: "var(--sa-text-muted)" }}
              >
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.pilotDiscountPct}
                onChange={(e) => set("pilotDiscountPct", e.target.value)}
                className="w-32 px-4 py-2.5 rounded-lg text-sm"
                style={{
                  background: "var(--sa-input-bg)",
                  border: "1px solid var(--sa-input-border)",
                  color: "var(--sa-text)",
                  outline: "none",
                }}
              />
            </div>
          )}
        </div>

        {/* Notes */}
        <div
          className="rounded-lg p-6"
          style={{
            background: "var(--sa-card)",
            border: "1px solid var(--sa-border-subtle)",
          }}
        >
          <label
            className="block text-[11px] font-semibold uppercase tracking-[0.12em] mb-2"
            style={{ color: "var(--sa-text-muted)" }}
          >
            Internal Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            placeholder="Any notes about this estate or onboarding context…"
            className="w-full px-4 py-3 rounded-lg text-sm resize-none"
            style={{
              background: "var(--sa-input-bg)",
              border: "1px solid var(--sa-input-border)",
              color: "var(--sa-text)",
              outline: "none",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-lg text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "var(--sa-text)",
            color: "var(--sa-black)",
          }}
        >
          {loading ? "Provisioning…" : "Provision Estate"}
        </button>
      </form>
    </div>
  );
}
