# Estavo — Product Requirements Document
**Version:** 1.0 | **Author:** Bryson Mabilo | **Date:** June 2026

---

## 1. Executive Summary

Estavo is a B2B SaaS platform for South African residential estates. It replaces fragmented WhatsApp groups, paper visitor logs, spreadsheet maintenance schedules, and manual levy tracking with a single, integrated operations system.

**Target Market:** Gated communities, security estates, townhouse complexes, and lifestyle estates in South Africa — primarily 50–500 units.

**Core Value Proposition:** One platform for residents, security staff, estate managers, and trustees. Everything that runs an estate — access control, financials, maintenance, and communication — managed from one place.

**Revenue Model:** Per-estate monthly subscription in ZAR, tiered by unit count.

---

## 2. Problem Statement

### The Current Reality in South African Estates

| Pain Point | Current "Solution" | Problem |
|---|---|---|
| Visitor access | WhatsApp to guard | No audit trail, human error |
| Levy management | Emails + spreadsheets | Late payment visibility is poor |
| Maintenance requests | WhatsApp groups | Requests get lost, no accountability |
| Trustee approvals | Email chains | Slow, no version control |
| Communication | Multiple WhatsApp groups | Residents miss notices |
| Guest worker access | Paper logbook | No digital record |
| Gate control | Guard manually opens | No remote override for managers |

### Who Suffers Most

- **Residents** — no visibility into their levy account, no simple way to pre-authorise guests, no easy way to log maintenance issues.
- **Security Staff** — overwhelmed by WhatsApp messages, no reliable system for guest OTP verification.
- **Estate Managers** — managing everything manually, no consolidated dashboard, cannot audit staff activity.
- **Trustees** — receive ad-hoc updates, no structured way to approve budget items or review reports.

---

## 3. Product Overview

Estavo is a **four-surface platform** — two mobile apps and two web portals — each designed for a specific role.

