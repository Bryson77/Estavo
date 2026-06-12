# EstateHQ — Resident App UI & Screen Flows
**Surface:** React Native (Expo) · iOS + Android
**Version:** 3.0 | Updated: June 2026
**Audience:** AI builder (Opus), developers, and design implementers

---

## CRITICAL READING: How to Use This Document

This document describes every screen, every interaction, and every navigation route in the EstateHQ Resident App. Each section is written to answer three questions:

1. **What does this screen look like?**
2. **What can the user do here?**
3. **Where does each action take the user next?**

When a button, card, or element is described as "tappable" or "clickable", that means tapping it must trigger a navigation event or action — it is never decorative. Route names are written in `SCREAMING_SNAKE_CASE` for clarity.

---

## PART 1 — NAVIGATION ARCHITECTURE

### 1.1 Bottom Navigation Bar

The app has exactly **4 tabs** in the bottom navigation bar. No more, no fewer.

```
┌──────────┬──────────────┬───────────┬──────────┐
│  🏠 Home │ 👥 Community │ 📋 Reports│ 🔑 Guests│
└──────────┴──────────────┴───────────┴──────────┘
```

| Tab Index | Label | Icon | Route |
|-----------|-------|------|-------|
| 1 | Home | House icon | `HOME_SCREEN` |
| 2 | Community | People icon | `COMMUNITY_SCREEN` |
| 3 | Reports | Clipboard icon | `REPORTS_SCREEN` |
| 4 | Guests | Key icon | `GUESTS_SCREEN` |

**Rule:** The bottom navbar is visible on all 4 tab root screens. It is hidden on any sub-screen or modal that sits on top of a tab (e.g. `GATE_SELECTION_SCREEN`, `CREATE_POST_SCREEN`, `GUEST_CODE_DETAIL_SCREEN`).

---

### 1.2 Screen Inventory

The following screens exist in the app. Screens marked **[TAB ROOT]** are the direct screens rendered when a tab is selected. All other screens are pushed on top of a tab's stack or opened as a full-screen modal.

| Screen Name | Route Constant | How it's Reached |
|---|---|---|
| Welcome | `WELCOME_SCREEN` | App launch, not yet authenticated |
| Email Input | `EMAIL_INPUT_SCREEN` | From `WELCOME_SCREEN` |
| Magic Link Sent | `MAGIC_LINK_SENT_SCREEN` | After magic link is requested |
| Login with Password | `PASSWORD_LOGIN_SCREEN` | From `EMAIL_INPUT_SCREEN` |
| Home | `HOME_SCREEN` | **[TAB ROOT]** Tab 1 |
| Gate Selection | `GATE_SELECTION_SCREEN` | Tapping gate card on `HOME_SCREEN` |
| Gate Hold | `GATE_HOLD_SCREEN` | Selecting a gate on `GATE_SELECTION_SCREEN` |
| Announcements | `ANNOUNCEMENTS_SCREEN` | Tapping management updates banner on `HOME_SCREEN` |
| Emergency | `EMERGENCY_SCREEN` | Tapping emergency card on `HOME_SCREEN` |
| Community | `COMMUNITY_SCREEN` | **[TAB ROOT]** Tab 2 |
| Events | `EVENTS_SCREEN` | Tapping Events card on `COMMUNITY_SCREEN` |
| Event Detail | `EVENT_DETAIL_SCREEN` | Tapping an event on `EVENTS_SCREEN` |
| Create Event | `CREATE_EVENT_SCREEN` | Tapping FAB on `EVENTS_SCREEN` |
| Create Post | `CREATE_POST_SCREEN` | Tapping FAB on `COMMUNITY_SCREEN` |
| Reports | `REPORTS_SCREEN` | **[TAB ROOT]** Tab 3 |
| Create Report | `CREATE_REPORT_SCREEN` | Tapping FAB on `REPORTS_SCREEN` |
| Archived Reports | `ARCHIVED_REPORTS_SCREEN` | Tapping "View Archived" on `REPORTS_SCREEN` |
| Guests | `GUESTS_SCREEN` | **[TAB ROOT]** Tab 4 |
| Guest Code Detail | `GUEST_CODE_DETAIL_SCREEN` | Tapping a guest code row on `GUESTS_SCREEN` |
| Generate Guest Code | `GENERATE_GUEST_CODE_SCREEN` | Tapping FAB on `GUESTS_SCREEN` |
| Settings | `SETTINGS_SCREEN` | Tapping settings icon (⚙️) on `HOME_SCREEN` or `GATE_SELECTION_SCREEN` |

