# Estavo Superadmin Portal — Design System
## Directive to: Gemini (Builder)
## Written by: Claude (Architect)
## Version: 2.0 | June 2026

---

## READ THIS FIRST

This document defines the complete visual identity of the Estavo Superadmin Portal. Every colour, every font size, every spacing value, every component state is defined here.

**Follow this document exactly.** Do not substitute colours. Do not use Tailwind default colours unless they match the hex values below. Do not add dark-mode variants, neon accents, or heavy shadows. The aesthetic goal is: a tool that feels like Linear or Stripe's dashboard — light, precise, calm, expensive-feeling through restraint rather than decoration.

---

## PART 1 — AESTHETIC DIRECTION

### The One Sentence Brief
A light, airy operations dashboard — generous whitespace, fine hairline borders, a single confident electric-blue accent, and typography that does the heavy lifting.

### What This Portal Should Feel Like
- Opening Linear or Stripe's dashboard for the first time
- Whitespace as a feature, not an absence
- Calm precision — nothing shouts
- A tool that respects the admin's attention
- Quietly premium: the kind of product investors notice the polish on

### What This Portal Should NOT Feel Like
- A dark "ops centre" / hacker terminal
- A marketing landing page with big gradients
- A Bootstrap admin template with heavy card shadows
- Anything cramped or dense by default
- Anything with emoji as navigation icons

---

## PART 2 — COLOUR PALETTE

These are the only colours used in the portal. Every element maps to one of these tokens.

### Base Palette

```
--color-bg:            #FFFFFF   ← Page background. Pure white.
--color-surface:       #FAFAFB   ← Card and panel backgrounds. Barely-there grey.
--color-surface-2:     #F2F3F5   ← Elevated surfaces — table headers, hover states, input backgrounds.
--color-border:        #E6E7EB   ← All borders. Hairline, quiet.
--color-border-strong: #D3D5DC   ← Focused inputs, active table rows, dividers that need to read.
```

### Text

```
--color-text-primary:  #16181D   ← Headings, body, table content. Near-black, not pure black.
--color-text-secondary:#6B7280   ← Labels, subtitles, muted info.
--color-text-disabled: #B0B3BD   ← Disabled states, placeholder text.
```

### Accent — Electric Blue

The single brand colour, carried over from the EstateHQ palette. Used with restraint. Only on: active nav items, primary buttons, links, focus rings, and key data highlights. Never used as a background fill on large areas.

```
--color-accent:        #3D6BF5   ← Primary accent. Electric blue.
--color-accent-hover:  #2F59D6   ← Hover state on accent elements.
--color-accent-muted:  #EEF2FE   ← Accent at low opacity — active nav bg, subtle highlights.
--color-accent-text:   #3D6BF5   ← Accent used as text colour (on light backgrounds, full strength reads fine).
```

### Semantic Colours

Used only for status indicators, badges, and alerts. Never for decoration.

```
--color-success:       #16A34A   ← Online, Active, Resolved, Operational
--color-success-muted: #EAFBF0   ← Success badge background
--color-success-text:  #15803D   ← Success badge text

--color-warning:       #D97706   ← In Progress, Pending, Issues
--color-warning-muted: #FEF6E7   ← Warning badge background
--color-warning-text:  #B45309   ← Warning badge text

--color-danger:        #DC2626   ← Offline, Expired, Error, Danger actions
--color-danger-muted:  #FDECEC   ← Danger badge background
--color-danger-text:   #B91C1C   ← Danger badge text

--color-neutral:       #9CA3AF   ← Inactive, Unknown
--color-neutral-muted: #F2F3F5   ← Neutral badge background
--color-neutral-text:  #6B7280   ← Neutral badge text
```

### Black

