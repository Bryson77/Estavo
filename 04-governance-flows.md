# EstateHQ — Trustee Portal & Corporate Dashboard Flows
**Surfaces:** Next.js Web
**Version:** 1.0 | Source: Governance PRD v1.0 | June 2026

---

## TRUSTEE PORTAL

**URL:** `app.estatehq.co.za/trustees`
**Access:** `role = 'trustee'` only — middleware enforced

**Design principle:** Trustees are not ops people. This is a decision inbox, not an operations dashboard. Mobile-first — most trustees check on their phone.

### Auth Flow

```
Manager invites trustee from Management Dashboard Settings
    │
    ▼
Trustee receives email invite → clicks link
    │
    ▼
Set password → profile created (role = 'trustee', estate_id = estate)
    │
    ▼
Login → redirected to /trustees/approvals (default)
```

No 2FA during testing phase. Role-based middleware prevents access to any route outside /trustees.

---

### Navigation

```
📥 Approvals    (default — badge shows pending count)
📊 Estate Overview
📅 Meetings
📄 Documents
⚙️ Settings
```

---

### T1. Approvals (Default Screen)

```
Approvals
────────────────────────────────────
[All] [Pending] [Approved] [Rejected]

Pending count badge on nav icon.

────────────────────────────────────
APPROVAL CARD:

[QUOTE]                            Pending ●
Pool pump replacement
Submitted by Amara Khumalo · 2h ago · R14,800

AI Summary:
"3 quotes obtained. Cheapest: AquaFix at R14,800.
Existing pump repaired twice in 18 months at combined
cost of R9,200. Replacement is cost-effective long-term."

Attachments: [AquaFix_Quote.pdf] [PlumbPro_Quote.pdf]

Votes: [John ✅] [You ⏳] [David ⏳]
Requires 2 of 3 trustee votes.

[Approve]    [Reject]    [Request More Info]

After action: "✓ Vote recorded. Logged 15:04"
────────────────────────────────────
```

**Type badge colours:**
- QUOTE — sage
- EXPENSE — amber
- POLICY CHANGE — red-light
- VENDOR ONBOARD — dark, white text

**After voting:**
- Card dims, status updates
- If threshold met → card updates to ✅ Approved or ❌ Rejected
- Toast: "Vote recorded. Trustees notified."

**Request More Info:**
```
Inline textarea: "What information do you need?"
[Submit] → manager notified + card status → "MORE INFO REQUESTED"
```

---

### T2. Estate Overview

Read-only governance snapshot. No operational data.

```
[Estate Name]
────────────────────────────────────
Open maintenance tickets:     5   (2 high priority)
Unresolved emergency alerts:  0
Staff on shift:               3
Levy collection rate:         94%   ← aggregate % only, no names

Next trustee meeting:  Mon 13 Jan · 18:00   [View →]
Upcoming AGM:          Thu 19 Feb · 18:00   [View →]

Last announcement sent: 2 days ago
Pending approvals:      2   [View →]
```

**POPIA:** Levy collection as percentage only. No individual resident names or amounts shown here.

---

### T3. Meetings

**Two tabs: Upcoming | Past**

**Upcoming:**
```
AGM 2026
Thu 19 Feb 2026 · 18:00–20:00 · Clubhouse
67 RSVPs confirmed
[View Agenda →]

Trustee Meeting — January
Mon 13 Jan · 18:00 · Boardroom
Agenda: 3 items
[View Agenda →]
```

**Agenda slide-over:**
```
Meeting title, date, time, location
Agenda items (numbered)
[Add agenda item] ← trustees can propose
Minutes section: shows text or PDF download once uploaded
[Download Minutes PDF]
```

**Past — Resolution log:**
```
Ref     | Description                  | Date      | Votes | Result
RES-001 | Approved AquaFix pool pump   | 13 Jan    | 3/3   | ✅ Passed
RES-002 | Levy increase 8% for 2026    | 19 Feb    | 2/3   | ✅ Passed
RES-003 | Rejected new security vendor | 5 Mar     | 1/3   | ❌ Rejected
```

---

### T4. Documents