---

## PART 2 — AUTHENTICATION

### 2.1 App Launch Logic

When the app is opened, it checks whether the user has an active session.

```
App opens
    │
    ├── Active session found → go directly to HOME_SCREEN
    │
    └── No session → go to WELCOME_SCREEN
```

There is no biometric lock. There is no PIN screen. Session persists until the user explicitly signs out or an admin revokes their access.

---

### 2.2 WELCOME_SCREEN

**What the user sees:**
- EstateHQ logo, centered
- Tagline: "One Platform. Everything Your Estate Runs On."
- A single primary button: **"Get Started"**

**What happens when "Get Started" is tapped:**
The app navigates to `EMAIL_INPUT_SCREEN`.

---

### 2.3 EMAIL_INPUT_SCREEN

**What the user sees:**
- Heading: "Enter your email to continue"
- An email input field
- A primary button: **"Send Magic Link"**
- A secondary text link below: **"Login with email and password"**

**What happens when "Send Magic Link" is tapped:**
- The system sends a magic link to the entered email address.
- The magic link is an **8-digit numeric code**.
- The app navigates to `MAGIC_LINK_SENT_SCREEN`.

**What happens when "Login with email and password" is tapped:**
The app navigates to `PASSWORD_LOGIN_SCREEN`.

---

### 2.4 MAGIC_LINK_SENT_SCREEN

**What the user sees:**
- Heading: "Check your inbox"
- Subtext: "We sent an 8-digit code to [user's email]. Enter it below."
- An 8-digit numeric code input field (OTP-style, auto-advancing per digit)
- A **"Verify Code"** button
- A **"Resend code"** link with a 60-second cooldown timer
- A **"Open email app"** shortcut button

**What happens when the correct 8-digit code is entered and "Verify Code" is tapped:**
- The system validates the code against the `residents` table.
- If the email is found: navigate to `HOME_SCREEN`.
- If the email is NOT found: show an inline error — "Your email isn't registered on any estate. Contact your estate office."

**What happens when an incorrect code is entered:**
Show an inline error beneath the input: "That code is incorrect. Try again or request a new one."

---

### 2.5 PASSWORD_LOGIN_SCREEN

**What the user sees:**
- Heading: "Sign in"
- Email input field (pre-filled if coming from `EMAIL_INPUT_SCREEN`)
- Password input field with show/hide toggle
- A primary button: **"Sign In"**
- A text link: **"Forgot password?"** (triggers a password reset email)
- A secondary link: **"Use magic link instead"** — navigates back to `EMAIL_INPUT_SCREEN`

**What happens when "Sign In" is tapped:**
- If credentials are valid: navigate to `HOME_SCREEN`.
- If credentials are invalid: show inline error — "Incorrect email or password."

---

## PART 3 — HOME SCREEN (`HOME_SCREEN`) [TAB ROOT]

### 3.1 Screen Header

The header sits at the top of the screen on a **blue background**. It spans the full width and contains:

- **Left side:** Profile picture (circular avatar, pulled from resident profile). Below the avatar, the text "Resident" in small caps. Below that, the resident's full first name and initial of surname (e.g. "Thandi M."). Below that, the estate name (e.g. "Hillcrest Estate").
- **Right side:** A settings icon button (⚙️). When this button is tapped, the app navigates to `SETTINGS_SCREEN`.

```
┌─────────────────────────────────────────────────┐
│  [Avatar]  Resident                         ⚙️  │  ← Blue background
│            Thandi M.                            │
│            Hillcrest Estate                     │
└─────────────────────────────────────────────────┘
```

---

### 3.2 Stat Cards (4 Cards in a 2×2 Grid)

These four cards appear immediately below the header, before the gate card. They are displayed in a **2-column, 2-row grid**.

