# Estavo — Build Progress

**Version:** 1.0 | **Last Updated:** June 2026 | **PRD Version:** 1.0

---

## Platform Overview

Estavo is a B2B SaaS platform for South African residential estates — access control, levy management, maintenance, and communication in one place.

### Four Surfaces (per PRD)

| Surface | Tech | Status |
|---|---|---|
| Resident App | React Native / Expo | 🟡 In Progress |
| Security App | React Native / Expo | ❌ Not Started |
| Manager Dashboard | Next.js (App Router) | ❌ Not Started |
| Superadmin Portal | Next.js (App Router) | ❌ Not Started |

### Infrastructure in This Repo

| Artifact | Kind | Path | Status |
|---|---|---|---|
| API Server | Express on Node 20 | `artifacts/api-server` | ✅ Running |
| Resident App | Expo / React Native | `artifacts/resident` | ✅ Running |
| Canvas / Mockup Sandbox | Vite | `artifacts/mockup-sandbox` | ✅ Running |

---

## Environment Variables

Secrets are stored in Replit's secrets vault — **not portable as a file**. If you move to another platform (Cloudflare Workers, Railway, Fly.io, etc.) you re-enter the same values manually. The values themselves always live in:
- **Supabase keys** → Supabase dashboard → Project Settings → API
- **Twilio, Resend keys** → their respective dashboards

| Secret | Used by | Where to get it |
|---|---|---|
| `SUPABASE_APP_URL` | All Supabase clients | Supabase → Project Settings → API |
| `SUPABASE_APP_ANON_KEY` | Auth calls, RLS client | Supabase → Project Settings → API |
| `SUPABASE_APP_SERVICE_ROLE_KEY` | Admin ops (bypasses RLS) | Supabase → Project Settings → API |
| `SUPABASE_PLATFORM_URL` | Platform billing client | Supabase → Platform project → API |
| `SUPABASE_PLATFORM_SERVICE_ROLE_KEY` | Platform billing client | Supabase → Platform project → API |
| `TWILIO_ACCOUNT_SID` | SMS OTP delivery | Twilio console |
| `TWILIO_AUTH_TOKEN` | SMS OTP delivery | Twilio console |
| `TWILIO_FROM_NUMBER` | SMS OTP delivery | Twilio console |
| `RESEND_API_KEY` | Transactional email | Resend dashboard |
| `SESSION_SECRET` | Express sessions | Already set in Replit |

---

## What's Been Built

### Backend — Drizzle → Supabase Migration ✅

- `lib/db/` deleted — entire Drizzle ORM package removed
- `@workspace/db`, `drizzle-orm`, `jsonwebtoken` removed from dependencies
- Custom JWT signing/verification removed; replaced by Supabase Auth tokens
- Dev bypass OTP (`123456`) removed
- `routes/seed.ts` deleted

#### `lib/supabase.ts`

| Export | Key | Purpose |
|---|---|---|
| `supabaseApp` | Service Role | Server admin ops — bypasses RLS |
| `supabaseAppAnon` | Anon | Auth: `signInWithOtp`, `verifyOtp`, `getUser` |
| `supabasePlatform` | Platform Service Role | Billing / superadmin |

> **Node 20 quirk:** `ws` package installed and passed as `realtime: { transport: ws }` to every `createClient` — Node 20 has no native WebSocket and Supabase Realtime throws on startup without it.

#### `lib/auth.ts` — `requireAuth` middleware

1. Verifies Bearer token via `supabaseAppAnon.auth.getUser(token)`
2. Fetches `profiles` row using service-role client (bypasses RLS)
3. Resolves `unit_number` from `units` table
4. Attaches `req.user` — `{ userId, estateId, role, unitId, unitNumber, firstName, lastName }`
5. Attaches `req.supabaseClient` — per-request client with user JWT so RLS fires correctly

#### Routes — Live

| Route | Table | Status |
|---|---|---|
| `POST /auth/request-otp` | `profiles` + Supabase Auth | ✅ |
| `POST /auth/verify-otp` | Supabase Auth + `profiles` + `units` + `estates` | ✅ |
| `GET /auth/me` | `profiles` + `units` + `estates` | ✅ |
| `GET /gates` | `estates.gates` (jsonb) | ✅ |
| `POST /gates/trigger` | `gate_log` | ✅ |
| `POST /gates/undo` | `gate_log` | ✅ |
| `GET /gates/activity` | `gate_log` | ✅ |
| `GET /guests` | `guest_otps` + `estates.guest_code_config` | ✅ |
| `POST /guests` | `guest_otps` | ✅ |
| `DELETE /guests/:id` | `guest_otps` | ✅ |

#### Routes — Stubbed (501)

