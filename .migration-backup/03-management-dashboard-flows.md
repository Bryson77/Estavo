# Estavo — Management Web Dashboard Flows
**Surface:** Next.js Web — desktop primary, tablet supported
**Version:** 2.0 | Updated: June 2026
**Auth:** Magic link OR email + password · No 2FA during testing phase

---

## Navigation (Sidebar)

```
🏠  Dashboard
👥  Residents
🚪  Gate & Access
🔧  Maintenance
👮  Staff
📣  Announcements
🚨  Emergencies
🏢  Contractors        ← from Governance PRD
✅  Approvals          ← from Governance PRD
📅  Community & Events
🏋️  Amenities
📊  Reports
💳  Billing            ← Yoco (not Stripe)
⚙️  Settings
```

Estate managers also get access to the **resident app as Unit 00** (or configurable manager unit ID). They use the resident app for on-the-go gate access and community visibility.

---

## Auth

### Login

```
Navigate to app.estavo.co.za/dashboard
    │
    ▼
Email + password   OR   Magic link
    │
    ▼
Role check: estate_manager or trustee or corporate_agent
    ├── estate_manager → /dashboard (this document)
    ├── trustee → /trustees (Trustee Portal)
    └── corporate_agent → corporate.estavo.co.za
```

No 2FA during testing phase. Will be added pre-production.

### First-Time Manager Onboarding

```
Superadmin creates estate → manager invited via email
    │
    ▼
Manager clicks invite link → browser opens app.estavo.co.za
    │
    ▼
Set password (first time)
    │
    ▼
Estate Setup Wizard (see Section: Onboarding)
    │
    ▼
Dashboard
```

---

## Dashboard Home

```
┌──────────────────────────────────────────────────────────┐
│  🏘️ [Estate Name]         Manager: [Name]  Last: now     │
├──────────────────────────────────────────────────────────┤
│  🚨 ACTIVE EMERGENCY — Unit 12 — 2m 14s               → │  ← red banner, only when active
├───────────┬───────────┬───────────┬──────────┬───────────┤
│ 120 UNITS │ 98 RESI   │ 7 TICKETS │ 12 CODES │ 3 STAFF  │
│           │ REGISTERED│  OPEN     │  ACTIVE  │ ON DUTY  │
├──────────────────────────────────────────────────────────┤
│ PENDING APPROVALS                            2 pending → │
│ APR-001 · Pool pump replacement · R14,800 · 1/2 votes    │
│ APR-004 · Conduct rule update   · —       · 0/2 votes    │
├──────────────────────────────────────────────────────────┤
│ GATE ACTIVITY (live)                                      │
│ 09:14 · Main Entry Gate · A8F2 (guest code used)         │
│ 09:01 · Main Entry Gate · [Resident] opened              │  ← no resident name shown in feed
│ 08:52 · Exit Gate · [Resident] exited                    │
├──────────────────────────────────────────────────────────┤
│ RECENT INCIDENTS (last 5)                                 │
│ INC-041 · Suspicious vehicle · Today 14:32 · Open        │
├──────────────────────────────────────────────────────────┤
│ OPEN MAINTENANCE (by status)                              │
│ Submitted: 2  · Under Review: 1 · In Progress: 3         │
│ Assigned: 1   · Resolved today: 2                        │
├──────────────────────────────────────────────────────────┤
│ ANNOUNCEMENTS — last sent 2 days ago     [Compose →]      │
└──────────────────────────────────────────────────────────┘
```

---

## 1. Residents

```
Residents
────────────────────────────────────
Filter: [All] [Registered] [Unregistered] [Flagged]
Search: [name / unit / email]

[Add Resident]   [Import CSV]   [Export]

────────────────────────────────────
Unit | Owner Name | Email | Status | Last Active | Actions
001  | T. Mokoena | t@... | ✅ Active | Today | View · Edit · Deactivate
002  | — (vacant) | —     | ⬜ Unregistered | — | Invite
...
```

