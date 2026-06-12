# Estavo — UI PRD (Visual System & Wording)
**Document:** UI Design System — Colours, Typography, Iconography, Voice
**Version:** 1.0 · 11 June 2026
**Sources:** `01_Estavo_PRD.md`, `02_Estavo_Brand_Identity.md`, `Estavo_Prototypes_PRD.md`, live prototypes at bryson77.github.io/estateHQ

---

## 0. Colour Decision (Override)

`02_Estavo_Brand_Identity.md` (v1.0) specified **Estavo Green `#1A7A4A`** as the primary brand accent. This is **overridden**:

- **Theming (brand accents, headers, CTAs, logo, primary buttons, active states):** No green. Use **Blue** (`#1E40AF` / `#005B9F`, Resident) and **Red** (`#C0392B` / `#DC2626`, Security/Maintenance/Manager), per the shipped prototypes.
- **Status/activity indicators (badges, chips, log entries) where green is the semantic meaning** — e.g. "Active", "Resolved", "Paid", "Online" — green remains valid, since it's communicating state, not branding.

This matches `Estavo_Prototypes_PRD.md`'s existing rule: *"There is no green status dot anywhere — online indicators reuse the role accent."* Online/active indicators use the role accent (blue/red), not green dots — green is reserved for status badges like "Resolved" or "Paid" where it's the conventional meaning.

`02_Estavo_Brand_Identity.md` should be version-bumped to v1.1 to record this change.

---

## 1. Colour System (as built)

### 1.1 Mobile apps (Resident · Security · Maintenance)

| Token | Resident (Blue) | Security / Maintenance (Red) |
|---|---|---|
| `--app-accent` | `oklch(0.5 0.16 245)` ≈ `#1E40AF` | `oklch(0.58 0.22 27)` ≈ `#DC2626` |
| `--app-header-from / to` | Deep blue → mid blue (e.g. `#0B3D7A` → `#005B9F`) | Deep red → mid red (e.g. `#7A1A12` → `#C0392B`) |
| `--app-bg` | `oklch(0.985 0.005 240)` (near-white, cool tint) | `oklch(0.985 0.005 25)` (near-white, warm tint) |
| `--primary-soft` | Pale blue tint | Pale red tint |

Shared neutrals:
- `bg-card`: white
- `bg-muted`, `text-muted-foreground`, `border`: neutral greys
- Success: `bg-success/15 text-success` (dark green text on light green chip — **status only**, not a brand accent)
- Warning / amber: `oklch(0.55 0.16 75)`
- Destructive / Alert: `#991B1B`

**Rule:** Green appears only as a *status* colour (e.g. "Resolved", "Paid") inside badges — never as a header, button, brand accent, or logo colour. No green status dot anywhere; online indicators always reuse the role accent (blue or red).

### 1.2 Management Dashboard (Web)

| Token | Value |
|---|---|
| `--brand-red` | `#C0392B` |
| `--brand-red-dark` | `#922B21` |
| `--forest-dark` | `#2D4A3E` |
| `--sage` | `#5C7A6E` (secondary accent — bar charts, maintenance avatars) |
| `--cream` / `--paper` | `#FAF7F2` / `#F8F3EC` |
| `--sidebar-bg` | `#1A1F1E` (near-black) |

Badge colours, status-driven:
- Success → dark green text on light green chip (status only)
- Amber → pending / in-progress
- Danger (red) → suspended / open / overdue
- Blue → informational
- Muted grey → inactive / closed

**Note:** `--forest-dark` and `--sage` are muted green-greys used as structural/secondary tones in the dashboard only (charts, avatar tints) — these read as neutral earth tones, not as a "green brand accent," and are visually distinct from the rejected Estavo Green (`#1A7A4A`). If a fully green-free palette is required even here, `--forest-dark`/`--sage` would need replacing — flag if so.

### 1.3 Reference values from screenshot (extracted earlier)

| Use | Hex |
|---|---|
| Header / primary blue (Resident) | `#005B9F` |
| Light accent fill (gate card button) | `#B3DBFE` |

---

## 2. Typography

| Role | Typeface | Notes |
|---|---|---|
| UI body (mobile apps) | **Inter** 400 / 500 / 600 / 700 | Single family across mobile surfaces |
| Eyebrow labels & metadata | **JetBrains Mono**, uppercase, `letter-spacing: 0.14em`, 10–11px | OTP codes, unit IDs, gate logs, ref codes |
| Display headings (Management Dashboard only) | **Fraunces** 500 | Resident/Security/Maintenance apps do **not** use Fraunces — they stay native-feeling |
| Email templates | **Courier New**, monospace (header wordmark) | Per latest direction for transactional emails |

### Type scale (from brand doc, web reference)

| Role | Size | Weight | Usage |
|---|---|---|---|
| Display | 48–64px | 800 | Landing page hero |
| H1 | 32px | 700 | Page titles |
| H2 | 24px | 600 | Section headers |
| H3 | 18px | 600 | Card headers, sub-sections |
| Body | 15px | 400 | General UI text |
| Caption | 13px | 400 | Labels, timestamps, metadata |
| Mono | 14px | 500 | Codes, IDs, log entries |

---

## 3. Layout, Spacing & Components

- **Grid:** 8px base unit — all spacing in multiples of 8.
- **Border radius:** 6px for cards/inputs (considered, not sharp, not pill-shaped).
- **Mobile shell:** iPhone-style frame, `rounded-[2.5rem]`, 10px bezel, 14px chin; inner canvas ~400×720px, `rounded-[1.9rem]`, accent-tinted background.
- **Header band (mobile):** 56px, gradient `--app-header-from → --app-header-to`, white text.
  - Tab routes: avatar (initials) + role label + screen title + settings cog
  - Sub-routes: back chevron + "Estavo" + screen title + settings cog