| Route file | Likely Supabase table | Notes |
|---|---|---|
| `routes/reports.ts` | `maintenance_requests` | Table exists — ready to wire |
| `routes/emergency.ts` | `incidents` | Table exists — ready to wire |
| `routes/amenities.ts` | none yet | Schema design needed |
| `routes/community.ts` | `notices` (partial) | Schema design needed |
| `routes/contractors.ts` | none yet | Schema design needed |

### Resident App

| Feature | Status | Notes |
|---|---|---|
| Logo on login screen | ✅ | `assets/images/logo.png` |
| Login (email entry) | ✅ | Calls `POST /auth/request-otp` |
| OTP verify screen | ✅ | Calls `POST /auth/verify-otp` |
| Home dashboard shell | ✅ | UI exists, some data wired |
| Gate control tab | ✅ | `GET /gates`, `POST /gates/trigger`, undo |
| Guest OTP tab | ✅ | Create, list, revoke |
| Maintenance/Reports tab | 🟡 Stubbed | Returns 501 — no data shown |
| Notices/Community tab | 🟡 Stubbed | Returns 501 — no data shown |
| Amenities tab | 🟡 Stubbed | Returns 501 — no data shown |
| Emergency button | 🟡 Stubbed | Returns 501 |
| Contractors tab | 🟡 Stubbed | Returns 501 |
| Push notifications | ❌ | Expo push not configured |
| Biometric device lock | ❌ | PRD: optional, Phase 1 |
| Levy & financials tab | ❌ | No `levy_accounts` table yet |
| PDF statement download | ❌ | Depends on levy tables |
| Dispute submission | ❌ | Depends on levy tables |

---

## What's Left — Full PRD Gap Analysis

### Phase 1 MVP

#### Resident App Gaps

| Feature | PRD Ref | Blocker |
|---|---|---|
| SMS OTP delivery to guest | §5.1.2 | Twilio not integrated |
| QR code generation for guest | §5.1.2 | No QR library yet |
| Levy balance + statement view | §5.1.3 | `levy_accounts` + `levy_transactions` tables don't exist in Supabase yet |
| PDF statement download | §5.1.3 | Depends on levy tables + Supabase Storage |
| Banking details display | §5.1.3 | Needs field in `estates` table |
| Dispute submission | §5.1.3 | Depends on levy / ticket tables |
| Maintenance request submit | §5.1.4 | Wire `maintenance_requests` table |
| Maintenance status tracking | §5.1.4 | Wire `maintenance_requests` table |
| Comments thread per request | §5.1.4 | New `request_comments` table needed |
| Photo upload on maintenance | §5.1.4 | Supabase Storage not configured |
| Rating/feedback on completion | §5.1.4 | New field / table needed |
| Estate notice board | §5.1.5 | Wire `notices` table |
| Push notification on new notice | §5.1.5 | Expo push tokens not collected |
| Emergency alert (red banner) | §5.1.5 | Wire `incidents` + push |
| Household members management | §5.1.6 | UI only, no backend |
| Notification preferences | §5.1.6 | Not started |
| Terms acceptance on first login | §9 (POPIA) | Consent record not stored |

#### Security App — Not Started (entire surface)

| Feature | PRD Ref |
|---|---|
| Gate Management Hub (open/close, status, log) | §5.2.1 |
| OTP verification at gate | §5.2.2 |
| QR code scan from resident's phone | §5.2.2 |
| Driver's Licence scan (barKoder SDK, SA PDF417) | §5.2.2 |
| Visitor Logbook (today, searchable history) | §5.2.3 |
| Manual visitor entry (walk-in, no pre-auth) | §5.2.3 |
| Incident reporting (quick log, photo) | §5.2.4 |
| Staff clock-in / clock-out | §5.2.5 |
| Emergency alerts from manager | §5.2.5 |

#### Manager Dashboard — Not Started (entire surface)

| Feature | PRD Ref |
|---|---|
| Overview dashboard (KPIs, alerts panel) | §5.3.1 |
| Resident directory + unit management | §5.3.2 |
| Add/remove residents + invite links | §5.3.2 |
| Bulk CSV import | §5.3.2 |
| Levy schedule configuration | §5.3.3 |
| Per-resident levy account (post charges, record payments) | §5.3.3 |
| Bulk levy run | §5.3.3 |
| Arrears report | §5.3.3 |
| CSV export for accounting | §5.3.3 |
| PDF statement generation per resident | §5.3.3 |
| Maintenance request management (assign, update, SLA) | §5.3.4 |
| Full gate log view | §5.3.5 |
| Emergency lockdown (lock all gates) | §5.3.5 |
| Revoke any active guest OTP | §5.3.5 |
| Staff account management | §5.3.6 |
| Shift clock-in/out log | §5.3.6 |
| Staff activity report | §5.3.6 |
| Post notices (general / urgent / emergency) | §5.3.7 |
| Emergency alert broadcast (push to all) | §5.3.7 |
| Scheduled notices | §5.3.7 |
| Notice read analytics | §5.3.7 |
| Generate monthly trustee report | §5.3.8 |
| Document vault | §5.3.8 |
| Estate settings (branding, unit count, etc.) | §5.3.9 |
| Notification template management | §5.3.9 |
| Twilio / Resend integration settings | §5.3.9 |