```
Documents
"All documents are encrypted and access-logged."
────────────────────────────────────
Grid (2 columns desktop, 1 mobile):

Insurance Certificate
Valid until: Mar 2026  🔴 ← red if < 30 days / expired
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

**Expiry states:**
- > 60 days: green "Valid"
- 30–60 days: amber "Expires soon"
- < 30 days: red "Expires in X days"
- Expired: red "EXPIRED"

Trustees: download only. Upload is manager/corporate only.

---

### T5. Trustee Settings

```
Settings
────────────────────────────────────
PROFILE
Name, email (read-only), estate (read-only)
Phone (editable)

NOTIFICATIONS
New approval requests: [On] (cannot disable — core function)
Approval threshold reached: [On]
Meeting scheduled: [On]
Document expiring: [On]

LEGAL
Privacy Policy →
Terms of Service →

SIGN OUT
```

---

---

## CORPORATE DASHBOARD

**URL:** `corporate.estatehq.co.za`
**Access:** `role = 'corporate_agent'` only
**Design principle:** Portfolio health at a glance. Every screen answers "is something wrong and where?"

### Auth Flow

```
Superadmin (Bryson) creates corporate agent account
    │
    ▼
Corporate agent receives invite email
    │
    ▼
Set password → role = 'corporate_agent' + assigned estates
    │
    ▼
Login → corporate.estatehq.co.za/portfolio (default)
```

Assigned estates set by superadmin via `corporate_agent_estates` table. Agent sees only their assigned estates.

---

### Navigation

```
🏘️ Portfolio    (default)
📊 Analytics
💰 Financials
✅ Compliance
👥 Managers
⚙️ Settings
```

---

### C1. Portfolio Overview

```
Portfolio
────────────────────────────────────
"3 estates · 2 healthy · 1 needs attention"
Filter: [All] [Needs Attention] [Healthy] [Suspended]

────────────────────────────────────
ESTATE CARD:

The Hudson Lifestyle Estate              [ACTIVE ●]
Midrand, Gauteng · 184 units
Manager: Amara Khumalo · Last active 14 mins ago
──────────────────────────────────────────────────
🔴 Open tickets: 5   ⚠️ Unassigned: 2
🚨 Alerts this month: 1
💳 R12,500 · ✅ Paid
Performance score: 87/100

[View Estate →]
────────────────────────────────────
```

**Card border states:**
- 🔴 Red border + "NEEDS ATTENTION": overdue payment / unresolved emergency / 5+ unassigned tickets / expired compliance
- 🟡 Amber border: pending approvals / compliance due < 30 days
- 🟢 Green border (default): all clear

**[View Estate →]** opens scoped read-only management dashboard for that estate. Corporate agent can see all data except individual resident PII. Cannot trigger gate actions or modify settings.

---

### C2. Analytics

```
Analytics
────────────────────────────────────
Estate Performance Table:

Estate           | Open | Avg Resolution | Alerts | Levy Rate | Score
The Hudson       |  5   | 2.3 days       |   1    |   94%     | 87 ✅
Silverwood       |  2   | 1.1 days       |   0    |   96%     | 96 ✅
Northgate Villas | 11   | 5.4 days       |   3    |   71%     | 61 ⚠️

Score: 80–100 green · 60–79 amber · below 60 red

Click row → scoped estate view

────────────────────────────────────
Charts:
- Monthly ticket volume (line, one line per estate, last 6 months)
- Avg resolution time (bar chart, estates side by side)
- Levy collection rate (horizontal bar per estate)

[Download Report PDF]
```

**Performance score formula (computed nightly via Edge Function):**
- Base: 100
- −20 per unresolved emergency alert
- −5 per unassigned ticket over 24hrs
- +20 if avg resolution < 2 days
- −10 if avg resolution > 5 days
- +30 if levy collection > 90%
- −20 if levy collection < 70%

---

### C3. Financials

```
Financials
────────────────────────────────────
SUMMARY
Total portfolio revenue:  R30,000/month
Paid this month:          R20,500
Outstanding:              R9,500
Avg levy collection:      84%

────────────────────────────────────
Billing Status Table:

Estate           | Monthly Fee | Levy Collection | Status     | Next Invoice
The Hudson       | R12,500     | 94%             | ✅ Paid    | 1 Jul
Silverwood       | R8,000      | 88%             | ✅ Paid    | 1 Jul
Northgate Villas | R9,500      | 71%             | ⚠️ Overdue | 15 Dec ← red

