# Estavo — Brand Identity
**Version:** 1.0 | **June 2026**

---

## 1. Brand Positioning

### What Estavo Is
A professional estate operations platform built specifically for South African residential communities. Not a startup toy — a serious operational tool that estate managers can trust and residents can rely on daily.

### Brand Personality

| Trait | What It Means in Practice |
|---|---|
| **Authoritative** | Confident, not arrogant. Estavo knows its domain. |
| **Precise** | No clutter. Every word and pixel earns its place. |
| **Grounded** | Built for real SA estate life — not imported SaaS aesthetic. |
| **Trustworthy** | Security + compliance front and centre. Not flashy. |
| **Efficient** | The brand never wastes your time. |

### What Estavo Is NOT
- Not a consumer app (no rounded bubbly UI, no emoji in UI copy)
- Not a generic SaaS product (not another blue gradient B2B tool)
- Not a government portal (not sterile or cold)
- Not a real estate listings platform (not about buying/selling property)

---

## 2. Naming

**Product Name:** Estavo

**Tagline:** *One Platform. Everything Your Estate Runs On.*

**Why this tagline works:**
- "One Platform" — directly addresses the fragmentation problem
- "Everything Your Estate Runs On" — positions Estavo as infrastructure, not a nice-to-have
- Short, printable, works in sales decks and on a homepage

**Domain:** estavo.co.za *(reserve this if not already owned)*

**Sub-brand naming convention:**
- Estavo Resident — the resident app
- Estavo Security — the security/staff app
- Estavo Manage — the manager dashboard
- Estavo Admin — superadmin portal (internal, not marketed)

---

## 3. Visual Identity

### 3.1 Logo

**Concept:** A wordmark-first identity. The logomark (if used) is a geometric "HQ" monogram built from clean angles — referencing both the compound/estate footprint and the precision of a command centre.

**Wordmark:**
- **"Estate"** — set in a refined, slightly extended weight geometric sans
- **"HQ"** — set bold, same typeface, same size or slightly larger — acts as the anchor

**Logomark (secondary use):**
- A tight "HQ" mark in a square container with clipped corners (not rounded — sharp, intentional)
- Used as app icon, favicon, and embossed on printed materials

**Do not:**
- Use a house/home icon — too generic, too "real estate portal"
- Use a shield icon — overused in estate security branding
- Add a gate or barrier graphic — too literal

---

### 3.2 Color Palette

| Name | Hex | Usage |
|---|---|---|
| **Obsidian** | `#0F1117` | Primary background (dark UI), headers |
| **Slate White** | `#F2F3F5` | Primary background (light UI), body text on dark |
| **Estavo Green** | `#1A7A4A` | Primary brand accent — CTAs, active states, success indicators |
| **Warm Graphite** | `#2C2F36` | Cards, elevated surfaces on dark UI |
| **Mist** | `#8B929E` | Secondary text, labels, disabled states |
| **Alert Red** | `#D93025` | Errors, emergency alerts, overdue levy indicators |
| **Amber** | `#E8A020` | Warnings, pending states, "action needed" badges |

**Why green, not blue:**
Most B2B SaaS uses blue (Salesforce, Jira, Linear). In the SA context, green carries connotations of security ("green light"), nature (estate environment), and go. It differentiates immediately. Not the flat lime-green of tech startups — a deep, confident forest green.

**Palette Logic:**
- Dark UI (Manager Dashboard, Superadmin): `#0F1117` base, `#2C2F36` cards, `#1A7A4A` accents
- Light UI (Resident App, Security App): `#F2F3F5` base, white cards, `#1A7A4A` accents
- Both UIs share the same accent palette — brand consistency across surfaces

---

### 3.3 Typography

