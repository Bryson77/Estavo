# EstateHQ — Governance Expansion PRD
## Full-Stack (Frontend + Backend)
**Version:** 1.0 | **Status:** Pre-build | **Date:** June 2026
**Scope:** Management Dashboard additions + Trustee Portal + Corporate Dashboard

---

## 1. OVERVIEW

This PRD covers all new features added to EstateHQ as part of the Estate OS governance expansion. It extends the existing Management Dashboard and introduces two new portals:

- **Management Dashboard additions** — Contractors screen, Approval Requests outbox, Pending Approvals widget
- **Trustee Portal** — Decision inbox, Estate overview, Meetings, Document vault
- **Corporate Dashboard** — Portfolio overview, Analytics, Financials, Compliance, Manager directory

All three interfaces share the same Supabase backend, design system, and authentication layer defined in the core PRD.

---

## 2. ARCHITECTURE

### URL Structure

```
app.estatehq.co.za/dashboard       → Estate Manager (existing)
app.estatehq.co.za/trustees        → Trustee Portal (new)
corporate.estatehq.co.za           → Corporate Dashboard (new)
```

### Role Access Map

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

## 3. DATABASE SCHEMA (New Tables)

> Tables in the core PRD already cover: `approval_requests`, `approval_votes`, `contractors`, `documents`, `trustee_estate_memberships`, `corporate_agent_estates`. This section defines the additional fields and logic not covered there.

### 3.1 Approval AI Summaries

```sql
CREATE TABLE approval_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,         -- AI-generated summary paragraph
  recommendation TEXT,                -- AI recommendation (optional)
  generated_at TIMESTAMPTZ DEFAULT now(),
  model_version TEXT DEFAULT 'claude-sonnet-4-20250514'
);
```

### 3.2 Meeting Records

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  meeting_type TEXT NOT NULL CHECK (meeting_type IN ('agm', 'trustee', 'special')),
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  agenda_items JSONB,                 -- Array of agenda item objects
  minutes_text TEXT,                  -- Free-text minutes
  minutes_url TEXT,                   -- PDF upload URL
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE meeting_resolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  resolution_number TEXT NOT NULL,    -- RES-001, RES-002
  description TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('passed', 'rejected', 'deferred')),
  votes_for INT DEFAULT 0,
  votes_against INT DEFAULT 0,
  votes_abstained INT DEFAULT 0,
  resolved_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(estate_id, resolution_number)
);
```

### 3.3 Estate Performance Scores (Corporate layer)

```sql
CREATE TABLE estate_performance_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  open_tickets INT DEFAULT 0,
  unassigned_tickets INT DEFAULT 0,
  avg_resolution_days DECIMAL(4,1),
  alerts_this_month INT DEFAULT 0,
  levy_collection_rate DECIMAL(5,2),  -- percentage, e.g. 94.50
  performance_score INT,              -- 0–100 composite score
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(estate_id, snapshot_date)
);
```

---

## 4. RLS POLICIES (New Tables)

```sql
-- Approval summaries: same access as approval_requests
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

-- Meeting resolutions: same as meetings
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

-- Performance snapshots: corporate agents see all their estates, managers see own
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

## 5. EDGE FUNCTIONS (New)

### 5.1 `generate-approval-summary`

**Trigger:** When a new approval request is created with document_urls attached.

**Logic:**
1. Receive `approval_request_id`
2. Fetch approval record + attached document metadata
3. Call Claude API (claude-sonnet-4-20250514) with document context
4. Prompt: extract vendor names, amounts, scope summary, flag anomalies, give 1-paragraph recommendation
5. Insert result into `approval_summaries`
6. Return summary to caller

**Endpoint:** `POST /functions/v1/generate-approval-summary`

```typescript
// Request body
{ approval_request_id: string }

// Response
{ summary_text: string, recommendation: string }
```

### 5.2 `compute-estate-performance`

**Trigger:** Nightly cron (00:00 SAST) via pg_cron.

**Logic:**
1. For each active estate, query:
   - Count of open tickets
   - Count of unassigned tickets older than 24hrs
   - Average resolution time (last 30 days)
   - Count of emergency alerts (current month)
   - Levy collection rate (from financial data)