- **Bottom tab bar:** 4 tabs + iOS home indicator; hidden on full-screen sub-routes (Gate, Emergency, Task Detail, New Guest Code).
- **Shadows:** Subtle, desaturated — `box-shadow: 0 1px 3px rgba(0,0,0,0.12)` on light surfaces. On dark UI, use border + background-lift instead of shadow.
- **Density:** Functional, not cramped or airy — dashboard is a work tool.

### Reusable primitives (Management Dashboard)
`Card`, `Btn` (primary / secondary / soft-red / ghost), `Badge`, `PriBadge`, `StatusBadge`, `Tbl`, `Td`, `Pager`, `Drawer`, `Kv`, `Logged` (the "✓ Logged" microconfirmation after write actions).

---

## 4. Iconography

- **Library:** Lucide — outline style, 1.5px stroke, rounded line caps. Do not mix with other icon sets.

| Icon | Usage |
|---|---|
| `shield-check` | Security, verified access |
| `gate` / `door-open` | Gate events |
| `user-check` | Resident verified |
| `alert-triangle` | Warning states |
| `siren` | Emergency alerts |
| `file-text` | Levy statements, documents |
| `wrench` | Maintenance |
| `clock` | Pending / scheduled |
| `check-circle` | Success / resolved |

**Branding note:** No house/home icon, no shield-as-logo, no gate/barrier graphic in the logo itself (per brand doc) — these icons are fine for in-app status, just not as the Estavo mark.

---

## 5. Interaction & Formatting Rules (cross-app)

- **Hold to open** (not tap) for any gate, intercom, or panic action — 5-second hold.
- **5-second undo window** after any one-tap action that triggers something physical (gate open, panic, emergency).
- Times: **24-hour** format (`14:32`, never `2:32 PM`).
- Dates: `D Mon YYYY` (`30 May 2026`).
- Spelling: **South African English** (`neighbours`, `colour`, `organise`).
- Canonical role names: **Resident · Security · Maintenance · Manager** (never "Supervisor").
- No spinners — use skeleton blocks for loading states.
- Every write action shows a small **"✓ Logged"** microconfirmation.
- Status badges:
  - Green → Active / Resolved / Paid (status only)
  - Amber → Pending / Overdue (<30 days) / Action needed
  - Red → Critical / Overdue (>60 days) / Error
  - Grey → Inactive / Cancelled / Closed

---

## 6. Voice & Tone

**Personality:** Authoritative (confident, not arrogant), Precise (no clutter), Grounded (real SA estate life), Trustworthy (security/compliance forward), Efficient (never wastes the user's time).

**Not:** consumer-app cute, generic blue-gradient SaaS, government-portal sterile, or a property-listings platform.

### UI copy — do
- "Pre-authorise a guest" (not "Invite a visitor")
- "Outstanding balance: R 2,400" (not "You owe money!")
- "Gate opened — 14:32" (not "Yay, gate opened!")
- "Maintenance request submitted" (not "We got your request!")
- "Submit request" (not "Send" or "Go")

### UI copy — don't
- No exclamation marks in operational UI (only acceptable in empty states / onboarding)
- No "Oops" — be precise about errors
- No passive "Something went wrong" — say what happened, why it matters, how to fix it
- No internal jargon ("webhook", "payload", "endpoint") in resident-facing UI

### Error message template
```
[What happened] — [Why it matters] — [How to fix it]

Example: "OTP code not recognised. It may have expired or been revoked.
Ask the resident to generate a new code."
```

### Empty state template
```
[What's missing] — [Why to care] — [Action to take]

Example: "No maintenance requests yet. Residents can log issues directly from the app."
```

---

## 7. Landing Page Content Reference (current live copy)

Pulled from bryson77.github.io/estateHQ/ — useful as the canonical source of marketing wording, restated here in summary form (full copy lives on the site, not duplicated verbatim):

- **Tagline / hero theme:** Estates currently run on WhatsApp groups and spreadsheets; Estavo replaces this patchwork with one platform covering gate control, guest access, maintenance reporting, and community tools.
- **Pricing stance:** No hidden costs, no per-resident charges, cancel anytime; one flat monthly price agreed upfront.
- **Six feature pillars** (numbered 01–06 on the site):
  1. Gate Control — hold-to-open, full gate log, 5-second undo
  2. Guest Access — WhatsApp-delivered codes with map link, 3 uses, configurable expiry (2–48h)
  3. Maintenance & Reporting — auto-categorised, escalation thresholds (12h / 48h / 72h), duplicate detection
  4. Security & Alerts — 5-second hold panic trigger, emergency ID, anonymous-to-residents/visible-to-staff posting
  5. Community — security + events feeds, anonymous posting option, RSVP
  6. Staff & Manager Tools — role-separated access (Security / Maintenance / Manager), auto logout on shift end
- **Demo section:** role picker (Resident / Security / Maintenance / Manager) linking to interactive prototypes.
- **Trust signals:** "Built for South African estates", POPIA compliance, data stays in South Africa.
- **Social proof stats (placeholder/mock):** 74% reduction in unresolved maintenance tickets within 30 days; zero security incidents linked to unauthorised guest access since launch; 11 min average guest-code creation-to-delivery time.

---

## 8. Open Items

1. ~~Resolve green vs blue/red conflict~~ — **Resolved**, see Section 0. `02_Estavo_Brand_Identity.md` should be bumped to v1.1.
2. Confirm whether `--forest-dark` / `--sage` (dashboard secondary tones, muted green-greys) are acceptable as structural/chart colours, or need replacing under the theming override.
3. Logomark: brand doc's "HQ" monogram was tied to Estavo Green — confirm new colour (blue or red, or a neutral) for the logomark/app icons now that green is excluded from theming.