**Display / Headings:** [Inter](https://rsms.me/inter/) Bold / Extra Bold
- Available on Google Fonts, works in React Native and Next.js
- Geometric, precise, excellent legibility at all sizes
- Not a serif — Estavo is operational software, not editorial

**Body:** Inter Regular / Medium
- Single family across all surfaces for system coherence
- Slightly increased line height for dashboard readability (1.6)

**Monospace (data, codes, IDs):** [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
- Used for: OTP codes, unit IDs, gate log entries, transaction IDs
- Makes numerical data feel deliberate and trustworthy

**Type Scale (web):**

| Role | Size | Weight | Usage |
|---|---|---|---|
| Display | 48–64px | 800 | Hero sections, landing page |
| H1 | 32px | 700 | Page titles |
| H2 | 24px | 600 | Section headers |
| H3 | 18px | 600 | Card headers, sub-sections |
| Body | 15px | 400 | General UI text |
| Caption | 13px | 400 | Labels, timestamps, metadata |
| Mono | 14px | 500 | Codes, IDs, log entries |

---

### 3.4 Spacing & Layout

- **Grid:** 8px base unit. All spacing is multiples of 8.
- **Border Radius:** 6px for cards and inputs (not circular, not sharp — considered)
- **Density:** Functional density — not cramped, not airy. Dashboard is a work tool, not a portfolio site.
- **Shadows:** Subtle, desaturated. `box-shadow: 0 1px 3px rgba(0,0,0,0.12)` for cards on light. On dark, use border + background lift instead of shadows.

---

### 3.5 Iconography

**Style:** Outline icons, 1.5px stroke, rounded line caps.

**Library:** [Lucide](https://lucide.dev/) — clean, consistent, MIT licensed, works in React + React Native.

**Do not mix icon styles.** All icons from one library throughout. Never mix Lucide with Heroicons or Material Icons.

**Key icons (consistent usage):**

| Icon | Usage |
|---|---|
| `shield-check` | Security, verified access |
| `gate` / `door-open` | Gate events |
| `user-check` | Resident verified |
| `alert-triangle` | Warning states |
| `siren` | Emergency alerts |
| `file-text` | Levy statements, documents |
| `wrench` | Maintenance |
| `clock` | Pending, scheduled |
| `check-circle` | Success, resolved |

---

## 4. Voice & Tone

### Core Principle
Estavo communicates like a competent professional — clear, direct, never condescending, never casual to the point of seeming unreliable.

### UI Copy Rules

**Do:**
- "Pre-authorise a guest" (not "Invite a visitor")
- "Outstanding balance: R 2,400" (not "You owe money!")
- "Gate opened — 14:32" (not "Yay, gate opened!")
- "Maintenance request submitted" (not "We got your request!")
- "Submit request" (not "Send" or "Go")

**Don't:**
- Exclamation marks in operational UI (only acceptable in empty states/onboarding)
- "Oops" — this is a professional tool, errors should be precise
- Passive voice in error messages: "Something went wrong" → "Guest OTP not found. Check the code or ask the resident to re-authorise."
- Jargon that residents won't understand: "webhook" / "payload" / "endpoint" should never appear in resident-facing UI

### Error Messages (Template)
```
[What happened] — [Why it matters] — [How to fix it]

Example: "OTP code not recognised. It may have expired or been revoked. Ask the resident to generate a new code."
```

### Empty State Copy (Template)
```
[What's missing] — [Why to care] — [Action to take]

Example: "No maintenance requests yet. Residents can log issues directly from the app."
```

---

## 5. Product UI Principles

### 5.1 Role-Specific Design
Each surface is designed for one job. The security app is used with gloves, in the dark, on a 6" Android screen. Large tap targets (min 48px), high contrast, minimal navigation depth. The manager dashboard is used on a laptop with multiple tabs open — information density is a feature.

### 5.2 Status is Always Visible
Every gate, every request, every levy account has a clear status indicator. Users should never have to wonder "is this thing in a good state or a bad state?"

**Status conventions:**
- Green badge: Active / Resolved / Paid
- Amber badge: Pending / Overdue (< 30 days) / Action needed
- Red badge: Critical / Overdue (> 60 days) / Error
- Grey badge: Inactive / Cancelled / Closed

### 5.3 Destructive Actions Are Protected
- Emergency lockdown requires a confirmation modal with typed confirmation ("LOCK ALL GATES")
- Deleting a resident account requires manager to type unit number
- Bulk levy runs show a summary before applying

### 5.4 Data First, Design Second
In the manager dashboard and security app, tables and data views take priority. No gratuitous charts or decorative elements that don't carry information.

---

## 6. App Icons

### Resident App Icon
- White/light `#F2F3F5` background
- Estavo green `#1A7A4A` HQ monogram, centred
- Clean, professional — stands out on a home screen among social apps

### Security App Icon
- Dark `#0F1117` background
- Estavo green `#1A7A4A` shield outline with HQ inside
- Immediately signals security context

---

## 7. Marketing Identity (Landing Page / Sales)

### Hero Section
- Dark background (`#0F1117`)
- Tagline: **"One Platform. Everything Your Estate Runs On."**
- Sub-copy: "Stop managing your estate across twelve WhatsApp groups. Estavo gives residents, security staff, and managers one place to do everything."
- CTA: "Book a Demo" (primary) / "See How It Works" (secondary)

### Social Proof Section (Phase 2, post-launch)
- Estate name + manager quote
- "X residents. Y% levy collection rate."

### Pricing Section
- Clean table, ZAR pricing, per-estate
- Feature comparison per tier
- Annual billing discount called out

### Trust Signals
- "Built for South African estates"
- "POPIA compliant"
- "Your data stays in South Africa"

---

*Brand decisions in this document are fixed for v1. Updates require a version increment and changelog entry.*
