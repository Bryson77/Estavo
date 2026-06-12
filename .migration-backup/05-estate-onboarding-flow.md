# Estavo — Estate Onboarding Flow
**Process:** Adding a new estate via Superadmin Portal
**Version:** 1.0 | June 2026

> This document covers the complete backend and frontend process that happens when Bryson (superadmin) presses "Add Estate" in the Superadmin Portal. Every configurable in the system is set here. Nothing is hardcoded — all defaults are estate-specific.

---

## Overview

```
Superadmin presses [Add Estate]
    │
    ▼
6-Step Onboarding Wizard
    │
    Step 1: Estate Profile
    Step 2: Gate Configuration
    Step 3: App Configurables
    Step 4: Resident Import
    Step 5: Staff Setup
    Step 6: Billing (Yoco)
    │
    ▼
Estate goes live
    │
    ▼
Manager completes in-dashboard setup (amenities, contractors, etc.)
```

---

## STEP 1: Estate Profile

```
Estate name:           [text, required]
Physical address:      [text, required]
Province:              [dropdown — GP, WC, KZN, LP, MP, NW, EC, NC, FS]
Number of units:       [number, required]
Google Maps link:      [URL, required]
    ↑ Used in guest code WhatsApp messages and copy button
Security contact no.:  [phone number, required]
    ↑ Shown to residents in Emergency screen "Call Security" button
Estate type:           [dropdown — Residential / Lifestyle / Retirement / Mixed Use]
Website (optional):    [URL]

[Next →]
```

**What this creates in Supabase:**
```sql
INSERT INTO estates (
  name, address, province, unit_count, google_maps_url,
  security_contact_number, estate_type, website, status
) VALUES (...);
-- Returns estate_id (UUID) — used for all subsequent steps
```

---

## STEP 2: Gate Configuration

```
Number of gates:   [1–10 selector]

For each gate:
    Gate name:     [e.g. "Main Entry Gate", "Exit Gate", "Pedestrian Gate"]
    Gate type:     [Vehicle] [Pedestrian] [Boom] [Sliding]
    Hardware IP:   [IP address of Raspberry Pi / relay module on estate network]
    Device key:    [auto-generated UUID — copy and configure on Pi]
    
    [Test Connection] ← pings Pi, returns ● Online / ● Offline

[Add another gate]   [Next →]
```

**Fail state on Test Connection:**
```
⚠️ Cannot reach this hardware. Ensure:
1. Pi is powered and connected to estate network
2. The device key matches the one configured on the Pi
3. Port [X] is open on the estate router
[Retry]   [Skip for now — configure later]
```

**What this creates:**
```sql
INSERT INTO gates (estate_id, name, gate_type, hardware_ip, device_key, status)
VALUES (...) FOR EACH gate;
-- Device key is also stored on Pi's config file
```

**Raspberry Pi config file (placed on Pi during physical installation):**
```json
{
  "estate_id": "uuid",
  "gate_id": "uuid",
  "device_key": "uuid",
  "api_endpoint": "https://api.estavo.co.za/gate/command",
  "heartbeat_interval_seconds": 30
}
```

---

## STEP 3: App Configurables

All values configurable per estate. These drive behaviour across all four app surfaces.

```
── ACCESS & GATE ──────────────────────────────────────────

Gate hold duration (seconds):
    [1.5] ← how long resident must hold to open gate
    Range: 0.5s – 5s

Gate undo window (seconds):
    [5] ← how long "Undo" button is available after gate opens
    Range: 0s – 30s

── EMERGENCY ──────────────────────────────────────────────

Emergency hold duration (seconds):
    [5] ← how long resident must hold emergency button
    Range: 3s – 10s

Emergency undo window (seconds):
    [5] ← how long "Undo" available after emergency fires
    Range: 0s – 60s

── GUEST ACCESS ───────────────────────────────────────────

Guest code format:
    Length:   [4] characters
    Type:     [Alphanumeric] [Numeric only]
    e.g.: A8F2 (alphanumeric, 4) or 4821 (numeric, 4)

Max active guest codes per resident:
    [10]
    Range: 1 – 50

Guest code max validity period:
    [30] days
    Range: 1 – 365 days

Require guest ID number on entry:
    [Off] ← if On, security is prompted to capture ID before admitting

── GOVERNANCE ─────────────────────────────────────────────

Approval threshold (ZAR):
    [5000] ← expenses above this amount require trustee approval

Votes required for approval:
    [2] trustees must approve

Quote minimum:
    [3] quotes required before submitting quote request

Emergency auto-notify trustees:
    [On] ← trustees get push/email when emergency fires

Unassigned ticket warning after:
    [12] hours ← escalation banner appears on dashboard

── COMMUNITY ──────────────────────────────────────────────

Community board enabled:         [On]
Anonymous posting allowed:       [On]
Events RSVP enabled:             [On]
Amenities booking enabled:       [Off] ← enable in step 5 or post-launch

[← Back]   [Next →]
```