```
┌──────────────────────┬──────────────────────┐
│  ACTIVE CODES  🔑    │  GUESTS INSIDE  👤   │
│        3             │         1            │
├──────────────────────┼──────────────────────┤
│  WEATHER        ☀️   │  OPEN TICKETS   🔧   │
│  24° Partly cloudy   │         2            │
└──────────────────────┴──────────────────────┘
```

**Card 1 — Active Codes:**
- Shows the count of active guest codes the resident currently has.
- This card is **tappable**. When the user taps it, the app switches to the **Guests tab** (`GUESTS_SCREEN`).

**Card 2 — Guests Inside:**
- Shows the count of guests who are currently inside the estate.
- This card is **tappable**. When the user taps it, the app switches to the **Guests tab** (`GUESTS_SCREEN`) and automatically applies the "Inside" filter so only guests currently inside are shown.

**Card 3 — Weather:**
- Shows the current weather for the estate's location (temperature + condition).
- This card is **display only**. It is not tappable. Tapping it does nothing.

**Card 4 — Open Tickets:**
- Shows the count of maintenance tickets the resident has that are in "Open" status.
- This card is **tappable**. When the user taps it, the app switches to the **Reports tab** (`REPORTS_SCREEN`).

---

### 3.3 Management Updates Banner

Below the stat cards, there is a banner row for management announcements:

```
┌─────────────────────────────────────────────────┐
│  📬  MANAGEMENT UPDATES                3 🔵  →  │
│      3 unread notices                           │
└─────────────────────────────────────────────────┘
```

- The blue dot and count indicate unread announcements.
- This entire banner row is **tappable**. When the user taps it, the app navigates to `ANNOUNCEMENTS_SCREEN`.
- Announcements are published by management only. Residents cannot post here.

---

### 3.4 Gate Card

Below the management updates banner, there is the gate card:

```
┌─────────────────────────────────────────────────┐
│  MAIN GATE                                  🚪  │
│  All gates online                               │
│  ● Online                                       │
│  ┌─────────────────────────────────────────┐    │
│  │  Hold to open                         → │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

- This entire card is **tappable**. When the user taps anywhere on the gate card (including the "Hold to open" button within it), the app navigates to `GATE_SELECTION_SCREEN`.
- The gate card is **not** a tab in the bottom navbar. It is a home screen element that opens a screen within the Home tab's navigation stack.

---

### 3.5 Emergency Card

Below the gate card, always visible at the bottom of the scrollable content, is the emergency card:

```
┌─────────────────────────────────────────────────┐
│  EMERGENCY                        Hold 5s  🚨   │  ← Red background
│  Hold 5 seconds to alert security               │
└─────────────────────────────────────────────────┘
```

- This card has a **red background** at all times.
- The card is **tappable**. When the user taps it, the app navigates to `EMERGENCY_SCREEN`.
- The text "Hold 5 seconds to alert security" is instructional — the actual hold interaction happens on `EMERGENCY_SCREEN`, not on the card.

---

### 3.6 Home Screen Scroll Order (Top to Bottom)

For absolute clarity, the vertical order of elements on `HOME_SCREEN` is:

1. Header (blue background, profile info + settings icon)
2. Stat cards (2×2 grid: Active Codes, Guests Inside, Weather, Open Tickets)
3. Management Updates banner
4. Gate card
5. Emergency card

---

## PART 4 — GATE SCREENS (Home Stack)

These screens are part of the Home tab's navigation stack. The bottom navbar is hidden on these screens. They are not accessible from any other tab.

---

### 4.1 GATE_SELECTION_SCREEN

**How the user gets here:** Tapping the gate card on `HOME_SCREEN`.

**What the user sees at the top of the screen:**
- A **back button (←)** on the top left. When tapped, the app goes back to `HOME_SCREEN`.
- The screen title: "Open Gate"
- A **settings icon (⚙️)** on the top right. When tapped, the app navigates to `SETTINGS_SCREEN`.

**What the user sees in the body:**
- Subheading: "Choose a gate, then hold to open."
- Two gate groups, displayed as distinct cards.

**Gate Group 1 — Gate 1:**

```
┌─────────────────────────────────────────────────┐
│  Gate 1                                         │
│  ┌───────────────────────────────────────────┐  │
│  │  🚪 Entry Gate               Hold to open →│  │
│  │     ● Online                              │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  🚪 Exit Gate                Hold to open →│  │
│  │     ● Online                              │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Gate Group 2 — Gate 2:**