#### Superadmin Portal — Not Started

| Feature | PRD Ref |
|---|---|
| Estate provisioning | §5.4.1 |
| Suspend / deactivate estate | §5.4.1 |
| Billing & subscription management | §5.4.2 |
| Support impersonation (read-only) | §5.4.3 |
| Platform analytics (MAU, feature adoption) | §5.4.4 |

#### Infrastructure / Platform — Phase 1

| Item | PRD Ref | Status |
|---|---|---|
| Twilio SMS — OTP delivery to guests | §5.1.2, §6.1 | ❌ Not integrated |
| Resend — transactional email | §6.1 | ❌ Not integrated |
| Expo push notifications | §7 | ❌ Not configured |
| Supabase Storage — photos, attachments, docs | §6.1 | ❌ Not configured |
| Gate hardware — Raspberry Pi + relay + Supabase Realtime | §6.4 | ❌ Not started |
| Supabase Realtime subscription on security app | §6.4 | ❌ Not started |
| POPIA: terms acceptance on first login | §9 | ❌ Not started |
| POPIA: 12-month gate log auto-purge | §9 | ❌ Not started |
| Supabase region: `af-south-1` or documented EU-West | §9 | ❓ Verify in dashboard |

#### Missing Supabase Tables (need schema design + creation)

| Table | Purpose |
|---|---|
| `levy_accounts` | Per-unit levy balance |
| `levy_transactions` | Charge / payment / credit history |
| `notices` | Estate notice board posts |
| `request_comments` | Comments thread on maintenance requests |
| `staff_shifts` | Clock-in/out records |
| `permanent_access` | Residents with physical access cards |
| `notification_tokens` | Expo push tokens per device |

---

### Phase 2 — Governance Expansion

| Feature | PRD Ref | Status |
|---|---|---|
| Trustee Portal (full web app) | §12.6 | ❌ Not started |
| Corporate Dashboard (full web app) | §12.7 | ❌ Not started |
| Approval Requests system | §12.5 | ❌ Not started |
| AI Quote Summariser (Claude `claude-sonnet-4-20250514`) | §12.8 | ❌ Not started |
| Maintenance Pattern Detection (Claude `claude-haiku-4-5-20251001`) | §12.8 | ❌ Not started |
| Meetings & Resolutions | §12.6 | ❌ Not started |
| Document Vault with expiry tracking | §12.6, §12.7 | ❌ Not started |
| Performance snapshots (pg_cron nightly) | §12.7 | ❌ Not started |
| Contractor management screen | §12.5 | ❌ Not started |
| WhatsApp notifications (Twilio) | §7 | Phase 2 per PRD |
| Trustee TOTP 2FA | §4.4, §6.3 | Phase 2 per PRD |
| In-app payment processing | §5.1.3 | Explicitly Phase 2 per PRD |

#### Phase 2 — Governance DB Tables Needed

Per PRD §12.2 — schemas already documented in PRD:
- `approval_requests`, `approval_votes`, `approval_summaries`
- `meetings`, `meeting_resolutions`
- `estate_performance_snapshots`
- `corporate_agent_estates`
- `documents` (vault)

---

## Immediate Next Steps (Priority Order)

1. **Wire `maintenance_requests`** → `/reports` routes (table exists in Supabase)
2. **Wire `incidents`** → `/emergency` routes (table exists in Supabase)
3. **Create `levy_accounts` + `levy_transactions`** tables in Supabase + wire levy tab
4. **Create `notices` table** + wire community/notices tab
5. **Twilio integration** — SMS OTP delivery to guests on code creation
6. **Expo push tokens** — collect on login, store in new `notification_tokens` table
7. **Supabase Storage** — enable for photo uploads on maintenance requests
8. **Security App** — new Expo artifact, separate from resident app
9. **Manager Dashboard** — new Next.js artifact
10. **Gate hardware** — Raspberry Pi + Supabase Realtime listener

---

## Testing — Mock Estate

Mock data lives in the live `estavo-app` Supabase project. Multiple emails with different roles are seeded on a mock estate.

Auth flow:
1. Enter email on the login screen → "Send code"
2. Supabase emails a 6-digit OTP (check inbox)
3. Enter code → app receives Supabase `access_token`
4. All API calls use `Authorization: Bearer <token>`

---

## Deployment Note

The Replit API server can be published to a `.replit.app` domain via the Deploy button. For production per the PRD tech stack (Cloudflare Workers + Pages), the Express server would need to be adapted or the API layer moved to Cloudflare Workers. Supabase itself is already the live/production database — no separate "push to prod" step needed for the DB unless schema migrations are applied.
