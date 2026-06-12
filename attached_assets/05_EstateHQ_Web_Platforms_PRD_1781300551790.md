# EstateHQ — Web Platforms PRD
**Version:** 1.0 | **June 2026**
**Scope:** Management Dashboard · Trustee Portal · Corporate Dashboard · Superadmin Portal · Marketing Landing Page

---

## 1. Overview

This PRD covers all five web surfaces of EstateHQ. Each surface has a distinct URL, role, and design intent. They share a single design system, a Supabase backend (two projects), and are deployed on Cloudflare Pages.

| Surface | URL | Role | Stack |
|---|---|---|---|
| Management Dashboard | `app.estatehq.co.za/dashboard` | Estate Manager | Next.js |
| Trustee Portal | `app.estatehq.co.za/trustees` | Trustee | Next.js |
| Corporate Dashboard | `corporate.estatehq.co.za` | Corporate Agent | Next.js |
| Superadmin Portal | `admin.estatehq.co.za` | Superadmin | Next.js |
| Marketing Site | `estatehq.co.za` | Public | Next.js |

All five live in the Turborepo monorepo under `apps/`. The Management Dashboard and Trustee Portal share the same Next.js app (`apps/manager`) — middleware routes by role. Corporate Dashboard and Superadmin Portal are separate apps.

---

## 2. Shared Design System

### 2.1 Colour Tokens

| Token | Hex | Usage |
|---|---|---|
| `--brand-red` | `#C0392B` | Primary CTA, active sidebar rail, destructive badges |
| `--brand-red-dark` | `#922B21` | Button hover, pressed states |
| `--forest-dark` | `#2D4A3E` | Sidebar background, `VENDOR ONBOARD` badges |
| `--sage` | `#5C7A6E` | Secondary accent, charts, avatar tints |
| `--cream` | `#FAF7F2` | Page background |
| `--paper` | `#F8F3EC` | Card backgrounds |
| `--sidebar-bg` | `#1A1F1E` | Fixed sidebar |
| `--muted` | `#8B929E` | Secondary text, labels |
| `--border` | `#E5E0D8` | Card and table borders |
| Success | `#1A7A4A` | Paid, resolved, valid states |
| Warning | `#E8A020` | Pending, overdue <30d, amber badges |
| Destructive | `#C0392B` | Errors, expired, rejected |

### 2.2 Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Display / Page titles | Fraunces | 500 | 22–32px |
| Section headers | Inter | 600 | 16–18px |
| Body / UI | Inter | 400–500 | 14–15px |
| Eyebrow labels | JetBrains Mono | 500 | 10–11px, UPPERCASE, tracking 0.14em |
| Data / IDs / Amounts | JetBrains Mono | 500 | 12–14px |
| Captions | Inter | 400 | 12px |

### 2.3 Component Primitives

| Component | Description |
|---|---|
| `Card` | White bg, 1px `--border`, 10px radius, 20px padding |
| `Btn` variants | primary (red), secondary (outline), soft-red (tinted), ghost |
| `Badge` | Inline pill — success / amber / destructive / muted / sage / forest |
| `StatusBadge` | Keyword-driven — Active/Resolved → success, Pending → amber, Rejected → destructive |
| `Tbl` / `Td` | Table primitives with hover row highlight |
| `Drawer` | 400px right slide-over with overlay, close on backdrop click |
| `Modal` | Centred overlay, max 560px, close on Escape |
| `Kv` | Key-value row for detail views |
| `Logged` | `✓ Logged` microconfirmation (JetBrains Mono 11px, muted) |
| `Pager` | Pagination controls |
| `Skeleton` | Block placeholder (no spinners) |
| `Toast` | Bottom-right notification, 4s auto-dismiss |

### 2.4 Global Chrome (Dashboard surfaces)

**Sidebar (fixed left, 240px, `--sidebar-bg`):**
- EstateHQ wordmark
- Estate / context eyebrow (JetBrains Mono UPPERCASE)
- Navigation items — active state: 3px red left rail + tinted bg
- Footer: avatar (initials, sage tint) · name · role · logout icon

**TopBar (64px, white):**
- Page title (Fraunces 22px)
- Context tag pill (sage)
- Role badge (JetBrains Mono)
- Bell icon with unread badge
- Search input
- User avatar

**Footer (every page):**
`UI prototype with mock data — [Estate Name].` or production equivalent.

### 2.5 Content Rules

- All amounts: ZAR, JetBrains Mono (`R14,800` not `R14800` or `R 14 800`)
- All times: 24-hour (`14:32`)
- All dates: `D Mon YYYY` (`13 Jan 2026`)
- SA English spelling throughout
- Every write action: `✓ Logged` microconfirmation
- Destructive actions: require confirmation modal with typed confirmation
- No spinners — skeleton loaders only

---

## 3. Management Dashboard

**URL:** `app.estatehq.co.za/dashboard`
**Access:** `role = 'manager'`
**Persona:** Amara Khumalo, Estate Manager, The Hudson Lifestyle Estate

### 3.1 Sidebar Navigation