```
┌─────────────────────────────────────────────────────────┐
│                     Estavo Platform                   │
├────────────────┬────────────────┬───────────────────────┤
│  Resident App  │  Security App  │   Manager Dashboard   │
│  (React Native)│  (React Native)│   (Next.js Web)       │
├────────────────┴────────────────┴───────────────────────┤
│               Superadmin Portal (Next.js Web)           │
├─────────────────────────────────────────────────────────┤
│     Supabase (DB + Auth + Storage) | Twilio | Resend    │
│     Cloudflare Pages/Workers | Raspberry Pi + Relay     │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Users & Roles

### 4.1 Resident
- Household-level account (one unit, multiple members possible)
- Self-registers via invite link from estate manager
- Auth: Magic link (email) + optional biometric lock on device

### 4.2 Security / Staff
- Assigned by estate manager
- Auth: Email + password (no magic link — needs reliable offline-ish access)
- Restricted to gate management and visitor scanning features

### 4.3 Estate Manager
- One or more per estate
- Auth: Email + password + TOTP 2FA (mandatory)
- Full estate admin: residents, staff, levies, maintenance, notices

### 4.4 Trustee
- Read-heavy role — financial reports, maintenance summaries
- Auth: Email + password + TOTP 2FA (mandatory)
- No operational controls — approvals only

### 4.5 Superadmin (Estavo Internal)
- Bryson + team
- Auth: Email + password + TOTP 2FA (mandatory)
- Platform-wide: estate provisioning, billing, support access

---

## 5. Platform Surfaces

---

### 5.1 Resident Mobile App (React Native / Expo)

#### 5.1.1 Home Dashboard
- Levy balance summary (outstanding / paid / next due date)
- Active maintenance requests (count + status)
- Recent estate notices (last 3)
- Quick action buttons: Pre-authorise Guest, Log Maintenance, View Levy Statement

#### 5.1.2 Guest Pre-Authorisation
- Resident enters guest name + arrival window (date/time range)
- System generates a 6-digit OTP valid for the arrival window
- OTP sent via SMS to guest (Twilio) and visible in-app to resident
- Security staff scans or enters OTP at gate — verified in real time
- Resident can revoke active OTP from app
- Audit log: who came, when, authorised by whom

#### 5.1.3 Levy & Financials
- Current balance (outstanding/credit)
- Full statement history (line items: levy, water, penalty, etc.)
- PDF statement download
- Payment method info (banking details display — no in-app payment processing in v1)
- Dispute submission form → creates ticket for manager

#### 5.1.4 Maintenance Requests
- Submit request: category (plumbing, electrical, common area, security, other), description, optional photo upload
- Track status: Submitted → Assigned → In Progress → Resolved
- In-app comments thread per request
- Rating/feedback on completion

#### 5.1.5 Notices & Communication
- Estate-wide notice board (push notification on new notice)
- Emergency alerts (red banner, push notification, cannot be muted)
- Archive of all past notices

#### 5.1.6 Profile & Settings
- Household members management (add/remove)
- Notification preferences
- Contact details
- Biometric lock toggle

---

### 5.2 Security / Staff Mobile App (React Native / Expo)

#### 5.2.1 Gate Management Hub
- Active gate status (open/closed/locked) — real time
- Open/close gate button (triggers relay via Supabase Realtime → Raspberry Pi listener)
- Gate activity log (last 50 events)

#### 5.2.2 Guest Verification
- **OTP Entry** — type in 6-digit code, system validates and confirms or rejects
- **QR Scan** — scan QR from guest's phone (resident generates QR from app)
- **Driver's Licence Scan** — barKoder SDK scans SA DL barcode, extracts name/ID → logs visitor without manual typing
- On success: guest name + authorising resident displayed, entry logged

#### 5.2.3 Visitor Logbook
- All entries today: name, time, authorised by, exit time
- Manual entry option (walk-in with no pre-auth — requires reason)
- Searchable history

#### 5.2.4 Incident Reporting
- Quick incident log: type, description, optional photo
- Submitted to estate manager dashboard immediately
- No resolution flow — manager handles from dashboard

#### 5.2.5 Staff Profile
- Shift clock-in/out (for manager's staff activity reporting)
- Basic notifications (emergency alerts from manager)

---

### 5.3 Manager Dashboard (Next.js Web)

#### 5.3.1 Overview Dashboard
- Estate health metrics: active residents, outstanding levies (ZAR total), open maintenance requests, gate activity today
- Alerts panel: overdue levies, unresolved incidents, pending approvals

#### 5.3.2 Resident Management
- Resident directory (unit → household → members)
- Add/remove residents, send invite links
- Unit status (occupied, vacant, owner vs tenant)
- Bulk import via CSV

#### 5.3.3 Levy & Financial Management
- Levy schedule configuration (monthly amount per unit, due date)
- Per-resident account: post charges, record payments, add notes
- Bulk levy run: generate monthly charges for all units in one click
- Arrears report: filter by overdue > 30/60/90 days
- Export to CSV for accounting software
- Statement generation per resident (PDF)

> **v1 Scope Note:** No payment gateway integration. Manager records payments manually after confirming EFT. This is intentional — keeps compliance scope minimal for MVP.

#### 5.3.4 Maintenance Management
- All requests in one view: filter by status, category, assigned staff
- Assign to external contractor (name + contact, no contractor portal in v1)
- Update status + add notes
- SLA tracking: flag requests open > 72 hours

#### 5.3.5 Access Control
- View full gate log (all entries/exits)
- Manage permanent access list (residents with access cards — metadata only in v1)
- Emergency lockdown: lock all gates (single button, requires confirmation modal)
- Revoke any active guest OTP

#### 5.3.6 Staff Management
- Add/remove security staff accounts
- View shift clock-in/out logs
- Staff activity report (entries processed per guard per shift)

#### 5.3.7 Notices & Communication
- Post notices: title, body, category (general / urgent / emergency), optional attachment
- Emergency alert: sends push to all residents + security immediately
- Scheduled notices (publish at date/time)
- Notice analytics: seen count per notice

#### 5.3.8 Trustee Reporting
- Generate monthly estate report: levy collection rate, maintenance summary, gate activity, financials
- Approve for trustee view (draft until approved)
- Document vault: upload minutes, budgets, compliance docs

#### 5.3.9 Settings
- Estate profile (name, address, unit count, branding)
- Notification templates (levy reminder, overdue notice, welcome message)
- Integration settings (Twilio credentials, Resend config)

---

### 5.4 Superadmin Portal (Next.js Web)

#### 5.4.1 Estate Management
- Provision new estate (creates isolated Supabase project schema, assigns manager)
- Suspend / deactivate estate
- Estate health overview across all estates

#### 5.4.2 Billing & Subscriptions
- Per-estate subscription status (tier, billing date, amount)
- Manual override (for pilot estates on free tier)
- Payment history

#### 5.4.3 Support Access
- Impersonate manager (read-only audit mode) for support tickets
- View estate logs without triggering resident-visible activity

#### 5.4.4 Platform Analytics
- Active estates, MAU, feature adoption rates
- Levy transactions processed (volume metric for sales)

---

## 6. Technical Architecture

### 6.1 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Resident App | React Native (Expo) | Cross-platform iOS + Android, OTA updates |
| Security App | React Native (Expo) | Same codebase as resident app, different navigation |
| Manager Dashboard | Next.js (App Router) | Web-first, SSR for reporting |
| Superadmin Portal | Next.js (App Router) | Internal tool, same framework |
| Database + Auth | Supabase | Postgres + RLS + Realtime + Storage |
| Multi-tenancy | Two Supabase projects | Apps DB + Platform/Billing DB |
| Monorepo | Turborepo | Shared packages (types, utils, UI) |
| SMS / WhatsApp | Twilio | OTP delivery + WhatsApp gate codes |
| Email | Resend | Transactional email (levy statements, notices) |
| Barcode Scanning | barKoder SDK | SA driver's licence PDF417 barcode |
| Hosting (Web) | Cloudflare Pages | Edge-delivered, fast in SA |
| API Workers | Cloudflare Workers | Edge functions for webhooks, OTP logic |
| Gate Hardware | Raspberry Pi + Relay Board | Controls physical gate motor |
| File Storage | Supabase Storage | Profile photos, maintenance attachments, documents |

### 6.2 Multi-Tenancy Strategy

**Two Supabase projects:**
- `estavo-app` — All estate operational data (residents, levies, maintenance, gate logs). Each estate is isolated via Row Level Security (RLS) policies using `estate_id`.
- `estavo-platform` — Billing, subscription management, estate provisioning records, superadmin accounts.

This separation prevents a billing bug from touching operational data and makes future white-labelling cleaner.

### 6.3 Authentication Matrix

| Role | Auth Method | 2FA |
|---|---|---|
| Resident | Magic link (email) | Optional biometric (device-level) |
| Security Staff | Email + password | No (operational speed priority) |
| Estate Manager | Email + password | TOTP (mandatory) |
| Trustee | Email + password | TOTP (mandatory) |
| Superadmin | Email + password | TOTP (mandatory) |

### 6.4 Gate Control Flow

```
Resident pre-authorises guest → OTP generated (stored in Supabase)
                                       ↓
                          Guest arrives at gate
                                       ↓
             Security scans DL barcode OR enters OTP
                                       ↓
                    Cloudflare Worker validates OTP
                                       ↓
                    Supabase Realtime pushes open signal
                                       ↓
              Raspberry Pi listener receives signal → triggers relay → gate opens
                                       ↓
                          Entry logged in gate_log table
