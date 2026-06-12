import { createClient } from "@supabase/supabase-js";

// ── Platform auth client (for login/session) ──────────────────────────────────
const platformUrl = process.env.NEXT_PUBLIC_SUPABASE_PLATFORM_URL;
const platformAnon = process.env.NEXT_PUBLIC_SUPABASE_PLATFORM_ANON_KEY;

export const supabase =
  platformUrl && platformAnon
    ? createClient(platformUrl, platformAnon)
    : null;

// ── App DB — service-role admin (server only) ─────────────────────────────────
const appUrl = process.env.SUPABASE_APP_URL;
const appServiceKey = process.env.SUPABASE_APP_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  appUrl && appServiceKey
    ? createClient(appUrl, appServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

export const isConfigured = !!(appUrl && appServiceKey);
