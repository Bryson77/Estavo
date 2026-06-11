import { createClient } from "@supabase/supabase-js";

const platformUrl = import.meta.env.VITE_SUPABASE_PLATFORM_URL;
const platformAnonKey = import.meta.env.VITE_SUPABASE_PLATFORM_ANON_KEY;

if (!platformUrl || !platformAnonKey) {
  console.warn("[supabase] Platform env vars not set — auth will fail");
}

const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder";

export const supabase = createClient(
  platformUrl ?? PLACEHOLDER_URL,
  platformAnonKey ?? PLACEHOLDER_KEY,
  { auth: { persistSession: true, autoRefreshToken: true } }
);

export const isSupabaseConfigured = Boolean(platformUrl && platformAnonKey);