```

### 6.5 Database Schema (Core Tables)

```sql
-- estates
id, name, address, unit_count, subscription_tier, created_at

-- units
id, estate_id, unit_number, status (occupied/vacant), type (owner/tenant)

-- profiles
id, estate_id, unit_id, role, full_name, email, phone, created_at

-- guest_otps
id, estate_id, unit_id, otp_code, guest_name, valid_from, valid_until, used_at, revoked_at

-- gate_log
id, estate_id, entry_type (otp/manual/permanent), guest_name, unit_id, staff_id, entered_at, exited_at

-- levy_accounts
id, estate_id, unit_id, balance, last_updated

-- levy_transactions
id, estate_id, unit_id, type (charge/payment/credit/penalty), amount, description, created_at, created_by

-- maintenance_requests
id, estate_id, unit_id, category, description, status, assigned_to, created_at, resolved_at

-- notices
id, estate_id, title, body, category, published_at, created_by, attachment_url

-- incidents
id, estate_id, reported_by (staff_id), type, description, photo_url, created_at
```

---

## 7. MVP Scope (Phase 1 — 12 Weeks)

### In Scope

| Feature Area | Included in MVP |
|---|---|
| Resident App | Home, guest OTP, levy view, maintenance requests, notices |
| Security App | Gate control, OTP verification, DL scan, visitor log |
| Manager Dashboard | Residents, levies (manual), maintenance, notices, gate log, staff management |
| Gate Hardware | Raspberry Pi + relay, Supabase Realtime trigger |
| Auth | All roles, magic link, TOTP 2FA |
| Notifications | Push (Expo), email (Resend), SMS OTP (Twilio) |

### Explicitly Out of Scope (MVP)

| Feature | Reason | When |
|---|---|---|
| In-app payment processing | Compliance overhead, not needed for manual EFT workflows | Phase 2 |
| Contractor portal | Adds a 5th surface to build | Phase 2 |
| AI quote analysis | Scope creep, manual works fine at this scale | Phase 3 |
| White-labelling | Not needed until 10+ estates | Phase 3 |
| Trustee portal | Read-only reports can be emailed as PDFs for MVP | Phase 2 |
| WhatsApp notifications | Twilio SMS covers OTP; WhatsApp adds cost + complexity | Phase 2 |
| Visitor facial recognition | Hardware complexity, cost, POPIA risk | Future |

---

## 8. Pricing (ZAR)

| Tier | Units | Monthly Price | Target Customer |
|---|---|---|---|
| Starter | Up to 50 units | R 1,200 / month | Small complexes |
| Growth | 51–150 units | R 2,800 / month | Mid-size estates |
| Estate | 151–350 units | R 5,500 / month | Large estates |
| Enterprise | 350+ units | Custom | Lifestyle estates |

**Notes:**
- Annual billing discount: 15% off
- Pilot pricing: First 3 estates at 50% for 6 months (customer development)
- Onboarding fee: R 3,500 per estate (one-time, covers setup + manager training by Bryson)

---

## 9. POPIA Compliance Notes

- All personal data (resident IDs, vehicle info, visitor logs) stored on South African infrastructure (Supabase region: `af-south-1` / use EU-West if SA not available, document the choice)
- Driver's licence scan data: logged to `gate_log` table only — not stored as raw image unless explicitly required
- Data retention policy: gate logs purged after 12 months by default (configurable per estate)
- Residents must accept terms on first login (consent record stored)
- Estate manager is the responsible party (operator agreement in onboarding contract)

---

## 10. Success Metrics (6 Months Post-Launch)

| Metric | Target |
|---|---|
| Estates onboarded | 5 paying estates |
| MRR | R 15,000+ |
| Resident app DAU/MAU | > 40% |
| Levy collection rate improvement | Measurable vs pre-platform baseline |
| Manager NPS | > 50 |
| Support tickets per estate/month | < 5 |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Raspberry Pi hardware failure at gate | Medium | High | Failsafe: gate defaults open (not locked) on signal loss; backup manual override |
| Estate manager adoption lag | High | Medium | Onboarding session + 30-day check-in by Bryson |
| POPIA audit | Low | High | Document all data flows, use SA-region infrastructure, operator agreements |
| Supabase downtime | Low | High | Offline OTP fallback: cache last 10 valid OTPs on security app device |
| Scope creep in build phase | High | Medium | This PRD is the lock. New features go to backlog, not current sprint |
| Twilio SMS delivery failures | Medium | Medium | Resend email as backup channel; OTP visible in resident app regardless |

---

## 12. Governance Expansion (Phase 2)

This section covers all features added as part of the Estate OS governance layer. It extends the existing Management Dashboard and introduces two new portals:

- **Management Dashboard additions** — Contractors screen, Approval Requests screen, Pending Approvals widget, Escalation Thresholds settings
- **Trustee Portal** — Decision inbox, Estate overview, Meetings, Document vault
- **Corporate Dashboard** — Portfolio overview, Analytics, Financials, Compliance, Manager directory

---

### 12.1 Architecture

**URL Structure:**
```
app.estavo.co.za/dashboard       → Estate Manager (existing)
app.estavo.co.za/trustees        → Trustee Portal (new)
corporate.estavo.co.za           → Corporate Dashboard (new)
```

**Role Access Map:**

| Feature | Estate Manager | Trustee | Corporate Agent | Super Admin |
|---|---|---|---|---|
| Contractors screen | ✅ Full | ❌ | ❌ | ✅ |
| Approval requests (submit) | ✅ | ❌ | ❌ | ✅ |
| Approval requests (vote) | ❌ | ✅ | ❌ | ✅ |
| Trustee Portal | ❌ | ✅ | ❌ | ✅ |
| Document vault (upload) | ✅ | ❌ | ✅ | ✅ |
| Document vault (view) | ✅ | ✅ | ✅ | ✅ |
| Corporate Dashboard | ❌ | ❌ | ✅ | ✅ |
| Estate overview (aggregate) | ❌ | ✅ (own estate) | ✅ (all estates) | ✅ |
| Resident data | ✅ | ❌ | ❌ | ✅ |
| Individual financial data | ❌ | ❌ | ❌ | ✅ |

---

### 12.2 Database Schema (Governance Tables)

```sql
-- AI-generated summaries for approval requests
CREATE TABLE approval_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  recommendation TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  model_version TEXT DEFAULT 'claude-sonnet-4-20250514'
);