```
EstateHQ wordmark
THE HUDSON  ← estate eyebrow

📊  Dashboard          ← default
👥  Residents
🔒  Staff
🔧  Reports (Tickets)
⚠️  Alerts
🚪  Gate Logs
💬  Community
✅  Tasks
🏊  Amenities
📋  Contractors
📝  Approvals          ← badge: pending count
💰  Billing
⚙️  Settings
```

---

### 3.2 Dashboard (default landing)

**Route:** `/dashboard`

#### KPI Strip (5 cards, clickable deep-links)
| Metric | Value | Deep Link |
|---|---|---|
| Open Reports | 5 (2 escalated) | `/dashboard/reports` |
| Resolved This Week | 3 | `/dashboard/reports` |
| Active Guest Codes | 5 (1 parcel) | `/dashboard/gate-logs` |
| Emergency Alerts | 1 | `/dashboard/alerts` |
| Staff On Shift | 3 | `/dashboard/staff` |

#### Left Column
- **Pending Approvals widget** — shows 2 most urgent pending approvals with ref, title, amount, vote progress. "X pending →" links to `/dashboard/approvals`. Empty state: "NO PENDING APPROVALS."
- **Reports by Status donut** — Open 5 / In Progress 2 / Resolved 3 / Closed 1. Colour-coded. Legend below.
- **Management Updates card** — last 2 broadcasts, `+ New Broadcast` button.

#### Right Column
- **Gate Activity — Last 7 Days** dual-bar chart (entries `--forest-dark`, exits `--sage`). Days on X axis.
- **Live Activity feed** — 8 timestamped events (gate entries, ticket updates, guest codes, alerts) with emoji glyphs.
- **On Shift Now card** — staff avatars, colour-coded red (security) / sage (maintenance), shift duration in JetBrains Mono.

---

### 3.3 Residents

**Route:** `/dashboard/residents`

**Header:**
- Title: "Residents" (Fraunces)
- Summary: "185 total · 184 active · 1 suspended" (JetBrains Mono, muted)
- Right: `Import CSV/XLSX` (secondary) · `Add Resident` (primary red)

**Filter bar:** Search input + pills `All / Active / Suspended`

**Table columns:** Unit · Name · Email · Phone · Status · Last Login · Actions (Edit · Suspend/Reactivate · Message)

**Row click → Resident Drawer (400px right):**

Drawer header: avatar (initials), full name, unit, "Send Message" + "Send Email" buttons.

Drawer tabs:
- **Overview** — unit details, occupancy type (owner/tenant), household members, contact info, account created date
- **Gate Logs** — last 20 gate entries/exits for this unit (time, direction, method)
- **Guest Codes** — active and expired codes issued by this resident
- **Reports** — maintenance tickets submitted by this unit
- **Vehicle** — registered vehicles (plate, make, colour)

**Add Resident modal:**
```
Unit number:     [text input]
Full name:       [text input]
Email:           [text input]
Phone:           [text input]
Occupancy type:  [Owner / Tenant toggle]
[Send Invite]    → "✓ Invite sent. Logged."
```

---

### 3.4 Staff

**Route:** `/dashboard/staff`

**Header:**
- Title: "Staff" (Fraunces)
- Summary: "5 total · 3 on shift · 2 off shift"
- Right: `Add Staff Member` (primary red)

**Filter pills:** `All / Security / Maintenance / On Shift / Off Shift`

**Table columns:** Name · Role (red/amber badge) · Status (dot + label) · Shift Start · Duration · Last Seen · Actions

**Row click → Staff Drawer:**
- Overview: contact, role, shift history, date joined
- Performance: tickets processed, avg response time, incidents flagged

---

### 3.5 Reports (Tickets)

**Route:** `/dashboard/reports`

**Header:**
- Title: "Reports" (Fraunces)
- Summary: "5 open · 2 in progress · 3 resolved"
- Right: `Export CSV` (secondary)

**Filter chips:** Status (Open / In Progress / Resolved / Closed) · Priority (High / Medium / Low) · Category

**Table columns:** Ref · Unit · Title · Category · Priority · Status · Age · Assignee · Actions

**Row click → Ticket Drawer:**
- Header: ticket ref, title, status badge
- Details: unit, category, priority, submitted by, submitted at
- Description + photo (if attached)
- Timeline: status change history with timestamps and actor
- Comments thread (manager ↔ resident)
- Actions: Assign · Reassign · Escalate · Change Status · Close

**Escalation banner:** amber, appears on unassigned tickets older than threshold (configured in Settings). "This ticket has been unassigned for 14 hours. [Assign now →]"

---

### 3.6 Alerts

**Route:** `/dashboard/alerts`

**Table columns:** ID · Unit · Resident · Type · When · Status · Responded By

Emergency events table — ID format `#E4821`. Type: Emergency Alert / Security Incident / False Alarm.

Status badges: Active (destructive) / Acknowledged (amber) / Resolved (success) / False Alarm (muted).

Row click → Alert Drawer:
- Full detail: time, unit, resident name, description
- Response log: which guard acknowledged, when, notes
- Action buttons: Acknowledge · Resolve · Mark False Alarm

