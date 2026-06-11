import { createClient } from "@supabase/supabase-js";

const appUrl = process.env.SUPABASE_APP_URL;
const appServiceKey = process.env.SUPABASE_APP_SERVICE_ROLE_KEY;
const appAnonKey = process.env.SUPABASE_APP_ANON_KEY;

const platformUrl = process.env.SUPABASE_PLATFORM_URL;
const platformServiceKey = process.env.SUPABASE_PLATFORM_SERVICE_ROLE_KEY;

if (!appUrl || !appServiceKey || !appAnonKey) {
  throw new Error("Missing SUPABASE_APP_URL, SUPABASE_APP_SERVICE_ROLE_KEY, or SUPABASE_APP_ANON_KEY");
}

if (!platformUrl || !platformServiceKey) {
  throw new Error("Missing SUPABASE_PLATFORM_URL or SUPABASE_PLATFORM_SERVICE_ROLE_KEY");
}

// Service-role client — bypasses RLS. Use ONLY for server-side admin/cross-estate ops.
export const supabaseApp = createClient(appUrl, appServiceKey, {
  auth: { persistSession: false },
});

// Anon client — used to call Supabase Auth (signInWithOtp, verifyOtp, getUser)
export const supabaseAppAnon = createClient(appUrl, appAnonKey, {
  auth: { persistSession: false },
});

// Platform project client (billing / superadmin)
export const supabasePlatform = createClient(platformUrl, platformServiceKey, {
  auth: { persistSession: false },
});
