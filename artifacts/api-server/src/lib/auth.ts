import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Request, Response, NextFunction } from "express";
import { supabaseApp, supabaseAppAnon } from "./supabase.js";

export interface AuthUser {
  userId: string;
  estateId: string;
  role: string;
  email: string;
  unitId: string | null;
  unitNumber: string | null;
  firstName: string;
  lastName: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  supabaseClient?: SupabaseClient;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);

  try {
    // 1. Verify token with Supabase Auth
    const { data: { user }, error: authError } = await supabaseAppAnon.auth.getUser(token);
    if (authError || !user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    // 2. Fetch profile using service role (bypasses RLS for this internal server lookup)
    const { data: profile, error: profileError } = await supabaseApp
      .from("profiles")
      .select("id, estate_id, unit_id, role, full_name, email, is_active")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      res.status(401).json({ error: "Profile not found" });
      return;
    }

    if (!profile.is_active) {
      res.status(403).json({ error: "Account suspended. Contact your estate manager." });
      return;
    }

    // 3. Resolve unit_number if unit_id is set
    let unitNumber: string | null = null;
    if (profile.unit_id) {
      const { data: unit } = await supabaseApp
        .from("units")
        .select("unit_number")
        .eq("id", profile.unit_id)
        .single();
      unitNumber = unit?.unit_number ?? null;
    }

    // 4. Split full_name into firstName / lastName for frontend compatibility
    const parts = (profile.full_name ?? "").trim().split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");

    req.user = {
      userId: user.id,
      estateId: profile.estate_id,
      role: profile.role,
      email: profile.email,
      unitId: profile.unit_id ?? null,
      unitNumber,
      firstName,
      lastName,
    };

    // 5. Attach a per-request RLS-aware client so route handlers can make
    //    user-scoped queries and Supabase RLS policies fire correctly.
    req.supabaseClient = createClient(
      process.env.SUPABASE_APP_URL!,
      process.env.SUPABASE_APP_ANON_KEY!,
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    next();
  } catch (err) {
    console.error("[requireAuth]", err);
    res.status(500).json({ error: "Authentication error" });
  }
}