---

### 3.7 Gate Logs

**Route:** `/dashboard/gate-logs`

**Two tabs: Entry Log | Guest Codes**

**Entry Log tab:**

Table columns: Time · Gate · Unit · Name · Role (Resident/Guest/Security) · Method (OTP/DL Scan/Manual/Permanent) · Direction (Entry/Exit)

Filter: date range picker · gate selector · method filter.

**Guest Codes tab:**

Table columns: Code · Unit · Resident · Guest Name · Type (Standard/Parcel) · Created · Expiry · Uses · Status

Active codes: highlighted row. Expired: muted.

Action: Revoke (for active codes) → confirmation modal → `✓ Code revoked. Logged.`

---

### 3.8 Community

**Route:** `/dashboard/community`

**Two tabs: Posts | Events**

**Posts tab:**
- Manager sees real author + unit even on anonymous posts (resident-facing label is "Anonymous")
- Table: Time · Author · Unit · Body preview · Visible (Yes/No) · Actions (Hide · Flag · Reply)
- Hidden posts: muted row, "HIDDEN" badge

**Events tab:**
- Event cards: title, date, time, location, RSVP count, status
- Actions: Edit · Cancel · Duplicate
- `+ Create Event` button (primary red) → modal with: title, date, time, location, description, max capacity

---

### 3.9 Tasks

**Route:** `/dashboard/tasks`

**Header:**
- Title: "Tasks" (Fraunces)
- Right: `+ New Task` (primary red)

**Filter pills:** `All / Active / Completed / Overdue`

**Table columns:** Ref · Title · Assignee · Due Date · Priority · Status · Repetition · Actions

Repetition badge: None / Daily / Weekly / Monthly (JetBrains Mono UPPERCASE).

Row click → Task Drawer: full details, checklist steps, mark complete.

---

### 3.10 Amenities

**Route:** `/dashboard/amenities`

**Two sections: Amenity Configuration | Current Bookings**

**Amenity Configuration:**
Card per amenity — name, operating hours, max capacity, slot length, status (Active/Inactive). Edit button per card. `+ Add Amenity` button.

**Current Bookings table:**
Columns: Amenity · Unit · Resident · Slot · Status · Actions (Approve/Reject/Cancel)

---

### 3.11 Contractors

**Route:** `/dashboard/contractors`

**Header:**
- Title: "Contractors" (Fraunces)
- Summary: "4 contractors · 2 trades"
- Right: `Add Contractor` (primary red)

**Filter pills:** `All · Plumbing · Electrical · Pest Control · Landscaping · General`

**Table columns:** Name · Trade · Phone · Rating · Jobs Done · Status · Actions

Rating: star row (visual) + numeric value (JetBrains Mono).

**Row click → Contractor Drawer (3 tabs):**

**Overview tab:** date added, status, contact, notes, `Request Quote →` button → `✓ Quote request submitted. Logged.`

**Quote History tab:** table of approval requests linked to this contractor (Ref · Description · Amount · Date · Status)

**Jobs tab:** tickets where this contractor was assigned (Ref · Title · Date · Status)

**Add Contractor modal:**
```
Contractor name:  [required]
Trade category:   [Plumbing / Electrical / Pest Control / Landscaping / General / Other]
Phone:            [required]
Email:            [optional]
Notes:            [textarea, optional]
[Add Contractor]  → "✓ Contractor added. Logged."
```

---

### 3.12 Approval Requests

**Route:** `/dashboard/approvals`

**Header:**
- Title: "Approval Requests" (Fraunces)
- Summary: "2 pending · 1 approved · 1 rejected" (JetBrains Mono, muted)
- Right: `New Request` (primary red)

**Filter pills:** `All · Pending · Approved · Rejected · More Info`

**Table columns:** Ref · Title · Type · Amount · Status · Submitted · Votes · Actions

Type badges (JetBrains Mono UPPERCASE):
- `QUOTE` — sage
- `EXPENSE` — amber
- `VENDOR ONBOARD` — forest-dark, white text
- `POLICY CHANGE` — destructive red

Vote progress: "1/3" with inline mini progress dots.

**Row click → Approval Drawer:**
```
[REF]                              [STATUS badge]
[Title]

Type:         [badge]
Amount:       R XX,XXX  ← JetBrains Mono
Submitted by: [name]
              [date + time]
Votes:        X of X required

AI SUMMARY  ← eyebrow
[summary paragraph]
Recommendation: [sentence]

ATTACHMENTS
[📄 filename.pdf] × n

TRUSTEE VOTES  ← eyebrow
[Name]    ✅/❌/⏳  [comment if voted]
...

TIMELINE  ← eyebrow
✅ [time]  [event]
...
```

**New Request modal:**
```
Request type:   [Quote / Expense / Policy Change / Vendor Onboard]
Title:          [required]
Description:    [textarea]
Amount (R):     [shown for Quote / Expense only]
Attach files:   [PDF upload, max 3, 10MB each]
Votes required: [number, default 2]

[Submit for Approval]
→ "✓ Submitted. Trustees notified."
```