-- Meeting records
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  meeting_type TEXT NOT NULL CHECK (meeting_type IN ('agm', 'trustee', 'special')),
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  agenda_items JSONB,
  minutes_text TEXT,
  minutes_url TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Meeting resolutions
CREATE TABLE meeting_resolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  resolution_number TEXT NOT NULL,
  description TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('passed', 'rejected', 'deferred')),
  votes_for INT DEFAULT 0,
  votes_against INT DEFAULT 0,
  votes_abstained INT DEFAULT 0,
  resolved_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(estate_id, resolution_number)
);

-- Nightly estate performance snapshots (for Corporate Dashboard)
CREATE TABLE estate_performance_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  open_tickets INT DEFAULT 0,
  unassigned_tickets INT DEFAULT 0,
  avg_resolution_days DECIMAL(4,1),
  alerts_this_month INT DEFAULT 0,
  levy_collection_rate DECIMAL(5,2),
  performance_score INT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(estate_id, snapshot_date)
);
```

---

### 12.3 RLS Policies (Governance Tables)

```sql
-- Approval summaries: governance roles only
CREATE POLICY "approval_summaries_governance_only"
  ON approval_summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('trustee', 'estate_manager', 'corporate_agent', 'super_admin')
    )
  );

-- Meetings: trustees + managers of that estate only
CREATE POLICY "meetings_estate_scoped"
  ON meetings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.estate_id = meetings.estate_id
      AND profiles.role IN ('trustee', 'estate_manager', 'super_admin')
    )
  );

