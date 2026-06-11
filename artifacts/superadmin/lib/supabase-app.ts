import { createClient } from "@supabase/supabase-js";

// We use the estatehq-app database for reading/writing estate data
// This requires the Service Role Key because ops sits outside of the app's RLS
const appUrl = process.env.SUPABASE_APP_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const appServiceRoleKey = process.env.SUPABASE_APP_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!appUrl || !appServiceRoleKey) {
  console.warn("[supabase] App env vars not set — data fetching will fail");
}

const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder";

export const supabaseAppAdmin = createClient(
  appUrl ?? PLACEHOLDER_URL,
  appServiceRoleKey ?? PLACEHOLDER_KEY,
  {
    auth: { persistSession: false },
  }
);
