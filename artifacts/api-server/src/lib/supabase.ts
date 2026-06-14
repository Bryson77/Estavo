import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_APP_URL;
const supabaseKey = process.env.SUPABASE_APP_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables (SUPABASE_APP_URL or SUPABASE_APP_SERVICE_ROLE_KEY)");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