```
┌─────────────────────────────────────────────────┐
│  Gate 2                                         │
│  ┌───────────────────────────────────────────┐  │
│  │  🚪 Entry Gate               Hold to open →│  │
│  │     ● Online                              │  │
│  └───────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────┐  │
│  │  🚪 Exit Gate                Hold to open →│  │
│  │     ● Online                              │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

- There is no pedestrian gate. Gate groups contain only Entry and Exit.
- Each gate row is individually **tappable/holdable**. When the user holds a gate row, the app navigates to `GATE_HOLD_SCREEN` for that specific gate.
- Each gate row shows its online/offline status with a coloured dot (green = online, red = offline).

---

### 4.2 GATE_HOLD_SCREEN

**How the user gets here:** Selecting and holding a gate row on `GATE_SELECTION_SCREEN`.

**Interaction:**
- The user must hold the row for the configured duration (default: 1.5 seconds).
- A progress ring or fill animation shows hold progress.
- Haptic feedback fires at the start and completion of the hold.
- If the user releases early, the hold is cancelled and nothing is sent to the gate.

**Success state — what the user sees:**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              ✅ (green circle)                  │
│                                                 │
│         Gate 1 · Entry Gate opening             │
│         Logged with your identity               │
│                                                 │
│              [Undo (5s)] ←──── countdown        │
│                                                 │
└─────────────────────────────────────────────────┘
```

- After 5 seconds (configurable), the Undo button disappears and the screen auto-dismisses back to `GATE_SELECTION_SCREEN`.
- When the Undo button is tapped, a cancellation command is sent to the gate hardware (Raspberry Pi), the action is logged as cancelled, and the screen dismisses.

**Failure state — what the user sees:**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              ⚠️                                 │
│                                                 │
│         Gate 1 · Entry Gate unavailable.        │
│         Use the intercom or contact security.   │
│                                                 │
│              [Dismiss]                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

- When Dismiss is tapped, the screen goes back to `GATE_SELECTION_SCREEN`.

---

### 4.3 EMERGENCY_SCREEN

**How the user gets here:** Tapping the emergency card on `HOME_SCREEN`.

**What the user sees:**
- Full-screen, red background.
- Large label: "EMERGENCY ALERT"
- Instruction: "Hold the button below for 5 seconds to alert security."
- A large circular hold button in the centre of the screen.
- Haptic pulse every 0.5 seconds during hold.
- If the user releases before 5 seconds: ring resets, no alert is sent.

**Post-alert screen — what the user sees after successful hold:**

```
┌─────────────────────────────────────────────────┐
│                  🚨 ALERT SENT                  │
│                                                 │
│     Security has been notified.                 │
│     Hillcrest Estate · Unit 136                 │
│     15:04:23                                    │
│                                                 │
│              [Undo (5s)] ←──── countdown        │
│                                                 │
│              [📞 Call Security]                 │
└─────────────────────────────────────────────────┘
```

- The **Undo button** is visible for the configured undo window (default: 5 seconds). When tapped, cancellation is sent and security is notified of the cancellation.
- The **"Call Security" button** is always visible on this screen. When tapped, it initiates a phone call to the estate's configured security number.
- After the undo window closes, only security can mark the alert as resolved.

---

## PART 5 — COMMUNITY SCREEN (`COMMUNITY_SCREEN`) [TAB ROOT]

### 5.1 Screen Layout

**What the user sees at the top:**
- Screen title: "Community"

**Body — two distinct sections stacked vertically:**

1. **Events card** — a tappable card at the top of the screen body.
2. **Community posts feed** — a scrollable list of posts below the Events card, newest first.

**Bottom right of screen:**
- A **Floating Action Button (FAB)** — a circular "+" button fixed to the bottom right corner. When this FAB is tapped, the app navigates to `CREATE_POST_SCREEN`.

---

### 5.2 Events Card

```
┌─────────────────────────────────────────────────┐
│  📅  EVENTS                                   → │
│      See what's happening in your estate        │
└─────────────────────────────────────────────────┘
```

- This entire card is **tappable**. When the user taps it, the app navigates to `EVENTS_SCREEN`.
- There are no amenity booking features anywhere in the app. Booking has been removed entirely.