**What this creates:**
```sql
INSERT INTO estate_config (
  estate_id,
  gate_hold_duration_ms,        -- stored as milliseconds
  gate_undo_window_ms,
  emergency_hold_duration_ms,
  emergency_undo_window_ms,
  guest_code_length,
  guest_code_type,              -- 'alphanumeric' | 'numeric'
  max_active_guest_codes,
  guest_code_max_validity_days,
  require_guest_id,
  approval_threshold_zar,
  votes_required,
  quote_minimum,
  emergency_notify_trustees,
  unassigned_ticket_warning_hours,
  community_board_enabled,
  anonymous_posting_allowed,
  events_rsvp_enabled,
  amenities_enabled
) VALUES (...);
```

---

## STEP 4: Resident Import

```
Method: [Upload CSV] or [Add manually]

── CSV UPLOAD ──────────────────────────────────────────────

Required columns:
    unit_no       (e.g. "001", "12A")
    type          ("owner" or "tenant")
    name          (full name)
    email         (unique, required)

Optional columns:
    phone
    tenant_name   (if unit has both owner and tenant)
    tenant_email

[Upload CSV]
    │
    ▼
Validation preview table:
    Row  | Unit | Type   | Name        | Email       | Status
    1    | 001  | owner  | T. Mokoena  | t@email.com | ✅ Valid
    2    | 002  | tenant | —           | no-email    | ❌ Missing email
    3    | 001  | owner  | Duplicate   | t@email.com | ⚠️ Duplicate unit

Errors shown row by row. Fix CSV and re-upload or skip flagged rows.

[Confirm Import — 118 valid / 2 skipped]
    │
    ▼
Resident records created in Supabase.
Invite emails sent via Resend to all imported residents.

── MANUAL ADD ──────────────────────────────────────────────

[Add Resident] → form:
    Unit number, Type, Name, Email, Phone
    [Save + Add Another]   [Save + Done]
```

**What this creates:**
```sql
-- For each resident:
INSERT INTO profiles (
  estate_id, unit_no, role, name, email, phone, status
) VALUES (...);

-- Trigger: send invite email via Resend
-- Email contains magic link to activate account
```

**Invite email content (sent via Resend):**
```
Subject: You've been invited to [Estate Name] on Estavo

Hi [Name],

[Estate Name] is now on Estavo — a platform to manage your 
gate access, report maintenance, and stay connected with your estate.

Click below to set up your account:
[Activate my account] → magic link

Your unit: [Unit No]
Estate: [Estate Name]

– The Estavo Team
```

---

## STEP 5: Staff Setup

```
[Add Staff Member]

For each staff member:
    Name:     [required]
    Email:    [required]
    Role:     [Security Guard] [Gate Operator] [Maintenance] [Cleaner] [Other]

[Add another]   [Skip for now]   [Next →]
```

Staff accounts created. Invite emails sent. Staff activate via magic link.

**Staff email:**
```
Subject: You've been set up on Estavo Staff — [Estate Name]

Hi [Name],

You've been added as [Role] at [Estate Name] on Estavo.

Click below to activate your Estavo Staff app account:
[Activate account] → magic link

Download the Estavo Staff app:
[App Store]   [Google Play]

– Estavo
```

**What this creates:**
```sql
INSERT INTO profiles (
  estate_id, role, name, email, status
) VALUES (...);
-- role = 'security_guard' | 'gate_operator' | 'maintenance' | 'staff'
```

---

## STEP 6: Billing (Yoco)