-- Meeting resolutions: same scope as meetings
CREATE POLICY "resolutions_estate_scoped"
  ON meeting_resolutions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.estate_id = meeting_resolutions.estate_id
      AND profiles.role IN ('trustee', 'estate_manager', 'super_admin')
    )
  );

-- Performance snapshots: corporate agents see assigned estates; managers see own
CREATE POLICY "performance_snapshots_scoped"
  ON estate_performance_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'super_admin'
        OR (profiles.role = 'estate_manager' AND profiles.estate_id = estate_performance_snapshots.estate_id)
        OR (
          profiles.role = 'corporate_agent'
          AND EXISTS (
            SELECT 1 FROM corporate_agent_estates
            WHERE corporate_agent_estates.agent_profile_id = profiles.id
            AND corporate_agent_estates.estate_id = estate_performance_snapshots.estate_id
          )
        )
      )
    )
  );
```

---

### 12.4 Edge Functions

#### `generate-approval-summary`
Triggered when a new approval request is created with PDF attachments.

1. Fetch approval record + attached document metadata
2. Call Claude API (`claude-sonnet-4-20250514`) with document context
3. Prompt extracts vendor names, amounts, scope summary, flags anomalies, gives 1-paragraph recommendation
4. Insert result into `approval_summaries`

**Endpoint:** `POST /functions/v1/generate-approval-summary`
```typescript
// Request
{ approval_request_id: string }
// Response
{ summary_text: string, recommendation: string }
```

**Prompt structure:**
```
You are reviewing approval documents for a South African residential estate.
The estate manager has submitted the following documents for trustee approval.