---

### 5.3 Community Posts Feed

Below the Events card, the community posts feed is displayed. Posts are ordered **newest first** — the most recently created post appears at the top.

Each post in the feed looks like this:

```
────────────────────────────────────────────────
Anonymous                                   2h ago
Anyone else hear a car alarm near North
gate around midnight?
💬 4   👁 38

────────────────────────────────────────────────
Thandi M.                               Yesterday
Reminder: pool gate latch has been loose.
Reported to maintenance.
💬 2   👁 71
```

**Post display rules:**
- If the post was made anonymously, the author label shows as "Anonymous".
- If the post was made with the author's name, it shows their name and unit (e.g. "Thandi M. · Unit 136").
- Management can always see who created any post, even anonymous ones, from the management dashboard. This is invisible to other residents.

**Post deletion rules:**
- A resident can delete their **own** posts only.
- Management, superadmin, and the AI moderation layer can delete any post.
- Deletion is not shown as a visible button on each post for other users. The delete option only appears when the logged-in user is the post author (or has elevated permissions).

---

### 5.4 CREATE_POST_SCREEN

**How the user gets here:** Tapping the FAB (+) on `COMMUNITY_SCREEN`.

**What the user sees at the top:**
- A **back button (←)** on the top left. When tapped, the app goes back to `COMMUNITY_SCREEN` without saving.
- Screen title: "New Post"

**What the user sees in the body (form fields, top to bottom):**

1. **Title** — text input, labelled "Title (optional)". The user can leave this blank.
2. **Post body** — multi-line text input, labelled "What would you like to share?". Required.
3. **Image** — an optional image upload field. Label: "Add a photo (optional)". Tapping it opens the device's photo picker.
4. **Post anonymously toggle** — a toggle switch with the label "Post anonymously". When toggled on, the post displays as "Anonymous" to other residents. Management can still see the author.
5. **"Post" button** — a full-width primary button at the bottom of the form. When tapped, the post is submitted and the app navigates back to `COMMUNITY_SCREEN`, where the new post appears at the top of the feed.

---

### 5.5 EVENTS_SCREEN

**How the user gets here:** Tapping the Events card on `COMMUNITY_SCREEN`.

**What the user sees at the top:**
- A **back button (←)** on the top left. When tapped, the app goes back to `COMMUNITY_SCREEN`.
- Screen title: "Events"

**What the user sees in the body:**
- A scrollable list of upcoming and recent events. Each event appears as a card:

```
┌─────────────────────────────────────────────────┐
│  Community Braai                                │
│  📅 Sat 28 Jun · 16:00    📍 Clubhouse lawn     │
│  24 attending                                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  AGM Meeting                                    │
│  📅 Wed 2 Jul · 19:00     📍 Clubhouse hall     │
│  41 attending                                   │
└─────────────────────────────────────────────────┘
```

- Each event card is **tappable**. When the user taps an event card, the app navigates to `EVENT_DETAIL_SCREEN` for that event.

**Bottom right of screen:**
- A **Floating Action Button (FAB)** — a circular "+" button. When tapped, the app navigates to `CREATE_EVENT_SCREEN`.

---

### 5.6 EVENT_DETAIL_SCREEN

**How the user gets here:** Tapping an event card on `EVENTS_SCREEN`.

**What the user sees at the top:**
- A **back button (←)** on the top left. When tapped, the app goes back to `EVENTS_SCREEN`.
- The event name as the screen title.

**What the user sees in the body:**
- Event name (large heading)
- Date and time
- Location
- Description
- Attending count (e.g. "24 attending")
- An **RSVP button** — labelled "RSVP". When the user taps it, their attendance is registered and the button state toggles to "RSVPed ✓". Tapping again un-RSVPs them.

**Event deletion rules:**
- A resident can delete their **own** events only.
- Management, superadmin, and the AI moderation layer can delete any event.

---

### 5.7 CREATE_EVENT_SCREEN

**How the user gets here:** Tapping the FAB (+) on `EVENTS_SCREEN`.

**What the user sees at the top:**
- A **back button (←)** on the top left. When tapped, the app goes back to `EVENTS_SCREEN` without saving.
- Screen title: "New Event"

**What the user sees in the body (form fields, top to bottom):**