2. Compute composite performance score (0–100):
   - -20 per unresolved emergency alert
   - -5 per unassigned ticket over 24hrs
   - +20 for avg resolution < 2 days
   - -10 for avg resolution > 5 days
   - +30 for levy collection > 90%
   - -20 for levy collection < 70%
3. Insert into `estate_performance_snapshots`

**Endpoint:** `POST /functions/v1/compute-estate-performance`

### 5.3 `cast-approval-vote`

**Trigger:** Trustee taps Approve / Reject / More Info on an approval card.

**Logic:**
1. Verify caller role = `trustee`
2. Verify trustee belongs to the estate of the approval
3. Insert into `approval_votes`
4. Increment `votes_received` on `approval_requests`
5. Check if `votes_received >= required_votes` — if yes, update status to `approved`
6. Check if majority rejected — update to `rejected`
7. Send notification to estate manager

**Endpoint:** `POST /functions/v1/cast-approval-vote`

```typescript
// Request body
{
  approval_request_id: string,
  vote: 'approved' | 'rejected' | 'more_info',
  comment?: string
}
```

---

## 6. MANAGEMENT DASHBOARD — NEW SCREENS

### 6.1 Contractors Screen

**Route:** `/dashboard/contractors`
**Sidebar position:** After Tasks, before Amenities

#### Layout

Header row:
- Title: "Contractors" (Fraunces)
- Right: "Add Contractor" button (primary red)
- Stats: "4 contractors · 2 trades"

Filter pills: All | Plumbing | Electrical | Pest Control | Landscaping | General

#### Contractor Table

Columns: Name | Trade | Phone | Email | Rating | Jobs Done | Status | Actions

```
SA Plumbing Pro      | Plumbing   | 011 234 5678 | — | ★★★★☆ 4.2 | 7 jobs  | Active | View · Edit · Deactivate
PowerFix Electric    | Electrical | 072 345 6789 | — | ★★★★★ 4.8 | 3 jobs  | Active | View · Edit · Deactivate
PestAway SA          | Pest Control| 083 456 7890 | — | ★★★☆☆ 3.1 | 2 jobs  | Active | View · Edit · Deactivate
GreenCut Landscaping | Landscaping | 061 567 8901 | — | ★★★★☆ 4.0 | 5 jobs  | Active | View · Edit · Deactivate
```

Rating: rendered as star row, numeric value in JetBrains Mono.

#### Contractor Detail Slide-over (400px, right)

- Name, trade badge, phone, email, rating
- Tabs: Overview | Quote History | Jobs

**Overview tab:**
- Date added, status, contact details
- "Request Quote" button (primary red)

**Quote History tab:**
```
APR-001 | Pool pump replacement | R14,800 | 13 Jan 2026 | Approved
APR-003 | Pest treatment       | R2,400  | 5 Mar 2026  | Rejected
```

**Jobs tab:**
- Tickets this contractor was assigned/referenced
- Ticket number, title, date, status

#### Add Contractor Modal

```
Contractor name:  [text input]
Trade category:   [dropdown — Plumbing / Electrical / Pest Control / Landscaping / General / Other]
Phone:            [text input]
Email:            [text input — optional]
Notes:            [textarea — optional]
[Add Contractor] → "✓ Logged" microcopy
```

---

### 6.2 Approval Requests Screen

**Route:** `/dashboard/approvals`
**Sidebar position:** After Reports

#### Layout

Header row:
- Title: "Approval Requests" (Fraunces)
- Right: "New Request" button (primary red)
- Stats: "2 pending · 1 approved · 1 rejected"

Filter pills: All | Pending | Approved | Rejected | More Info Requested

#### Approvals Table

Columns: Ref | Title | Type | Amount | Status | Submitted | Trustee Votes | Actions

```
APR-001 | Pool pump replacement  | QUOTE         | R14,800 | Pending   | 2 hrs ago   | 1/2 votes | View · Cancel
APR-002 | PestAway invoice       | EXPENSE       | R3,200  | Approved  | 1 day ago   | 2/2 votes | View
APR-003 | New security vendor    | VENDOR ONBOARD| —       | Rejected  | 3 days ago  | 1/2 votes | View
APR-004 | Conduct rule update    | POLICY CHANGE | —       | More Info | 5 days ago  | 0/2 votes | View · Resubmit
```