---

### 3.13 Billing

**Route:** `/dashboard/billing`

**Header:** "Billing" (Fraunces)

**Two sections: Levy Overview | Transaction History**

**Levy Overview:**
- Current month summary card: total charged / total collected / outstanding / collection rate %
- Arrears table: Unit · Resident · Balance · Days Overdue · Last Payment · Actions (Send Reminder · View Statement)
- Arrears filter: `> 30 days / > 60 days / > 90 days`
- `Run Levy Cycle` button (primary red) → confirmation modal ("This will post monthly levy charges to all 184 units. Confirm?") → `✓ Levy cycle complete. 184 charges posted. Logged.`
- `Export Arrears CSV` (secondary)

**Transaction History table:**
Columns: Date · Unit · Type (Charge/Payment/Credit/Penalty) · Amount · Description · Posted By

Type badges: Charge (muted) / Payment (success) / Credit (sage) / Penalty (destructive).

Per-unit statement: click unit → Statement Drawer showing all transactions for that unit, running balance, `Generate PDF Statement` button → `✓ Statement generated. Logged.`

> **v1 note:** No payment gateway. Payments recorded manually by manager after EFT confirmation.

---

### 3.14 Settings

**Route:** `/dashboard/settings`

Multi-section layout. Each section is a `Card` with a header and save button.

**Sections:**

**Estate Profile**
- Estate name, address, unit count, contact email, phone
- [Save Changes] → `✓ Saved. Logged.`

**Notification Templates**
- Levy reminder template (editable body text)
- Overdue notice template
- Welcome message template
- [Save Templates] → `✓ Saved.`

**Escalation Thresholds**
- Approval threshold (R): expenses above this require trustee approval (default R5,000)
- Votes required for approval (default 2)
- Quote minimum: quotes required before submitting (default 3)
- Emergency auto-notify trustees: ON/OFF toggle
- Unassigned ticket warning: hours before escalation banner (default 12)
- [Save] → `✓ Saved.`

**Feature Toggles**
- Community board: ON/OFF
- Amenity bookings: ON/OFF
- Trusted contractors directory (resident-visible): ON/OFF
- Anonymous posts: ON/OFF

**Integrations**
- Twilio: Account SID, Auth Token, From Number (masked), [Test SMS] → `✓ Test sent.`
- Resend: API Key (masked), From Email, [Test Email] → `✓ Test sent.`

**POPIA / Data Privacy (Red Zone)**
- Section header in destructive red: "Destructive actions — these cannot be undone."
- Export all estate data (ZIP) → typed confirmation modal
- Delete all gate logs older than 12 months → typed confirmation
- Delete estate (full data wipe) → typed confirmation: type estate name

---

### 3.15 Management Dashboard — Screen Flow

```
Dashboard
  ├── KPI cards → deep link to matching screen
  ├── Pending Approvals widget → /approvals
  ├── Live Activity feed (read-only)
  └── On Shift Now (read-only)

Residents → table → row → Drawer (Overview | Gate Logs | Guest Codes | Reports | Vehicle)
                        → Add Resident modal

Staff → table → row → Drawer
              → Add Staff modal

Reports → table → row → Drawer (details | timeline | comments | actions)
        → filter chips

Alerts → table → row → Drawer (acknowledge | resolve | false alarm)

Gate Logs
  ├── Entry Log tab (filterable table)
  └── Guest Codes tab → [Revoke] → confirmation

Community
  ├── Posts tab (moderation table)
  └── Events tab → [+ Create Event] modal

Tasks → table → row → Drawer → checklist

Amenities
  ├── Config cards → [Edit] per amenity
  └── Bookings table → [Approve / Reject / Cancel]

Contractors → table → row → Drawer (Overview | Quote History | Jobs)
           → [Add Contractor] modal

Approvals → table → row → Drawer (AI summary | votes | timeline)
          → [New Request] modal
          → [Cancel] confirmation
          → [Resubmit] → ✓ Logged

Billing
  ├── Levy Overview → [Run Levy Cycle] confirmation → ✓ Logged
  ├── Arrears table → [Send Reminder] | [View Statement] → Statement Drawer
  └── Transaction History → unit click → Statement Drawer

Settings → section cards → [Save] → ✓ Logged
```

---

## 4. Trustee Portal

**URL:** `app.estatehq.co.za/trustees`
**Access:** `role = 'trustee'`
**Persona:** John Mokoena, Trustee, The Hudson Lifestyle Estate