1. **Event name** — text input, required.
2. **Description** — multi-line text input, required.
3. **Location** — text input (free text, entered by the user), required.
4. **Start date and time** — date/time picker, required.
5. **End date and time** — date/time picker, required.
6. **"Post Event" button** — a full-width primary button at the bottom. When tapped, the event is submitted and the app navigates back to `EVENTS_SCREEN`, where the new event appears in the list.

---

## PART 6 — REPORTS SCREEN (`REPORTS_SCREEN`) [TAB ROOT]

### 6.1 Screen Layout

**What the user sees at the top:**
- Screen title: "Reports"
- Three summary stat cards in a horizontal row:

```
┌────────────┬───────────────┬─────────────┐
│     1      │       1       │      2      │
│   OPEN     │  IN PROGRESS  │  RESOLVED   │
└────────────┴───────────────┴─────────────┘
```

These cards are **display only**. Tapping them does not navigate anywhere.

**Filter tabs below the stat cards:**

```
[All]   [Open]   [In Progress]   [Resolved]
```

When the user taps a filter tab, the ticket list below updates to show only tickets matching that status.

**Body — ticket list:**
- Open and In Progress tickets appear first, at the top of the list.
- Resolved tickets appear below Open and In Progress tickets.
- Each ticket row shows: ticket title, status badge, date submitted.
- Tickets listed belong **only** to the logged-in resident. The resident cannot see another unit's tickets under any circumstances.

**Below the ticket list:**
- A section labelled **"Trusted Contractors"** listing the estate's approved contractors. This is read-only, managed by estate management.

**Below trusted contractors:**
- A text link or button: **"View Archived Tickets"**. When tapped, the app navigates to `ARCHIVED_REPORTS_SCREEN`.

**Bottom right of screen:**
- A **Floating Action Button (FAB)** — a circular "+" button. When tapped, the app navigates to `CREATE_REPORT_SCREEN`.

**Auto-archive rule:**
Resolved tickets are automatically archived after 5 days. Once archived, they no longer appear in the main ticket list and are only visible on `ARCHIVED_REPORTS_SCREEN`.

---

### 6.2 CREATE_REPORT_SCREEN

**How the user gets here:** Tapping the FAB (+) on `REPORTS_SCREEN`.

**What the user sees at the top:**
- A **back button (←)** on the top left. When tapped, the app goes back to `REPORTS_SCREEN` without saving.
- Screen title: "New Report"

**What the user sees in the body:**
- Keep the existing new ticket creation flow as defined in v2.0 of the flows document. The form fields, submission logic, and confirmation behaviour remain unchanged.

---

### 6.3 ARCHIVED_REPORTS_SCREEN

**How the user gets here:** Tapping "View Archived Tickets" on `REPORTS_SCREEN`.

**What the user sees at the top:**
- A **back button (←)** on the top left. When tapped, the app goes back to `REPORTS_SCREEN`.
- Screen title: "Archived Tickets"

**What the user sees in the body:**
- A list of the resident's own tickets that were resolved and auto-archived after 5 days.
- Each row shows: ticket title, resolution date, archived date.
- Read-only. No actions available on archived tickets.

---

## PART 7 — GUESTS SCREEN (`GUESTS_SCREEN`) [TAB ROOT]

### 7.1 Screen Layout

**What the user sees at the top:**
- Screen title: "Guests"
- Two summary stat cards in a horizontal row:

```
┌──────────────────────────┬──────────────────────────┐
│  ACTIVE CODES    3       │  INSIDE NOW      1       │
│  of 10 max               │                          │
└──────────────────────────┴──────────────────────────┘
```

These cards are **display only** on this screen.

**Filter tabs below the stat cards:**

```
[All]   [Active]   [Inside]   [Expired]
```

When the user taps a filter tab, the guest code list below updates accordingly.

**Body — guest code list:**

Active codes appear first. Expired codes appear below active ones.

Each row in the guest code list shows:
- Guest name (e.g. "John Smith")
- Status badge (e.g. "Inside", "Active", "Expired")
- A **Deactivate button** inline on the row — but only if the code is Active or Inside. Expired codes do not show the Deactivate button.