Type badges: `QUOTE` (sage), `EXPENSE` (amber), `VENDOR ONBOARD` (blue), `POLICY CHANGE` (red). JetBrains Mono UPPERCASE.

Vote progress: "1/2 votes" — shows as mini progress indicator.

#### New Request Modal

```
Request type:   [segmented — Quote | Expense | Policy Change | Vendor Onboard]
Title:          [text input — required]
Description:    [textarea]
Amount (R):     [number input — optional for Policy/Vendor]
Attach quotes:  [file upload — PDF, max 3 files, 10MB each]
Votes required: [number input — default 2]

[Submit for Approval] → "✓ Submitted. Trustees notified." microcopy
```

After submission:
- Creates record in `approval_requests`
- Triggers `generate-approval-summary` Edge Function if PDFs attached
- Sends push notification to all trustees of this estate

#### Approval Request Detail Slide-over

```
APR-001                                          [PENDING badge]
Pool pump replacement

Type: QUOTE | Amount: R14,800
Submitted by: Amara Khumalo | 2 hours ago
Votes: 1 of 2 required

AI Summary:
"3 quotes obtained. Cheapest: AquaFix at R14,800.
Recommended by estate manager. Existing pump repaired
twice in 18 months at combined cost of R9,200.
Replacement is cost-effective long-term."

Attachments:
  [AquaFix_Quote.pdf] [PlumbPro_Quote.pdf] [AquaGuard_Quote.pdf]

Trustee Votes:
  John Mokoena     ✅ Approved — "Agree with recommendation"
  Mary Sithole     ⏳ Pending
  David Ferreira   ⏳ Pending

Timeline:
  ✅ Submitted — Amara Khumalo — 14:30
  ✅ AI Summary generated — 14:31
  ✅ Trustees notified — 14:31
  ✅ John Mokoena voted Approved — 15:04
  ⏳ Awaiting 1 more vote...
```

---

### 6.3 Dashboard Widget — Pending Approvals

**Added to:** existing Dashboard screen, below KPI cards, left column.

```
Pending Approvals                    [2 pending →]
─────────────────────────────────────────────────
APR-001 | Pool pump replacement | R14,800 | 1/2 votes
APR-004 | Conduct rule update   | —       | 0/2 votes
```

Click "→" navigates to `/dashboard/approvals`.
If 0 pending: empty state — "NO PENDING APPROVALS / All requests have been actioned."

---

### 6.4 Settings Addition — Escalation Thresholds

**Added to:** existing Settings screen, Escalation Thresholds sub-section.

```
Approval threshold:
  R [5000] — expenses above this require trustee approval
  [Save] → "✓ Logged"

Votes required for approval:
  [2] trustees must approve before status changes

Quote minimum:
  [3] quotes required before submitting a quote request

Emergency auto-notify trustees:
  [ON] — send push notification to trustees on emergency alert

Unassigned ticket warning:
  After [12] hours, show escalation banner on Reports screen
```

---

## 7. TRUSTEE PORTAL

**URL:** `app.estatehq.co.za/trustees`
**Access:** `role = 'trustee'` only

**Design principle:** Trustees are not ops people. The entire interface is a decision inbox. No gate logs, no staff data, no maintenance tables. Mobile-first — most trustees check this on their phone.

### Sidebar Navigation

```
📥  Approvals        (default — badge showing pending count)
📊  Estate Overview
📅  Meetings
📄  Documents
⚙️  Settings
```

Same design system as management dashboard. Sidebar collapses to icon-only on mobile.

---

### Screen T1 — Approvals

**Route:** `/trustees/approvals`
**Default landing screen.**

#### Layout

Header: "Approvals" (Fraunces) + badge showing pending count.
Filter pills: All | Pending | Approved | Rejected

#### Approval Cards (stacked, full width)

Each card:

```
[QUOTE]                              Pending ●
Pool pump replacement
Submitted by Amara Khumalo · 2 hours ago · R14,800

AI Summary:
"3 quotes obtained. Cheapest: AquaFix at R14,800.
Recommended by estate manager. Existing pump repaired
twice in 18 months at combined cost of R9,200.
Replacement is cost-effective long-term."

Attachments: [AquaFix_Quote.pdf] [PlumbPro_Quote.pdf]

Votes: [John ✅] [You ⏳] [David ⏳]
Requires 2 of 3 trustee votes.

[Approve]  [Reject]  [Request More Info]

After action: "✓ Vote recorded. Logged 15:04" — JetBrains Mono 11px
```

**Type badge colours:**
- `QUOTE` — sage background
- `EXPENSE` — amber background
- `POLICY CHANGE` — red-light background
- `VENDOR ONBOARD` — forest-dark background, white text

**After voting:**
- Card dims, vote status updates
- If threshold met: card updates to "✅ Approved" or "❌ Rejected"
- Toast: "Vote recorded. Trustees notified."

**Request More Info flow:**
- Inline textarea appears: "What information do you need?"
- Submit → notification sent to estate manager with comment
- Card status → "MORE INFO REQUESTED"

---

### Screen T2 — Estate Overview

**Route:** `/trustees/overview`

Read-only governance snapshot. No operational detail.

```
The Hudson Lifestyle Estate
────────────────────────────────────────────
Open maintenance tickets:     5   (2 high priority)
Unresolved emergency alerts:  0
Staff on shift:               3
Levy collection rate:         94%   ← aggregate %, no names
────────────────────────────────────────────
Next trustee meeting:   Mon 13 Jan 2026, 18:00   [View →]
Upcoming AGM:           Thu 19 Feb 2026, 18:00   [View →]
────────────────────────────────────────────
Last broadcast sent:    2 days ago
Pending approvals:      2   [View →]
```

**POPIA note:** Levy collection shown as aggregate percentage only. No individual resident names or amounts.

All values are read-only. No action buttons except navigation links.

---

### Screen T3 — Meetings

**Route:** `/trustees/meetings`

#### Two tabs: Upcoming | Past

**Upcoming tab:**

Meeting cards:

```
AGM 2026
Thu 19 Feb 2026 · 18:00–20:00 · Clubhouse
67 RSVPs confirmed
[View Agenda →]

Trustee Meeting — January
Mon 13 Jan 2026 · 18:00 · Boardroom
Agenda: 3 items
[View Agenda →]
```

**Agenda view (slide-over):**
- Meeting title, date, time, location
- Agenda items list (numbered, added by manager)
- "Add agenda item" button (trustees can propose items)
- Minutes section: shows minutes text or PDF download once uploaded
- "Download Minutes PDF" button

**Past tab:**

Resolution log table:

```
RES-001 | Approved AquaFix pool pump — R14,800 | 13 Jan 2026 | 3/3 votes | Passed
RES-002 | Levy increase 8% for 2026            | 19 Feb 2026 | 2/3 votes | Passed
RES-003 | Rejected new security vendor          | 5 Mar 2026  | 1/3 votes | Rejected
```

Resolution badges: Passed = green, Rejected = red, Deferred = amber. JetBrains Mono UPPERCASE.

---

### Screen T4 — Documents

**Route:** `/trustees/documents`

#### Layout

Header: "Documents" (Fraunces) + "All documents are encrypted and access-logged."

Document categories (card grid, 2 columns):

```
Insurance Certificate
Valid until: Mar 2026 ← RED if within 30 days / expired
[Download PDF]

10-Year Maintenance Plan
Last updated: Jan 2024
[Download PDF]

Audited Financials 2024
Uploaded: Nov 2025
[Download PDF]

HOA / Body Corporate Rules
Version 3 · Updated: Aug 2023
[Download PDF]

CSOS Submission 2025
Status: ✅ Submitted
[Download PDF]

POPIA Compliance Record
Last reviewed: Nov 2025
[Download PDF]
```

**Expiry indicator:**
- > 60 days: green "Valid"
- 30–60 days: amber "Expires soon"
- < 30 days: red "Expires in X days"
- Expired: red "EXPIRED"

Trustees can download but not upload. Upload is manager/corporate only.

---

### Trustee Portal — Auth Flow

1. Manager creates trustee account via Management Dashboard (invite by email)
2. Trustee receives email with invite link
3. Trustee sets password → profile created with `role = 'trustee'` + `estate_id`
4. Login → redirected to `/trustees/approvals`
5. No access to any other route — middleware enforces `role = 'trustee'`

