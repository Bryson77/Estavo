# Estavo — Security Audit & Build Verification
**Strict Checklist · Pre-Launch Required · v1.0**

> This document is a hard gate — not a guideline. Every item below must pass before production traffic hits any Estavo surface. Items marked 🔴 are launch blockers. Items marked 🟡 are high-priority post-launch if not completed. Nothing ships until all 🔴 items are signed off.

---

## Table of Contents

1. [Authentication & Session Security](#1-authentication--session-security)
2. [Database & Row Level Security (RLS)](#2-database--row-level-security-rls)
3. [API Security](#3-api-security)
4. [Gate Hardware Security](#4-gate-hardware-security)
5. [Emergency System Integrity](#5-emergency-system-integrity)
6. [Data Isolation (Multi-Tenant)](#6-data-isolation-multi-tenant)
7. [Third-Party Integrations](#7-third-party-integrations)
8. [POPIA Compliance (SA Data Protection)](#8-popia-compliance-sa-data-protection)
9. [Mobile App Security](#9-mobile-app-security)
10. [Infrastructure & DevOps](#10-infrastructure--devops)
11. [Build & Setup Verification](#11-build--setup-verification)

---

---

## 1. AUTHENTICATION & SESSION SECURITY

### 1.1 Magic Link Security

- [ ] 🔴 **Magic link tokens expire after 15 minutes** — verify Supabase auth config `OTP_EXPIRY = 900`
- [ ] 🔴 **Magic links are single-use** — cannot be replayed after first click
- [ ] 🔴 **Magic links are invalidated on new request** — old link dies when user requests a new one
- [ ] 🔴 **Rate limiting on magic link requests** — max 5 requests per email per hour, 429 response after
- [ ] 🟡 **Magic links include device fingerprint validation** — alert if link clicked from different device/IP than requested

**Test:**
```
1. Request magic link
2. Click link → login successful
3. Click same link again → must fail (token already consumed)
4. Request 6 links in 1 hour from same email → 6th request must be rate-limited
```

---

### 1.2 TOTP 2FA (Managers & Superadmins)

- [ ] 🔴 **2FA is mandatory for all manager and superadmin accounts** — no bypass, no skip
- [ ] 🔴 **2FA cannot be disabled by the user** — only superadmin can remove 2FA from a manager (audit logged)
- [ ] 🔴 **Backup codes generated at 2FA setup** — single-use, 8 codes minimum
- [ ] 🔴 **Backup codes are hashed in DB** — never stored plaintext
- [ ] 🔴 **Invalid TOTP code: max 5 attempts then 5-minute lockout** — lockout persists across sessions
- [ ] 🔴 **TOTP window: ±1 period tolerance** — accounts for clock drift, not more
- [ ] 🟡 **Alert manager on new device login** — email via Resend on new device/IP

**Test:**
```
1. Set up manager account, skip 2FA → must be blocked
2. Enter wrong TOTP 5x → account locked for 5min
3. Enter correct TOTP after lockout timer → must work
4. Use backup code → login succeeds, code marked used
5. Reuse same backup code → must fail
```

---

### 1.3 Session Management

- [ ] 🔴 **JWT access tokens expire in 1 hour** — verify Supabase config
- [ ] 🔴 **Refresh tokens expire in 7 days** — rotate on each refresh
- [ ] 🔴 **Session revocation works immediately** — blacklist or Supabase session delete propagates within 60s
- [ ] 🔴 **All sessions invalidated on password/email change** — (magic link re-auth required)
- [ ] 🟡 **Concurrent session limit: 3 devices max per user** — oldest session revoked on 4th login
- [ ] 🟡 **Session activity visible in app Settings** — user can revoke individual sessions

**Test:**
```
1. Login on Device A and Device B
2. Revoke Device A session from Device B → Device A next request returns 401
3. Login on Device C 30min after Device A → both sessions alive
4. Let access token expire → refresh token re-issues new access token
5. Let refresh token expire → user must re-authenticate via magic link
```

---

### 1.4 Biometric Lock (Resident App Only)

- [ ] 🔴 **Biometric lock is client-side app lock only** — it does not replace server-side session auth
- [ ] 🔴 **Biometric failure locks app after 5 attempts** — requires re-authentication via magic link
- [ ] 🔴 **Biometric keys stored in device secure enclave** — iOS Keychain / Android Keystore only, never in app storage
- [ ] 🟡 **Biometric data never transmitted to server** — only a local boolean token is passed to the app layer

---

## 2. DATABASE & ROW LEVEL SECURITY (RLS)

**Critical note:** Estavo uses TWO separate Supabase projects. Resident-facing data is on Project A. Internal/operational data is on Project B. Verify isolation is maintained at all times.

### 2.1 RLS Policy Completeness

- [ ] 🔴 **RLS is enabled on every table in both Supabase projects** — no table left without RLS
- [ ] 🔴 **Default deny: no unauthenticated reads or writes on any table** — every policy is explicit allow, not default allow
- [ ] 🔴 **Residents can only read/write their own unit's data** — `auth.uid() = user_id` or `estate_unit = user_unit`
- [ ] 🔴 **Residents cannot access other residents' guest codes, maintenance requests, or activity**
- [ ] 🔴 **Security staff can read gate logs and visitor entries for their estate only** — cross-estate reads blocked
- [ ] 🔴 **Estate managers can read/write only within their estate's scope** — `estate_id = manager.estate_id`
- [ ] 🔴 **Superadmin role bypasses RLS via service role key** — service role key is NEVER exposed client-side

**Test every table individually:**
```sql
-- Run as resident user, attempt to read another resident's data
SELECT * FROM guest_codes WHERE resident_id = '<other_resident_id>';
-- Expected: 0 rows returned (not an error — RLS silently filters)

-- Run as estate manager, attempt to read another estate's data
SELECT * FROM maintenance_requests WHERE estate_id = '<other_estate_id>';
-- Expected: 0 rows returned
```

---

### 2.2 Data Model Security

- [ ] 🔴 **`estate_id` foreign key is on every tenant-scoped table** — no orphaned records possible
- [ ] 🔴 **Soft deletes only for audit-sensitive tables** — gate_logs, incidents, emergency_alerts: never hard deleted
- [ ] 🔴 **Audit columns on all sensitive tables** — `created_at`, `created_by`, `updated_at`, `updated_by`
- [ ] 🔴 **Emergency alerts table is append-only** — no UPDATE or DELETE allowed via RLS (only superadmin via service role)
- [ ] 🟡 **Database encryption at rest** — Supabase default (AES-256), confirm enabled

---

### 2.3 SQL Injection Prevention

- [ ] 🔴 **All queries use Supabase SDK parameterized queries** — no string interpolation into SQL anywhere
- [ ] 🔴 **No raw SQL in client code** — verify in code review
- [ ] 🔴 **Server-side Supabase Edge Functions use parameterized queries** — same rule

---

## 3. API SECURITY

### 3.1 Endpoint Authentication

- [ ] 🔴 **Every API endpoint requires valid JWT** — no unauthenticated endpoints except `/health`
- [ ] 🔴 **JWT validated on every request** — not just at login
- [ ] 🔴 **Role claim in JWT is verified server-side** — client cannot self-elevate role
- [ ] 🔴 **Supabase anon key is public but RLS enforces access** — verify anon key cannot bypass RLS
- [ ] 🔴 **Service role key is in Cloudflare Worker environment variables ONLY** — not in client bundle, not in `.env` committed to repo

**Verify service role key exposure:**
```bash
# In built Next.js bundle, this must return nothing:
grep -r "service_role" .next/
grep -r "SUPABASE_SERVICE" .next/
# Any result = critical leak
```

---

### 3.2 Rate Limiting

- [ ] 🔴 **Magic link endpoint: 5 req/hour per email**
- [ ] 🔴 **TOTP verify endpoint: 5 attempts then 5-minute lockout**
- [ ] 🔴 **Guest code validation: 10 failed attempts per IP per hour → temporary block**
- [ ] 🔴 **Gate open command: max 10 open commands per resident per hour** — prevents automated abuse
- [ ] 🟡 **Emergency alert: max 3 per resident per hour** — prevents spam (but do not silently drop — notify manager)
- [ ] 🟡 **Global rate limiting on Cloudflare Workers** — WAF rules in place

---

### 3.3 Input Validation

- [ ] 🔴 **All user inputs validated and sanitised server-side** — client-side validation is UX only, not security
- [ ] 🔴 **File uploads (maintenance photos) validated for file type (MIME, not extension) and size**
- [ ] 🔴 **CSV imports (resident bulk upload) validated row-by-row with strict schema** — malformed rows rejected, not executed
- [ ] 🔴 **Guest code expiry dates validated server-side** — cannot set expiry in the past or more than 90 days out
- [ ] 🟡 **Max request body size enforced on all endpoints** — prevent oversized payloads

---

### 3.4 CORS

- [ ] 🔴 **CORS origin whitelist** — only `estavo.co.za` and subdomains allowed, plus `localhost:3000` for dev
- [ ] 🔴 **No wildcard `*` CORS in production**
- [ ] 🔴 **Preflight OPTIONS requests handled correctly**

---

## 4. GATE HARDWARE SECURITY

### 4.1 Raspberry Pi & Relay Security

- [ ] 🔴 **Raspberry Pi units communicate with backend over HTTPS only** — no HTTP
- [ ] 🔴 **Raspberry Pi has a unique device certificate / API key per estate** — not a shared key
- [ ] 🔴 **Device keys are rotatable** — if a Pi is compromised, key can be revoked without affecting other estates
- [ ] 🔴 **Pi cannot be commanded from the internet directly** — all commands go through Estavo backend which validates the request before forwarding
- [ ] 🔴 **Gate open commands include a nonce** — prevents replay attacks (same command cannot be replayed to open gate again)
- [ ] 🔴 **Command timestamp validated within ±30 second window** — expired commands rejected
- [ ] 🟡 **Pi hardware in locked, tamper-evident enclosure**
- [ ] 🟡 **Pi OS is hardened** — SSH disabled or key-only, default passwords changed, unnecessary services removed

---

### 4.2 Gate Command Authorization

- [ ] 🔴 **Every gate open command includes: user ID, estate ID, gate ID, timestamp, nonce**
- [ ] 🔴 **Backend validates: user is registered at the correct estate, gate belongs to that estate, user is active**
- [ ] 🔴 **Gate commands are logged: who, which gate, timestamp, command type (resident/guest/override)**
- [ ] 🔴 **Override commands require additional authorization** — must include reason code + staff ID
- [ ] 🔴 **Logs cannot be deleted by any app user** — service role only, audit trail

---

### 4.3 Hardware Failure Handling

- [ ] 🔴 **Fail state is GATE CLOSED** — if Pi goes offline or command times out, gate does not open
- [ ] 🔴 **Gate offline status is surfaced to security staff and manager within 60 seconds**
- [ ] 🟡 **Manual override key procedure is documented and locked in estate office**
- [ ] 🟡 **Pi health heartbeat every 30 seconds** — offline alert if 2 consecutive heartbeats missed

---

## 5. EMERGENCY SYSTEM INTEGRITY

- [ ] 🔴 **Emergency alerts cannot be silently dropped** — every triggered alert is persisted to DB before delivery to security app
- [ ] 🔴 **Emergency alert delivery is confirmed** — push notification delivery receipt checked; if failed, fallback to Twilio WhatsApp SMS
- [ ] 🔴 **Emergency alert system is tested monthly** — documented test procedure with dummy estate
- [ ] 🔴 **Emergency cannot be triggered by expired/deactivated accounts** — auth check before alert dispatch
- [ ] 🔴 **Cancellation window is exactly 60 seconds** — not configurable by estate, not extendable
- [ ] 🔴 **Cancelled alerts are still logged as triggered + cancelled** — not erased
- [ ] 🔴 **Emergency alert payload never contains location data beyond estate + unit** — no GPS coordinates transmitted to security staff app (POPIA / safety concern)
- [ ] 🟡 **Emergency load test** — simulate 50 simultaneous alerts across 10 estates, verify all delivered within 5 seconds

---

## 6. DATA ISOLATION (MULTI-TENANT)

**This is the single most critical security property of Estavo. A breach of tenant isolation — where Estate A can read Estate B's data — is a catastrophic failure.**

- [ ] 🔴 **Every query in the application includes `estate_id` filter** — audit every single DB query in the codebase
- [ ] 🔴 **`estate_id` is never trusted from the client** — always derived from the authenticated user's JWT claims server-side
- [ ] 🔴 **Cross-estate data access test** — create two test estates, log in as manager of Estate A, attempt to access Estate B's residents, gate logs, incidents → all must return 0 results or 403
- [ ] 🔴 **Superadmin estate-switching is audited** — every estate a superadmin accesses is logged
- [ ] 🔴 **Shared infrastructure (Cloudflare Workers) does not cache responses across tenants** — verify cache keys include estate_id

**Mandatory penetration test scenario:**
```
1. Create Estate A and Estate B
2. Log in as Estate A manager
3. Manually craft API requests with Estate B's estate_id
4. Expected: 0 data returned, no 500 errors (which would indicate server-side filtering failure)
5. Log all attempted cross-tenant requests as security incidents
```

---

## 7. THIRD-PARTY INTEGRATIONS

### 7.1 Twilio (WhatsApp)

- [ ] 🔴 **Twilio credentials in Cloudflare Worker environment variables only** — not in codebase
- [ ] 🔴 **Twilio webhook signature validated** — incoming webhooks verified using Twilio's signature header
- [ ] 🔴 **WhatsApp message content sanitised** — no user-supplied content rendered as-is without escaping
- [ ] 🔴 **Twilio sending rate per estate** — prevent one estate's emergency spam from exhausting account limits
- [ ] 🟡 **Twilio account has secondary number as fallback**

### 7.2 Resend (Email)

- [ ] 🔴 **Resend API key in Cloudflare Worker environment variables only**
- [ ] 🔴 **Email templates reviewed for phishing risk** — no user input reflected directly into email HTML without escaping
- [ ] 🔴 **DKIM / SPF / DMARC configured for sending domain** — verify DNS records
- [ ] 🔴 **Unsubscribe mechanism on non-transactional emails** — POPIA compliance

### 7.3 barKoder SDK (Driver's Licence Scanning)

- [ ] 🔴 **Scanned licence data is not stored server-side beyond the gate log entry** — raw barcode payload is parsed, structured fields stored, raw data discarded
- [ ] 🔴 **Licence scans only accessible to staff and managers of the relevant estate** — RLS enforced
- [ ] 🔴 **Licence data retention policy defined and enforced** — delete gate log PII after N months (define per POPIA requirements)
- [ ] 🟡 **barKoder licence key is valid and not hardcoded in JS bundle**

---

## 8. POPIA COMPLIANCE (SA DATA PROTECTION)

> POPIA (Protection of Personal Information Act) is South African data protection law. Non-compliance carries fines up to R10 million. This section is not optional.

- [ ] 🔴 **Privacy Policy published and linked from all apps and website**
- [ ] 🔴 **Terms of Service published**
- [ ] 🔴 **Explicit consent collected at resident onboarding** — what data is collected, why, who can access it
- [ ] 🔴 **Data subject access request process defined** — resident can request all their data in portable format
- [ ] 🔴 **Data deletion process defined** — resident can request deletion; define retention exceptions (legal/gate logs)
- [ ] 🔴 **Driver's licence data: purpose limitation** — only used for gate entry verification, not profiling
- [ ] 🔴 **Breach notification procedure** — 72-hour notification to Information Regulator if data breach occurs
- [ ] 🔴 **Data processing agreement with Supabase, Twilio, Resend, Cloudflare** — all are data processors
- [ ] 🔴 **No data transferred outside SA without adequate protection** — verify Supabase region is EU or SA (if SA available), not US without safeguards
- [ ] 🟡 **POPIA compliance reviewed by SA legal counsel before launch** — worth the cost

---

## 9. MOBILE APP SECURITY

### 9.1 React Native / Expo

- [ ] 🔴 **No sensitive data in `AsyncStorage`** — API keys, tokens, anything sensitive must be in `expo-secure-store` (backed by Keychain / Keystore)
- [ ] 🔴 **JWT tokens stored in `expo-secure-store`** — not `AsyncStorage`
- [ ] 🔴 **`expo-secure-store` keys are scoped per user** — cleared on logout
- [ ] 🔴 **App does not log sensitive data to console in production** — strip `console.log` in production build
- [ ] 🔴 **Certificate pinning considered** — if not implemented, document why and assess risk
- [ ] 🔴 **Deep link validation** — magic link deep links validated against known scheme and host, not blindly executed
- [ ] 🟡 **Jailbreak / root detection** — warn user but do not block (too aggressive for MVP)
- [ ] 🟡 **Screenshot prevention on sensitive screens** — emergency screen, guest code display

### 9.2 App Store Requirements

- [ ] 🔴 **iOS App Store compliance** — privacy manifest complete, permissions declared (camera for barcode, notifications, biometric)
- [ ] 🔴 **Android Play Store compliance** — data safety section accurate
- [ ] 🔴 **Both apps reviewed for Apple / Google policy violations before submission**

---

## 10. INFRASTRUCTURE & DEVOPS

### 10.1 Secrets Management

- [ ] 🔴 **No secrets in git** — run `git log --all -p | grep -E "(key|secret|password|token)" | head -50` before first deploy
- [ ] 🔴 **.gitignore includes `.env`, `.env.local`, `.env.production`**
- [ ] 🔴 **All secrets in Cloudflare Worker secrets (not plaintext vars)**
- [ ] 🔴 **Supabase service role key is in Cloudflare Worker secrets only**
- [ ] 🔴 **Separate secrets for dev, staging, production** — production secrets never used in dev

### 10.2 Cloudflare

- [ ] 🔴 **WAF enabled on all public endpoints**
- [ ] 🔴 **DDoS protection enabled**
- [ ] 🔴 **Bot Fight Mode enabled**
- [ ] 🔴 **Minimum TLS version: 1.2 (prefer 1.3)**
- [ ] 🔴 **HSTS enabled with min 1 year max-age**
- [ ] 🔴 **Security headers set**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restrictive
- [ ] 🟡 **CSP (Content Security Policy)** — strict CSP on dashboard, no `unsafe-inline`

### 10.3 Supabase

- [ ] 🔴 **Two separate Supabase projects confirmed** — resident data vs operational data fully isolated
- [ ] 🔴 **Supabase dashboard login uses strong password + MFA for Estavo team**
- [ ] 🔴 **Database backups enabled and tested** — verify restore works at least once
- [ ] 🔴 **Connection pooling configured** — Supavisor or PgBouncer, not direct connections from workers
- [ ] 🟡 **Read replicas configured** if dashboard read load is high

### 10.4 CI/CD

- [ ] 🔴 **No production deploy without passing tests**
- [ ] 🔴 **Dependency vulnerability scan in CI** — `npm audit` or equivalent on every PR
- [ ] 🔴 **Staging environment exists and is tested before production deploy**
- [ ] 🟡 **Automated RLS regression tests** — run cross-tenant isolation tests on every deploy

---

## 11. BUILD & SETUP VERIFICATION

### 11.1 Pre-Deploy Checklist (Every Production Deploy)

```
□ All environment variables set in Cloudflare / Vercel production
□ Supabase migrations applied to production DB
□ RLS policies verified on any new/modified tables
□ Magic link redirect URL updated to production domain (not localhost)
□ TOTP issuer name shows correct app name (not "Supabase" default)
□ Push notification certificates (APNs / FCM) valid and not expiring within 30 days
□ barKoder licence key valid
□ Twilio WhatsApp sender number verified
□ Resend domain DNS records verified (DKIM/SPF)
□ Smoke test on staging: login, open gate, generate guest code, trigger + cancel emergency
□ Dependency audit clean (no critical CVEs)
```

### 11.2 Turborepo Monorepo Verification

- [ ] 🔴 **Shared packages (`@estavo/ui`, `@estavo/types`) versioned correctly** — breaking changes require coordinated deploy
- [ ] 🔴 **`turbo.json` pipeline does not leak dev dependencies to production builds**
- [ ] 🔴 **Each app's `package.json` does not include the other app's private packages**
- [ ] 🔴 **Build output verified: resident app bundle does not include security app code, dashboard bundle does not include superadmin code**

### 11.3 Supabase Setup Verification

```sql
-- Run on both Supabase projects before launch:

-- 1. Verify RLS enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;
-- Expected: 0 rows

-- 2. Verify no tables have no policies
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public'
AND tablename NOT IN (
  SELECT DISTINCT tablename FROM pg_policies WHERE schemaname = 'public'
);
-- Expected: only tables that are intentionally policy-free (e.g. lookup tables)

-- 3. Verify indexes on estate_id columns (performance + security)
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public' AND indexdef LIKE '%estate_id%';
-- All major tables should have an index on estate_id
```

### 11.4 First Estate Onboarding — Manual Verification Steps

When onboarding the very first real estate (pilot), manually verify:

```
1. Create estate in superadmin portal
2. Send manager invite → confirm email received (check Resend logs)
3. Manager clicks invite → confirms TOTP 2FA setup completes
4. Manager completes estate setup wizard
5. Import test residents (2 units)
6. Residents receive invite emails → confirm delivery
7. Resident completes onboarding → confirm unit verification works
8. Test gate open from resident app → confirm Pi receives command, gate opens
9. Generate guest code → deliver via WhatsApp → confirm Twilio sends
10. Security guard uses code at gate → confirm code validates, entry logged
11. Trigger emergency from resident app → confirm security app receives push within 5 seconds
12. Cancel emergency within 60s → confirm cancellation reaches security
13. Log maintenance request → confirm manager sees it in dashboard
14. Manager closes maintenance request → confirm resident gets push notification
15. Scan driver's licence → confirm parsed data logged correctly
16. Attempt cross-tenant data access → confirm blocked
17. Export gate log from dashboard → confirm CSV correct
```

All 17 steps must pass before declaring the estate live.

---

## Audit Sign-Off

| Area | Completed By | Date | Notes |
|---|---|---|---|
| Auth & Sessions | | | |
| RLS / Database | | | |
| API Security | | | |
| Gate Hardware | | | |
| Emergency System | | | |
| Multi-Tenant Isolation | | | |
| Third-Party Integrations | | | |
| POPIA Compliance | | | |
| Mobile App Security | | | |
| Infrastructure | | | |
| Build Verification | | | |

**No surface goes live until all 🔴 items are checked and signed off.**

---

_Document version 1.0 — June 2026_
_Review before every major release. Re-run tenant isolation tests on every schema change._