**Add Resident:**
```
Unit number (required)
Type: [Owner] [Tenant]
Name (required)
Email (required)
Guest ID number (optional — configurable field, admin decides if required)
    ↑ This is configurable during estate onboarding
[Send Invite]
    │
    ▼
Resident receives magic link email to activate their account
```

**Guest ID field:** Whether guests must provide an ID number when visiting is an **estate-level configurable** set during onboarding. Some estates require it (captured by security at gate), some don't.

**CSV Import columns:** Unit No, Type (owner/tenant), Name, Email, Phone (optional)

**Deactivate Resident:**
```
"Deactivate [Name], Unit [X]? This revokes all access,
cancels active guest codes, and prevents future logins.
Re-invite required to restore access."
[Confirm Deactivate]  [Cancel]
```

---

## 2. Gate & Access

```
Gate & Access
────────────────────────────────────
GATE STATUS
Main Entry Gate   ● Online   [Hold to Open]   [Lock / Unlock]
Exit Gate         ● Online   [Hold to Open]

────────────────────────────────────
ACCESS LOG
[Export CSV]  [Export PDF]
Filter: date range · gate · type (resident/guest/contractor/override)

Timestamp        | Person         | Type      | Gate        | Code
10 Jun 09:14     | Guest Code     | Guest     | Main Entry  | A8F2
10 Jun 09:01     | Unit 012       | Resident  | Main Entry  | —
10 Jun 08:52     | Unit 012       | Resident  | Exit        | —
10 Jun 08:14     | Override       | Override  | Main Entry  | INC-ref

────────────────────────────────────
GUEST CODES (active across estate)
Filter: active · expired · inside · all
Code  | Created by   | Guest Name    | Validity     | Uses  | Status
A8F2  | Unit 136     | John Smith    | 10–14 Jun    | 2/3   | Inside
K4R9  | Unit 136     | Maria Santos  | 10–12 Jun    | 3/3   | Active
```

**Privacy note in logs:** Resident names not shown in manager gate log — unit numbers only. Full name accessible by clicking the row and then requesting detail. This isn't about hiding from managers (they have access), it's about not exposing PII in a scannable table that could be screen-grabbed.

**Override log:** Requires reason code from security staff. Visible here to managers.

---

## 3. Maintenance

```
Maintenance
────────────────────────────────────
[Download Logs]  ← export all maintenance records

Kanban columns:
[Submitted] [Under Review] [Assigned] [In Progress] [Resolved]

Cards show: ticket # · category · unit · priority · age · assignee

Click ticket → detail slide-over:
    ├── Title, description, category, priority
    ├── Submitted by: Unit [X] (name on hover/expand — not in table view)
    ├── Photos attached
    ├── Internal notes (not visible to resident)
    ├── Status history timeline
    ├── Assign to: dropdown of staff
    └── [Mark Resolved] → resident notified automatically

Drag card between columns to update status.
```

**Maintenance Pattern Detection (AI — from PRD):**
If same issue appears 3+ times for same unit or asset in 24 months:
```
⚠️ Pattern detected: This asset has been repaired 4 times in 18 months.
Total repair spend: R11,200. Estimated replacement: R8,000.
Consider replacement over further repairs.
```

**Weekly Tasks (assign to staff):**
```
Tasks tab within Maintenance:
    [+ Add Task]
    Task name, assigned to (staff member), due date, recurrence (once/weekly/monthly)
    Staff see these on their home screen in the Staff app
```

---

## 4. Staff

```
Staff
────────────────────────────────────
[Add Staff]   [Export]

Name            | Role             | Status  | Last Login | Actions
James Dlamini   | Security Guard   | Active  | Today      | View · Edit · Deactivate
Priya Naidoo    | Maintenance      | Active  | Yesterday  | View · Edit · Deactivate
Sipho Khumalo   | Gate Operator    | Inactive| 3 days ago | Reactivate

────────────────────────────────────
Add Staff:
    Name (required)
    Email (required)
    Role: [Security Guard] [Gate Operator] [Maintenance] [Cleaner] [Other]
    [Send Invite]

────────────────────────────────────
Staff detail (click row):
    Profile, contact, role, shift history (if tracking enabled)
    [Send message] → push notification to staff app
    [Change role]
    [Deactivate]
```