---

## 8. CORPORATE DASHBOARD

**URL:** `corporate.estatehq.co.za`
**Access:** `role = 'corporate_agent'` only

**Design principle:** Portfolio health at a glance. Every screen answers "is something wrong and where?"

### Sidebar Navigation

```
🏘️  Portfolio          (default)
📊  Analytics
💰  Financials
✅  Compliance
👥  Managers
⚙️  Settings
```

---

### Screen C1 — Portfolio Overview

**Route:** `/portfolio`
**Default landing screen.**

#### Layout

Header: "Portfolio" (Fraunces) + "3 estates · 2 healthy · 1 needs attention"

Filter pills: All | Needs Attention | Healthy | Suspended

#### Estate Cards (grid — 2 columns desktop, 1 column mobile)

```
The Hudson Lifestyle Estate          [ACTIVE ●]
Midrand, Gauteng · 184 units
Manager: Amara Khumalo · Last active 14 mins ago
──────────────────────────────────────────────
🔴 Open tickets: 5   ⚠️ Unassigned: 2
🚨 Alerts this month: 1
💳 R12,500 · ✅ Paid
Performance: 87/100

[View Estate →]
```

**Card border states:**
- Red border + "NEEDS ATTENTION" badge: overdue payment / unresolved emergency / 5+ unassigned tickets / compliance item expired
- Amber border: pending approvals / compliance due within 30 days
- Green border (default): all clear

**"View Estate →"** opens scoped read-only Management Dashboard for that estate.
- Corporate agent sees all data except individual resident personal info
- Cannot trigger gate actions or modify estate settings

---

### Screen C2 — Analytics

**Route:** `/analytics`

#### Estate Performance Table

```
Estate                | Open | Avg Resolution | Alerts | Levy Rate | Score
The Hudson            |  5   |   2.3 days     |   1    |   94%     |  87 ✅
Silverwood Estate     |  2   |   1.1 days     |   0    |   96%     |  96 ✅
Northgate Villas      | 11   |   5.4 days     |   3    |   71%     |  61 ⚠️
```

Score colours: 80–100 = green, 60–79 = amber, below 60 = red.

Drill into any row → scoped estate view.

#### Charts (below table)

- **Monthly ticket volume** — line chart, one line per estate, last 6 months
- **Avg resolution time** — bar chart, estates side by side
- **Levy collection rate** — horizontal bar per estate

Export: "Download Report PDF" button top right.

---

### Screen C3 — Financials

**Route:** `/financials`

#### Billing Status Table

```
Estate                | Monthly Fee | Levy Collection | Status     | Next Invoice
The Hudson            | R12,500     | 94%             | ✅ Paid    | 1 Jan 2026
Silverwood Estate     | R8,000      | 88%             | ✅ Paid    | 1 Jan 2026
Northgate Villas      | R9,500      | 71%             | ⚠️ Overdue | 15 Dec 2025
```

Overdue row: amber background, "OVERDUE" badge in red mono.

**Summary card (top):**
```
Total portfolio revenue:   R30,000 / month
Paid this month:           R20,500
Outstanding:               R9,500
Average levy collection:   84%
```

Click on estate row → invoice history slide-over for that estate.

**Invoice History Slide-over:**
```
Northgate Villas — Invoice History

Dec 2025 | R9,500 | ⚠️ OVERDUE  | Due 15 Dec | [Send Reminder]
Nov 2025 | R9,500 | ✅ Paid     | 1 Nov 2025 | [Download PDF]
Oct 2025 | R9,500 | ✅ Paid     | 1 Oct 2025 | [Download PDF]
```

---

### Screen C4 — Compliance

**Route:** `/compliance`

#### Compliance Matrix

Rows = compliance items. Columns = estates.

```
Item                     | The Hudson        | Silverwood      | Northgate
CSOS 2025                | ✅ Submitted      | ✅ Submitted    | ⚠️ Due 15 Jan
Insurance Cert           | ✅ Valid Mar 2026  | ✅ Valid        | 🔴 EXPIRED
10-Year Plan             | ✅ Updated 2024   | ⚠️ Last: 2021   | ⚠️ Last: 2020
Audited Financials 2024  | ✅ Complete       | ⏳ In progress  | ✅ Complete
POPIA Review             | ✅ Nov 2025       | ✅ Oct 2025     | ⚠️ Overdue
```

