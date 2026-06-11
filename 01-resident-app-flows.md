# EstateHQ — Resident App Flows
**Surface:** React Native (Expo) · iOS + Android
**Version:** 2.0 | Updated: June 2026
**Source:** Confirmed from Figma screenshots + review session

---

## Navigation Structure

Bottom tab bar — 4 tabs:
```
🏠 Home    👥 Community    📋 Reports    🔑 Guests
```

Emergency is NOT a tab. It lives as a persistent card on the Home screen and opens a dedicated full-screen page.

---

## 1. ONBOARDING & AUTH

### 1.1 Login Flow

```
App Launch
    │
    ▼
Welcome Screen
    │ "Enter your email to get started"
    ▼
Email Input Screen
    ├── Email field
    ├── [Send Magic Link] — primary button
    │   OR
    └── [Login with password] — secondary (email + password flow)
    │
    ▼ (magic link chosen)
"Check your inbox"
    ├── Resend link (60s cooldown)
    └── [Open email app] shortcut
    │
    ▼ [User taps link → deep link opens app]
    │
    ▼
VALIDATION: Check email against estates table
    ├── Email found → proceed to Home
    └── Email NOT found → "Your email isn't registered on any estate. Contact your estate office."
```

**Key change from v1:** No unit number or ID number verification at login. System checks only that the email exists in the `residents` table. Unit and ID fields are managed by the admin on the backend — the resident doesn't re-enter them.

**Stay logged in:** Session persists until the user explicitly signs out. Refresh tokens are long-lived. No forced re-auth unless the session is revoked by admin.

---

### 1.2 First-Time Post-Login

```
First login detected
    │
    ▼
Push Notification Permission
    "EstateHQ needs to send you gate codes and emergency alerts."
    [Allow] / [Not Now]
    │
    ▼
Biometric Lock Setup (Optional)
    [Enable Face ID / Fingerprint] / [Skip]
    │
    ▼
Home Screen
```

No identity re-verification step for the resident. Their profile is pre-populated from admin import.

---

## 2. HOME SCREEN

```
┌─────────────────────────────────────────┐
│ TM   RESIDENT · THANDI M.          ⚙️   │
│      Hillcrest Estate                   │
│ Unit 136 · Hillcrest Estate             │
├──────────────────┬──────────────────────┤
│ ACTIVE CODES  🔑 │ GUESTS INSIDE  👤    │
│      3            │       1              │
├──────────────────┼──────────────────────┤
│ WEATHER       ☀️  │ OPEN TICKETS   🔧   │
│ 24° Partly cloudy │       2              │
└──────────────────┴──────────────────────┘

┌─────────────────────────────────────────┐
│ MAIN GATE                          🚪   │
│ All gates online                        │
│ ● Online                                │
│ ┌───────────────────────────────────┐   │
│ │  Hold to open                   → │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📬  MANAGEMENT UPDATES          3 🔵 →  │
│     3 unread notices                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ EMERGENCY              Hold 5s  🚨      │
│ Hold 5 seconds to alert security        │
└─────────────────────────────────────────┘
```

**Cards:**
- **Active Codes** → taps to Guests tab
- **Guests Inside** → taps to Guests tab filtered to "Inside"
- **Weather** → display only, pulled from weather API
- **Open Tickets** → taps to Reports tab

**Management Updates (Announcements):**
- Published by admin/manager only
- Shows unread count badge
- Tap → opens Announcements list (not a separate tab — inline slide-up or page)
- No "recent activity" feed on home — removed

**Emergency Card:**
- Persistent, always visible, below gate card
- Red background card: "EMERGENCY — Hold 5 seconds to alert security"
- Tap anywhere on the card → opens Emergency screen (see Section 6)

**Gate Card:**
- Shows "All gates online" or degraded status
- "Hold to open" tap → opens Gate Selection screen (see Section 3)
- If only one gate configured, skips selection and goes directly to hold screen

---

## 3. GATE ACCESS

### 3.1 Gate Selection Screen

```
Open Gate
────────────────────────────────────
Choose a gate, then hold to open.
5-second undo window after opening.

┌──────────────────────────────────────┐
│ 🚪  Main Entry Gate    Hold to open →│
│      ● Online                        │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ 🚪  Exit Gate          Hold to open →│
│      ● Online                        │
└──────────────────────────────────────┘
```

Hold timing is **configurable per estate** (set during estate onboarding). Default: 1.5 seconds.

### 3.2 Hold-to-Open Interaction