---

## 5. Announcements

```
Announcements
────────────────────────────────────
[Compose Announcement]   [Templates]

SCHEDULED (2)
"AGM reminder" → All residents → Mon 16 Jun 09:00

SENT HISTORY
"Pool maintenance Friday" → 2 days ago → 98 residents → 94% opened

────────────────────────────────────
Compose Announcement:
    Title (required)
    Body (text + basic formatting)
    Priority: [Info] [Important] [Urgent]
    Send to: [All residents] [Select units] [Staff only] [All]
    Channels: [In-app push] [Email (Resend)] [Both]
    Schedule: [Send now] [Schedule for date/time]
    [Send / Schedule]
```

**Announcements appear on resident app home** as "Management Updates" card with unread count.

---

## 6. Emergencies

```
Emergencies
────────────────────────────────────
ACTIVE (0)
No active emergencies.

ALL HISTORY
Alert ID | Unit   | Triggered  | Resolved  | Duration | Officer    | Outcome
EMG-041  | Unit 12| 10 Jun 15:04| 15:12    | 8m       | J. Dlamini | No Threat
EMG-039  | Unit 07| 8 Jun 23:31 | 23:38    | 7m       | Priya N.   | False Alarm

[Export PDF report per alert]

────────────────────────────────────
ESTATE EMERGENCY SETTINGS
Security contact number: [number]   [Edit]
Escalation contacts (auto-notified): [list + add]
```

---

## 7. Contractors (from Governance PRD)

```
Contractors
────────────────────────────────────
[Add Contractor]
Filter: [All] [Plumbing] [Electrical] [Pest Control] [Landscaping] [General]
Stats: "4 contractors · 2 trades"

Table:
Name              | Trade      | Phone        | Rating  | Jobs | Status | Actions
SA Plumbing Pro   | Plumbing   | 011 234 5678 | ★4.2 (7)| 7   | Active | View · Edit · Deactivate
PowerFix Electric | Electrical | 072 345 6789 | ★4.8 (3)| 3   | Active | View · Edit · Deactivate

Click row → slide-over:
    Tabs: Overview | Quote History | Jobs
    
    [Request Quote] → creates approval request pre-filled with contractor
```

**Add Contractor form:**
```
Name, Trade category, Phone, Email (optional), Notes (optional)
[Add Contractor]
```

---

## 8. Approvals (from Governance PRD)

```
Approvals
────────────────────────────────────
[New Request]
Stats: "2 pending · 1 approved · 1 rejected"
Filter: [All] [Pending] [Approved] [Rejected] [More Info]

Table:
Ref    | Title                 | Type          | Amount  | Status  | Submitted | Votes
APR-001| Pool pump replacement | QUOTE         | R14,800 | Pending | 2h ago    | 1/2
APR-002| PestAway invoice      | EXPENSE       | R3,200  | Approved| 1 day ago | 2/2

Click row → slide-over with full detail:
    Type, amount, description, AI summary, attachments
    Trustee vote statuses
    Timeline
    [Cancel request] if still pending
    [Resubmit] if more info was requested
```

**New Request form:**
```
Type: [Quote] [Expense] [Policy Change] [Vendor Onboard]
Title, Description, Amount (optional for policy/vendor)
Attach quotes: PDF, max 3, 10MB each
Votes required: number (default 2 — configurable in settings)
[Submit] → trustees notified + AI summary generated if PDFs attached
```

**Approval threshold setting:** Expenses above R[X] require trustee approval. Configured in Settings → Escalation Thresholds.

---

## 9. Community & Events