```
PLAN SELECTION
── Starter ─────────────────────────────
R[X]/month
Up to 50 units
2 staff accounts
Basic features

── Growth ──────────────────────────────
R[X]/month
Up to 200 units
10 staff accounts
Full features + Governance

── Enterprise ──────────────────────────
Custom pricing
200+ units
Unlimited staff
Custom onboarding

[Select plan]
    │
    ▼
BILLING CONTACT
    Name:          [text]
    Email:         [text]
    Phone:         [text]
    Company name:  [optional]
    
PAYMENT METHOD (Yoco)
    [Connect Yoco account]
    OR
    [Invoice me monthly] ← manual billing for enterprise
    
Billing start date: [today] / [1st of next month]

[Confirm & Launch Estate]
    │
    ▼
```

**Note:** Stripe removed. Billing handled via **Yoco** (ZAR-native, SA payment gateway). For enterprise/manual billing, invoices generated as PDF via Resend.

---

## ESTATE LAUNCH

```
[Confirm & Launch Estate] pressed
    │
    ▼
BACKEND PROCESS (all synchronous, shown as progress):

✅ Estate record created
✅ Gate records created
✅ Estate config saved
✅ Resident records created (N)
✅ Staff records created (N)
✅ Invite emails dispatched (Resend)
✅ Billing record created (Yoco)
✅ Supabase RLS policies verified for estate_id
✅ Estate status set to 'active'
    │
    ▼
SUCCESS SCREEN:

🎉 [Estate Name] is live.

Summary:
    Units:     120
    Residents: 98 imported (22 unregistered)
    Staff:     4 added
    Gates:     2 configured (both online ✅)
    Plan:      Growth · R8,500/month

Next steps:
    → [Set up amenities] (optional)
    → [Add contractors] (optional)
    → [Add trustees] (optional — for Governance)
    → [Open manager app] → deeplink to resident app Unit 00
    → [Go to Dashboard]
```

**Supabase process on estate creation:**
```sql
-- 1. Create estate
INSERT INTO estates (...) RETURNING id;

-- 2. Create estate_config with all configurables
INSERT INTO estate_config (estate_id, ...) VALUES (...);

-- 3. Create gates
INSERT INTO gates (estate_id, name, ...) VALUES (...) x N;

-- 4. Create manager profile
INSERT INTO profiles (estate_id, role='estate_manager', ...) VALUES (...);

-- 5. Create resident profiles
INSERT INTO profiles (estate_id, role='resident', ...) VALUES (...) x N;

-- 6. Create staff profiles  
INSERT INTO profiles (estate_id, role='[staff_role]', ...) VALUES (...) x N;

-- 7. Create billing record
INSERT INTO billing (estate_id, plan, yoco_customer_id, ...) VALUES (...);

-- 8. Set estate status active
UPDATE estates SET status = 'active' WHERE id = estate_id;

-- 9. Dispatch invite emails via Resend (Edge Function call)
-- POST /functions/v1/dispatch-invites { estate_id }
```

---

## POST-LAUNCH: Manager Completes Setup

After Bryson launches the estate, the manager logs into the dashboard and completes:

```
Dashboard → Settings (estate configurables already set, but can edit)

Optional setup items:
    ├── Amenities: add amenity names, time slots, max concurrent bookings
    ├── Contractors: add vetted contractors + trades
    ├── Trustees: invite trustee accounts (for Governance module)
    ├── Weekly task templates: set up recurring staff tasks
    ├── Announcement templates: pre-write common notices
    └── Escalation contacts: add contacts for emergency/incident auto-notify
```

Manager also receives their resident app access (Unit 00) immediately after estate launch — no extra setup needed.

---

## Supabase Table Reference (New Estate Dependencies)

```
estates
estate_config          ← all configurables, FK → estates
gates                  ← hardware config, FK → estates
profiles               ← all users (residents, staff, managers, trustees), FK → estates
billing                ← Yoco billing record, FK → estates
```

RLS on every table scoped by `estate_id`. Verified post-creation.

---

## Checklist Before Pressing "Launch"

```
□ Estate profile complete (name, address, maps link, security number)
□ At least 1 gate configured and online
□ App configurables reviewed (especially emergency hold time)
□ Manager account created and invite sent
□ Residents imported (or at least 1 test resident)
□ Staff added (at least 1 security contact)
□ Billing set up (Yoco connected or invoice agreed)
□ Pi device key matches what's on the hardware
□ Test gate connection shows ● Online
```

---

_v1.0 — Complete onboarding wizard for superadmin. All configurables established here. No hardcoded estate values anywhere in the codebase._
