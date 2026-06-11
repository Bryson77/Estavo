import { Router } from "express";
import { z } from "zod";
import { supabaseApp, supabaseAppAnon } from "../lib/supabase.js";
import { requireAuth, type AuthRequest } from "../lib/auth.js";

const router = Router();

const requestOtpSchema = z.object({
  email: z.string().email(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6).optional(),
  token: z.string().length(6).optional(),
}).refine(d => d.otp ?? d.token, { message: "otp or token required" });

// POST /auth/request-otp
// Checks email exists in profiles, then asks Supabase Auth to email a 6-digit OTP.
router.post("/auth/request-otp", async (req, res) => {
  const parsed = requestOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }
  const { email } = parsed.data;

  try {
    const { data: profile } = await supabaseApp
      .from("profiles")
      .select("id, is_active")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (!profile) {
      res.status(404).json({ error: "No account found with this email. Contact your estate manager." });
      return;
    }

    if (!profile.is_active) {
      res.status(403).json({ error: "Your account has been suspended. Contact your estate manager." });
      return;
    }

    const { error } = await supabaseAppAnon.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: { shouldCreateUser: false },
    });

    if (error) {
      console.error("[auth/request-otp] Supabase error:", error.message);
      res.status(500).json({ error: "Failed to send sign-in code. Please try again." });
      return;
    }

    res.json({ message: "A sign-in code has been sent to your email." });
  } catch (err) {
    console.error("[auth/request-otp]", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// POST /auth/verify-otp
// Verifies the 6-digit code with Supabase Auth and returns a session token.
// Accepts both `otp` (frontend field name) and `token` (Supabase field name).
router.post("/auth/verify-otp", async (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request — email and 6-digit code required" });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const otpCode = (parsed.data.otp ?? parsed.data.token) as string;

  try {
    const { data, error } = await supabaseAppAnon.auth.verifyOtp({
      email,
      token: otpCode,
      type: "email",
    });

    if (error || !data.session) {
      res.status(401).json({ error: "Invalid or expired code. Request a new one." });
      return;
    }

    const accessToken = data.session.access_token;
    const userId = data.user!.id;

    const { data: profile } = await supabaseApp
      .from("profiles")
      .select("id, estate_id, unit_id, role, full_name, email, phone, is_active")
      .eq("id", userId)
      .single();

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    let unitNumber: string | null = null;
    if (profile.unit_id) {
      const { data: unit } = await supabaseApp
        .from("units")
        .select("unit_number")
        .eq("id", profile.unit_id)
        .single();
      unitNumber = unit?.unit_number ?? null;
    }

    const { data: estate } = await supabaseApp
      .from("estates")
      .select("name, address")
      .eq("id", profile.estate_id)
      .single();

    const parts = (profile.full_name ?? "").trim().split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");

    res.json({
      token: accessToken,
      user: {
        id: userId,
        firstName,
        lastName,
        email: profile.email,
        role: profile.role,
        unitNumber,
        estateId: profile.estate_id,
        estateName: estate?.name ?? "",
        estateAddress: estate?.address ?? "",
        accountStanding: "good",
        phone: (profile as any).phone ?? null,
      },
    });
  } catch (err) {
    console.error("[auth/verify-otp]", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// GET /auth/me — returns fresh profile data for the authenticated user
router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: profile } = await supabaseApp
      .from("profiles")
      .select("id, estate_id, unit_id, role, full_name, email, phone, is_active")
      .eq("id", req.user!.userId)
      .single();

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    let unitNumber: string | null = null;
    if (profile.unit_id) {
      const { data: unit } = await supabaseApp
        .from("units")
        .select("unit_number")
        .eq("id", profile.unit_id)
        .single();
      unitNumber = unit?.unit_number ?? null;
    }

    const { data: estate } = await supabaseApp
      .from("estates")
      .select("name, address")
      .eq("id", profile.estate_id)
      .single();

    const parts = (profile.full_name ?? "").trim().split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ");

    res.json({
      id: profile.id,
      firstName,
      lastName,
      email: profile.email,
      role: profile.role,
      unitNumber,
      estateId: profile.estate_id,
      estateName: estate?.name ?? "",
      estateAddress: estate?.address ?? "",
      accountStanding: "good",
      phone: (profile as any).phone ?? null,
    });
  } catch (err) {
    console.error("[auth/me]", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

export default router;