```
────────────────────────────────────────────────
John Smith                [Inside]   [Deactivate]
#A8F2 · 2/3 uses

────────────────────────────────────────────────
Maria Santos              [Active]   [Deactivate]
#K4R9 · 3/3 uses

────────────────────────────────────────────────
Sarah Chen                [Expired]
#D6Q3 · 0/3 uses
```

**Each guest code row is tappable.** When the user taps a row (anywhere except the Deactivate button), the app navigates to `GUEST_CODE_DETAIL_SCREEN` for that guest.

**Bottom right of screen:**
- A **Floating Action Button (FAB)** — a circular "+" button. When tapped, the app navigates to `GENERATE_GUEST_CODE_SCREEN`.

---

### 7.2 GUEST_CODE_DETAIL_SCREEN

**How the user gets here:** Tapping a guest code row on `GUESTS_SCREEN`.

**What the user sees at the top:**
- A **back button (←)** on the top left. When tapped, the app goes back to `GUESTS_SCREEN`.
- The guest's name as the screen title.

**What the user sees in the body:**

**Code summary block:**
```
John Smith                              [Inside]
Code: A8F2
Uses: 2 of 3
Valid: 10 Jun – 14 Jun 2026
Gate: Gate 1 · Entry Gate
```

**Entry/exit activity log:**

Labelled "ENTRY / EXIT LOG". Shows all gate events for this guest code — ordered chronologically, newest at the top.

```
ENTRY / EXIT LOG
────────────────────────────────────────────────
Entry      10 Jun  08:14      Gate 1 · Entry Gate
Exit       10 Jun  11:32      Gate 1 · Exit Gate
Time inside: 3h 18m

Entry      11 Jun  09:01      Gate 1 · Entry Gate
Currently inside
────────────────────────────────────────────────
```

Each entry session shows:
- Entry time and gate used
- Exit time and gate used (if the guest has exited)
- Total time spent inside during that session
- If the guest is currently inside, it shows "Currently inside" instead of an exit row

**Action buttons at the bottom:**

- **"Copy Code"** button — copies the guest code in WhatsApp-ready format (same format as used in `GENERATE_GUEST_CODE_SCREEN`).
- **"Deactivate"** button — only visible if the code status is Active or Inside. Not shown if the code is Expired.

**Deactivate confirmation flow:**

When the Deactivate button is tapped, a confirmation dialog appears:

```
"Deactivate access for John Smith?"
"This will immediately invalidate code A8F2.
John will not be able to enter the estate."

[Confirm Deactivate]     [Cancel]
```

- If "Confirm Deactivate" is tapped: code is invalidated immediately, the log records the deactivation, and the status changes to Expired on the `GUESTS_SCREEN` list.
- If "Cancel" is tapped: dialog closes, nothing changes.

---

### 7.3 GENERATE_GUEST_CODE_SCREEN

**How the user gets here:** Tapping the FAB (+) on `GUESTS_SCREEN`.

**What the user sees at the top:**
- A **back button (←)** on the top left. When tapped, the app goes back to `GUESTS_SCREEN` without saving.
- Screen title: "New Guest Code"

**What the user sees in the body (form fields, top to bottom):**

1. **Guest name** — text input, required.
2. **Phone number** — number input, optional.
3. **Valid from** — date and time picker, required.
4. **Valid until** — date and time picker, required.
5. **Number of uses** — number input (default: 1). There is an "Unlimited" toggle next to it. If unlimited is toggled on, the number input is hidden.
6. **Gate** — a dropdown selector. Only shown if the estate has multiple gates configured. Allows the resident to choose which gate the code is valid for.
7. **"Generate Code" button** — full-width primary button at the bottom of the form.

**After "Generate Code" is tapped — Code Created Screen:**

```
┌─────────────────────────────────────────────────┐
│         Code: A8F2                              │
│                                                 │
│  John Smith                                     │
│  Valid: 10 Jun 08:00 – 14 Jun 23:59             │
│  Uses: 3 remaining                              │
│  Gate: Gate 1 · Entry Gate                      │
│                                                 │
│              [Copy Code]                        │
└─────────────────────────────────────────────────┘
```

- When "Copy Code" is tapped, the following WhatsApp-formatted message is copied to the clipboard:

```
Hi [Guest Name],

You've been invited to [Estate Name] by [Resident Name], Unit [Unit No].

Your entry code is: A8F2

Valid: 10 Jun 2026, 08:00 – 14 Jun 2026, 23:59
Gate: Gate 1 · Entry Gate
Uses: 3 remaining

📍 Estate location: [Google Maps link]

Show this code to security on arrival or present it at the entry point.

– EstateHQ
```

- When the resident dismisses this screen, the new code appears at the top of the active codes list on `GUESTS_SCREEN`.

---

## PART 8 — SETTINGS SCREEN (`SETTINGS_SCREEN`)

**How the user gets here:** Tapping the ⚙️ settings icon on `HOME_SCREEN` or `GATE_SELECTION_SCREEN`.

**What the user sees at the top:**
- A **back button (←)** on the top left. When tapped, the app returns to wherever the user came from.
- Screen title: "Settings"

**Sections:**

**PROFILE**
- Name — read-only
- Email — read-only
- Unit — read-only (changes require an admin)
- Phone — editable by the resident

**SECURITY**
- Active sessions → tappable row that opens a list of active sessions. The user can revoke any session from this list.
- Change password — only shown if password authentication is enabled

**NOTIFICATIONS** (all are toggleable on/off by the resident)
- Management updates (announcements)
- Gate activity (my gates)
- Guest code used
- Maintenance updates
- Emergency alerts from estate — **this notification cannot be disabled**

**LEGAL**
- Privacy Policy → tappable, opens a web view
- Terms of Service → tappable, opens a web view

**DATA & ACCOUNT**
- Request Data Export → tappable
- Delete My Data → tappable

---

**DANGER ZONE** (styled visually distinct — red border, separate section)

```
──────────────── DANGER ZONE ────────────────

⚠️  Delete account and all associated data

This action is irreversible. Your account,
guest codes, maintenance history, and gate
logs associated with your identity will be
scheduled for deletion within 30 days.

[Request Account Deletion]
```

When "Request Account Deletion" is tapped, the app shows a warning screen listing everything that will be deleted, with a text field where the user must type the word "DELETE" to confirm. After typing "DELETE" and tapping "Confirm Deletion Request", the user sees:

> "Deletion request submitted. You will receive a confirmation email. Access continues for 7 days, then your account will be deactivated."

---

## PART 9 — CONFIGURABLE SETTINGS (Set During Estate Onboarding)

These values are set by the estate manager or superadmin during onboarding. The resident cannot change them.

| Setting | Default | Where Set |
|---|---|---|
| Gate hold duration | 1.5 seconds | Onboarding → Gate Config |
| Gate undo window | 5 seconds | Onboarding → Gate Config |
| Emergency hold duration | 5 seconds | Onboarding → Emergency Config |
| Emergency undo window | 5 seconds | Onboarding → Emergency Config |
| Guest code length | 4 characters | Onboarding → Access Config |
| Max active guest codes per resident | 10 | Onboarding → Access Config |
| Guest code max validity period | 30 days | Onboarding → Access Config |
| Estate Google Maps link | Required | Onboarding → Estate Profile |
| Security contact number | Required | Onboarding → Emergency Config |
| Trusted contractor list | Empty | Populated by manager post-onboarding |
| Amenities available | Removed | N/A — feature scrapped |

---

## PART 10 — ESTATE MANAGER ACCESS (Resident App)

Estate managers access the resident app as a special profile type. Their unit is shown as "Manager · [Estate Name]" in the header, not a unit number.

**Manager-specific abilities in the resident app:**
- Open any gate (logged as "Manager — [Name]" in gate logs)
- View and post to the community board (identity always shown — managers cannot post anonymously)
- View and publish management updates / announcements
- Generate guest codes for estate or contractor use
- Cannot view other residents' data, tickets, or guest codes — the same data privacy rules apply

This is not a separate app. It is the same resident app with an elevated profile type.

---

_v3.0 — Magic link is 8-digit numeric code. Biometric lock removed entirely. Home card order confirmed: stat cards → gate card → emergency card. Amenity bookings scrapped. Pedestrian gate removed. Gate groups: Gate 1 (Entry + Exit), Gate 2 (Entry + Exit). Posts and events support deletion by author, management, superadmin, and AI moderation layer. Reports auto-archive after 5 days resolved._
