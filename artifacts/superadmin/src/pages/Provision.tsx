import React, { useState } from "react";
import { useLocation } from "wouter";
import { platformApi } from "@/lib/api";

const TIERS = [
  { value: "starter", label: "Starter", description: "Up to 100 units · R1,200/mo", units: 100, price: 1200 },
  { value: "growth", label: "Growth", description: "Up to 250 units · R2,500/mo", units: 250, price: 2500 },
  { value: "estate", label: "Estate", description: "Up to 500 units · R4,500/mo", units: 500, price: 4500 },
  { value: "enterprise", label: "Enterprise", description: "500+ units · Custom pricing", units: null, price: null },
];

export default function ProvisionPage() {
  const [, navigate] = useLocation();
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

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Estate name is required."); return; }
    if (!form.unitCount || isNaN(Number(form.unitCount))) { setError("Unit count must be a number."); return; }

    setLoading(true);
    setError(null);

    const selectedTier = TIERS.find(t => t.value === form.subscriptionTier);

    try {
      await platformApi.createEstate({
        name: form.name.trim(),
        address: form.address.trim() || undefined,
        unitCount: Number(form.unitCount),
        subscriptionTier: form.subscriptionTier as any,
        subscriptionStatus: form.isPilot ? "pilot" : "active",
        managerEmail: form.managerEmail.trim() || undefined,
        isPilot: form.isPilot,
        pilotDiscountPct: form.isPilot ? Number(form.pilotDiscountPct) : 0,
        monthlyAmountZar: selectedTier?.price
          ? selectedTier.price * (form.isPilot ? (1 - Number(form.pilotDiscountPct) / 100) : 1)
          : undefined,
        notes: form.notes.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate("/estates"), 2000);
    } catch (err: any) {
      setError(err.message ?? "Failed to provision estate");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-950 border border-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">Estate Provisioned!</h2>
          <p className="text-slate-400 text-sm mt-2">Redirecting to estates list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Provision New Estate</h1>
        <p className="text-slate-400 text-sm mt-1">Register a new estate on the EstateHQ platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-950 border border-red-800 text-red-300 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300">Estate Details</h2>
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Estate Name *</label>
            <input
              value={form.name}
              onChange={e => set("name", e.target.value)}
              required
              placeholder="e.g. Hillcrest Estate"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Address</label>
            <input
              value={form.address}
              onChange={e => set("address", e.target.value)}
              placeholder="14 Hillcrest Drive, KZN"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Unit Count *</label>
              <input
                type="number"
                min="1"
                value={form.unitCount}
                onChange={e => set("unitCount", e.target.value)}
                required
                placeholder="136"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Manager Email</label>
              <input
                type="email"
                value={form.managerEmail}
                onChange={e => set("managerEmail", e.target.value)}
                placeholder="mgr@estate.co.za"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Subscription Tier</h2>
          <div className="grid grid-cols-2 gap-3">
            {TIERS.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => set("subscriptionTier", t.value)}
                className={`text-left p-4 rounded-xl border transition-colors ${
                  form.subscriptionTier === t.value
                    ? "bg-indigo-950 border-indigo-600"
                    : "bg-slate-800 border-slate-700 hover:border-slate-600"
                }`}
              >
                <div className={`text-sm font-semibold ${form.subscriptionTier === t.value ? "text-indigo-300" : "text-white"}`}>
                  {t.label}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-300">Pilot Pricing</h2>
              <p className="text-xs text-slate-500 mt-0.5">Discounted during rollout phase</p>
            </div>
            <button
              type="button"
              onClick={() => set("isPilot", !form.isPilot)}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.isPilot ? "bg-indigo-600" : "bg-slate-700"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isPilot ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
          {form.isPilot && (
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.pilotDiscountPct}
                onChange={e => set("pilotDiscountPct", e.target.value)}
                className="w-32 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Internal Notes</label>
          <textarea
            value={form.notes}
            onChange={e => set("notes", e.target.value)}
            rows={3}
            placeholder="Any notes about this estate or onboarding context..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
        >
          {loading ? "Provisioning..." : "Provision Estate"}
        </button>
      </form>
    </div>
  );
}
