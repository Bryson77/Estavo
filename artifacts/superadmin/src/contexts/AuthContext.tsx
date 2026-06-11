import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// ============================================================
// Auth state machine
// ============================================================
type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "mfa_required"; factorId: string; challengeId: string }
  | { status: "unauthorized" } // Authenticated but not in platform_admins
  | { status: "authenticated"; session: Session; user: User; adminRole: string };

interface AuthContextValue {
  authState: AuthState;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  verifyMfa: (code: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function checkAdminRole(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("platform_admins")
    .select("role, is_active")
    .eq("id", userId)
    .single();
  if (!data || !data.is_active) return null;
  return (data.role as string) ?? "super_admin";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });
  // Store MFA challenge data between signIn and verifyMfa calls
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);
  const [pendingChallengeId, setPendingChallengeId] = useState<string | null>(null);

  // On mount — restore session and verify role
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (!session) {
        setAuthState({ status: "unauthenticated" });
        return;
      }
      const role = await checkAdminRole(session.user.id);
      if (!mounted) return;
      if (!role) {
        await supabase.auth.signOut();
        setAuthState({ status: "unauthorized" });
        return;
      }
      setAuthState({ status: "authenticated", session, user: session.user, adminRole: role });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (event === "SIGNED_OUT" || !session) {
          setAuthState({ status: "unauthenticated" });
          setPendingFactorId(null);
          setPendingChallengeId(null);
          return;
        }
        // SESSION_UPDATED fires after MFA verification — re-check role
        if (event === "MFA_CHALLENGE_VERIFIED" || event === "TOKEN_REFRESHED") {
          const role = await checkAdminRole(session.user.id);
          if (!mounted) return;
          if (!role) {
            await supabase.auth.signOut();
            setAuthState({ status: "unauthorized" });
            return;
          }
          setAuthState({ status: "authenticated", session, user: session.user, adminRole: role });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setAuthState({ status: "loading" });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthState({ status: "unauthenticated" });
      return { error: error.message };
    }

    // Check if MFA factors are enrolled
    const { data: mfaData } = await supabase.auth.mfa.listFactors();
    const totpFactor = mfaData?.totp?.[0] ?? null;

    if (totpFactor && totpFactor.status === "verified") {
      // User has TOTP enrolled — require MFA challenge
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: totpFactor.id });

      if (challengeError || !challengeData) {
        await supabase.auth.signOut();
        setAuthState({ status: "unauthenticated" });
        return { error: "Failed to initiate MFA challenge. Try again." };
      }

      setPendingFactorId(totpFactor.id);
      setPendingChallengeId(challengeData.id);
      setAuthState({
        status: "mfa_required",
        factorId: totpFactor.id,
        challengeId: challengeData.id,
      });
      return { error: null };
    }

    // No TOTP enrolled yet — sign in succeeds but role gate still applies
    // (Server will reject aal1 tokens — user must enrol via Supabase dashboard)
    if (!data.session) {
      setAuthState({ status: "unauthenticated" });
      return { error: "Sign in failed. No session returned." };
    }

    const role = await checkAdminRole(data.session.user.id);
    if (!role) {
      await supabase.auth.signOut();
      setAuthState({ status: "unauthorized" });
      return { error: null };
    }

    // No TOTP factor — warn but allow login (enrolment required for API calls to work)
    setAuthState({
      status: "authenticated",
      session: data.session,
      user: data.session.user,
      adminRole: role,
    });
    return { error: null };
  };

  const verifyMfa = async (code: string): Promise<{ error: string | null }> => {
    if (!pendingFactorId || !pendingChallengeId) {
      return { error: "No active MFA challenge. Please sign in again." };
    }

    const { data, error } = await supabase.auth.mfa.verify({
      factorId: pendingFactorId,
      challengeId: pendingChallengeId,
      code,
    });

    if (error || !data.session) {
      return { error: "Invalid code. Check your authenticator app and try again." };
    }

    setPendingFactorId(null);
    setPendingChallengeId(null);

    const role = await checkAdminRole(data.session.user.id);
    if (!role) {
      await supabase.auth.signOut();
      setAuthState({ status: "unauthorized" });
      return { error: null };
    }

    setAuthState({
      status: "authenticated",
      session: data.session,
      user: data.session.user,
      adminRole: role,
    });
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPendingFactorId(null);
    setPendingChallengeId(null);
    setAuthState({ status: "unauthenticated" });
  };

  return (
    <AuthContext.Provider value={{ authState, signIn, verifyMfa, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