Same global chrome as Management Dashboard. Role badge: `TRUSTEE` (amber tint — distinguishes from manager's red).

### 4.1 Sidebar Navigation

```
EstateHQ wordmark
THE HUDSON  ← estate eyebrow

📥  Approvals        ← default, badge: pending count
📊  Estate Overview
📅  Meetings
📄  Documents
⚙️  Settings
```

---

### 4.2 Approvals (default landing)

**Route:** `/trustees/approvals`

Stacked approval cards (not a table — cards are the primary UI pattern). Filter pills: `All · Pending · Approved · Rejected`

**Card structure (per approval):**
- Type badge (JetBrains Mono UPPERCASE, colour-coded) + Status pill (right)
- Title, submitted by, time ago, amount
- `AI SUMMARY` eyebrow + summary paragraph + recommendation sentence
- `ATTACHMENTS` — PDF chips
- `VOTES` eyebrow — per-trustee vote status row
- Three action buttons: `Approve` · `Reject` · `Request More Info`
- Post-vote state: buttons replaced by `Vote recorded` pill + `✓ Vote recorded. Logged HH:MM` microconfirmation

**"Request More Info" flow:**
Inline textarea appears: "What information do you need?" → `Submit` → card status → `MORE INFO` + `✓ Logged`

**Empty state:**
```
NO PENDING APPROVALS
All approval requests have been actioned.
```

---

### 4.3 Estate Overview

**Route:** `/trustees/overview`

Read-only. Single column, max 680px.

**Estate Snapshot card:**
4-up stat grid (JetBrains Mono values): Open Tickets · Unresolved Alerts · Staff on Shift · Levy Collection Rate

POPIA footnote: "Levy collection shown as estate aggregate only. Individual resident financials are not accessible to trustees."

**Upcoming Meetings card:**
Next 2 meetings with date, time, location, agenda item count. `[View →]` links to `/trustees/meetings`.

**Quick Links card:**
Pending Approvals count `[Review →]` · Last Broadcast date · Documents Expiring count `[View →]`

---

### 4.4 Meetings

**Route:** `/trustees/meetings`

**Two tabs: Upcoming | Past**

**Upcoming tab:**
Meeting cards — title, type badge (AGM/Trustee/Special), date, time, location, RSVP count, agenda item count. `[View Agenda →]` opens Agenda slide-over.

**Agenda slide-over (400px right):**
- Meeting details (title, date, time, location)
- Numbered agenda items list
- `[+ Propose agenda item]` → inline input → `✓ Item added. Logged.`
- Minutes section: shows minutes text or `[Download Minutes PDF]` once uploaded

**Past tab — Resolution Log:**
Table: Resolution # · Description · Meeting Date · Votes · Result

Result badges: `PASSED` (success) · `REJECTED` (destructive) · `DEFERRED` (amber). JetBrains Mono UPPERCASE.

---

### 4.5 Documents

**Route:** `/trustees/documents`

Header subline: "All documents are encrypted and access-logged." (12px muted)

2-column card grid. Each card:
- Document title
- Validity/date metadata
- Expiry badge (Valid / Expires soon / Expires in X days / EXPIRED)
- `[Download PDF]` ghost button → `✓ Download started`

Trustees can download only. No upload button.

**Expiry badge logic:**
- > 60 days: `✅ Valid` (success)
- 30–60 days: `⚠️ Expires in X days` (amber)
- < 30 days: `🔴 Expires in X days` (destructive)
- Expired: `EXPIRED` (destructive, JetBrains Mono)

---

### 4.6 Trustee Portal — Screen Flow

```
Approvals (default)
  ├── filter pills → card set filters
  ├── [Approve] / [Reject] → card dims + ✓ Logged
  └── [Request More Info] → inline textarea → Submit → card status changes

Estate Overview
  ├── [View →] meetings link → /meetings
  ├── [Review →] approvals link → /approvals
  └── [View →] documents link → /documents

Meetings
  ├── Upcoming: [View Agenda →] → slide-over
  │     └── [+ Propose item] → ✓ Logged
  └── Past: resolution table (read-only)

Documents → [Download PDF] → ✓ Download started (all read-only)
```

---

## 5. Corporate Dashboard

**URL:** `corporate.estatehq.co.za`
**Access:** `role = 'corporate_agent'`
**Persona:** Refilwe Dlamini, Corporate Agent, 3-estate portfolio

### 5.1 Sidebar Navigation

```
EstateHQ wordmark
PORTFOLIO VIEW  ← context eyebrow

🏘️  Portfolio    ← default
📊  Analytics
💰  Financials
✅  Compliance
👥  Managers
⚙️  Settings
```

Role badge: `CORPORATE AGENT` (JetBrains Mono, forest-dark tint)

---

### 5.2 Portfolio (default landing)

**Route:** `/portfolio`

**Header:** "Portfolio" · "3 estates · 2 healthy · 1 needs attention"

**Filter pills:** `All · Needs Attention · Healthy · Suspended`

**2-column estate card grid:**

Each card:
- Estate name + `ACTIVE` status pill
- Location, unit count
- Manager name + last active timestamp
- Stats row: open tickets · unassigned · alerts this month · monthly fee + payment status
- Performance score bar (0–100, `--sage` fill, JetBrains Mono score)
- `[View Estate →]` button

**Card border states:**
- Needs Attention: `2px solid --brand-red` + `NEEDS ATTENTION` destructive badge
- Amber: `1px solid --warning` (pending approvals / compliance due soon)
- Default (healthy): `1px solid --border`

**"View Estate →":** opens scoped read-only view of that estate's Management Dashboard (corporate agent cannot trigger gate actions, cannot see individual resident personal data, cannot change settings).

---

### 5.3 Analytics

**Route:** `/analytics`

**Estate Performance Table:**
Columns: Estate · Open Tickets · Avg Resolution · Alerts · Levy Rate · Score

Score cell badges: ≥80 success · 60–79 amber · <60 destructive.

**Three charts below table (inline SVG — no external library):**

1. **Monthly Ticket Volume** — line chart, 6 months, one line per estate. Legend with estate name + colour.
2. **Avg Resolution Time** — grouped bar chart, estates side by side.
3. **Levy Collection Rate** — horizontal bar per estate. Bars below 80% in amber.

`Download Report PDF` (secondary top-right) → `✓ Logged`

---

### 5.4 Financials

**Route:** `/financials`

**Summary card (full width, 4-up grid):**
Total MRR · Paid This Month · Outstanding (red) · Avg Levy Collection

**Billing Status Table:**
Columns: Estate · Monthly Fee · Levy Collection · Status · Next Invoice · Actions

Overdue row: amber background. `OVERDUE` badge: destructive, JetBrains Mono.

Action: `[Invoice]` (view PDF mock) · `[Send Reminder]` → `✓ Reminder sent to [Manager]. Logged.`

**Row click → Invoice History slide-over:**
Table of past invoices: Month · Amount · Status · Due Date · Actions (Send Reminder / Download PDF)

---

### 5.5 Compliance

**Route:** `/compliance`

**Compliance Matrix:**
Rows = compliance items. Columns = each estate.

Items: CSOS Submission · Insurance Certificate · 10-Year Maintenance Plan · Audited Financials · POPIA Compliance Review

Cell states:
- ✅ — `bg-success/10`
- ⚠️ — `bg-amber/10`
- 🔴 — `bg-destructive/10`
- ⏳ — `bg-muted/30`

Click amber/red cell → **Compliance Detail slide-over:**
- Item name · Estate name · Status (badge) · Expiry/due date · Days overdue
- "Action required: [description]"
- `[Upload Document →]` (primary red) → `✓ Logged`

`Export Compliance Report` (secondary) → `✓ Logged`

---

### 5.6 Managers

**Route:** `/managers`

**Header:** "Managers" · "3 managers · all active" · `Add Manager` (primary red)

**Table columns:** Name · Estate · Phone · Last Login · Status · Actions (View · Message)

Last login > 48 hours: amber text (flag).

**Manager Detail slide-over:**
- Contact info, estate, last login, account created
- Recent activity log (last 10 actions with timestamps)
- `[Reassign Estate]` → confirmation modal → `✓ Logged`
- `[Message Manager]` → `✓ Message sent. Logged.`

**Add Manager modal:**
```
Email address:  [required]
Estate:         [dropdown — assigned estates]
Full name:      [required]
Phone:          [optional]
[Send Invite]   → "✓ Invite sent. Logged."
```

---

### 5.7 Corporate Dashboard — Screen Flow

```
Portfolio (default)
  ├── filter pills → card grid filters
  └── [View Estate →] → scoped estate view (read-only)

Analytics
  ├── performance table (read-only, drill by row)
  └── [Download Report PDF] → ✓ Logged

Financials
  ├── summary card (read-only)
  ├── billing table → row → Invoice History slide-over
  │     ├── [Send Reminder] → ✓ Logged
  │     └── [Download PDF] → ✓ Logged
  └── [Invoice] → ✓ Logged

Compliance
  ├── matrix → amber/red cell → Compliance Detail slide-over
  │     └── [Upload Document] → ✓ Logged
  └── [Export Compliance Report] → ✓ Logged

Managers
  ├── table → [View] → slide-over
  │     ├── [Reassign Estate] → confirmation → ✓ Logged
  │     └── [Message Manager] → ✓ Logged
  └── [Add Manager] → modal → ✓ Logged
```

---

## 6. Superadmin Portal

**URL:** `admin.estatehq.co.za`
**Access:** `role = 'superadmin'` (Bryson + core team only)
**Design system:** Same as Corporate Dashboard. Role badge: `SUPERADMIN` (JetBrains Mono, destructive red tint).

### 6.1 Sidebar Navigation

```
EstateHQ wordmark
SUPERADMIN  ← context eyebrow

🏠  Estates         ← default
👤  Accounts
📊  Platform Stats
🔧  Support Access
⚙️  Settings
```

---

### 6.2 Estates

**Route:** `/admin/estates`

**Header:** "Estates" · "[N] total · [N] active · [N] pilot · [N] suspended" · `Provision New Estate` (primary red)

**Table columns:** Name · Location · Units · Manager · Tier · Status · Created · MRR · Actions

Status badges: Active (success) · Pilot (amber) · Suspended (destructive) · Churned (muted).

Tier badges: Starter · Growth · Estate · Enterprise (all JetBrains Mono).

**Row click → Estate Detail slide-over:**
- Estate profile (name, address, unit count)
- Manager contact + last login
- Subscription: tier, billing date, MRR, status
- Feature flags (toggle per estate)
- Actions:
  - `[Suspend Estate]` → typed confirmation → `✓ Logged`
  - `[Reactivate]` → `✓ Logged`
  - `[Change Tier]` → dropdown modal → `✓ Logged`
  - `[Export Estate Data]` → `✓ Logged`

**Provision New Estate modal:**
```
Estate name:      [required]
Address:          [required]
Unit count:       [required]
Subscription tier:[dropdown — Starter / Growth / Estate / Enterprise]
Manager email:    [required — invite sent on provision]
Pilot (free tier):[toggle]
[Provision Estate] → "✓ Estate provisioned. Manager invite sent. Logged."
```

---

### 6.3 Accounts

**Route:** `/admin/accounts`

**Four tabs: Managers | Trustees | Corporate Agents | Security Staff**

Each tab is a filterable table with the same columns: Name · Estate · Email · Role · Status · Last Login · Actions (View · Suspend · Reset Password)

`[Suspend]` → confirmation modal → `✓ Account suspended. Logged.`
`[Reset Password]` → `✓ Password reset email sent. Logged.`

---

### 6.4 Platform Stats

**Route:** `/admin/stats`

**KPI strip:** Total Estates · Active MAU · MRR · Feature Adoption (Levy module %) · Avg Reports/Estate/Month

**Charts:**
- MRR over time (line chart, last 12 months)
- Estate growth (bar chart, new estates per month)
- Feature adoption matrix (heatmap-style table: feature × estate, % active)

All read-only. `Export Data CSV` (secondary).

---

### 6.5 Support Access

**Route:** `/admin/support`

Allows read-only impersonation of any manager account for support purposes.

**Table:** Estate · Manager · Last Login · Open Tickets · Actions (`[View as Manager →]`)

`[View as Manager →]` → opens Management Dashboard in read-only impersonation mode:
- Yellow banner across top: "SUPERADMIN VIEW — Read only. No actions will be taken. [Exit →]"
- All write buttons disabled
- Activity is not logged against the manager's account

**Audit log** (bottom of page): all support access events (who accessed, which estate, when, duration).

---

### 6.6 Settings

**Route:** `/admin/settings`

- Platform-wide feature flags
- Default subscription tier settings
- Onboarding email templates
- POPIA / Data retention defaults

---

### 6.7 Superadmin — Screen Flow

```
Estates (default)
  ├── table → row → Estate Detail slide-over
  │     ├── [Suspend] → typed confirmation → ✓ Logged
  │     ├── [Reactivate] → ✓ Logged
  │     ├── [Change Tier] → modal → ✓ Logged
  │     └── [Export Estate Data] → ✓ Logged
  └── [Provision New Estate] → modal → ✓ Logged

Accounts
  ├── 4 tabs (Managers | Trustees | Corporate Agents | Security)
  ├── [Suspend] → confirmation → ✓ Logged
  └── [Reset Password] → ✓ Logged

Platform Stats → charts + KPIs (read-only) → [Export CSV]

Support Access
  ├── [View as Manager →] → impersonation mode (yellow banner, read-only)
  └── Audit log (read-only)

Settings → section cards → [Save] → ✓ Logged
```

---

## 7. Marketing Landing Page

**URL:** `estatehq.co.za`
**Access:** Public
**Purpose:** Inbound leads → "Book a Demo" CTA

### 7.1 Page Sections

#### Hero
- Dark background (`#0F1117`)
- Headline (Fraunces 56px): "One Platform. Everything Your Estate Runs On."
- Sub-copy (Inter 18px, muted): "Stop managing your estate across twelve WhatsApp groups. EstateHQ gives residents, security staff, and managers one place to do everything."
- CTAs: `Book a Demo` (primary red, large) · `See How It Works` (ghost, white)
- Background: subtle grid pattern or abstract gate/estate graphic

#### Problem Section
- Headline: "Your estate runs on WhatsApp. It shouldn't."
- 3-column problem cards: Visitor Access / Levy Management / Maintenance — each showing the "before" pain (WhatsApp, spreadsheets, paper logbooks) vs EstateHQ solution

#### Product Overview
- 4-tab switcher: Resident · Security · Manager · Trustee
- Each tab shows a device mockup of the relevant interface
- Brief 2-line description per role

#### Feature Highlights
- 6 feature cards (2-column grid):
  1. Guest OTP Access — "Pre-authorise visitors in seconds. They get a code, security scans it."
  2. Levy Management — "Track payments, post charges, run statements. No spreadsheets."
  3. Maintenance Requests — "Residents log issues. You manage them. Everyone sees progress."
  4. Gate Control — "Open gates remotely. Every entry logged automatically."
  5. Trustee Approvals — "Submit quotes for approval. Trustees vote from their phone."
  6. Estate Intelligence — "Performance scores, compliance tracking, portfolio oversight."

#### Pricing
- Headline: "Simple pricing. No surprises."
- 3-column pricing table (Starter / Growth / Estate)
- ZAR pricing, annual billing note
- All tiers include: feature comparison rows
- `Book a Demo` CTA below each tier
- "Enterprise? Let's talk." link

| Tier | Price | Units |
|---|---|---|
| Starter | R1,200/month | Up to 50 units |
| Growth | R2,800/month | 51–150 units |
| Estate | R5,500/month | 151–350 units |

#### Trust Section
- "Built for South Africa" — flag + body copy about SA-specific design (POPIA, ZAR, local phone numbers, SA DL scanning)
- "Your data stays in South Africa" — infrastructure note
- "POPIA compliant" — brief description

#### CTA Section
- Dark background
- Headline: "Ready to replace the WhatsApp group?"
- `Book a Demo` (primary red, large)
- "No contract. Cancel anytime." (small muted)

#### Footer
- Logo + tagline
- Links: Features · Pricing · About · Contact · Privacy Policy · Terms
- "© 2026 EstateHQ. Built in South Africa."

### 7.2 "Book a Demo" Flow

CTA click → `/demo-request` or modal:
```
Book a Demo

Estate name:   [text input]
Your name:     [text input]
Email:         [text input]
Phone:         [text input]
Unit count:    [dropdown — <50 / 50–150 / 150–350 / 350+]
How did you hear about us? [dropdown]

[Book Demo]  → success state:
  "Thanks, [name]. We'll be in touch within 24 hours.
   We'll email you a confirmation shortly."
```

On submit → Resend email to Bryson with lead details.

---

## 8. Auth Flows (All Web Surfaces)

### 8.1 Login (all roles)

`app.estatehq.co.za/login` and `corporate.estatehq.co.za/login` and `admin.estatehq.co.za/login`

```
EstateHQ wordmark
──────────────────────────
Email:     [input]
Password:  [input, show/hide toggle]

[Sign in]

Forgot password? →
```

Post-login redirect by role:
- `manager` → `/dashboard`
- `trustee` → `/trustees/approvals`
- `corporate_agent` → `/portfolio`
- `superadmin` → `/admin/estates`

### 8.2 Magic Link (Residents — app only, not web)

Residents use the mobile app with magic link auth. No web login for residents.

### 8.3 TOTP 2FA (managers, trustees, corporate agents, superadmin)

After password entry → TOTP screen:
```
Two-factor authentication
Enter the 6-digit code from your authenticator app.

[_ _ _ _ _ _]  ← 6 individual inputs, auto-advance

[Verify]
Lost access to your authenticator? [Contact support →]
```

### 8.4 Invite Flow (for new accounts)

Email invite link → `/accept-invite?token=xxx`:
```
You've been invited to EstateHQ
[Role] for [Estate Name]

Set your password:
New password:     [input]
Confirm password: [input]

[Set password & sign in]
```

On submit → account activated → redirect to role-appropriate landing screen.

### 8.5 Password Reset

```
Reset your password
Enter your email and we'll send you a reset link.

Email: [input]
[Send reset link]

Success: "Check your email. If this address is registered, 
          you'll receive a link within 5 minutes."
```

---

## 9. Role-Based Middleware Rules

| Route prefix | Allowed roles | Redirect if unauthorised |
|---|---|---|
| `/dashboard/*` | manager, superadmin | `/login` |
| `/trustees/*` | trustee, superadmin | `/login` |
| `/portfolio/*` (corporate) | corporate_agent, superadmin | `/login` |
| `/admin/*` | superadmin | `/login` |
| `estatehq.co.za/*` | public | — |

Middleware implemented in Next.js `middleware.ts` — reads Supabase session, checks `profiles.role`, redirects accordingly.

---

## 10. Responsive Behaviour

All web dashboards are designed for **laptop/desktop first** (min 1280px). Tablet support (768px+) via sidebar collapse to icon-only mode. Mobile is not a priority for web dashboards — residents and security use the native mobile apps.

Marketing site is fully responsive (mobile-first).

| Breakpoint | Dashboard behaviour |
|---|---|
| ≥ 1280px | Full 240px sidebar + content |
| 1024–1279px | 240px sidebar + content (compressed) |
| 768–1023px | Sidebar collapses to 64px icons only |
| < 768px | Dashboard not supported — redirect to mobile app |

---

## 11. Error States

| Scenario | UI Treatment |
|---|---|
| No estates assigned | Full-page empty state: "No estates yet. Contact your administrator." |
| Session expired | Toast + redirect to login |
| Network error | Toast: "Connection issue. Changes may not have saved. Try again." |
| Unauthorised action | Toast: "You don't have permission to do that." |
| Form validation | Inline red message below field, border turns destructive |
| Empty table | Centred empty state with icon + description + action CTA |

---

## 12. Explicitly Out of Scope (v1 Web)

- Payment gateway / in-app payments (to be scoped separately)
- Contractor portal (Phase 2)
- White-labelling (Phase 3)
- Real-time CCTV or audio streams
- Internationalisation beyond SA English
- Resident web portal (residents use mobile app only)

---

*This is the locked Web Platforms PRD for EstateHQ v1. Changes require explicit decision and version increment.*