Click row → invoice history slide-over:
    Northgate Villas — Invoice History
    Dec 2025 | R9,500 | ⚠️ OVERDUE | Due 15 Dec | [Send Reminder]
    Nov 2025 | R9,500 | ✅ Paid    | 1 Nov 2025 | [Download PDF]
```

---

### C4. Compliance

```
Compliance
────────────────────────────────────
Matrix: rows = compliance items · columns = estates

Item                    | The Hudson       | Silverwood     | Northgate
CSOS 2025               | ✅ Submitted     | ✅ Submitted   | ⚠️ Due 15 Jan
Insurance Certificate   | ✅ Valid Mar 2026 | ✅ Valid       | 🔴 EXPIRED
10-Year Plan            | ✅ Updated 2024  | ⚠️ Last: 2021  | ⚠️ Last: 2020
Audited Financials 2024 | ✅ Complete      | ⏳ In progress  | ✅ Complete
POPIA Review            | ✅ Nov 2025      | ✅ Oct 2025    | ⚠️ Overdue

[Export Compliance Report PDF]

Click amber/red cell → slide-over:
    Insurance Certificate — Northgate Villas
    Status: EXPIRED (expired 1 Dec 2025)
    [Upload Document →] ← routes to that estate's document vault
```

---

### C5. Managers

```
Managers
────────────────────────────────────
[Add Manager]  ← invite by email

Name            | Estate            | Phone        | Last Login | Status | Actions
Amara Khumalo   | The Hudson        | 082 111 2233 | 14 mins    | Active | View · Message
Lebo Sithole    | Silverwood        | 073 222 3344 | 2 hrs      | Active | View · Message
David Ferreira  | Northgate Villas  | 084 333 4455 | 3 days     | Active | View · Message

Click row → slide-over:
    Name, estate, contact, last login, account created
    Recent activity log (last 10 actions + timestamps)
    [Reassign to different estate]
    [Message Manager] → push notification to their app
```

---

### C6. Corporate Settings

```
Settings
────────────────────────────────────
PROFILE
Name, email, company name

ASSIGNED ESTATES (read-only — set by superadmin)
The Hudson · Silverwood · Northgate Villas

NOTIFICATIONS
Estate performance score drops below 70: [On]
Compliance item overdue: [On]
Document expiring < 30 days: [On]

SIGN OUT
```

---

## AI Features (Governance Layer)

### Quote Summariser
**Trigger:** New approval request with PDF attachments.
**Model:** claude-sonnet-4-20250514
**Output:** 80-word summary + one-sentence recommendation → shown on approval cards in Trustee Portal and Management Dashboard.

**Prompt structure:**
```
You are reviewing approval documents for a South African residential estate.
Request type: [type] | Title: [title] | Amount: [amount]

[Document content]

Write one paragraph (max 80 words) covering:
1. What is being requested
2. Key figures and vendors
3. Notable flags or concerns
4. Brief recommendation

Then one sentence: "Recommendation: ..."

Be factual, concise, neutral. Do not invent information not in the documents.
```

### Maintenance Pattern Detection
**Trigger:** New ticket submitted.
**Model:** claude-haiku-4-5-20251001
**Output:** Amber banner if same issue 3+ times in 24 months:
```
⚠️ Pattern detected: This asset has been repaired 4 times in 18 months.
Total repair spend: R11,200. Replacement estimate: R8,000.
Consider replacement over further repairs.
```

---

## Governance Notifications

| Event | Notified | Channel |
|---|---|---|
| New approval submitted | All trustees | Push + Email |
| Trustee votes | Estate manager | Push |
| Approval approved/rejected | Estate manager | Push + Email |
| Trustee requests more info | Estate manager | Push + Email |
| Meeting scheduled | All trustees | Push + Email |
| Document expiring < 30 days | Manager + corporate agent | Email |
| Document expired | Manager + corporate agent + trustees | Email |
| Estate performance score < 70 | Corporate agent | Email |
| Compliance item overdue | Corporate agent | Email |

---

_v1.0 — Trustee Portal + Corporate Dashboard. Source: Governance PRD v1.0. 2FA deferred to post-testing._