Cell colours: ✅ green, ⚠️ amber, 🔴 red, ⏳ grey.

"Export Compliance Report" button (secondary) → PDF of full matrix with dates.

Click any amber/red cell → compliance detail slide-over:
```
Insurance Certificate — Northgate Villas
Status: EXPIRED (expired 1 Dec 2025)
Action required: Upload renewed certificate
[Upload Document →]
```

---

### Screen C5 — Managers

**Route:** `/managers`

#### Manager Directory Table

```
Name             | Estate             | Phone        | Last Login    | Status | Actions
Amara Khumalo    | The Hudson         | 082 111 2233 | 14 mins ago   | Active | View · Message
Lebo Sithole     | Silverwood Estate  | 073 222 3344 | 2 hrs ago     | Active | View · Message
David Ferreira   | Northgate Villas   | 084 333 4455 | 3 days ago    | Active | View · Message
```

"Add Manager" button (primary red) → invite by email modal.

Manager detail slide-over:
- Name, estate, contact, last login, account created
- Recent activity log (last 10 actions with timestamps)
- "Reassign to different estate" button
- "Message Manager" button

---

### Corporate Dashboard — Auth Flow

1. Bryson (super_admin) creates corporate agent account
2. Corporate agent receives invite email
3. Sets password → profile created with `role = 'corporate_agent'`
4. Bryson assigns estates via `corporate_agent_estates` table
5. Login → redirected to `corporate.estatehq.co.za/portfolio`
6. Sees only estates assigned to them — no cross-portfolio data leakage

---

## 9. NOTIFICATIONS

### Notification Triggers (New — Governance Layer)

| Event | Who gets notified | Channel |
|---|---|---|
| New approval request submitted | All trustees of estate | Push + Email |
| Trustee votes on approval | Estate manager | Push |
| Approval threshold reached (approved/rejected) | Estate manager | Push + Email |
| Trustee requests more info | Estate manager | Push + Email |
| Meeting scheduled | All trustees | Push + Email |
| Document expiring in 30 days | Estate manager + corporate agent | Email |
| Document expired | Estate manager + corporate agent + trustees | Email |
| Estate performance score drops below 70 | Corporate agent | Email |
| Compliance item overdue | Corporate agent | Email |

---

## 10. AI FEATURES

### 10.1 Quote Summariser

**Trigger:** New approval request created with PDF attachments.
**Where:** Edge Function `generate-approval-summary`
**Model:** claude-sonnet-4-20250514

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

Then write one sentence recommendation starting with "Recommendation:"
Be factual, concise, and neutral. Do not invent information not in the documents.
```

**Display:** Shows on approval cards in Trustee Portal and in approval detail slide-over in Management Dashboard.

### 10.2 Maintenance Pattern Detection

**Trigger:** When a new ticket is submitted for a unit or asset.
**Where:** Reports screen — shown as a banner if pattern detected.
**Model:** claude-haiku-4-5-20251001 (lightweight — runs per-ticket)

**Logic:**
- Query last 24 months of tickets for same unit or same description keywords
- If same issue type appears 3+ times: flag it
- Display: amber banner on ticket detail

```
⚠️ Pattern detected: This asset has been repaired 4 times in 18 months.
Total repair spend: R11,200. Replacement cost estimate: R8,000.
Consider replacement over further repairs.
```

---

## 11. OPEN QUESTIONS (Pre-Build Validation)

These must be answered by the estate manager + trustee interviews before building:

- [ ] What is the typical approval threshold at SA estates? (Drives Settings default)
- [ ] Do trustees prefer push notifications or email for approval requests?
- [ ] How many trustees does a typical estate have? (Drives required_votes default)
- [ ] Do trustees have laptops or are they purely mobile?
- [ ] What compliance deadlines cause the most stress for managing agents?
- [ ] Would corporate agents pay per-estate or prefer flat portfolio pricing?

---

*Version 1.0 — Update after validation interviews before handing to development.*
