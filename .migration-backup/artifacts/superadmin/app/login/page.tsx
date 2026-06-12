"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--sa-black)" }}
    >
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo mark */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5"
            style={{
              background: "var(--sa-text)",
              color: "var(--sa-black)",
            }}
          >
            <Lock size={20} strokeWidth={2.5} />
          </div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--sa-text)", letterSpacing: "-0.02em" }}
          >
            Estavo
          </h1>
          <p
            className="text-xs mt-1.5 uppercase tracking-[0.2em] font-medium"
            style={{ color: "var(--sa-text-muted)" }}
          >
            Superadmin Portal
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-2"
              style={{ color: "var(--sa-text-muted)" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@estavo.co.za"
              className="w-full px-4 py-3 rounded-lg text-sm transition-colors"
              style={{
                background: "var(--sa-input-bg)",
                border: "1px solid var(--sa-input-border)",
                color: "var(--sa-text)",
                outline: "none",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--sa-text-muted)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--sa-input-border)")
              }
            />
          </div>

          <div>
            <label
              className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-2"
              style={{ color: "var(--sa-text-muted)" }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••"
              className="w-full px-4 py-3 rounded-lg text-sm transition-colors"
              style={{
                background: "var(--sa-input-bg)",
                border: "1px solid var(--sa-input-border)",
                color: "var(--sa-text)",
                outline: "none",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--sa-text-muted)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--sa-input-border)")
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "var(--sa-text)",
              color: "var(--sa-black)",
            }}
          >
            {loading ? (
              "Signing in…"
            ) : (
              <>
                Sign In <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <p
          className="text-center text-[11px] mt-8"
          style={{ color: "var(--sa-text-dim)" }}
        >
          Estavo Platform · Internal Use Only
        </p>
      </div>
    </div>
  );
}
