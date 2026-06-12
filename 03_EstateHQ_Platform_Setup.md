# Estavo — Platform Setup Guide
**Version:** 1.0 | **June 2026**
All steps you can action yourself. No developer required beyond you.

---

## Overview: What You're Setting Up

| Platform | Purpose | Cost |
|---|---|---|
| Supabase (x2) | Database, Auth, Storage, Realtime | Free tier to start |
| Cloudflare Pages | Hosting for Next.js web apps | Free |
| Cloudflare Workers | Edge functions (OTP validation, webhooks) | Free (100k requests/day) |
| Twilio | SMS OTP delivery | ~R 0.18 / SMS |
| Resend | Transactional email | Free up to 3,000/month |
| GitHub | Monorepo source control | Free |
| Turborepo | Monorepo build orchestration | Free (open source) |
| Expo | React Native build + OTA updates | Free to start |

---

## Phase 0: Prerequisites

Before anything:

1. **Register domains:**
   - `estavo.co.za` — production
   - `estavo.dev` — staging/dev (optional but recommended)
   - Register at [domains.co.za](https://www.domains.co.za) or [afrihost.com](https://www.afrihost.com)

2. **Create accounts on all platforms first (no setup yet):**
   - [supabase.com](https://supabase.com) — one account, you'll create two projects
   - [cloudflare.com](https://cloudflare.com) — one account
   - [twilio.com](https://twilio.com)
   - [resend.com](https://resend.com)
   - [github.com](https://github.com) — create organisation: `estavo-dev`
   - [expo.dev](https://expo.dev)

3. **Move your domain DNS to Cloudflare:**
   - In Cloudflare: Add site → enter your domain → follow the nameserver instructions
   - Update nameservers at your registrar to Cloudflare's
   - Takes up to 24 hours to propagate — do this first

---

## Phase 1: Supabase Setup

You need **two Supabase projects**. Do not combine them.

### Project 1: `estavo-app`
Operational data: residents, levies, gate logs, maintenance.

### Project 2: `estavo-platform`
Billing, estate provisioning, superadmin.

---

### 1.1 Create Both Projects

1. Go to [app.supabase.com](https://app.supabase.com)
2. **New Project** → Organisation: Personal (or create an "Estavo" org)
3. **Project 1:**
   - Name: `estavo-app`
   - Database password: Generate a strong one, save it in a password manager
   - Region: **Europe West (eu-west-1)** — closest available to SA at present
   - Plan: Free
4. **Project 2:**
   - Name: `estavo-platform`
   - Same region
5. Wait for both to spin up (~2 min each)

---

### 1.2 Save Your Keys

For each project, go to **Settings → API** and save:

```
# estavo-app
NEXT_PUBLIC_SUPABASE_APP_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_APP_ANON_KEY=eyJ...
SUPABASE_APP_SERVICE_ROLE_KEY=eyJ...   ← NEVER expose this client-side

# estavo-platform
NEXT_PUBLIC_SUPABASE_PLATFORM_URL=https://yyyyyyyyyyyy.supabase.co
NEXT_PUBLIC_SUPABASE_PLATFORM_ANON_KEY=eyJ...
SUPABASE_PLATFORM_SERVICE_ROLE_KEY=eyJ...
```

Store these in:
1. A local `.env.local` file (never commit to git — add to `.gitignore`)
2. Cloudflare Pages environment variables (set up in Phase 3)

---

### 1.3 Configure Auth — `estavo-app`

Go to **Authentication → Settings**:

**Email:**
- Enable email provider: ✅
- Confirm email: ✅
- Secure email change: ✅

**Magic Link (for residents):**
- Magic links are email auth in Supabase — no extra toggle needed
- Residents will receive a login link to their email

**Site URL:**
- Site URL: `https://manage.estavo.co.za`
- Add to Redirect URLs: `https://manage.estavo.co.za/**`, `exp://` (for Expo dev), `estavo://` (for production app deep link)

**Password Settings:**
- Min length: 10
- Require uppercase: ✅
- Require number: ✅
- (For security staff, manager, trustee accounts — not magic link users)

**TOTP (2FA) — for managers, trustees, superadmin:**
1. Go to **Authentication → Sign In Methods**
2. Enable "Multi-factor authentication"
3. Enforce MFA for specific roles via your app's middleware, not Supabase directly (Supabase enables the capability, your app enforces it by role)

**Email Templates:**
Go to **Authentication → Email Templates**. Customise each:

*Magic Link template:*
```
Subject: Your Estavo login link

Hello,

Click the link below to sign in to Estavo. This link expires in 1 hour.

{{ .ConfirmationURL }}

If you didn't request this, ignore this email.

— Estavo
```

*Invite User template:*
```
Subject: You've been added to [Estate Name] on Estavo

Hello,

Your estate manager has added you to Estavo. Click below to set up your account.

{{ .ConfirmationURL }}

This link expires in 72 hours.

— Estavo
```

---

### 1.4 Configure Storage — `estavo-app`

Go to **Storage → New Bucket** and create:

| Bucket Name | Public? | Purpose |
|---|---|---|
| `maintenance-photos` | No | Maintenance request attachments |
| `levy-documents` | No | Levy statements, receipts |
| `notice-attachments` | No | Notice file attachments |
| `estate-documents` | No | Minutes, budgets, compliance docs |
| `profile-photos` | No | Resident profile pictures |

All buckets private — access via signed URLs generated server-side.

**Storage policies (set via SQL Editor — see below).**

---

### 1.5 Run the Database Schema

Go to **SQL Editor** in `estavo-app` and run the following in one block:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS helper
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- CORE TABLES
-- ============================================================

CREATE TABLE estates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  unit_count INTEGER DEFAULT 0,
  subscription_tier TEXT DEFAULT 'starter',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID REFERENCES estates(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  status TEXT DEFAULT 'occupied' CHECK (status IN ('occupied', 'vacant')),
  occupancy_type TEXT DEFAULT 'owner' CHECK (occupancy_type IN ('owner', 'tenant')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  estate_id UUID REFERENCES estates(id),
  unit_id UUID REFERENCES units(id),
  role TEXT NOT NULL CHECK (role IN ('resident', 'security', 'manager', 'trustee', 'superadmin')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE guest_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID REFERENCES estates(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id),
  resident_id UUID REFERENCES profiles(id),
  otp_code TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gate_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID REFERENCES estates(id),
  entry_type TEXT CHECK (entry_type IN ('otp', 'manual', 'permanent', 'dl_scan')),
  guest_name TEXT,
  unit_id UUID REFERENCES units(id),
  otp_id UUID REFERENCES guest_otps(id),
  staff_id UUID REFERENCES profiles(id),
  id_number TEXT,
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  exited_at TIMESTAMPTZ
);

CREATE TABLE levy_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID REFERENCES estates(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC(10,2) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE levy_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID REFERENCES estates(id),
  unit_id UUID REFERENCES units(id),
  type TEXT CHECK (type IN ('charge', 'payment', 'credit', 'penalty')),
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID REFERENCES estates(id),
  unit_id UUID REFERENCES units(id),
  submitted_by UUID REFERENCES profiles(id),
  category TEXT CHECK (category IN ('plumbing', 'electrical', 'common_area', 'security', 'other')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'assigned', 'in_progress', 'resolved', 'closed')),
  assigned_to TEXT,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID REFERENCES estates(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'urgent', 'emergency')),
  attachment_url TEXT,
  created_by UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID REFERENCES estates(id),
  reported_by UUID REFERENCES profiles(id),
  type TEXT,
  description TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gate_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estate_id UUID REFERENCES estates(id) UNIQUE,
  status TEXT DEFAULT 'closed' CHECK (status IN ('open', 'closed', 'locked')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE estates ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE levy_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE levy_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_status ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's estate_id
CREATE OR REPLACE FUNCTION get_my_estate_id()
RETURNS UUID AS $$
  SELECT estate_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: users can read their own estate's profiles; managers see all
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (estate_id = get_my_estate_id());

CREATE POLICY "profiles_insert_manager" ON profiles
  FOR INSERT WITH CHECK (
    get_my_role() IN ('manager', 'superadmin')
    AND estate_id = get_my_estate_id()
  );

-- Units: all estate members can view
CREATE POLICY "units_select" ON units
  FOR SELECT USING (estate_id = get_my_estate_id());

-- Guest OTPs: residents manage own; security + manager read all in estate
CREATE POLICY "otps_resident_insert" ON guest_otps
  FOR INSERT WITH CHECK (
    get_my_role() = 'resident'
    AND estate_id = get_my_estate_id()
    AND resident_id = auth.uid()
  );

CREATE POLICY "otps_resident_select" ON guest_otps
  FOR SELECT USING (
    estate_id = get_my_estate_id()
    AND (resident_id = auth.uid() OR get_my_role() IN ('security', 'manager', 'superadmin'))
  );

-- Gate log: security writes, all estate staff read
CREATE POLICY "gate_log_insert" ON gate_log
  FOR INSERT WITH CHECK (get_my_role() IN ('security', 'manager', 'superadmin'));

CREATE POLICY "gate_log_select" ON gate_log
  FOR SELECT USING (estate_id = get_my_estate_id());

-- Levy: residents see own unit; managers see all
CREATE POLICY "levy_accounts_resident" ON levy_accounts
  FOR SELECT USING (
    estate_id = get_my_estate_id()
    AND (unit_id = (SELECT unit_id FROM profiles WHERE id = auth.uid())
         OR get_my_role() IN ('manager', 'trustee', 'superadmin'))
  );

CREATE POLICY "levy_transactions_resident" ON levy_transactions
  FOR SELECT USING (
    estate_id = get_my_estate_id()
    AND (unit_id = (SELECT unit_id FROM profiles WHERE id = auth.uid())
         OR get_my_role() IN ('manager', 'trustee', 'superadmin'))
  );

CREATE POLICY "levy_transactions_manager_insert" ON levy_transactions
  FOR INSERT WITH CHECK (
    get_my_role() IN ('manager', 'superadmin')
    AND estate_id = get_my_estate_id()
  );

-- Maintenance: residents insert own; all estate members can read; managers update
CREATE POLICY "maintenance_insert" ON maintenance_requests
  FOR INSERT WITH CHECK (estate_id = get_my_estate_id());

CREATE POLICY "maintenance_select" ON maintenance_requests
  FOR SELECT USING (estate_id = get_my_estate_id());

CREATE POLICY "maintenance_update" ON maintenance_requests
  FOR UPDATE USING (get_my_role() IN ('manager', 'superadmin'));

-- Notices: managers write; all estate members read published
CREATE POLICY "notices_select" ON notices
  FOR SELECT USING (
    estate_id = get_my_estate_id()
    AND (published_at IS NOT NULL OR get_my_role() IN ('manager', 'superadmin'))
  );

CREATE POLICY "notices_insert" ON notices
  FOR INSERT WITH CHECK (
    get_my_role() IN ('manager', 'superadmin')
    AND estate_id = get_my_estate_id()
  );

-- Gate status: all estate members read; security + manager update
CREATE POLICY "gate_status_select" ON gate_status
  FOR SELECT USING (estate_id = get_my_estate_id());

CREATE POLICY "gate_status_update" ON gate_status
  FOR UPDATE USING (get_my_role() IN ('security', 'manager', 'superadmin'));

-- ============================================================
-- REALTIME (for gate control)
-- ============================================================
-- Enable Realtime on gate_status table:
-- Go to Database → Replication → enable gate_status
-- (Cannot be done via SQL — do this in the Supabase UI)
```

After running: go to **Database → Replication** in the Supabase UI and enable Realtime for the `gate_status` table.

---

### 1.6 Configure Realtime (Gate Control)

1. Go to **Database → Replication**
2. Find `gate_status` in the tables list
3. Toggle **Realtime** to ON

This is what lets the Raspberry Pi listener receive instant updates when a manager changes gate status.

---

## Phase 2: Resend Setup (Email)

### 2.1 Create Account & Verify Domain

1. Go to [resend.com](https://resend.com) → Sign up
2. Go to **Domains → Add Domain**
3. Enter: `estavo.co.za`
4. Resend will give you DNS records to add. Copy them.

### 2.2 Add DNS Records in Cloudflare

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Select your domain → **DNS → Records → Add Record**
3. Add each record Resend provides:
   - Usually: 1x MX record, 2x TXT records (SPF + DMARC), 1x CNAME (DKIM)
4. Back in Resend → click **Verify DNS** — wait 5–10 min for propagation

### 2.3 Get API Key

1. Resend → **API Keys → Create API Key**
2. Name: `estavo-production`
3. Permission: **Full Access**
4. Save the key: `re_xxxxxxxxxxxx`

Add to your env:
```
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@estavo.co.za
```

### 2.4 Email Addresses to Configure

Set up these addresses in your domain's email routing (Cloudflare Email Routing or forward to your iCloud):

| Address | Purpose |
|---|---|
| `noreply@estavo.co.za` | Transactional sends (Resend) |
| `support@estavo.co.za` | Customer support |
| `billing@estavo.co.za` | Billing enquiries |

**Cloudflare Email Routing** (free, no mail server needed):
1. Cloudflare dashboard → **Email → Email Routing**
2. Add routing rules: `support@estavo.co.za` → forward to your personal email

---

## Phase 3: Cloudflare Setup

### 3.1 Cloudflare Pages — Manager Dashboard

1. **GitHub:** Create repo `estavo-web` in your `estavo-dev` org
2. **Cloudflare:** Go to **Workers & Pages → Create → Pages → Connect to Git**
3. Select the `estavo-web` repo
4. Build settings:
   - Build command: `pnpm run build --filter=@estavo/manager`
   - Build output directory: `apps/manager/.next`
   - Root directory: `/` (Turborepo handles workspace)
5. **Environment Variables** → add all your `.env.local` values here
6. After deploy, go to **Custom Domains → Add Domain**: `manage.estavo.co.za`
7. Cloudflare will auto-create the DNS record and SSL cert

### 3.2 Cloudflare Workers — OTP Validation

This worker validates guest OTPs at the gate without exposing Supabase service keys to the mobile app.

1. **Install Wrangler** (Cloudflare CLI):
```bash
npm install -g wrangler
wrangler login
```

2. **Create worker project:**
```bash
wrangler init estavo-otp-validator
cd estavo-otp-validator
```

3. **Worker logic** (`src/index.ts`):
```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { otp_code, estate_id } = await request.json() as {
      otp_code: string;
      estate_id: string;
    };

    if (!otp_code || !estate_id) {
      return new Response(JSON.stringify({ valid: false, error: 'Missing fields' }), { status: 400 });
    }

    // Query Supabase via REST API
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/guest_otps?otp_code=eq.${otp_code}&estate_id=eq.${estate_id}&used_at=is.null&revoked_at=is.null&valid_until=gte.${new Date().toISOString()}&select=id,guest_name,unit_id,valid_until`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    const data = await res.json() as any[];

    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ valid: false, error: 'OTP not found or expired' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const otp = data[0];

    // Mark as used
    await fetch(
      `${env.SUPABASE_URL}/rest/v1/guest_otps?id=eq.${otp.id}`,
      {
        method: 'PATCH',
        headers: {
          apikey: env.SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ used_at: new Date().toISOString() }),
      }
    );

    return new Response(
      JSON.stringify({ valid: true, guest_name: otp.guest_name, unit_id: otp.unit_id }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  },
};

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}
```

4. **Set secrets:**
```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_KEY
```

5. **Deploy:**
```bash
wrangler deploy
```

6. **Custom route:** In Cloudflare, add route `api.estavo.co.za/otp/validate` → points to this worker.

### 3.3 Subdomains to Configure in Cloudflare DNS

| Subdomain | Points To | Purpose |
|---|---|---|
| `manage.estavo.co.za` | Cloudflare Pages | Manager dashboard |
| `admin.estavo.co.za` | Cloudflare Pages | Superadmin portal |
| `api.estavo.co.za` | Cloudflare Workers | API routes |
| `estavo.co.za` | Cloudflare Pages | Marketing landing page |

All added as CNAME records pointing to your Cloudflare Pages project URL, or auto-created when you add custom domains in Pages.

---

## Phase 4: Twilio Setup (SMS OTPs)

### 4.1 Create Account & Get a Number

1. Go to [twilio.com](https://twilio.com) → Sign up
2. Verify your phone number
3. Go to **Phone Numbers → Buy a Number**
4. Search for a South African number (+27) — select one with SMS capability
5. Purchase it (~$1/month)

### 4.2 Get Credentials

**Console Dashboard:**
- Account SID: `ACxxxxxxxxxxxxxxxx`
- Auth Token: `xxxxxxxxxxxxxxxx` (click to reveal)

Add to env:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=+27XXXXXXXXX
```

### 4.3 Test SMS Send

In Twilio console → **Messaging → Try it out → Send an SMS**. Send a test to your own number.

### 4.4 Upgrade Account (Before Going Live)

Free trial accounts can only send to verified numbers. Before onboarding any estate:
1. Add a credit card to Twilio
2. Upgrade to a paid account (you only pay per SMS sent)
3. Load R 200–500 as a starting balance

**SMS cost:** ~R 0.15–0.20 per SMS to SA numbers. At 1,000 OTPs/month: ~R 180. Low.

---

## Phase 5: Turborepo Monorepo Setup

### 5.1 Initialise Monorepo

```bash
npx create-turbo@latest estavo --package-manager pnpm
cd estavo
```

### 5.2 Repo Structure

```
estavo/
├── apps/
│   ├── manager/          ← Next.js manager dashboard
│   ├── superadmin/       ← Next.js superadmin portal
│   ├── resident/         ← Expo React Native resident app
│   └── security/         ← Expo React Native security app
├── packages/
│   ├── database/         ← Supabase client + TypeScript types
│   ├── ui/               ← Shared React Native + web components
│   ├── utils/            ← OTP generation, formatters, validators
│   └── config/           ← Shared ESLint, TypeScript configs
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

### 5.3 `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 5.4 `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {}
  }
}
```

### 5.5 Shared Database Package

In `packages/database/`:

```bash
cd packages/database
pnpm add @supabase/supabase-js
```

`src/client.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types'; // generated types

export const supabaseApp = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_APP_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_APP_ANON_KEY!
);

export const supabasePlatform = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_PLATFORM_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PLATFORM_ANON_KEY!
);
```

**Generate TypeScript types from Supabase:**
```bash
npx supabase gen types typescript \
  --project-id YOUR_APP_PROJECT_ID \
  --schema public \
  > packages/database/src/types.ts
```

Get your project ID from Supabase → Settings → General.

---

## Phase 6: Expo Setup (Mobile Apps)

### 6.1 EAS Account

1. Go to [expo.dev](https://expo.dev) → Create account
2. Create organisation: `estavo`
3. Install EAS CLI:
```bash
npm install -g eas-cli
eas login
```

### 6.2 Initialise Expo Apps

For each mobile app (`apps/resident` and `apps/security`):

```bash
cd apps/resident
npx create-expo-app . --template blank-typescript
eas init --id YOUR_EAS_PROJECT_ID
```

### 6.3 `eas.json` (build profiles)

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 6.4 Environment Variables in Expo

Use `expo-constants` with a `.env` file. Install:
```bash
pnpm add expo-constants
```

Create `apps/resident/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_OTP_VALIDATOR_URL=https://api.estavo.co.za/otp/validate
```

All `EXPO_PUBLIC_` prefixed vars are safe to bundle in the client.

---

## Phase 7: GitHub Repository Setup

### 7.1 Create Repos

Go to github.com → New repository:
- `estavo-dev/estavo` — main monorepo (private)
- `estavo-dev/estavo-hardware` — Raspberry Pi code (private)

### 7.2 Branch Strategy

```
main          ← production-ready only
staging       ← pre-production, mirrors what's live on Cloudflare staging
dev           ← active development
feature/*     ← individual feature branches
```

**Branch protection on `main`:**
1. GitHub → repo → Settings → Branches → Add Rule
2. Branch name pattern: `main`
3. Enable: "Require pull request before merging", "Require 1 approval" (even if it's just you doing a self-review)

### 7.3 `.gitignore` (critical)

```
.env
.env.local
.env.*.local
.next/
node_modules/
.turbo/
*.log
.DS_Store
```

**Never commit `.env` files. Ever.**

---

## Phase 8: Raspberry Pi Hardware Setup

### 8.1 Hardware Requirements

- Raspberry Pi 4 (2GB+ RAM) — ~R 1,200
- Relay module (2-channel) — ~R 120
- MicroSD card (32GB) — ~R 200
- Enclosure (weatherproof for outdoor gate mounting) — ~R 300

### 8.2 Pi OS Setup

1. Download [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. Flash **Raspberry Pi OS Lite (64-bit)** to SD card
3. Before ejecting: in Imager settings, enable SSH, set hostname `estavo-gate`, set a strong password, configure Wi-Fi (the estate's network)

### 8.3 Pi Listener Script

SSH into the Pi, then:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-pip -y
pip3 install supabase RPi.GPIO
```

Create `/home/pi/gate_listener.py`:
```python
import RPi.GPIO as GPIO
import time
from supabase import create_client

# Gate relay on GPIO pin 18
RELAY_PIN = 18
GPIO.setmode(GPIO.BCM)
GPIO.setup(RELAY_PIN, GPIO.OUT, initial=GPIO.HIGH)  # HIGH = relay off (gate closed)

SUPABASE_URL = "https://your-app-project.supabase.co"
SUPABASE_KEY = "your-service-role-key"  # Store in env var in production

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
ESTATE_ID = "your-estate-uuid-here"

def open_gate():
    print("Opening gate...")
    GPIO.output(RELAY_PIN, GPIO.LOW)   # LOW = relay on = gate motor triggered
    time.sleep(2)                       # Hold relay for 2 seconds (motor pulse)
    GPIO.output(RELAY_PIN, GPIO.HIGH)  # Release relay

def on_gate_status_change(payload):
    new_status = payload['new']['status']
    if new_status == 'open':
        open_gate()

# Subscribe to Realtime
channel = supabase.realtime.channel('gate_control')
channel.on(
    'postgres_changes',
    event='UPDATE',
    schema='public',
    table='gate_status',
    filter=f'estate_id=eq.{ESTATE_ID}',
    callback=on_gate_status_change
)

channel.subscribe()
supabase.realtime.connect()

print(f"Gate listener active for estate {ESTATE_ID}")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    GPIO.cleanup()
```

### 8.4 Auto-Start on Boot

```bash
sudo nano /etc/systemd/system/gate-listener.service
```

```ini
[Unit]
Description=Estavo Gate Listener
After=network.target

[Service]
ExecStart=/usr/bin/python3 /home/pi/gate_listener.py
WorkingDirectory=/home/pi
StandardOutput=journal
StandardError=journal
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable gate-listener
sudo systemctl start gate-listener
sudo systemctl status gate-listener
```

---

## Phase 9: Environment Variables Master Reference

Keep this filled out in your password manager. **Never commit to git.**

```bash
# ── Supabase App ────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_APP_URL=
NEXT_PUBLIC_SUPABASE_APP_ANON_KEY=
SUPABASE_APP_SERVICE_ROLE_KEY=

# ── Supabase Platform ───────────────────────────────────
NEXT_PUBLIC_SUPABASE_PLATFORM_URL=
NEXT_PUBLIC_SUPABASE_PLATFORM_ANON_KEY=
SUPABASE_PLATFORM_SERVICE_ROLE_KEY=

# ── Resend ──────────────────────────────────────────────
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@estavo.co.za

# ── Twilio ──────────────────────────────────────────────
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# ── App Config ──────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://manage.estavo.co.za
NEXT_PUBLIC_OTP_VALIDATOR_URL=https://api.estavo.co.za/otp/validate
NODE_ENV=production
```

---

## Setup Checklist

```
□ Domains registered and DNS moved to Cloudflare
□ Supabase: estavo-app project created
□ Supabase: estavo-platform project created
□ Supabase: Auth configured (magic link, TOTP enabled, email templates)
□ Supabase: Storage buckets created
□ Supabase: Database schema + RLS run successfully
□ Supabase: Realtime enabled on gate_status
□ Resend: Domain verified, API key saved
□ Cloudflare: Email routing configured
□ Cloudflare: Pages project created and connected to GitHub
□ Cloudflare: OTP validator Worker deployed
□ Cloudflare: All subdomains configured (manage, admin, api)
□ Twilio: Phone number purchased, account upgraded to paid
□ GitHub: Monorepo created, branch protection on main
□ Turborepo: Workspace structure initialised
□ Expo: EAS account created, apps initialised
□ Raspberry Pi: OS installed, listener script running as service
□ All env vars added to Cloudflare Pages (not just local .env)
```

---

*Work through each phase in order. Don't skip ahead — later phases depend on earlier ones being done correctly.*