```
Community & Events
────────────────────────────────────
[Community board]  [Events]  [Amenities]

COMMUNITY BOARD (moderation view):
    All posts visible (including who posted anonymously)
    [Delete post]   [Flag]

EVENTS:
    [Create Event]
    List: title, date, location, RSVP count, [Edit] [Cancel]

AMENITIES:
    [Add Amenity] — name, available time slots, booking rules, max concurrent bookings
    List of configured amenities with booking calendar
    See all resident bookings, [Cancel booking] if needed
```

---

## 10. Reports

```
Reports
────────────────────────────────────
GATE ACTIVITY REPORT
Date range picker → [Download PDF] [Download CSV]
Entries/exits by gate, by day, peak hours

MAINTENANCE REPORT
Volume by category, avg resolution time, open vs closed
[Download PDF] [Download CSV]

INCIDENT REPORT
Type frequency, responding officer, SAPS referrals
[Download PDF] [Download CSV]

RESIDENT ADOPTION REPORT
Registered vs total units, last activity per resident
[Download PDF] [Download CSV]

EMERGENCY REPORT
All alerts, duration, resolution, responding officers
[Download PDF] [Download CSV]

FINANCIAL REPORT (levy / billing summary)
[Download PDF] [Download CSV]
```

---

## 11. Billing (Yoco)

```
Billing
────────────────────────────────────
Current plan: [Plan Name] — R[X]/month
Status: ✅ Active
Next billing: 1 Jul 2026

INVOICES
Date       | Amount  | Status | Actions
1 Jun 2026 | R8,500  | ✅ Paid | Download PDF
1 May 2026 | R8,500  | ✅ Paid | Download PDF

[Manage payment method] → Yoco payment portal
[Change plan] → contact superadmin
```

Payment processing via **Yoco** (not Stripe). Yoco handles ZAR payments natively.

---

## 12. Settings

```
Settings
────────────────────────────────────
ESTATE PROFILE
Estate name, address, Google Maps link, contact number
Province, number of units

GATES
List: name, type, hardware IP/identifier, [Test connection]
[Add gate]   [Remove gate]

CONFIGURABLE DEFAULTS (set here, apply estate-wide)
    Gate hold duration: [1.5] seconds
    Gate undo window: [5] seconds
    Emergency hold duration: [5] seconds
    Emergency undo window: [5] seconds
    Guest code length: [4] characters
    Max active guest codes per resident: [10]
    Guest code max validity: [30] days
    Require guest ID number: [Yes/No]

ESCALATION THRESHOLDS (Governance)
    Approval threshold: R [5,000] — expenses above this need trustee sign-off
    Votes required for approval: [2] trustees
    Quote minimum: [3] quotes before submitting quote request
    Emergency auto-notify trustees: [On/Off]
    Unassigned ticket warning after: [12] hours

NOTIFICATIONS
    Escalation contact emails (emergency, incidents)
    Billing notification email

INTEGRATIONS
    Twilio (WhatsApp): status · test · credentials via Cloudflare Worker
    Resend (email): status · test · DKIM status
    Yoco: billing integration status

MANAGER ACCOUNTS
    Add manager / trustee
    Active manager sessions
    [Invite new manager] by email

DANGER ZONE
    Deactivate estate (requires superadmin confirmation)
```

---

## Manager Unit Access (Resident App)

When a manager logs into the **resident app** with their manager email:

- Identified as Unit 00 (or configurable manager unit ID set during onboarding)
- Header shows: "Manager · [Estate Name]"
- Can open any gate — logged as "Manager — [Name]" in gate logs
- Can view and post in Community (never anonymous — identity always shown)
- Can view Management Updates
- Can generate guest codes for estate use
- Cannot see other residents' individual data (reports, guest history, etc.)

---

_v2.0 — No 2FA for testing, Yoco not Stripe, Governance PRD fully integrated (contractors, approvals, trustee portal routes, corporate portal), configurable defaults centralised in Settings, download logs on all report screens._