Used only for: text on accent-coloured buttons where white would have insufficient contrast in edge cases — in practice, this palette uses white text on the accent. `--color-text-primary` (#16181D) is the closest thing to "black" and is used for all primary text.

```
--color-white: #FFFFFF
```

### Electric Blue in a Light Palette

You requested the electric blue accent stay. In a light interface it does more work than it did on dark — it's now the *only* saturated colour against a field of white, grey, and near-black, so it reads even more deliberately as "this is the brand, this is interactive, click here."

- **Blue** (`#3D6BF5`) — the accent, the authority colour, the brand signal. On white, this colour is louder than it was on dark — use it more sparingly than you think.
- **Red** (`#DC2626`) — reserved exclusively for danger, offline states, and destructive actions.
- **White / near-black** — the entire canvas. Hierarchy comes from type weight, spacing, and the rare appearance of colour — not from background tinting.

---

## PART 3 — TYPOGRAPHY

### Font

**Primary font:** `Inter` — loaded from Google Fonts. Carried over; Inter's neutrality suits a light, content-forward dashboard.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Monospace font:** `JetBrains Mono` — used only for: codes, IDs, gate codes, timestamps in logs, any data that is computer-generated rather than human-written.

```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Colour | Usage |
|---|---|---|---|---|---|---|
| `--text-page-title` | 22px | 600 | 1.3 | -0.01em | Text primary | Page H1 |
| `--text-page-subtitle` | 13px | 400 | 1.5 | 0 | Text secondary | Page description |
| `--text-section-title` | 12px | 600 | 1.4 | 0.06em | Text secondary (UPPERCASE) | Section labels, card eyebrows |
| `--text-card-value` | 28px | 600 | 1.1 | -0.01em | Text primary | Big numbers on stat cards |
| `--text-card-label` | 11px | 600 | 1.4 | 0.08em | Text secondary (UPPERCASE) | Stat card labels |
| `--text-body` | 14px | 400 | 1.6 | 0 | Text primary | Table cells, descriptions |
| `--text-body-sm` | 12px | 400 | 1.5 | 0 | Text secondary | Timestamps, secondary info |
| `--text-label` | 12px | 500 | 1.4 | 0 | Text secondary | Form labels |
| `--text-button` | 13px | 500 | 1 | 0 | Depends on variant | Buttons |
| `--text-nav` | 13px | 500 | 1 | 0 | Text secondary | Sidebar nav items |
| `--text-mono` | 13px | 400 | 1.5 | 0 | Text primary | Codes, IDs, logs |

### Typography Rules

- **Never use font sizes below 11px.** Anything smaller is inaccessible and feels cheap.
- **Page titles stay around 22px, weight 600.** Confident but not shouting — this is the Linear/Stripe register, not a landing-page hero.
- **Section labels are always uppercase with letter-spacing.** This is what distinguishes a label from body text in a dense interface.
- **Monospace font is used strictly for data, never for UI text.**
- **Line lengths in text blocks should not exceed 640px** to maintain readability.
- **Weight does the work that colour used to do.** On dark, accent-text gave hierarchy. On light, prefer font-weight (500/600) and `--color-text-secondary` vs `--color-text-primary` to create hierarchy — reach for the accent colour last.

---

## PART 4 — SPACING SYSTEM

All spacing is based on a **4px base unit**. Use only multiples of 4. Carried over unchanged — the light palette needs the *same* generous spacing, if anything slightly more, since whitespace is now a visible design element rather than dark negative space.

```
4px   → micro gaps, icon padding
8px   → tight component padding, small gaps between inline elements
12px  → form element internal padding
16px  → standard component padding, gaps between small cards
20px  → sidebar item padding (vertical)
24px  → card internal padding
32px  → gaps between sections on a page
40px  → page top padding
48px  → large section separators
```

**Do not use arbitrary values like 15px, 22px, 37px.** Snap to the scale above.

---

## PART 5 — LAYOUT

### 5.1 Overall Structure

```
┌────────────────────────────────────────────────────────────────────┐
│  SIDEBAR  (240px fixed, full height, bg: --color-surface)          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Logo + "Superadmin"  (top, 24px padding)                   │  │
│  │                                                              │  │
│  │  Nav items (see Part 6)                                      │  │
│  │                                                              │  │
│  │  ─────────────────────────── (divider at bottom)            │  │
│  │  Admin name + role  (bottom, 20px padding)                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────┤
│  MAIN CONTENT AREA  (flex-1, bg: --color-bg, scrollable)           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Page header (title + subtitle + divider)   40px top padding │  │
│  │                                                              │  │
│  │  Page content                               24px side pad    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

- Sidebar: `width: 240px`, `min-height: 100vh`, fixed position, does not scroll with content, `border-right: 1px solid var(--color-border)`
- Main content: `flex: 1`, `overflow-y: auto`, `padding: 40px 32px`, `background: var(--color-bg)`
- No top navbar. No breadcrumbs. The sidebar is the only navigation chrome.

### 5.2 Page Header

Every page opens with:

```
PAGE TITLE                                    [Action button if applicable]
Page subtitle in muted text
──────────────────────────────────────────────────────────────────── (1px border)
```

- Title and subtitle left-aligned
- Action button (e.g. "+ Add Estate") right-aligned, vertically centred with the title
- Divider: `1px solid --color-border`, full width, `margin-top: 16px`, `margin-bottom: 32px`

### 5.3 Stat Card Grid

Stat cards sit in a CSS grid:

```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
gap: 16px;
margin-bottom: 32px;
```

This means: on wide screens, 5 cards sit in one row. On narrower screens, they wrap gracefully.

### 5.4 Content Sections

Each section below the stat cards is a separate visual block:

```
SECTION LABEL (uppercase, text-secondary, 11px, letter-spacing)
margin-bottom: 12px

[Content — table, list, or cards]
background: --color-surface
border: 1px solid --color-border
border-radius: 10px
overflow: hidden
```

---

## PART 6 — SIDEBAR

### 6.1 Structure

```
┌──────────────────────────────────┐
│  ◈ Estavo            (logo)      │  ← 24px padding, 20px top
│  SUPERADMIN          (label)     │  ← 11px, uppercase, accent-text
│                                  │
│  ──────────────────────────────  │  ← 1px border, margin 16px 0
│                                  │
│  □  Overview                     │  ← nav items start here
│  □  Estates                      │
│  □  Residents                    │
│  □  Security                     │
│  □  Reports                      │
│  □  Community                    │
│  □  Announcements                │
│  □  Billing                      │
│  □  Settings                     │
│                                  │
│  [flex-grow: 1 — pushes to btm]  │
│                                  │
│  ──────────────────────────────  │  ← 1px border
│  Superadmin                      │  ← name, 13px, text-primary
│  Platform Administrator          │  ← role, 11px, text-secondary
│  [Sign out — greyed, disabled]   │
└──────────────────────────────────┘
```

### 6.2 Nav Item States

```css
/* Default */
.nav-item {
  padding: 9px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 150ms, color 150ms;
}

/* Hover */
.nav-item:hover {
  background: var(--color-surface-2);
  color: var(--color-text-primary);
}

/* Active (current page) */
.nav-item.active {
  background: var(--color-accent-muted);
  color: var(--color-accent);
  font-weight: 600;
}
```

No left border on active state. The background tint is sufficient. Left borders feel heavy in a dense sidebar.

### 6.3 Nav Icons

Use `lucide-react` for all icons. Icon size: `16px`. Stroke width: `1.5`. Icons are the same colour as their nav item label.

| Nav Item | Lucide Icon |
|---|---|
| Overview | `LayoutDashboard` |
| Estates | `Building2` |
| Residents | `Users` |
| Security | `ShieldCheck` |
| Reports | `ClipboardList` |
| Community | `MessageSquare` |
| Announcements | `Megaphone` |
| Billing | `CreditCard` |
| Settings | `Settings` |

---

## PART 7 — COMPONENTS

### 7.1 Stat Card

```
┌──────────────────────────────────────┐
│  TOTAL ESTATES          (eyebrow)    │  ← 11px, uppercase, letter-spacing, secondary
│                                      │
│  12                     (value)      │  ← 28px, semibold, text-primary
│                                      │
│  +2 this month  ↑       (delta)      │  ← 12px, success-text (if positive)
└──────────────────────────────────────┘

background: --color-surface
border: 1px solid --color-border
border-radius: 10px
padding: 20px 24px
```

Delta colour rules:
- Positive number: `--color-success-text`
- Negative number: `--color-danger-text`
- Neutral / no delta: omit the delta line entirely

Icon (optional): top-right of card, `20px`, `--color-text-disabled`. Lucide icon matching the metric. Never coloured.

### 7.2 Data Table

```
┌──────────────────────────────────────────────────────────────────┐
│  NAME          ESTATE        STATUS      DATE          ACTIONS   │  ← header row
│  ──────────────────────────────────────────────────────────────  │
│  Thandi M.     Hillcrest     ● Active    12 Jun 2026   View →    │  ← data row
│  ──────────────────────────────────────────────────────────────  │
│  James K.      Silverwood    ● Suspended 3 Jun 2026    View →    │
└──────────────────────────────────────────────────────────────────┘
```

```css
/* Table container */
.table-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  width: 100%;
}

/* Header row */
.table-header {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-secondary);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-2);
}

/* Data row */
.table-row {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
  color: var(--color-text-primary);
  background: var(--color-bg);
  transition: background 100ms;
}

.table-row:last-child {
  border-bottom: none;
}

/* Hover — only on clickable rows */
.table-row.clickable:hover {
  background: var(--color-surface-2);
  cursor: pointer;
}
```

**Column alignment:**
- Text columns: left-aligned
- Number columns: right-aligned
- Status badges: left-aligned
- Action buttons: right-aligned

### 7.3 Badge

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

/* Dot before label */
.badge::before {
  content: '●';
  font-size: 7px;
}

/* Variants */
.badge-success  { background: var(--color-success-muted);  color: var(--color-success-text); }
.badge-warning  { background: var(--color-warning-muted);  color: var(--color-warning-text); }
.badge-danger   { background: var(--color-danger-muted);   color: var(--color-danger-text);  }
.badge-neutral  { background: var(--color-neutral-muted);  color: var(--color-neutral-text); }
```

| Status | Badge Variant |
|---|---|
| Active, Online, Operational, Resolved | `badge-success` |
| In Progress, Pending, Issues | `badge-warning` |
| Offline, Suspended, Expired, Error | `badge-danger` |
| Unknown, Inactive, N/A | `badge-neutral` |

### 7.4 Buttons

```css
/* Base */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 150ms, opacity 150ms, border-color 150ms;
  white-space: nowrap;
}

