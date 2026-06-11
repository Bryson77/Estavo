---
name: Supabase server auth pattern
description: How requireAuth middleware works in the Express API server using Supabase JS v2
---

**Pattern used in `artifacts/api-server/src/lib/auth.ts`:**

1. Extract Bearer token from `Authorization` header
2. Verify with `supabaseAppAnon.auth.getUser(token)` — validates the Supabase JWT without trusting the client
3. Fetch `profiles` row using `supabaseApp` (service role) — bypasses RLS for this internal server lookup
4. Fetch `units.unit_number` separately if `unit_id` is set
5. Attach `req.user` (userId, estateId, role, unitId, unitNumber, firstName, lastName)
6. Attach `req.supabaseClient` — a fresh per-request client with `global.headers.Authorization = Bearer token` so downstream RLS policies fire correctly

**Why:** Using the anon key for getUser() (not service role) ensures Supabase validates the token signature. Using service role for profile lookup avoids RLS chicken-and-egg. The per-request RLS client ensures estate/unit scoping is enforced by Supabase policies, not just app code.

**How to apply:** Route handlers use `req.supabaseClient!` for user-scoped data queries (guest_otps, gate_log) and `supabaseApp` for cross-user lookups (estate config, unit resolution).
