# EstateHQ Resident App — Progress Log

## Project Overview

**EstateHQ** is a residential estate management platform. This repo contains:

| Artifact | Kind | Path | Status |
|---|---|---|---|
| API Server | Express (Node 20) | `artifacts/api-server` | ✅ Running |
| Resident App | Expo / React Native | `artifacts/resident` | ✅ Running |
| Canvas / Mockup Sandbox | Vite | `artifacts/mockup-sandbox` | ✅ Running |

The backend is fully migrated off Drizzle ORM to Supabase JS v2. Auth is now Supabase Auth (magic link / email OTP).

---

## What Was Built This Session

### 1. Mobile App — Setup & Fixes

- Re-registered `artifacts/resident` as a proper Expo artifact with its own workflow (`artifacts/resident: expo`)
- Fixed CORS in the API server (`cors({ origin: true, credentials: true })`)
- Replaced deprecated `TouchableWithoutFeedback` → `Pressable` throughout
- Replaced deprecated React Native `shadow*` props → `boxShadow` style
- **Logo** — added real EstateHQ PNG logo to `assets/images/logo.png`; updated login screen to display it above the sign-in form

### 2. Backend — Full Drizzle → Supabase Migration

#### Removed
- `lib/db/` — entire Drizzle ORM package deleted
- `@workspace/db`, `drizzle-orm`, `jsonwebtoken` removed from `api-server` dependencies
- Custom JWT signing/verification (`signToken`, `verifyToken`) removed
- `routes/seed.ts` removed (Drizzle-only seeder)
- Dev bypass OTP (`123456` hardcoded) removed

#### `lib/supabase.ts`
Three Supabase clients exported:

| Export | Key | Purpose |
|---|---|---|
| `supabaseApp` | Service Role | Admin/server ops — bypasses RLS |
| `supabaseAppAnon` | Anon | Auth calls: `signInWithOtp`, `verifyOtp`, `getUser` |
| `supabasePlatform` | Platform Service Role | Billing / superadmin |

**Node 20 fix:** `ws` npm package installed and passed as `realtime: { transport: ws }` to every `createClient` call — required because Node 20 has no native WebSocket.

#### `lib/auth.ts` — `requireAuth` middleware
1. Extracts `Bearer` token from `Authorization` header
2. Verifies with `supabaseAppAnon.auth.getUser(token)` — validates Supabase JWT
3. Fetches `profiles` row via service-role client (bypasses RLS for server-side lookup)
4. Resolves `unit_number` from `units` table if `unit_id` is set
5. Attaches `req.user` — `{ userId, estateId, role, unitId, unitNumber, firstName, lastName }`
6. Attaches `req.supabaseClient` — fresh per-request client with user's JWT in headers so Supabase RLS policies fire correctly for downstream queries

#### `routes/auth.ts`

| Route | What it does |
|---|---|
| `POST /auth/request-otp` | Pre-checks email in `profiles`, calls `supabaseAppAnon.auth.signInWithOtp` to send a 6-digit code |
| `POST /auth/verify-otp` | Calls `supabaseAppAnon.auth.verifyOtp`, returns Supabase `access_token` + profile/unit/estate data |
| `GET /auth/me` | Returns fresh profile for the authenticated user |

#### `routes/guests.ts` — rewired to `guest_otps` table

| Route | Logic |
|---|---|
| `GET /guests` | Queries `guest_otps` by `estate_id` + `unit_id`; reads `estates.guest_code_config` jsonb for limits |
| `POST /guests` | Validates against config (max active codes), generates unique 6-digit `otp_code`, inserts into `guest_otps` |
| `DELETE /guests/:id` | Sets `revoked_at`, `deactivated_at`, `deactivated_by` on the row |

Response shape is transformed from Supabase snake_case → camelCase to stay compatible with the existing frontend (`guestFirstName`, `guestLastName`, `pinCode`, `validUntil`, `isActive`, etc.)

#### `routes/gates.ts` — rewired to `gate_log` + `estates.gates`

| Route | Logic |
|---|---|
| `GET /gates` | Returns `estates.gates` jsonb array for the user's estate |
| `POST /gates/trigger` | Inserts into `gate_log` with `entry_type: "resident"`, simulated `hardware_response_ms`, returns `logId` for undo |
| `POST /gates/undo` | Sets `gate_log.status = "cancelled"` for the given `logId` |
| `GET /gates/activity` | Returns recent `gate_log` entries; residents filtered to their `unit_id`, staff see all |

#### Stubbed Routes (501 Not Implemented)
These reference tables not yet in the live Supabase schema. Each file has a TODO comment naming the likely Supabase table to wire up.

| Route file | Supabase table (when ready) |
|---|---|
| `routes/reports.ts` | `maintenance_requests` ✅ exists in Supabase |
| `routes/emergency.ts` | `incidents` ✅ exists in Supabase |
| `routes/amenities.ts` | `amenities` (TBD) |
| `routes/community.ts` | `community_posts`, `notices` (TBD) |
| `routes/contractors.ts` | `contractors` (TBD) |

---

## Supabase Tables in Use

| Table | Used by |
|---|---|
| `profiles` | Auth middleware, `GET /auth/me`, `POST /auth/verify-otp` |
| `units` | Auth middleware (unit_number resolution) |
| `estates` | Gates (gates jsonb), Guests (guest_code_config jsonb), Auth (estate name) |
| `guest_otps` | All guest routes |
| `gate_log` | All gate routes |
| `gate_status` | Available, not yet queried |

---

## Supabase Tables Ready to Wire (not yet used)

| Table | Maps to |
|---|---|
| `maintenance_requests` | `/reports` routes |
| `incidents` | `/emergency` routes |

---

## Environment Variables Required

| Secret | Where used |
|---|---|
| `SUPABASE_APP_URL` | All three Supabase clients |
| `SUPABASE_APP_ANON_KEY` | Auth calls, per-request RLS client |
| `SUPABASE_APP_SERVICE_ROLE_KEY` | Admin/service-role client |
| `SUPABASE_PLATFORM_URL` | Platform client |
| `SUPABASE_PLATFORM_SERVICE_ROLE_KEY` | Platform client |

All five are set in Replit Secrets.

---

## Testing — Mock Estate

Mock data is seeded in the live `estatehq-app` Supabase project with different roles assigned to different emails. Use those emails to trigger an OTP and log in via the resident app.

Auth flow:
1. Enter email on the login screen → "Send code"
2. Supabase emails a 6-digit OTP
3. Enter the code on the verify screen
4. App receives a Supabase `access_token` — stored as the session token
5. All subsequent API calls send `Authorization: Bearer <access_token>`

---

## What's Next

- [ ] Wire `/reports` → `maintenance_requests` table
- [ ] Wire `/emergency` → `incidents` table
- [ ] Design + create Supabase tables for amenities, community, contractors
- [ ] Push Supabase schema changes to production when tables are ready
- [ ] App Store / Play Store submission prep