Request type: [type]
Title: [title]
Description: [description]
Amount: [amount]

[Attached document content]

Write a single paragraph (max 80 words) summarising:
1. What is being requested
2. Key figures and vendors
3. Any notable flags or concerns
4. A brief recommendation

Then write one sentence starting with "Recommendation:"
Be factual, concise, and neutral. Do not invent information not in the documents.
```

#### `compute-estate-performance`
Nightly cron at 00:00 SAST via pg_cron.

For each active estate, computes a 0–100 composite score:
- -20 per unresolved emergency alert
- -5 per unassigned ticket over 24hrs
- +20 for avg resolution < 2 days
- -10 for avg resolution > 5 days
- +30 for levy collection > 90%
- -20 for levy collection < 70%

Inserts result into `estate_performance_snapshots`.

#### `cast-approval-vote`
Triggered when a trustee votes on an approval request.

1. Verify caller role = `trustee` and belongs to the estate
2. Insert into `approval_votes`
3. Increment `votes_received` on `approval_requests`
4. If threshold met → update status to `approved` or `rejected`
5. Send notification to estate manager

**Endpoint:** `POST /functions/v1/cast-approval-vote`
```typescript
// Request
{
  approval_request_id: string,
  vote: 'approved' | 'rejected' | 'more_info',
  comment?: string
}
```

---

### 12.5 Management Dashboard Additions

#### Contractors Screen (`/dashboard/contractors`)
Positioned in sidebar after Tasks, before Amenities.

- Filter pills: All | Plumbing | Electrical | Pest Control | Landscaping | General
- Table: Name | Trade | Phone | Email | Rating | Jobs Done | Status | Actions
- Ratings rendered as star row with numeric value in JetBrains Mono
- Row click opens 400px right slide-over with tabs: Overview | Quote History | Jobs
- "Add Contractor" modal: name, trade category, phone, email (optional), notes (optional)
- "Request Quote" button on contractor detail → creates an approval request of type `QUOTE`

#### Approval Requests Screen (`/dashboard/approvals`)
Positioned in sidebar after Reports.

- Filter pills: All | Pending | Approved | Rejected | More Info Requested
- Table: Ref | Title | Type | Amount | Status | Submitted | Trustee Votes | Actions
- Type badges (JetBrains Mono UPPERCASE): `QUOTE` (sage), `EXPENSE` (amber), `VENDOR ONBOARD` (blue), `POLICY CHANGE` (red)
- Vote progress shown as mini progress indicator: "1/2 votes"
- New Request modal fields: type, title, description, amount, file upload (PDF, max 3 files, 10MB each), votes required
- On submission: creates `approval_requests` record, triggers `generate-approval-summary` if PDFs attached, notifies all trustees
- Detail slide-over shows: AI summary, attachments, per-trustee vote status, full timeline

#### Pending Approvals Widget
Added to existing Dashboard screen below KPI cards.

```
Pending Approvals                    [2 pending →]
─────────────────────────────────────────────────
APR-001 | Pool pump replacement | R14,800 | 1/2 votes
APR-004 | Conduct rule update   | —       | 0/2 votes
```

Empty state: "NO PENDING APPROVALS · All requests have been actioned."

#### Settings Addition — Escalation Thresholds
New sub-section in existing Settings screen:
- Approval threshold (ZAR): expenses above this require trustee approval (default R5,000)
- Votes required for approval (default 2)
- Quote minimum: number of quotes required before submitting (default 3)
- Emergency auto-notify trustees: ON/OFF toggle
- Unassigned ticket warning: hours before escalation banner shows (default 12)

---

### 12.6 Trustee Portal

**URL:** `app.estavo.co.za/trustees`
**Access:** `role = 'trustee'` only
**Design principle:** Decision inbox. Trustees are not ops people — no gate logs, no staff data, no maintenance tables. Mobile-first.

**Auth flow:**
1. Manager creates trustee account via Management Dashboard (invite by email)
2. Trustee receives email → sets password → profile created with `role = 'trustee'` + `estate_id`
3. Login → redirected to `/trustees/approvals`
4. Middleware enforces `role = 'trustee'` — no access to any other route

**Sidebar:** Approvals (default, pending badge) · Estate Overview · Meetings · Documents · Settings

#### T1 — Approvals (`/trustees/approvals`)
Default landing screen. Stacked approval cards, each showing:
- Type badge + status pill
- Title, submitted by, time, amount
- AI-generated summary paragraph (from `approval_summaries`)
- PDF attachment links
- Per-trustee vote status row
- Three action buttons: `Approve` | `Reject` | `Request More Info`
- On vote: card dims, status updates, toast "✓ Vote recorded. Logged 15:04" (JetBrains Mono 11px)
- "Request More Info" shows inline textarea → submits comment to estate manager, card status → `MORE INFO REQUESTED`

#### T2 — Estate Overview (`/trustees/overview`)
Read-only governance snapshot:
- Open maintenance tickets (count + high priority count)
- Unresolved emergency alerts
- Staff on shift
- Levy collection rate (aggregate % only — no individual names per POPIA)
- Next trustee meeting + upcoming AGM (with links)
- Last broadcast sent, pending approvals count

No action buttons except navigation links.

#### T3 — Meetings (`/trustees/meetings`)
Two tabs: Upcoming | Past

**Upcoming:** Meeting cards with title, date, time, location, RSVP count, "View Agenda →" link. Agenda slide-over shows items list, "Add agenda item" (trustees can propose), minutes PDF download once uploaded.

**Past:** Resolution log table — RES-001, description, date, vote tally, result badge (Passed = green, Rejected = red, Deferred = amber, JetBrains Mono UPPERCASE).

#### T4 — Documents (`/trustees/documents`)
2-column card grid: Insurance Certificate, 10-Year Maintenance Plan, Audited Financials, HOA/Body Corporate Rules, CSOS Submission, POPIA Compliance Record.

Each card shows validity status:
- > 60 days: green "Valid"
- 30–60 days: amber "Expires soon"
- < 30 days: red "Expires in X days"
- Expired: red "EXPIRED"

Trustees download only. Upload is manager/corporate agent only.
Header note: "All documents are encrypted and access-logged."

---

### 12.7 Corporate Dashboard

**URL:** `corporate.estavo.co.za`
**Access:** `role = 'corporate_agent'` only
**Design principle:** Portfolio health at a glance. Every screen answers "is something wrong and where?"

**Auth flow:**
1. Bryson (super_admin) creates corporate agent account
2. Agent receives invite email → sets password → `role = 'corporate_agent'`
3. Bryson assigns estates via `corporate_agent_estates` table
4. Login → redirected to `/portfolio`
5. Agent sees only assigned estates — no cross-portfolio data leakage

**Sidebar:** Portfolio (default) · Analytics · Financials · Compliance · Managers · Settings

#### C1 — Portfolio (`/portfolio`)
Estate cards in a grid (2 columns desktop, 1 mobile). Each card shows:
- Estate name, location, unit count, manager name + last active
- Open tickets, unassigned tickets, alerts this month, levy amount + payment status
- Performance score (0–100)
- "View Estate →" opens scoped read-only Management Dashboard (no gate actions, no resident personal data, no settings changes)

Card border states:
- Red border + "NEEDS ATTENTION": overdue payment / unresolved emergency / 5+ unassigned tickets / compliance expired
- Amber border: pending approvals / compliance due within 30 days
- Green border (default): all clear

Filter pills: All | Needs Attention | Healthy | Suspended

#### C2 — Analytics (`/analytics`)
Estate Performance Table: Open | Avg Resolution | Alerts | Levy Rate | Score (per estate)
Score colours: 80–100 green, 60–79 amber, below 60 red.

Charts below table:
- Monthly ticket volume — line chart, one line per estate, last 6 months
- Avg resolution time — bar chart, estates side by side
- Levy collection rate — horizontal bar per estate

"Download Report PDF" button top right.

#### C3 — Financials (`/financials`)
Summary card: total portfolio revenue, paid this month, outstanding, average levy collection.

Billing Status Table: Estate | Monthly Fee | Levy Collection | Status | Next Invoice
Overdue row: amber background, "OVERDUE" badge in red mono.

Row click → Invoice History slide-over for that estate (month, amount, status, due date, download/send reminder actions).

#### C4 — Compliance (`/compliance`)
Compliance Matrix — rows = compliance items, columns = estates:
- CSOS submission, Insurance Certificate, 10-Year Maintenance Plan, Audited Financials, POPIA Review
- Cell colours: ✅ green, ⚠️ amber, 🔴 red, ⏳ grey
- Click amber/red cell → compliance detail slide-over with upload action

"Export Compliance Report" button → PDF of full matrix with dates.

#### C5 — Managers (`/managers`)
Manager Directory Table: Name | Estate | Phone | Last Login | Status | Actions (View · Message)
"Add Manager" button → invite by email modal.
Manager detail slide-over: contact info, last login, recent activity log (last 10 actions), "Reassign to different estate" + "Message Manager" actions.

---

### 12.8 AI Features

#### Quote Summariser
- **Trigger:** New approval request with PDF attachments
- **Model:** `claude-sonnet-4-20250514`
- **Output:** Single paragraph (max 80 words) + one-sentence recommendation
- **Display:** Approval cards in Trustee Portal + approval detail slide-over in Management Dashboard

#### Maintenance Pattern Detection
- **Trigger:** New ticket submitted for a unit or asset
- **Model:** `claude-haiku-4-5-20251001`
- **Logic:** Query last 24 months of tickets for same unit or matching description keywords. Flag if same issue type appears 3+ times.
- **Display:** Amber banner on ticket detail

```
⚠️ Pattern detected: This asset has been repaired 4 times in 18 months.
Total repair spend: R11,200. Replacement cost estimate: R8,000.
Consider replacement over further repairs.
```

---

### 12.9 Governance Notifications

| Event | Recipient | Channel |
|---|---|---|
| New approval request submitted | All trustees of estate | Push + Email |
| Trustee votes on approval | Estate manager | Push |
| Approval threshold reached | Estate manager | Push + Email |
| Trustee requests more info | Estate manager | Push + Email |
| Meeting scheduled | All trustees | Push + Email |
| Document expiring in 30 days | Estate manager + corporate agent | Email |
| Document expired | Estate manager + corporate agent + trustees | Email |
| Performance score drops below 70 | Corporate agent | Email |
| Compliance item overdue | Corporate agent | Email |

---

### 12.10 Open Questions (Pre-Build Validation)

These must be answered via estate manager + trustee interviews before building Phase 2:

- [ ] What is the typical approval threshold at SA estates? (Drives Settings default)
- [ ] Do trustees prefer push notifications or email for approval requests?
- [ ] How many trustees does a typical estate have? (Drives `required_votes` default)
- [ ] Do trustees have laptops or are they purely mobile?
- [ ] What compliance deadlines cause the most stress for managing agents?
- [ ] Would corporate agents pay per-estate or prefer flat portfolio pricing?

---

*This is the locked PRD for Estavo v1 + Governance Expansion. Changes require explicit decision and version increment.*
