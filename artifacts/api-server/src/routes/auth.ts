import { Router } from "express";
import { z } from "zod";
import { supabaseApp, supabaseAppAnon } from "../lib/supabase.js";
import { requireAuth, type AuthRequest } from "../lib/auth.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

const requestOtpSchema = z.object({
  email: z.string().email(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().optional(),
  token: z.string().optional(),
}).refine(d => d.otp ?? d.token, { message: "otp or token required" });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// POST /auth/request-otp
// POST /auth/request-otp
// Checks email exists in profiles, then asks Supabase Auth to email a 6-digit OTP.
router.post("/auth/request-otp", authLimiter, async (req, res) => {
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
      options: { 
        shouldCreateUser: false,
        emailRedirectTo: process.env.MAGIC_LINK_REDIRECT_URL || "resident://"
      },
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

// POST /auth/request-password-setup
// Checks email exists, then sends a password reset magic link.
router.post("/auth/request-password-setup", authLimiter, async (req, res) => {
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

    const redirectUrl = process.env.MAGIC_LINK_REDIRECT_URL || `${req.protocol}://${req.get('host')}/api/auth/reset-password`;
    
    const { error } = await supabaseAppAnon.auth.resetPasswordForEmail(email.toLowerCase(), {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.error("[auth/request-password-setup] Supabase error:", error.message);
      res.status(500).json({ error: "Failed to send setup link. Please try again." });
      return;
    }

    res.json({ message: "A password setup link has been sent to your email." });
  } catch (err) {
    console.error("[auth/request-password-setup]", err);
    res.status(500).json({ error: "Failed to request password setup" });
  }
});

// GET /auth/reset-password
// Serves a simple HTML page that reads the Supabase hash fragment and updates the password.
router.get("/auth/reset-password", (req, res) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_APP_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_APP_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).send("Server configuration error: missing Supabase credentials.");
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Set Your Password - EstateHQ</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0F1923; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
    .container { background-color: #1F2933; padding: 40px; border-radius: 12px; width: 100%; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
    h2 { margin-top: 0; margin-bottom: 24px; text-align: center; }
    label { display: block; margin-bottom: 8px; font-size: 14px; color: #A0AAB2; }
    input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #3E4C59; background-color: #0F1923; color: white; margin-bottom: 24px; box-sizing: border-box; }
    button { width: 100%; padding: 14px; border-radius: 8px; border: none; background-color: #FF6347; color: white; font-weight: bold; cursor: pointer; font-size: 16px; }
    button:disabled { opacity: 0.7; cursor: not-allowed; }
    #message { margin-top: 16px; text-align: center; font-size: 14px; }
    .success { color: #4CAF50; }
    .error { color: #F44336; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Set New Password</h2>
    <form id="password-form">
      <label for="password">New Password</label>
      <input type="password" id="password" required minlength="6" placeholder="Enter at least 6 characters">
      <button type="submit" id="submit-btn">Save Password</button>
      <div id="message"></div>
    </form>
  </div>

  <script>
    const supabaseUrl = "${supabaseUrl}";
    const supabaseAnonKey = "${supabaseAnonKey}";
    const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

    const form = document.getElementById('password-form');
    const submitBtn = document.getElementById('submit-btn');
    const messageEl = document.getElementById('message');

    // Supabase client automatically parses the hash fragment on load and establishes a session.
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('password').value;
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
      messageEl.textContent = '';
      messageEl.className = '';

      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        messageEl.textContent = error.message;
        messageEl.className = 'error';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Password';
      } else {
        messageEl.textContent = 'Password updated successfully! You can now log into the app.';
        messageEl.className = 'success';
        submitBtn.textContent = 'Done';
      }
    });
  </script>
</body>
</html>
  `;
  res.send(html);
});


// POST /auth/verify-otp
// Verifies the 6-digit code with Supabase Auth and returns a session token.
// Verifies the 6-digit code with Supabase Auth and returns a session token.
// Accepts both `otp` (frontend field name) and `token` (Supabase field name).
router.post("/auth/verify-otp", authLimiter, async (req, res) => {
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

    const { data: profile, error: profileErr } = await supabaseApp
      .from("profiles")
      .select("id, estate_id, unit_id, role, full_name, email, phone, is_active, estates(name, address), units(unit_number)")
      .eq("id", userId)
      .single();

    if (profileErr || !profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const unitNumber = profile.units?.unit_number ?? null;
    const estate = profile.estates ?? {};

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

// POST /auth/login
// POST /auth/login
// Logs in via email and password, returning a session token.
router.post("/auth/login", authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email or password format" });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const { data, error } = await supabaseAppAnon.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error || !data.session) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const accessToken = data.session.access_token;
    const userId = data.user!.id;

    const { data: profile, error: profileErr } = await supabaseApp
      .from("profiles")
      .select("id, estate_id, unit_id, role, full_name, email, phone, is_active, estates(name, address), units(unit_number)")
      .eq("id", userId)
      .single();

    if (profileErr || !profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    if (!profile.is_active) {
      res.status(403).json({ error: "Your account has been suspended. Contact your estate manager." });
      return;
    }

    const unitNumber = profile.units?.unit_number ?? null;
    const estate = profile.estates ?? {};

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
    console.error("[auth/login]", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /auth/me — returns fresh profile data for the authenticated user
router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: profile, error: profileErr } = await supabaseApp
      .from("profiles")
      .select("id, estate_id, unit_id, role, full_name, email, phone, is_active, estates(name, address), units(unit_number)")
      .eq("id", req.user!.userId)
      .single();

    if (profileErr || !profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const unitNumber = profile.units?.unit_number ?? null;
    const estate = profile.estates ?? {};

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

// POST /auth/logout — invalidates the Supabase session server-side
router.post("/auth/logout", requireAuth, async (req: AuthRequest, res) => {
  try {
    // req.supabaseClient is already scoped to the user's JWT — signOut invalidates the refresh token
    await req.supabaseClient!.auth.signOut();
  } catch {
    // Never block logout — client will clear local storage regardless
  }
  res.json({ success: true });
});

export default router;