/* Primary */
.btn-primary {
  background: var(--color-accent);
  color: var(--color-white);
}
.btn-primary:hover { background: var(--color-accent-hover); }

/* Danger */
.btn-danger {
  background: var(--color-danger);
  color: var(--color-white);
}
.btn-danger:hover { background: #B91C1C; }

/* Ghost */
.btn-ghost {
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}
.btn-ghost:hover {
  background: var(--color-surface-2);
  color: var(--color-text-primary);
  border-color: var(--color-border-strong);
}

/* Disabled */
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

**Button size rule:** All buttons in the page header are standard size (as above). Buttons inside table rows or dense panels use a smaller padding: `padding: 5px 10px; font-size: 12px`.

### 7.5 Form Inputs

```css
.input {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 7px;
  padding: 9px 12px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: var(--color-text-primary);
  width: 100%;
  transition: border-color 150ms, box-shadow 150ms;
  outline: none;
}

.input::placeholder {
  color: var(--color-text-disabled);
}

.input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(61, 107, 245, 0.12);
}

/* Select dropdown */
select.input {
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* chevron-down icon */
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
  cursor: pointer;
}

/* Form label */
.form-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
  display: block;
}
```

### 7.6 Modal

```
Backdrop: rgba(15, 17, 21, 0.4) — full screen overlay
Modal container:
  background: --color-bg
  border: 1px solid --color-border
  border-radius: 12px
  padding: 28px 32px
  width: 480px (default), 600px (wide variant for multi-field forms)
  max-width: calc(100vw - 48px)
  box-shadow: 0 20px 48px rgba(16, 18, 27, 0.12)
```

Modal header:
- Title: 16px, 600 weight, text-primary
- Close button: top-right, `X` icon, ghost style, `20px` icon

Modal footer:
- Right-aligned row of buttons
- Cancel (Ghost) on the left, Confirm/Submit (Primary or Danger) on the right
- `gap: 8px`

Backdrop click closes the modal. Pressing Escape closes the modal.

### 7.7 Slide-Over Panel

Used for ticket detail and similar contextual views.

```
Backdrop: rgba(15, 17, 21, 0.25)
Panel:
  position: fixed
  top: 0
  right: 0
  height: 100vh
  width: 440px
  background: --color-bg
  border-left: 1px solid --color-border
  padding: 32px 28px
  overflow-y: auto
  z-index: 50
  box-shadow: -16px 0 40px rgba(16, 18, 27, 0.08)
```

Panel slides in from the right with a `transform: translateX` animation — `300ms ease-out`.

Panel header:
- Title: 16px, 600 weight
- Subtitle: 12px, text-secondary
- Close button (X) top-right

Pressing Escape or clicking the backdrop closes the panel.

### 7.8 Toast Notifications

Position: `fixed`, top-right, `top: 20px`, `right: 20px`, `z-index: 100`.

```
┌──────────────────────────────────────┐
│  ✓  Estate created successfully      │  ← success toast
└──────────────────────────────────────┘

background: --color-bg
border: 1px solid --color-border
border-left: 3px solid [semantic colour matching toast type]
border-radius: 8px
padding: 12px 16px
font-size: 13px
font-weight: 500
color: --color-text-primary
box-shadow: 0 8px 24px rgba(16, 18, 27, 0.1)
min-width: 280px
max-width: 360px
```

Toast variants:
- Success: left border `--color-success`
- Error: left border `--color-danger`
- Info: left border `--color-accent`

Auto-dismiss: 4 seconds. Animate in from right (`translateX(110%)`→`translateX(0)`), animate out fading up.

### 7.9 Confirmation Dialog

A modal variant, width: `400px`.

```
┌──────────────────────────────────────────┐
│  Delete this post?                       │  ← 16px, 600, text-primary
│                                          │
│  This action cannot be undone.           │  ← 14px, text-secondary
│  The post will be permanently removed    │
│  from the community board.               │
│                                          │
│                    [Cancel]  [Delete]    │  ← Ghost + Danger buttons
└──────────────────────────────────────────┘
```

- The title always names the specific item or action.
- The description always states the consequence.
- Confirm button is always Danger variant for destructive actions.
- Cancel is always the leftmost option.

### 7.10 Empty State

Shown inside any table or section container when there is no data.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              ○  (outline icon, 32px)                 │
│                                                      │
│          No [things] found.               (14px 500) │
│          [Contextual instruction]        (13px muted)│
│                                                      │
└──────────────────────────────────────────────────────┘
padding: 48px 24px
text-align: center
background: --color-surface
```

Empty state icon is always `--color-text-disabled`. Never coloured. Never an emoji.

### 7.11 Loading Skeleton

While data is loading, replace each data element with a skeleton:

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface) 25%,
    var(--color-surface-2) 50%,
    var(--color-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

- Stat card skeleton: two lines (label height + value height) in the card dimensions
- Table skeleton: 5–6 rows, each with columns matching the real table structure

---

## PART 8 — MOTION & INTERACTION

### Rules

1. **Transitions are functional, not decorative.** They exist to prevent jarring jumps. They do not exist to entertain.
2. **Default duration:** `150ms` for colour/background changes, `200ms` for size changes, `300ms` for panels and modals entering.
3. **Easing:** `ease-out` for things entering (modal, slide-over, toast). `ease-in` for things leaving. `ease` for hover states.
4. **No bounce, spring, or elastic easing anywhere.** This is a dashboard, not a game.
5. **Respect `prefers-reduced-motion`:** Wrap all transitions in a media query that disables them when the user has requested it.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Hover states

Every interactive element has a visible hover state. The rule is: hover changes background, not text colour, unless the element is a link or a nav item.

### Focus states

Every interactive element has a visible focus ring for keyboard navigation:

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

Never remove focus outlines. Never use `outline: none` without a replacement.

---

## PART 9 — SCROLLBARS

Custom scrollbars on the main content area and any scrollable panels:

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border-strong);
  border-radius: 999px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-disabled);
}
```

---

## PART 10 — CSS CUSTOM PROPERTIES MASTER FILE

Put all tokens in a single `:root` block in `globals.css`. Every component references these tokens, never hardcoded hex values.

```css
:root {
  /* Base */
  --color-bg:             #FFFFFF;
  --color-surface:        #FAFAFB;
  --color-surface-2:      #F2F3F5;
  --color-border:         #E6E7EB;
  --color-border-strong:  #D3D5DC;

  /* Text */
  --color-text-primary:   #16181D;
  --color-text-secondary: #6B7280;
  --color-text-disabled:  #B0B3BD;

  /* Accent */
  --color-accent:         #3D6BF5;
  --color-accent-hover:   #2F59D6;
  --color-accent-muted:   #EEF2FE;
  --color-accent-text:    #3D6BF5;

  /* Semantic */
  --color-success:        #16A34A;
  --color-success-muted:  #EAFBF0;
  --color-success-text:   #15803D;

  --color-warning:        #D97706;
  --color-warning-muted:  #FEF6E7;
  --color-warning-text:   #B45309;

  --color-danger:         #DC2626;
  --color-danger-muted:   #FDECEC;
  --color-danger-text:    #B91C1C;

  --color-neutral:        #9CA3AF;
  --color-neutral-muted:  #F2F3F5;
  --color-neutral-text:   #6B7280;

  --color-white:          #FFFFFF;

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Radii */
  --radius-sm:  6px;
  --radius-md:  8px;
  --radius-lg:  10px;
  --radius-xl:  12px;
  --radius-full: 999px;

  /* Sidebar */
  --sidebar-width: 240px;
}

/* Base reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: var(--color-accent-text);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
```

---

## PART 11 — RULES FOR GEMINI

1. **Every colour in the UI must reference a CSS custom property from Part 10.** No hardcoded hex values anywhere in component files.
2. **No Tailwind default colour classes** (e.g. `bg-blue-500`, `text-gray-400`). Use CSS variables or extend Tailwind's config to map to the tokens above.
3. **No dark backgrounds anywhere.** Page, sidebar, cards, modals — all light. The only dark colour in the entire UI is `--color-text-primary` (#16181D), used for text.
4. **No box shadows except where explicitly defined** (Part 7: modals, slide-overs, toasts). Cards and tables use a 1px border instead of a shadow — that's the primary depth cue in this design.
5. **No gradients on interactive elements.** No gradient buttons. No gradient cards. Gradients exist only in the loading skeleton animation.
6. **No border-radius above 12px on any container.** This is not a consumer app.
7. **Icons are always from `lucide-react`.** No other icon library. Size: 16px for UI icons, 20px for empty state icons. Stroke width: 1.5. Icon colour follows text colour — never the accent, except on active nav items.
8. **Monospace font is used only for codes, IDs, and log timestamps.** Not for headings, labels, or descriptions.
9. **Red (`--color-danger`) is never used decoratively.** It appears only when something is wrong, offline, expired, or dangerous.
10. **Electric blue (`--color-accent`) is the rarest colour on the page.** On a light background it reads as louder than it did on dark. Reach for font-weight and `--color-text-secondary` for hierarchy first; reach for blue only for the one or two things per screen that are genuinely interactive or branded.
11. **Every interactive element has a hover state and a focus-visible state.** No exceptions.
12. **Do not add illustrations, background patterns, or decorative SVGs.** Data is the visual. The interface gets out of the way.

---

*Design System v2.0 — Light, calm, premium. Whitespace as structure. Electric blue accent used sparingly. Hairline borders over shadows. Inter + JetBrains Mono. All tokens in CSS custom properties.*