```
User holds "Hold to open →" row
    │
    │ Hold progress fills (duration = estate config, default 1.5s)
    │ Haptic feedback on hold start and completion
    │ RELEASE EARLY → cancelled, no command sent
    │
    ▼
SUCCESS Screen:

         ✅ (green circle)

    Main Entry Gate opening
    Logged with your identity

    [Undo (5s)] ← countdown button

    After 5s: button disappears, screen auto-dismisses
```

**Undo window is configurable** (set during estate onboarding). Default: 5 seconds.

If undo is tapped → cancellation command sent to Pi → gate close attempted (if it hasn't fully opened yet, or signal sent to Pi to re-close).

**Failure state:**
```
    ⚠️

Main Entry Gate unavailable.
Use the intercom or contact security.

[Dismiss]
```

---

## 4. COMMUNITY TAB

### 4.1 Layout

```
Community
──────────────────────────────────────
[📅 Book an amenity  Clubhouse · Tennis · Padel · Braai]
    ↑ Horizontal scrollable banner, taps to expand amenity booking

[Security]          [Events]
    ↑ Toggle — two sub-views
```

### 4.2 Security Sub-view (default)

Community board for security-related posts only.

```
NEW POST
┌──────────────────────────────────────┐
│ Share an update with your neighbours │
└──────────────────────────────────────┘
Post as: [Anonymous] [Thandi M. · Unit 136]
"Your identity is visible to estate management only."
[Post]

────────────────────────────────────────
Anonymous                          2h ago
Anyone else hear a car alarm near North
gate around midnight?
💬 4   👁 38

────────────────────────────────────────
Anonymous                       Yesterday
Reminder: pool gate latch has been loose.
Reported to maintenance.
💬 2   👁 71
```

**Post visibility:** Management can always see who posted, even if anonymous. Other residents only see "Anonymous" label.

**Moderation:** Manager can delete posts from the dashboard.

### 4.3 Events Sub-view

```
Community Braai
📅 Sat 30 May · 16:00  📍 Clubhouse lawn
24 attending                      [RSVP]

AGM Meeting
📅 Wed 5 Jun · 19:00  📍 Clubhouse hall
41 attending                      [RSVP]

Kids' Movie Night
📅 Fri 14 Jun · 18:30  📍 Pool deck
12 attending                      [RSVP]
```

RSVP tap → toggles attendance. RSVP count updates. Manager sees attendee list from dashboard.

### 4.4 Amenity Booking

Tapping the amenity banner expands to:

```
[Book an amenity  Clubhouse · Tennis · Padel · Braai]
    ↓ expands

Clubhouse       Sat · 14:00–18:00        [Book]
Tennis court    Sun · 08:00–10:00        [Book]
Padel court     Wed · 17:00–18:00        [Book]
Braai area      Fri · 18:00–22:00        [Book]

"Amenities available are configured by your estate."
```

Amenities, time slots, and booking rules are **configured during estate onboarding** by manager.

Book tap → shows slot calendar picker → confirm → booking logged → push confirmation.

---

## 5. REPORTS TAB (Maintenance)

```
Reports
────────────────────────────────────
  1          1          2
OPEN      IN PROGRESS  RESOLVED

[All] [Open] [In Progress] [Resolved]

────────────────────────────────────
#1024                    [In Progress]
Leaking tap in main bathroom
Priority · Medium

#1019                    [Open]
Gate motor making noise
Priority · High

────────────────────────────────────
TRUSTED CONTRACTORS              ✓ Verified
Vetted by estate management

[TM] Thabo Mokoena ✓   [RV]
     PipeFix Plumbing
     🔧 Plumbing ★ 4.9
     142 jobs · ~30 min
     [📞 Call]  [💬 WhatsApp]    ←→

────────────────────────────────────
CLOSED & ARCHIVED · 2              ▼

                                [+]  ← FAB to create new report
```

**Trusted Contractors section:** Horizontally scrollable. Populated by estate management. Residents can call or WhatsApp directly. This is read-only for residents — management controls the list.

**New Report flow (tap [+]):**
```
Category: [Electrical] [Plumbing] [Structural] [Common Area] [Security] [Other]
Description: text area (required)
Photos: optional, max 3 (camera or library)
Priority: [Routine] [Urgent]
[Submit]
    │
    ▼
"Report #1025 submitted. Management will review within 24 hours."
```

Push notification sent at each status change.

---

## 6. EMERGENCY FLOW

### 6.1 Access Points

1. **Home screen Emergency card** — tap anywhere on the red card
2. No other access point — not a tab, not a FAB

### 6.2 Emergency Screen

```
┌─────────────────────────────────────┐
│ ← ESTATEHQ         Emergency    ⚙️  │
│                                     │
│                                     │
│  Hold the button for 5 seconds to   │
│  alert all security on duty.        │
│                                     │
│              ╭─────╮                │
│              │  🚨  │ ← large red   │
│              │      │   circle      │
│              ╰─────╯                │
│               Hold                  │
│                                     │
└─────────────────────────────────────┘
```

**Hold duration:** Configurable per estate during onboarding. Default: 5 seconds (as shown in screenshots).

**Hold interaction:**
- User presses and holds the red circle
- Progress ring fills clockwise (red)
- Haptic pulse every 0.5 seconds while holding
- Release before complete → cancelled, ring resets, no alert sent
- Complete hold → alert fires immediately

### 6.3 Post-Alert Screen

```
┌─────────────────────────────────────┐
│         🚨 ALERT SENT               │
│                                     │
│  Security has been notified.        │
│  [Estate Name] · Unit 136           │
│  15:04:23                           │
│                                     │
│  [Undo (5s)] ← countdown button     │
│                                     │
│  [📞 Call Security]                 │
│  ← always visible, immediate        │
└─────────────────────────────────────┘
```

**Undo window:** Configurable. Default: 5 seconds (same as gate undo). After window closes, undo button disappears — security must dismiss from their side.

**"Call Security" button:** Always present, taps to initiate phone call to the estate's security number (set during onboarding by admin).

### 6.4 What Fires on Alert

```
Emergency Alert Triggered
    │
    ├── Push notification → all security app users on duty (estate)
    ├── Push notification → estate manager
    ├── WhatsApp (Twilio) → primary security contact number
    ├── Log created: resident profile ID, unit, timestamp
    └── Alert appears in real-time on Management Dashboard
```

**POPIA note:** Alert payload includes unit number but not resident's name or personal details beyond what security needs to respond. No GPS coordinates.

### 6.5 Cancel Alert (within undo window)

```
Tap [Undo]
    │
    ▼
Cancellation sent to security immediately
Security app shows: "Alert cancelled by resident."
Log updated: cancelled, timestamp
```

No reason required for cancellation within the undo window. After undo window closes → only security can mark resolved.

**Only security type:** Alert goes to security only. No fire service, no medical — removed. If resident needs those, they call directly. EstateHQ security alert = on-site security only.

---

## 7. GUESTS TAB

```
Guests
────────────────────────────────────
Active codes    3          Inside now  1
of 10 max

[+ Generate new guest code]

[All] [Active] [Inside] [Expired]

────────────────────────────────────
John Smith                      [Inside] 📋
#A8F2 · 2/3 uses

Maria Santos                    [Active] 📋
#K4R9 · 3/3 uses

Plumber - PipeFix               [Active] 📋
#P1L7 · 1/3 uses

Sarah Chen                     [Expired] 📋
#D6Q3 · 0/3 uses

────────────────────────────────────
┌──────────────────────────────────┐
│  ▓▒░ (QR icon)                  │
│  Each code is scannable at gate  │ ← info note only, NO QR functionality
└──────────────────────────────────┘
```

**Active codes appear first, expired/inactive below.**

**Code format:** 4-character alphanumeric (e.g. #A8F2) — configurable length during onboarding. Default: 4 chars.

**Max active codes per resident:** Configurable during onboarding. Default: 10.

**QR note:** Displayed as informational copy only. No QR code generation or display in app. QR functionality removed.

---

### 7.1 Guest Code Detail (tap on any guest row)

```
John Smith                          [Inside]
Code: A8F2
Uses: 2 of 3
Valid: 10 Jun – 14 Jun 2026
Gate: Main Entry Gate

ENTRY/EXIT LOG
────────────────────────────────────
Entry   10 Jun  08:14    Main Entry Gate
Exit    10 Jun  11:32    Exit Gate
Time inside: 3h 18m

Entry   11 Jun  09:01    Main Entry Gate
  Currently inside
────────────────────────────────────

[Copy Code]   [Deactivate]    ← only if code is Active
              ↑ not shown if Expired
```

**Entry/Exit log:** Shows all gate events for this guest code — entry time, exit time, gate used, time spent inside. This is read from the gate log filtered by code ID.

**Deactivate flow:**
```
"Deactivate access for John Smith?"
"This will immediately invalidate code A8F2.
John will not be able to enter the estate."
[Confirm Deactivate]   [Cancel]
    │
    ▼
Code invalidated immediately → logged
Row moves to Expired section
```

---

### 7.2 Generate New Guest Code

```
Tap [+ Generate new guest code]
    │
    ▼
Guest Details Form
────────────────────────────────────
Guest name:         [text input, required]
Phone (optional):   [number input]
Valid from:         [date/time picker]
Valid until:        [date/time picker]
Number of uses:     [number — default 1, or unlimited toggle]
Gate:               [dropdown if multiple gates]

[Generate Code]
    │
    ▼
Code Created Screen
────────────────────────────────────
    Code: A8F2

    John Smith
    Valid: 10 Jun 08:00 – 14 Jun 23:59
    Uses: 3 remaining
    Gate: Main Entry Gate

    [Copy Code]
        ↑ copies full WhatsApp-format message (see below)

Dismiss → code appears in Guests list
```

**Copy Code button output (same as what Twilio sends via WhatsApp):**
```
Hi [Guest Name],

You've been invited to [Estate Name] by [Resident Name], Unit [Unit No].

Your entry code is: A8F2

Valid: 10 Jun 2026, 08:00 – 14 Jun 2026, 23:59
Gate: Main Entry Gate
Uses: 3 remaining

📍 Estate location: [Google Maps link — set during onboarding]

Show this code to security on arrival or present it at the entry point.

– EstateHQ
```

**Estate Google Maps link** is configured by superadmin during estate onboarding. Same link used in both the copy button and the Twilio WhatsApp message.

---

## 8. SETTINGS

```
Settings
────────────────────────────────────
PROFILE
Name (read-only)
Email (read-only)
Unit (read-only — changes require admin)
Phone (editable)

SECURITY
Biometric lock [toggle]
Active sessions → [view + revoke]
Change password (if password auth enabled)

NOTIFICATIONS
Management updates (announcements)
Gate activity (my gates)
Guest code used
Maintenance updates
Emergency alerts from estate (cannot disable)

LEGAL
Privacy Policy →
Terms of Service →

DATA & ACCOUNT
Request Data Export →
Delete My Data →
    │
    ▼ (Danger Zone — styled like GitHub danger zone)

────────────── DANGER ZONE ──────────────
⚠️ Delete account and all associated data

This action is irreversible. Your account,
guest codes, maintenance history, and gate
logs associated with your identity will be
scheduled for deletion within 30 days.

[Request Account Deletion]
    │
    ▼
Warning screen:
"Are you sure? This cannot be undone."
List of what will be deleted.
Type "DELETE" to confirm.
[Confirm Deletion Request]
    │
    ▼
"Deletion request submitted. You will
receive a confirmation email. Access
continues for 7 days, then your account
will be deactivated."
```

---

## 9. ESTATE MANAGER — RESIDENT APP ACCESS

Estate managers get access to the resident app as **Unit 00** (or a configurable manager unit identifier set during onboarding).

**Manager-specific abilities in resident app:**
- Open any gate (same as resident, but their identity shows as "Manager — [Name]" in logs)
- View and post to Community board (identity always shown, never anonymous)
- View Management Updates (can also publish from dashboard)
- Generate guest codes (for estate/contractor use)
- Cannot see other residents' data, reports, or guest codes — same privacy rules apply

**Manager unit shown as:** "Manager · [Estate Name]" in the header (not a unit number like residents).

This is not a separate app — just the same resident app with an elevated profile type that unlocks the above.

---

## Configurables Summary (set during estate onboarding)

| Setting | Default | Where set |
|---|---|---|
| Gate hold duration | 1.5 seconds | Onboarding → Gate Config |
| Gate undo window | 5 seconds | Onboarding → Gate Config |
| Emergency hold duration | 5 seconds | Onboarding → Emergency Config |
| Emergency undo window | 5 seconds | Onboarding → Emergency Config |
| Guest code length | 4 characters | Onboarding → Access Config |
| Max active guest codes per resident | 10 | Onboarding → Access Config |
| Guest code max validity period | 30 days | Onboarding → Access Config |
| Amenities available | None | Onboarding → Amenities |
| Estate Google Maps link | Required | Onboarding → Estate Profile |
| Security contact number | Required | Onboarding → Emergency Config |
| Trusted contractor list | Empty | Populated by manager post-onboarding |

---

_v2.0 — Reflects confirmed screenshots and review session. QR removed. Recent activity removed. Emergency hold = 5s. Auth = email check only._
