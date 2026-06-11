\#\# TABLE OF CONTENTS

1\. Architecture Overview  
2\. Folder Structure  
3\. Tech Stack  
4\. Estate Isolation — How It Works  
5\. Database Schema (Full Production)  
6\. Row-Level Security Policies  
7\. Auth System  
8\. Edge Functions  
9\. Gate Hardware Integration  
10\. Notification System  
11\. File Storage  
12\. Realtime Subscriptions  
13\. Rate Limiting  
14\. Audit Logging  
15\. POPIA & Data Compliance  
16\. Security Hardening (Full)  
17\. Error Taxonomy  
18\. CI/CD & Deployment

\---

\#\# 1\. ARCHITECTURE OVERVIEW

EstateHQ operates on a dual-database architecture. Two completely separate Supabase projects. No shared tables. No shared auth. No shared connections.

\`\`\`  
┌─────────────────────────────────────────────────────────┐  
│  ESTATEHQ-APP (Supabase Project 1 — EU West Frankfurt)  │  
│                                                         │  
│  All estate operational data                            │  
│  Residents, staff, managers, trustees                   │  
│  Gate logs, guest codes, emergency alerts               │  
│  Maintenance reports, tasks, shifts                     │  
│  Community posts, events, amenity bookings              │  
│  Approval requests, documents, meetings                 │  
│  Performance snapshots, contractors                     │  
│                                                         │  
│  RLS enforced on every table                            │  
│  estate\_id on every row                                 │  
│  Realtime scoped to estate\_id                           │  
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐  
│  ESTATEHQ-OPS (Supabase Project 2 — EU West Frankfurt)  │  
│                                                         │  
│  Internal operations only                               │  
│  Superadmin user accounts                               │  
│  Leads (intake form submissions)                        │  
│  Audit logs (all admin actions — immutable)             │  
│  System health and failure logs                         │  
│  Onboarding progress records                            │  
└─────────────────────────────────────────────────────────┘  
\`\`\`

\*\*Why two projects:\*\*  
If \`estatehq-app\` is ever compromised, the internal audit trail and operator data in \`estatehq-ops\` is untouched on a completely separate project with separate credentials. Support staff access \`estatehq-ops\` without ever touching production estate data unless explicitly granted.

\*\*The service role key for \`estatehq-app\`\*\* lives exclusively in \`estatehq-ops\` server-side Next.js functions. It is never in a browser, never in a mobile app, never in an environment variable that a client can read.

\---

\#\# 2\. FOLDER STRUCTURE

\`\`\`  
estatehq/                               ← Turborepo monorepo root  
│  
├── apps/  
│   ├── resident/                       ← React Native (Expo) — iOS \+ Android  
│   │   ├── app/                        ← Expo Router file-based routing  
│   │   │   ├── (auth)/                 ← Auth screens (magic link, password setup)  
│   │   │   ├── (tabs)/                 ← Main tab navigation  
│   │   │   │   ├── home.tsx  
│   │   │   │   ├── gate.tsx  
│   │   │   │   ├── guests.tsx  
│   │   │   │   └── reports.tsx  
│   │   │   └── \_layout.tsx  
│   │   ├── components/                 ← Screen-specific components  
│   │   ├── hooks/                      ← Custom hooks (useGate, useGuests, etc.)  
│   │   ├── stores/                     ← Zustand stores (auth, gate, guests)  
│   │   └── app.config.ts  
│   │  
│   ├── security/                       ← React Native (Expo) — same structure as resident  
│   │   ├── app/  
│   │   │   ├── (auth)/  
│   │   │   ├── (tabs)/  
│   │   │   │   ├── home.tsx  
│   │   │   │   ├── gates.tsx  
│   │   │   │   ├── alerts.tsx  
│   │   │   │   └── logs.tsx  
│   │   │   └── \_layout.tsx  
│   │   ├── components/  
│   │   ├── hooks/  
│   │   └── stores/  
│   │  
│   ├── staff/                          ← React Native (Expo)  
│   │   ├── app/  
│   │   │   ├── (auth)/  
│   │   │   ├── (tabs)/  
│   │   │   │   ├── home.tsx  
│   │   │   │   ├── reports.tsx  
│   │   │   │   ├── tasks.tsx  
│   │   │   │   └── weekly.tsx  
│   │   │   └── \_layout.tsx  
│   │   ├── components/  
│   │   ├── hooks/  
│   │   └── stores/  
│   │  
│   ├── management/                     ← Next.js 14 (App Router)  
│   │   ├── app/  
│   │   │   ├── (auth)/  
│   │   │   │   └── login/  
│   │   │   ├── (dashboard)/            ← Protected routes  
│   │   │   │   ├── dashboard/  
│   │   │   │   ├── residents/  
│   │   │   │   ├── staff/  
│   │   │   │   ├── reports/  
│   │   │   │   ├── alerts/  
│   │   │   │   ├── gate-logs/  
│   │   │   │   ├── community/  
│   │   │   │   ├── tasks/  
│   │   │   │   ├── amenities/  
│   │   │   │   ├── contractors/  
│   │   │   │   ├── approvals/  
│   │   │   │   ├── billing/  
│   │   │   │   └── settings/  
│   │   │   ├── trustees/               ← Trustee Portal (same Next.js app, separate route group)  
│   │   │   │   ├── approvals/  
│   │   │   │   ├── overview/  
│   │   │   │   ├── meetings/  
│   │   │   │   └── documents/  
│   │   │   └── layout.tsx  
│   │   ├── components/  
│   │   │   ├── ui/                     ← shadcn/ui components  
│   │   │   ├── charts/                 ← Recharts wrappers  
│   │   │   ├── tables/                 ← Table components per entity  
│   │   │   └── slideoverpanels/        ← All slide-over panels  
│   │   ├── lib/  
│   │   │   ├── supabase/               ← Supabase client (server \+ client)  
│   │   │   └── stripe/                 ← Stripe helpers  
│   │   └── middleware.ts               ← Route protection \+ role enforcement  
│   │  
│   ├── corporate/                      ← Next.js 14 — corporate.estatehq.co.za  
│   │   ├── app/  
│   │   │   ├── (auth)/  
│   │   │   └── (dashboard)/  
│   │   │       ├── portfolio/  
│   │   │       ├── analytics/  
│   │   │       ├── financials/  
│   │   │       ├── compliance/  
│   │   │       └── managers/  
│   │   ├── components/  
│   │   └── middleware.ts  
│   │  
│   └── superadmin/                     ← Next.js 14 — ops.estatehq.co.za  
│       ├── app/  
│       │   ├── (auth)/  
│       │   └── (ops)/  
│       │       ├── overview/  
│       │       ├── estates/  
│       │       ├── residents/  
│       │       ├── config/  
│       │       ├── reports/  
│       │       ├── leads/  
│       │       ├── billing/  
│       │       ├── business/  
│       │       └── team/  
│       ├── components/  
│       └── middleware.ts  
│  
├── packages/  
│   ├── supabase/                       ← Shared Supabase utilities  
│   │   ├── src/  
│   │   │   ├── client.ts               ← createBrowserClient \+ createServerClient  
│   │   │   ├── types.ts                ← Auto-generated from Supabase schema  
│   │   │   ├── queries/                ← Shared query functions  
│   │   │   │   ├── residents.ts  
│   │   │   │   ├── gates.ts  
│   │   │   │   ├── reports.ts  
│   │   │   │   └── ...  
│   │   │   └── helpers/  
│   │   │       ├── rls.ts              ← RLS testing utilities  
│   │   │       └── pagination.ts       ← Cursor-based pagination helpers  
│   │   └── package.json  
│   │  
│   ├── ui/                             ← Shared design tokens \+ components  
│   │   ├── src/  
│   │   │   ├── tokens/  
│   │   │   │   ├── colours.ts  
│   │   │   │   ├── typography.ts  
│   │   │   │   └── spacing.ts  
│   │   │   ├── components/  
│   │   │   │   ├── HoldButton.tsx      ← Gate open hold button  
│   │   │   │   ├── StatusBadge.tsx  
│   │   │   │   ├── MonoLabel.tsx  
│   │   │   │   ├── SkeletonBlock.tsx  
│   │   │   │   ├── AuditNote.tsx       ← "✓ Logged" microcopy  
│   │   │   │   ├── GateStatusDot.tsx  
│   │   │   │   └── EmergencyCard.tsx  
│   │   │   └── index.ts  
│   │   └── package.json  
│   │  
│   ├── utils/                          ← Shared utilities  
│   │   ├── src/  
│   │   │   ├── dates.ts                ← SA date/time formatting (Africa/Johannesburg)  
│   │   │   ├── validation.ts           ← Zod schemas for all entities  
│   │   │   ├── errors.ts               ← Error type taxonomy  
│   │   │   ├── csv.ts                  ← CSV/XLSX parsing (BOM strip, Windows line endings)  
│   │   │   └── constants.ts  
│   │   └── package.json  
│   │  
│   └── config/                         ← Shared configuration  
│       ├── eslint.js  
│       ├── tsconfig.json               ← TypeScript strict base  
│       ├── tailwind.js                 ← Shared Tailwind config \+ design tokens  
│       └── package.json  
│  
├── supabase/                           ← Supabase local dev \+ migrations  
│   ├── migrations/                     ← All schema migrations in order  
│   │   ├── 0001\_initial\_schema.sql  
│   │   ├── 0002\_rls\_policies.sql  
│   │   ├── 0003\_governance\_tables.sql  
│   │   └── ...  
│   ├── functions/                      ← All Edge Functions  
│   │   ├── trigger-gate/  
│   │   │   └── index.ts  
│   │   ├── send-guest-code-whatsapp/  
│   │   │   └── index.ts  
│   │   ├── expire-guest-codes/  
│   │   │   └── index.ts  
│   │   ├── escalate-reports/  
│   │   │   └── index.ts  
│   │   ├── send-push-notification/  
│   │   │   └── index.ts  
│   │   ├── classify-report/  
│   │   │   └── index.ts  
│   │   ├── generate-approval-summary/  
│   │   │   └── index.ts  
│   │   ├── cast-approval-vote/  
│   │   │   └── index.ts  
│   │   ├── compute-estate-performance/  
│   │   │   └── index.ts  
│   │   ├── stripe-webhook/  
│   │   │   └── index.ts  
│   │   └── cleanup-expired-data/  
│   │       └── index.ts  
│   └── config.toml  
│  
├── .github/  
│   └── workflows/  
│       ├── deploy-management.yml  
│       ├── deploy-corporate.yml  
│       ├── deploy-superadmin.yml  
│       └── eas-build.yml  
│  
├── turbo.json  
├── package.json  
└── TASK.md                             ← Claude Code session handoff notes  
\`\`\`

\---

\#\# 3\. TECH STACK

| Layer | Tool | Version | Notes |  
|---|---|---|---|  
| Mobile apps | React Native (Expo) | SDK 52 | iOS \+ Android, single codebase per app |  
| Web apps | Next.js | 14 (App Router) | Management, Corporate, Ops |  
| Monorepo | Turborepo | Latest | Shared packages across all apps |  
| Language | TypeScript | 5.x strict | All apps, all packages, no JavaScript |  
| Auth \+ DB | Supabase | Latest | \`estatehq-app\` project, EU West |  
| Admin DB | Supabase | Latest | \`estatehq-ops\` project, EU West |  
| File storage | Supabase Storage | — | Report photos, logos, documents |  
| Realtime | Supabase Realtime | — | Emergency alerts, gate logs, reports |  
| Edge Functions | Supabase Edge Functions (Deno) | — | Gate trigger, notifications, AI, cron |  
| Gate hardware | Raspberry Pi Zero 2W \+ relay | — | On-estate, GPIO fires relay |  
| Gate scanner | Rugged Android (Ulefone/Doogee) | — | Replaces proprietary scanner hardware |  
| WhatsApp | Twilio WhatsApp API | — | Guest code delivery |  
| Email | Resend | — | All transactional email |  
| Push | Expo Push Notifications | — | Emergency, alerts, gate events |  
| Payments | Stripe | — | Subscriptions, invoices, customer portal |  
| AI | Claude API (Anthropic) | claude-haiku-4-5 / claude-sonnet-4 | Report classification, approval summaries |  
| CDN \+ WAF | Cloudflare Pro | — | All web properties |  
| Zero Trust | Cloudflare Access | — | Ops portal only |  
| Web hosting | Vercel | — | Management, Corporate, Ops |  
| Marketing | Cloudflare Pages | — | estatehq.co.za |  
| CI/CD | GitHub Actions \+ Vercel \+ EAS | — | Auto-deploy on push |  
| Input validation | Zod | Latest | All API inputs, all Edge Functions |  
| State (mobile) | Zustand | Latest | Lightweight, no Redux |  
| State (web) | React Query (TanStack) | v5 | Server state, cache, optimistic updates |

\---

\#\# 4\. ESTATE ISOLATION — HOW IT WORKS

This is the most critical security concept in EstateHQ. Every estate's data is completely isolated from every other estate. This is enforced at four layers simultaneously.

\#\#\# Layer 1 — Database (Row-Level Security)

Every table in \`estatehq-app\` has \`estate\_id UUID NOT NULL\`. RLS policies are enabled on every table with default deny — if no policy matches, the query returns zero rows.

\`\`\`sql  
\-- Example: residents table  
\-- Estate A's manager CANNOT query Estate B's residents  
\-- Even if they know Estate B's UUID  
\-- Even if they call the API directly  
\-- Even if the app has a bug

CREATE POLICY "residents\_estate\_scoped"  
ON users FOR SELECT  
USING (estate\_id \= auth\_estate\_id());  
\-- auth\_estate\_id() returns the estate\_id from the authenticated user's JWT  
\-- If the JWT doesn't match, zero rows returned — not an error, just zero rows  
\`\`\`

This is not application-level filtering. This is Postgres enforcing isolation before the query result is even assembled. The application cannot override it.

\#\#\# Layer 2 — JWT Claims

Every user's session token contains their \`estate\_id\` and \`role\` as custom claims. These are set by Supabase Auth on login and cannot be modified by the client. Every RLS policy reads from \`auth.uid()\` and the JWT claims — not from the request body.

\`\`\`typescript  
// User's JWT payload (simplified)  
{  
  sub: "user-uuid",  
  estate\_id: "estate-uuid",  // injected by Supabase hook on login  
  role: "resident",           // injected by Supabase hook on login  
  exp: 1234567890  
}  
\`\`\`

\#\#\# Layer 3 — Application (Middleware)

Next.js middleware validates the session on every request before the route handler runs. If the session is expired, invalid, or the role doesn't match the route, the user is redirected to login. This is a UX layer — it does not replace RLS.

\`\`\`typescript  
// apps/management/middleware.ts  
export async function middleware(request: NextRequest) {  
  const session \= await getSession(request)  
  if (\!session) return redirect('/login')  
  if (\!\['manager', 'supervisor'\].includes(session.role)) return redirect('/unauthorized')  
  // RLS handles estate isolation — middleware handles role access  
}  
\`\`\`

\#\#\# Layer 4 — Realtime Subscriptions

All Supabase Realtime subscriptions are scoped to \`estate\_id\`. A manager at Estate A cannot receive realtime events from Estate B even if they somehow constructed the subscription URL manually — RLS applies to Realtime too.

\`\`\`typescript  
// Always scoped — never subscribe to full table  
const subscription \= supabase  
  .channel(\`emergency\_alerts:estate\_id=eq.${estateId}\`)  
  .on('postgres\_changes', {  
    event: 'INSERT',  
    schema: 'public',  
    table: 'emergency\_alerts',  
    filter: \`estate\_id=eq.${estateId}\`  // RLS \+ filter \= double protection  
  }, handler)  
  .subscribe()  
\`\`\`

\#\#\# What Happens if RLS is Misconfigured

The \`packages/supabase/src/helpers/rls.ts\` file contains test functions that verify isolation. These are run in CI before every production deployment:

\`\`\`typescript  
// Cross-estate query must return 0 rows — always  
export async function testCrossEstateIsolation(  
  estateAUserId: string,  
  estateBId: string  
): Promise\<boolean\> {  
  const client \= createClientWithUser(estateAUserId)  
  const { data } \= await client  
    .from('users')  
    .select('id')  
    .eq('estate\_id', estateBId)  
  return data?.length \=== 0 // must be true  
}  
\`\`\`

\*\*If this test fails, the CI pipeline blocks the deployment.\*\*

\---

\#\# 5\. DATABASE SCHEMA

\#\#\# Schema Design Rules (Enforced)  
\- Every table: \`estate\_id UUID NOT NULL REFERENCES estates(id)\`  
\- Every table: \`created\_at TIMESTAMPTZ DEFAULT now()\`  
\- All list queries: cursor-based pagination, 20 rows default  
\- No \`SELECT \*\` anywhere — columns always specified  
\- Indexes on: \`estate\_id\`, \`user\_id\`, \`created\_at DESC\`, \`status\` on every major table  
\- Soft deletes only: \`status \= 'deleted'\` or \`is\_active \= false\` — never hard DELETE on user data  
\- Immutable tables (logs): INSERT policy only, no UPDATE or DELETE policies

\`\`\`sql  
\-- ══════════════════════════════════════════════════════  
\-- ESTATES  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE estates (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  name text NOT NULL,  
  address text,  
  maps\_link text,  
  logo\_url text,  
  unit\_count int,  
  timezone text DEFAULT 'Africa/Johannesburg',  
  province text,  
  estate\_type text CHECK (estate\_type IN (  
    'gated\_residential','lifestyle\_estate','cluster\_home',  
    'sectional\_title','mixed\_use'  
  )),  
  features jsonb DEFAULT '{  
    "community\_posts": false,  
    "community\_events": false,  
    "amenity\_bookings": false,  
    "weekly\_maintenance": false,  
    "contractor\_directory": false,  
    "emergency\_button": true,  
    "walkin\_gate\_pin": false,  
    "walkin\_gate\_biometric\_info": false,  
    "parcel\_delivery\_codes": true,  
    "non\_emergency\_alert": true,  
    "noise\_complaints": false,  
    "staff\_incident\_reporting": true,  
    "report\_voting": false,  
    "community\_mute\_hours": false,  
    "amenity\_waitlist": false,  
    "amenity\_damage\_reporting": false,  
    "vehicle\_register": false,  
    "vehicle\_register\_mandatory": false,  
    "account\_standing\_flag": false,  
    "document\_library": false,  
    "anonymous\_posts": true,  
    "resident\_chooses\_anonymity": true,  
    "post\_moderation": false,  
    "approval\_requests": true,  
    "trustee\_portal": false,  
    "corporate\_dashboard": false,  
    "management\_broadcasts": true,  
    "email\_resident\_tool": true  
  }',  
  community\_config jsonb DEFAULT '{  
    "mute\_hours\_start": "22:00",  
    "mute\_hours\_end": "07:00"  
  }',  
  guest\_code\_config jsonb DEFAULT '{  
    "available\_durations\_hours": \[2, 6, 12, 24, 48\],  
    "max\_active\_codes\_per\_unit": 10,  
    "max\_active\_codes\_per\_resident": null,  
    "code\_limit\_type": "per\_unit",  
    "allow\_custom\_duration": false,  
    "allow\_extension": true,  
    "max\_extensions": 1,  
    "code\_format": "pin\_and\_qr"  
  }',  
  security\_config jsonb DEFAULT '{  
    "resident\_hold\_seconds": 3,  
    "security\_hold\_seconds": 2,  
    "undo\_window\_seconds": 5,  
    "gate\_rate\_limit\_per\_minute": 10,  
    "emergency\_hold\_seconds": 5,  
    "emergency\_confirmation\_required": false,  
    "false\_alarm\_strikes\_before\_suspension": 3,  
    "emergency\_suspension\_hours": 24  
  }',  
  escalation\_config jsonb DEFAULT '{  
    "unassigned\_threshold\_hours": 12,  
    "open\_threshold\_hours": 48,  
    "manager\_escalation\_hours": 72  
  }',  
  gates jsonb DEFAULT '\[\]',  
  \-- gates: \[{id, label, type: "vehicle"|"pedestrian", access: "resident"|"visitor"|"both",  
  \--          group\_id, group\_label, pi\_ip, pi\_configured: false}\]  
  gate\_groups jsonb DEFAULT '\[\]',  
  \-- gate\_groups: \[{id, label}\]  
  approval\_config jsonb DEFAULT '{  
    "approval\_threshold\_rands": 5000,  
    "votes\_required": 2,  
    "quotes\_required": 3,  
    "notify\_trustees\_on\_emergency": true  
  }',  
  payment\_status text DEFAULT 'active' CHECK (  
    payment\_status IN ('active','overdue','suspended','churned')  
  ),  
  payment\_overdue\_since timestamptz,  
  stripe\_customer\_id text,  
  stripe\_subscription\_id text,  
  monthly\_fee\_rands numeric(10,2),  
  plan\_notes text,  
  status text DEFAULT 'active' CHECK (status IN ('active','suspended','churned','onboarding')),  
  onboarding\_complete boolean DEFAULT false,  
  created\_at timestamptz DEFAULT now()  
);

\-- ══════════════════════════════════════════════════════  
\-- USERS (all roles in one table)  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE users (  
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  first\_name text NOT NULL,  
  last\_name text NOT NULL,  
  email text NOT NULL,  
  phone text,  
  role text NOT NULL CHECK (role IN (  
    'resident','security','maintenance','supervisor',  
    'manager','trustee','corporate\_agent'  
  )),  
  unit\_number text,  
  status text DEFAULT 'active' CHECK (status IN ('active','suspended')),  
  account\_standing text DEFAULT 'good' CHECK (account\_standing IN ('good','arrears')),  
  emergency\_strikes int DEFAULT 0,  
  emergency\_suspended\_until timestamptz,  
  first\_login boolean DEFAULT true,  
  last\_login\_at timestamptz,  
  push\_token text,  
  push\_token\_updated\_at timestamptz,  
  unit\_change\_log jsonb DEFAULT '\[\]',  
  \-- \[{old\_unit, new\_unit, changed\_at, changed\_by}\]  
  created\_at timestamptz DEFAULT now()  
);

CREATE INDEX idx\_users\_estate\_role ON users(estate\_id, role);  
CREATE INDEX idx\_users\_estate\_status ON users(estate\_id, status);  
CREATE INDEX idx\_users\_email ON users(email);

\-- ══════════════════════════════════════════════════════  
\-- GATE LOGS (immutable — INSERT only)  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE gate\_logs (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  gate\_id text NOT NULL,  
  gate\_label text NOT NULL,  
  gate\_group\_id text,  
  gate\_group\_label text,  
  triggered\_by uuid REFERENCES users(id),  
  trigger\_type text NOT NULL CHECK (  
    trigger\_type IN ('resident','security','supervisor','system','manager')  
  ),  
  unit\_number text,  
  actor\_name text,  
  direction text CHECK (direction IN ('entry','exit')),  
  status text DEFAULT 'success' CHECK (  
    status IN ('success','failed','cancelled','timeout','offline\_cache')  
  ),  
  hardware\_response\_ms int,  
  offline\_validated boolean DEFAULT false,  
  created\_at timestamptz DEFAULT now()  
);

CREATE INDEX idx\_gate\_logs\_estate\_created ON gate\_logs(estate\_id, created\_at DESC);  
CREATE INDEX idx\_gate\_logs\_estate\_gate ON gate\_logs(estate\_id, gate\_id);

\-- ══════════════════════════════════════════════════════  
\-- GUEST CODES  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE guest\_codes (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  unit\_id uuid REFERENCES users(id),  
  guest\_first\_name text NOT NULL,  
  guest\_last\_name text NOT NULL,  
  guest\_phone text,  
  is\_parcel boolean DEFAULT false,  
  pin\_code text NOT NULL,  
  qr\_payload text NOT NULL,  
  valid\_from timestamptz DEFAULT now(),  
  valid\_until timestamptz NOT NULL,  
  uses\_total int DEFAULT 3,  
  uses\_remaining int DEFAULT 3,  
  extension\_count int DEFAULT 0,  
  is\_active boolean DEFAULT true,  
  whatsapp\_sent boolean DEFAULT false,  
  whatsapp\_failed boolean DEFAULT false,  
  whatsapp\_failure\_reason text,  
  parcel\_confirmed boolean DEFAULT false,  
  parcel\_confirmed\_by uuid REFERENCES users(id),  
  parcel\_confirmed\_at timestamptz,  
  deactivated\_by uuid REFERENCES users(id),  
  deactivated\_at timestamptz,  
  created\_at timestamptz DEFAULT now()  
);

CREATE INDEX idx\_guest\_codes\_estate\_active ON guest\_codes(estate\_id, is\_active);  
CREATE INDEX idx\_guest\_codes\_pin ON guest\_codes(estate\_id, pin\_code, is\_active);  
CREATE INDEX idx\_guest\_codes\_unit ON guest\_codes(unit\_id);

\-- ══════════════════════════════════════════════════════  
\-- MAINTENANCE REPORTS  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE maintenance\_reports (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  ticket\_number text GENERATED ALWAYS AS (  
    'TKT-' || upper(substring(id::text, 1, 8))  
  ) STORED,  
  submitted\_by uuid REFERENCES users(id),  
  unit\_number text,  
  title text NOT NULL,  
  description text NOT NULL,  
  ai\_category text,  
  ai\_classification text CHECK (  
    ai\_classification IN ('maintenance','security','urgent','redirect\_community','unclear')  
  ),  
  ai\_classification\_confidence numeric(3,2),  
  photo\_url text,  
  photo\_thumbnail\_url text,  
  category text CHECK (category IN ('maintenance','security','urgent','general')),  
  priority text DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),  
  status text DEFAULT 'open' CHECK (  
    status IN ('open','in\_progress','resolved','closed','reopened')  
  ),  
  assigned\_to uuid REFERENCES users(id),  
  escalation\_level int DEFAULT 0,  
  escalated\_at timestamptz,  
  duplicate\_of uuid REFERENCES maintenance\_reports(id),  
  vote\_count int DEFAULT 0,  
  resolved\_at timestamptz,  
  resident\_confirmed\_resolved boolean,  
  created\_at timestamptz DEFAULT now(),  
  updated\_at timestamptz DEFAULT now()  
);

CREATE INDEX idx\_reports\_estate\_status ON maintenance\_reports(estate\_id, status);  
CREATE INDEX idx\_reports\_assigned ON maintenance\_reports(assigned\_to);  
CREATE INDEX idx\_reports\_estate\_created ON maintenance\_reports(estate\_id, created\_at DESC);

\-- ══════════════════════════════════════════════════════  
\-- REPORT STATUS HISTORY (immutable)  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE report\_status\_history (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  report\_id uuid NOT NULL REFERENCES maintenance\_reports(id),  
  status text NOT NULL,  
  changed\_by uuid REFERENCES users(id),  
  note text,  
  is\_internal boolean DEFAULT false,  
  photo\_url text,  
  created\_at timestamptz DEFAULT now()  
);

\-- ══════════════════════════════════════════════════════  
\-- EMERGENCY ALERTS  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE emergency\_alerts (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  emergency\_ref text GENERATED ALWAYS AS (  
    '\#E' || upper(substring(id::text, 1, 4))  
  ) STORED,  
  triggered\_by uuid REFERENCES users(id),  
  trigger\_type text DEFAULT 'resident' CHECK (  
    trigger\_type IN ('resident','security','staff')  
  ),  
  unit\_number text,  
  status text DEFAULT 'active' CHECK (  
    status IN ('active','cancelled','acknowledged','resolved','false\_alarm')  
  ),  
  acknowledged\_by uuid REFERENCES users(id),  
  acknowledged\_at timestamptz,  
  cancelled\_at timestamptz,  
  resolved\_at timestamptz,  
  resolved\_by uuid REFERENCES users(id),  
  resolution\_note text,  
  false\_alarm\_flagged\_by uuid REFERENCES users(id),  
  false\_alarm\_flagged\_at timestamptz,  
  false\_alarm\_reason text,  
  created\_at timestamptz DEFAULT now()  
);

CREATE INDEX idx\_emergency\_estate\_status ON emergency\_alerts(estate\_id, status);

\-- ══════════════════════════════════════════════════════  
\-- TASKS  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE tasks (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  title text NOT NULL,  
  description text,  
  assigned\_to uuid REFERENCES users(id),  
  created\_by uuid REFERENCES users(id),  
  due\_date date,  
  priority text DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),  
  status text DEFAULT 'pending' CHECK (  
    status IN ('pending','in\_progress','completed')  
  ),  
  repeat text DEFAULT 'none' CHECK (repeat IN ('none','daily','weekly')),  
  completion\_note text,  
  completion\_photo\_url text,  
  source\_incident\_id uuid REFERENCES security\_incidents(id),  
  created\_at timestamptz DEFAULT now(),  
  updated\_at timestamptz DEFAULT now()  
);

\-- ══════════════════════════════════════════════════════  
\-- SHIFTS  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE shifts (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  user\_id uuid NOT NULL REFERENCES users(id),  
  started\_at timestamptz DEFAULT now(),  
  ended\_at timestamptz,  
  status text DEFAULT 'active' CHECK (status IN ('active','ended'))  
);

CREATE INDEX idx\_shifts\_estate\_active ON shifts(estate\_id, status);

\-- ══════════════════════════════════════════════════════  
\-- SECURITY INCIDENTS (immutable)  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE security\_incidents (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  incident\_ref text GENERATED ALWAYS AS (  
    'INC-' || upper(substring(id::text, 1, 6))  
  ) STORED,  
  reported\_by uuid NOT NULL REFERENCES users(id),  
  incident\_type text NOT NULL CHECK (incident\_type IN (  
    'break\_in\_attempt','suspicious\_vehicle','theft',  
    'vandalism','trespassing','medical','fire','other'  
  )),  
  severity text DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),  
  description text NOT NULL,  
  photo\_url text,  
  location\_on\_estate text,  
  vehicle\_description text,  
  status text DEFAULT 'open' CHECK (  
    status IN ('open','acknowledged','under\_investigation','resolved','false\_report')  
  ),  
  acknowledged\_by uuid REFERENCES users(id),  
  acknowledged\_at timestamptz,  
  resolved\_at timestamptz,  
  resolution\_note text,  
  converted\_to\_task\_id uuid REFERENCES tasks(id),  
  created\_at timestamptz DEFAULT now()  
);

CREATE INDEX idx\_incidents\_estate\_status ON security\_incidents(estate\_id, status);

\-- ══════════════════════════════════════════════════════  
\-- CONTRACTORS  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE contractors (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  name text NOT NULL,  
  logo\_url text,  
  description text,  
  trade\_categories text\[\],  
  phone text,  
  whatsapp text,  
  email text,  
  rating\_sum int DEFAULT 0,  
  rating\_count int DEFAULT 0,  
  is\_active boolean DEFAULT true,  
  created\_at timestamptz DEFAULT now()  
);

\-- ══════════════════════════════════════════════════════  
\-- APPROVAL REQUESTS  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE approval\_requests (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  approval\_ref text GENERATED ALWAYS AS (  
    'APR-' || upper(substring(id::text, 1, 6))  
  ) STORED,  
  request\_type text NOT NULL CHECK (request\_type IN (  
    'quote','expense','policy\_change','vendor\_onboard','other'  
  )),  
  title text NOT NULL,  
  description text,  
  amount\_rands numeric(10,2),  
  document\_urls text\[\],  
  submitted\_by uuid NOT NULL REFERENCES users(id),  
  required\_votes int DEFAULT 2,  
  votes\_received int DEFAULT 0,  
  votes\_approved int DEFAULT 0,  
  votes\_rejected int DEFAULT 0,  
  status text DEFAULT 'pending' CHECK (status IN (  
    'pending','approved','rejected','more\_info','cancelled'  
  )),  
  ai\_summary text,  
  ai\_recommendation text,  
  ai\_summary\_generated\_at timestamptz,  
  created\_at timestamptz DEFAULT now(),  
  updated\_at timestamptz DEFAULT now()  
);

CREATE INDEX idx\_approvals\_estate\_status ON approval\_requests(estate\_id, status);

\-- ══════════════════════════════════════════════════════  
\-- APPROVAL VOTES (immutable)  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE approval\_votes (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  approval\_request\_id uuid NOT NULL REFERENCES approval\_requests(id),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  voter\_id uuid NOT NULL REFERENCES users(id),  
  vote text NOT NULL CHECK (vote IN ('approved','rejected','more\_info')),  
  comment text,  
  voted\_at timestamptz DEFAULT now(),  
  UNIQUE(approval\_request\_id, voter\_id)  
);

\-- ══════════════════════════════════════════════════════  
\-- MEETINGS  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE meetings (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  meeting\_type text NOT NULL CHECK (meeting\_type IN ('agm','trustee','special')),  
  title text NOT NULL,  
  scheduled\_at timestamptz NOT NULL,  
  location text,  
  agenda\_items jsonb DEFAULT '\[\]',  
  minutes\_text text,  
  minutes\_url text,  
  status text DEFAULT 'scheduled' CHECK (  
    status IN ('scheduled','completed','cancelled')  
  ),  
  created\_by uuid REFERENCES users(id),  
  created\_at timestamptz DEFAULT now(),  
  updated\_at timestamptz DEFAULT now()  
);

\-- ══════════════════════════════════════════════════════  
\-- MEETING RESOLUTIONS (immutable)  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE meeting\_resolutions (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  meeting\_id uuid NOT NULL REFERENCES meetings(id),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  resolution\_number text NOT NULL,  
  description text NOT NULL,  
  result text NOT NULL CHECK (result IN ('passed','rejected','deferred')),  
  votes\_for int DEFAULT 0,  
  votes\_against int DEFAULT 0,  
  votes\_abstained int DEFAULT 0,  
  resolved\_at timestamptz DEFAULT now(),  
  UNIQUE(estate\_id, resolution\_number)  
);

\-- ══════════════════════════════════════════════════════  
\-- DOCUMENTS  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE documents (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  document\_type text NOT NULL CHECK (document\_type IN (  
    'conduct\_rules','visitor\_policy','body\_corporate\_rules',  
    'emergency\_contacts','insurance\_certificate','ten\_year\_plan',  
    'audited\_financials','csos\_submission','popia\_review','custom'  
  )),  
  custom\_label text,  
  file\_url text,  
  external\_url text,  
  version text,  
  valid\_until date,  
  uploaded\_by uuid REFERENCES users(id),  
  is\_active boolean DEFAULT true,  
  created\_at timestamptz DEFAULT now(),  
  updated\_at timestamptz DEFAULT now()  
);

\-- ══════════════════════════════════════════════════════  
\-- ESTATE PERFORMANCE SNAPSHOTS  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE estate\_performance\_snapshots (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  snapshot\_date date NOT NULL DEFAULT CURRENT\_DATE,  
  open\_tickets int DEFAULT 0,  
  unassigned\_tickets int DEFAULT 0,  
  avg\_resolution\_days numeric(4,1),  
  alerts\_this\_month int DEFAULT 0,  
  levy\_collection\_rate numeric(5,2),  
  performance\_score int CHECK (performance\_score BETWEEN 0 AND 100),  
  created\_at timestamptz DEFAULT now(),  
  UNIQUE(estate\_id, snapshot\_date)  
);

\-- ══════════════════════════════════════════════════════  
\-- CORPORATE AGENT ESTATE MEMBERSHIPS  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE corporate\_agent\_estates (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  agent\_user\_id uuid NOT NULL REFERENCES users(id),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  assigned\_by uuid REFERENCES users(id),  
  assigned\_at timestamptz DEFAULT now(),  
  UNIQUE(agent\_user\_id, estate\_id)  
);

\-- ══════════════════════════════════════════════════════  
\-- TRUSTEE ESTATE MEMBERSHIPS  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE trustee\_estate\_memberships (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  trustee\_user\_id uuid NOT NULL REFERENCES users(id),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  role\_in\_estate text DEFAULT 'trustee' CHECK (  
    role\_in\_estate IN ('trustee','chairperson','treasurer')  
  ),  
  term\_start date,  
  term\_end date,  
  is\_active boolean DEFAULT true,  
  assigned\_by uuid REFERENCES users(id),  
  assigned\_at timestamptz DEFAULT now(),  
  UNIQUE(trustee\_user\_id, estate\_id)  
);

\-- ══════════════════════════════════════════════════════  
\-- COMMUNITY POSTS  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE community\_posts (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  author\_id uuid REFERENCES users(id),  
  content text NOT NULL,  
  photo\_url text,  
  post\_type text DEFAULT 'general' CHECK (  
    post\_type IN ('general','noise\_complaint','lost\_found','announcement')  
  ),  
  is\_anonymous boolean DEFAULT true,  
  status text DEFAULT 'active' CHECK (status IN ('active','deleted','pending\_moderation')),  
  deleted\_by uuid REFERENCES users(id),  
  deletion\_reason text,  
  created\_at timestamptz DEFAULT now()  
);

\-- ══════════════════════════════════════════════════════  
\-- COMMUNITY EVENTS  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE community\_events (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  created\_by uuid REFERENCES users(id),  
  title text NOT NULL,  
  description text,  
  image\_url text,  
  location text,  
  starts\_at timestamptz NOT NULL,  
  ends\_at timestamptz NOT NULL,  
  status text DEFAULT 'active' CHECK (status IN ('active','cancelled')),  
  cancelled\_by uuid REFERENCES users(id),  
  cancellation\_reason text,  
  created\_at timestamptz DEFAULT now()  
);

CREATE TABLE event\_rsvps (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  event\_id uuid NOT NULL REFERENCES community\_events(id),  
  user\_id uuid NOT NULL REFERENCES users(id),  
  response text NOT NULL CHECK (response IN ('yes','no','maybe')),  
  guest\_count int DEFAULT 0,  
  created\_at timestamptz DEFAULT now(),  
  UNIQUE(event\_id, user\_id)  
);

\-- ══════════════════════════════════════════════════════  
\-- AMENITIES  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE amenities (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  name text NOT NULL,  
  description text,  
  photo\_url text,  
  slot\_duration\_mins int DEFAULT 60,  
  available\_days text\[\],  
  available\_from time DEFAULT '08:00',  
  available\_until time DEFAULT '20:00',  
  max\_concurrent int DEFAULT 1,  
  max\_bookings\_per\_unit\_per\_week int DEFAULT 2,  
  cancellation\_policy text DEFAULT 'anytime' CHECK (  
    cancellation\_policy IN ('anytime','24hr\_notice','48hr\_notice')  
  ),  
  waitlist\_enabled boolean DEFAULT false,  
  damage\_reporting\_enabled boolean DEFAULT false,  
  is\_active boolean DEFAULT true,  
  created\_at timestamptz DEFAULT now()  
);

CREATE TABLE amenity\_bookings (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  amenity\_id uuid NOT NULL REFERENCES amenities(id),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  resident\_id uuid NOT NULL REFERENCES users(id),  
  slot\_start timestamptz NOT NULL,  
  slot\_end timestamptz NOT NULL,  
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled','completed')),  
  cancelled\_by uuid REFERENCES users(id),  
  cancellation\_reason text,  
  damage\_reported boolean DEFAULT false,  
  damage\_description text,  
  created\_at timestamptz DEFAULT now()  
);

CREATE TABLE amenity\_waitlist (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  amenity\_id uuid NOT NULL REFERENCES amenities(id),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  resident\_id uuid NOT NULL REFERENCES users(id),  
  desired\_date date NOT NULL,  
  desired\_start time NOT NULL,  
  notified boolean DEFAULT false,  
  notified\_at timestamptz,  
  expires\_at timestamptz,  
  created\_at timestamptz DEFAULT now()  
);

\-- ══════════════════════════════════════════════════════  
\-- VEHICLE REGISTER  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE vehicles (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  unit\_number text NOT NULL,  
  registered\_by uuid NOT NULL REFERENCES users(id),  
  make text NOT NULL,  
  model text NOT NULL,  
  colour text NOT NULL,  
  licence\_plate text NOT NULL,  
  is\_active boolean DEFAULT true,  
  approved\_by uuid REFERENCES users(id),  
  approved\_at timestamptz,  
  approval\_status text DEFAULT 'pending' CHECK (  
    approval\_status IN ('pending','approved','rejected')  
  ),  
  created\_at timestamptz DEFAULT now()  
);

CREATE INDEX idx\_vehicles\_estate\_unit ON vehicles(estate\_id, unit\_number);

\-- ══════════════════════════════════════════════════════  
\-- MANAGEMENT BROADCASTS  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE management\_broadcasts (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  sent\_by uuid NOT NULL REFERENCES users(id),  
  message\_type text DEFAULT 'broadcast' CHECK (  
    message\_type IN ('broadcast','unit\_specific')  
  ),  
  target\_unit\_number text,  
  target\_user\_id uuid REFERENCES users(id),  
  subject text,  
  content text NOT NULL,  
  attachment\_url text,  
  delivery\_channel text\[\] DEFAULT ARRAY\['push','email'\],  
  push\_delivered\_count int DEFAULT 0,  
  email\_delivered\_count int DEFAULT 0,  
  delivery\_failed boolean DEFAULT false,  
  created\_at timestamptz DEFAULT now()  
);

\-- ══════════════════════════════════════════════════════  
\-- WALK-IN GATE PINS  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE walkin\_gate\_pins (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  pin\_code text NOT NULL,  
  valid\_from timestamptz NOT NULL,  
  valid\_until timestamptz NOT NULL,  
  created\_by uuid REFERENCES users(id),  
  notification\_sent boolean DEFAULT false,  
  created\_at timestamptz DEFAULT now()  
);

\-- ══════════════════════════════════════════════════════  
\-- DATA DELETION REQUESTS (POPIA)  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE data\_deletion\_requests (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  user\_id uuid NOT NULL REFERENCES users(id),  
  requested\_at timestamptz DEFAULT now(),  
  status text DEFAULT 'pending' CHECK (  
    status IN ('pending','processing','completed','rejected')  
  ),  
  completed\_at timestamptz,  
  rejection\_reason text,  
  confirmation\_email\_sent boolean DEFAULT false  
);

\-- ══════════════════════════════════════════════════════  
\-- PUSH TOKENS (managed separately for cleanup)  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE push\_tokens (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  user\_id uuid NOT NULL REFERENCES users(id),  
  estate\_id uuid NOT NULL REFERENCES estates(id),  
  token text NOT NULL,  
  platform text CHECK (platform IN ('ios','android')),  
  is\_valid boolean DEFAULT true,  
  last\_used\_at timestamptz,  
  created\_at timestamptz DEFAULT now(),  
  UNIQUE(user\_id, token)  
);

\-- ══════════════════════════════════════════════════════  
\-- SYSTEM FAILURE LOGS (estatehq-ops project)  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE system\_failures (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid,  
  estate\_name text,  
  error\_type text NOT NULL,  
  error\_subtype text,  
  affected\_user\_id uuid,  
  affected\_user\_email text,  
  payload jsonb,  
  status text DEFAULT 'unresolved' CHECK (  
    status IN ('unresolved','investigating','resolved')  
  ),  
  assigned\_to uuid,  
  resolution\_note text,  
  resolved\_at timestamptz,  
  created\_at timestamptz DEFAULT now()  
);

\-- ══════════════════════════════════════════════════════  
\-- AUDIT LOGS (estatehq-ops project — INSERT only)  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE audit\_logs (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  actor\_id uuid NOT NULL,  
  actor\_email text NOT NULL,  
  action\_type text NOT NULL,  
  target\_type text,  
  target\_id uuid,  
  estate\_id uuid,  
  payload jsonb,  
  ip\_address inet,  
  created\_at timestamptz DEFAULT now()  
);  
\-- No UPDATE or DELETE policies. Append-only forever.

\-- ══════════════════════════════════════════════════════  
\-- ONBOARDING PROGRESS (estatehq-ops project)  
\-- ══════════════════════════════════════════════════════  
CREATE TABLE onboarding\_progress (  
  id uuid PRIMARY KEY DEFAULT gen\_random\_uuid(),  
  estate\_id uuid NOT NULL,  
  current\_step int DEFAULT 1,  
  completed\_steps int\[\] DEFAULT ARRAY\[\]::int\[\],  
  step\_data jsonb DEFAULT '{}',  
  started\_by uuid NOT NULL,  
  started\_at timestamptz DEFAULT now(),  
  completed\_at timestamptz,  
  setup\_mode text DEFAULT 'bryson' CHECK (setup\_mode IN ('bryson','manager'))  
);  
\`\`\`

\---

\#\# 6\. ROW-LEVEL SECURITY POLICIES

\`\`\`sql  
\-- Enable RLS on every table (default deny)  
ALTER TABLE estates ENABLE ROW LEVEL SECURITY;  
ALTER TABLE users ENABLE ROW LEVEL SECURITY;  
ALTER TABLE gate\_logs ENABLE ROW LEVEL SECURITY;  
ALTER TABLE guest\_codes ENABLE ROW LEVEL SECURITY;  
ALTER TABLE maintenance\_reports ENABLE ROW LEVEL SECURITY;  
ALTER TABLE report\_status\_history ENABLE ROW LEVEL SECURITY;  
ALTER TABLE emergency\_alerts ENABLE ROW LEVEL SECURITY;  
ALTER TABLE security\_incidents ENABLE ROW LEVEL SECURITY;  
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;  
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;  
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;  
ALTER TABLE approval\_requests ENABLE ROW LEVEL SECURITY;  
ALTER TABLE approval\_votes ENABLE ROW LEVEL SECURITY;  
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;  
ALTER TABLE meeting\_resolutions ENABLE ROW LEVEL SECURITY;  
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;  
ALTER TABLE community\_posts ENABLE ROW LEVEL SECURITY;  
ALTER TABLE community\_events ENABLE ROW LEVEL SECURITY;  
ALTER TABLE event\_rsvps ENABLE ROW LEVEL SECURITY;  
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;  
ALTER TABLE amenity\_bookings ENABLE ROW LEVEL SECURITY;  
ALTER TABLE amenity\_waitlist ENABLE ROW LEVEL SECURITY;  
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;  
ALTER TABLE management\_broadcasts ENABLE ROW LEVEL SECURITY;  
ALTER TABLE push\_tokens ENABLE ROW LEVEL SECURITY;  
ALTER TABLE walkin\_gate\_pins ENABLE ROW LEVEL SECURITY;  
ALTER TABLE data\_deletion\_requests ENABLE ROW LEVEL SECURITY;  
ALTER TABLE estate\_performance\_snapshots ENABLE ROW LEVEL SECURITY;

\-- ── Helper Functions ──────────────────────────────────

CREATE OR REPLACE FUNCTION auth\_estate\_id()  
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$  
  SELECT estate\_id FROM users WHERE id \= auth.uid()  
$$;

CREATE OR REPLACE FUNCTION auth\_role()  
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$  
  SELECT role FROM users WHERE id \= auth.uid()  
$$;

CREATE OR REPLACE FUNCTION is\_manager\_or\_above()  
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$  
  SELECT role IN ('manager','supervisor','super\_admin')  
  FROM users WHERE id \= auth.uid()  
$$;

CREATE OR REPLACE FUNCTION is\_security\_or\_above()  
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$  
  SELECT role IN ('security','supervisor','manager','super\_admin')  
  FROM users WHERE id \= auth.uid()  
$$;

\-- ── RLS Policies ─────────────────────────────────────

\-- USERS: own estate only  
CREATE POLICY "users\_estate\_scoped"  
ON users FOR SELECT  
USING (estate\_id \= auth\_estate\_id());

CREATE POLICY "managers\_manage\_users"  
ON users FOR ALL  
USING (estate\_id \= auth\_estate\_id() AND is\_manager\_or\_above());

\-- GATE LOGS: security/manager see all; residents see own  
CREATE POLICY "gate\_logs\_scoped"  
ON gate\_logs FOR SELECT  
USING (  
  estate\_id \= auth\_estate\_id()  
  AND (  
    is\_security\_or\_above()  
    OR triggered\_by \= auth.uid()  
  )  
);

CREATE POLICY "gate\_logs\_insert\_all"  
ON gate\_logs FOR INSERT  
WITH CHECK (estate\_id \= auth\_estate\_id());

\-- GUEST CODES: residents see own; security/manager see all  
CREATE POLICY "guest\_codes\_scoped"  
ON guest\_codes FOR SELECT  
USING (  
  estate\_id \= auth\_estate\_id()  
  AND (  
    is\_security\_or\_above()  
    OR unit\_id \= auth.uid()  
  )  
);

CREATE POLICY "residents\_create\_guest\_codes"  
ON guest\_codes FOR INSERT  
WITH CHECK (  
  estate\_id \= auth\_estate\_id()  
  AND unit\_id \= auth.uid()  
  AND auth\_role() \= 'resident'  
);

\-- MAINTENANCE REPORTS: residents see own; staff see assigned; managers see all  
CREATE POLICY "reports\_scoped"  
ON maintenance\_reports FOR SELECT  
USING (  
  estate\_id \= auth\_estate\_id()  
  AND (  
    is\_manager\_or\_above()  
    OR submitted\_by \= auth.uid()  
    OR (auth\_role() \= 'maintenance' AND assigned\_to \= auth.uid())  
  )  
);

\-- EMERGENCY ALERTS: security/manager see all; resident sees own  
CREATE POLICY "emergency\_alerts\_scoped"  
ON emergency\_alerts FOR SELECT  
USING (  
  estate\_id \= auth\_estate\_id()  
  AND (  
    is\_security\_or\_above()  
    OR triggered\_by \= auth.uid()  
  )  
);

\-- SECURITY INCIDENTS: security/manager only — residents never see  
CREATE POLICY "security\_incidents\_staff\_only"  
ON security\_incidents FOR SELECT  
USING (  
  estate\_id \= auth\_estate\_id()  
  AND is\_security\_or\_above()  
);

\-- APPROVAL REQUESTS: managers submit; trustees vote; both see  
CREATE POLICY "approvals\_manager\_and\_trustee"  
ON approval\_requests FOR SELECT  
USING (  
  estate\_id \= auth\_estate\_id()  
  AND auth\_role() IN ('manager','supervisor','trustee','super\_admin')  
);

\-- APPROVAL VOTES: immutable, scoped  
CREATE POLICY "approval\_votes\_scoped"  
ON approval\_votes FOR SELECT  
USING (  
  estate\_id \= auth\_estate\_id()  
  AND auth\_role() IN ('manager','supervisor','trustee','super\_admin')  
);

CREATE POLICY "trustees\_vote"  
ON approval\_votes FOR INSERT  
WITH CHECK (  
  estate\_id \= auth\_estate\_id()  
  AND auth\_role() \= 'trustee'  
  AND voter\_id \= auth.uid()  
);

\-- MEETINGS: trustees and managers of same estate  
CREATE POLICY "meetings\_estate\_scoped"  
ON meetings FOR SELECT  
USING (  
  estate\_id \= auth\_estate\_id()  
  AND auth\_role() IN ('trustee','manager','supervisor','super\_admin')  
);

\-- DOCUMENTS: trustees, managers, corporate agents see; residents never see  
CREATE POLICY "documents\_governance\_only"  
ON documents FOR SELECT  
USING (  
  estate\_id \= auth\_estate\_id()  
  AND auth\_role() IN ('trustee','manager','supervisor','corporate\_agent','super\_admin')  
);

\-- COMMUNITY POSTS: residents see active posts for own estate; anonymous author hidden  
CREATE POLICY "community\_posts\_estate"  
ON community\_posts FOR SELECT  
USING (  
  estate\_id \= auth\_estate\_id()  
  AND status \= 'active'  
);

\-- ESTATE PERFORMANCE SNAPSHOTS: managers own estate; corporate agents their assigned estates  
CREATE POLICY "performance\_snapshots\_scoped"  
ON estate\_performance\_snapshots FOR SELECT  
USING (  
  estate\_id \= auth\_estate\_id()  
  OR (  
    auth\_role() \= 'corporate\_agent'  
    AND EXISTS (  
      SELECT 1 FROM corporate\_agent\_estates  
      WHERE agent\_user\_id \= auth.uid()  
      AND estate\_id \= estate\_performance\_snapshots.estate\_id  
    )  
  )  
);

\-- VEHICLES: manager sees all for estate; resident sees own unit  
CREATE POLICY "vehicles\_scoped"  
ON vehicles FOR SELECT  
USING (  
  estate\_id \= auth\_estate\_id()  
  AND (  
    is\_manager\_or\_above()  
    OR registered\_by \= auth.uid()  
  )  
);

\-- PUSH TOKENS: own tokens only  
CREATE POLICY "push\_tokens\_own"  
ON push\_tokens FOR ALL  
USING (user\_id \= auth.uid());

\-- AUDIT LOGS (ops project): INSERT only — no SELECT for non-superadmin  
CREATE POLICY "audit\_logs\_insert\_only"  
ON audit\_logs FOR INSERT WITH CHECK (true);  
\`\`\`

\---

\#\# 7\. AUTH SYSTEM

\#\#\# Login Matrix

| Role | First Login | Returning | 2FA | Session |  
|---|---|---|---|---|  
| Resident | Magic link → password | Email \+ password | Optional biometric lock | Permanent until logout |  
| Security | Magic link → password | Email \+ password | Optional biometric lock | Until End Shift |  
| Maintenance | Magic link → password | Email \+ password | Optional biometric lock | Until End Shift |  
| Supervisor | Magic link → password | Email \+ password \+ TOTP | Mandatory | 7 days |  
| Manager | Magic link → password | Email \+ password \+ TOTP | Mandatory | 7 days |  
| Trustee | Email invite → password | Email \+ password \+ TOTP | Mandatory | 7 days |  
| Corporate Agent | Email invite → password | Email \+ password \+ TOTP | Mandatory | 7 days |  
| Superadmin | Email \+ password | Email \+ password \+ TOTP | Mandatory | 24 hours |

\#\#\# Role Detection on Login

Supabase hook reads \`users.role\` after authentication and injects it as a JWT custom claim. Apps use this claim to route to the correct navigation without showing a role selector.

\#\#\# Wrong App Rejection

Every app checks the JWT role on launch:  
\- Resident app: rejects any role other than \`resident\`  
\- Security app: rejects any role other than \`security\`  
\- Staff app: rejects any role other than \`maintenance\`  
\- Management web: rejects if not \`manager\` or \`supervisor\`  
\- Trustee portal: rejects if not \`trustee\`  
\- Corporate dashboard: rejects if not \`corporate\_agent\`  
\- Ops portal: rejects if not \`super\_admin\`

Message: \*"This app is for \[role\] only. You are logged in as \[actual role\]."\* with link to correct app.

\---

\#\# 8\. EDGE FUNCTIONS

\#\#\# \`trigger-gate\`  
Validates JWT, checks estate ownership, rate limits, POSTs to Pi, writes gate\_log regardless of outcome. Returns \`200 triggered\` or \`408 hardware\_timeout\` or \`429 rate\_limit\`.

\#\#\# \`send-guest-code-whatsapp\`  
Fires on guest code creation if \`guest\_phone\` provided. Catches Twilio failures and sets \`whatsapp\_failed \= true\` with reason. Sends resident push notification on failure.

\#\#\# \`expire-guest-codes\`  
Cron every 15 minutes: \`UPDATE guest\_codes SET is\_active \= false WHERE valid\_until \< now() AND is\_active \= true\`.

\#\#\# \`escalate-reports\`  
Cron every hour: checks unassigned tickets \> threshold, open tickets \> threshold, unresolved \> threshold. Sends push \+ email per escalation level. Updates \`escalation\_level\`.

\#\#\# \`classify-report\`  
Called on report creation. Sends description text to Claude Haiku (no PII). Returns classification \+ confidence. Updates \`ai\_classification\` on the report. If \`redirect\_community\`: response tells app to show redirect nudge.

\#\#\# \`generate-approval-summary\`  
Called when new approval request created with PDFs. Sends document content to Claude Sonnet. Returns 80-word summary \+ recommendation. Inserts into \`approval\_requests.ai\_summary\`.

\#\#\# \`cast-approval-vote\`  
Validates trustee role and estate membership. Inserts vote. Updates approval vote counts. Checks if threshold met — updates status. Notifies estate manager.

\#\#\# \`compute-estate-performance\`  
Nightly cron. Queries open tickets, unassigned, avg resolution, emergency count, levy rate. Computes score 0–100. Inserts into \`estate\_performance\_snapshots\`.

\#\#\# \`send-push-notification\`  
Internal wrapper around Expo Push API. Handles chunked sends (max 100 tokens). On \`DeviceNotRegistered\` error: marks token invalid in \`push\_tokens\`, sets \`is\_valid \= false\`.

\#\#\# \`stripe-webhook\`  
Handles: \`invoice.payment\_succeeded\` → set \`payment\_status \= 'active'\`. \`invoice.payment\_failed\` → set \`payment\_status \= 'overdue'\`, record \`payment\_overdue\_since\`. Schedules suspension check at day 20\.

\#\#\# \`cleanup-expired-data\`  
Nightly cron. Anonymises guest phone numbers on codes expired \> 90 days. Purges soft-deleted community posts \> 1 year. Processes completed data deletion requests.

\---

\#\# 9\. GATE HARDWARE INTEGRATION

\#\#\# Chain  
\`\`\`  
App (3s hold) → Edge Function (validate \+ rate limit) → Pi HTTP server  
→ GPIO relay pulse (500ms) → Centurion trigger input → Gate opens  
→ Gate log written (regardless of hardware outcome)  
\`\`\`

\#\#\# Pi Agent (Python Flask)  
\`\`\`python  
from flask import Flask, request, jsonify  
import RPi.GPIO as GPIO, time, os, hmac, hashlib

app \= Flask(\_\_name\_\_)  
RELAY\_PINS \= {"entry\_vehicle": 17, "exit\_vehicle": 27, "pedestrian": 22}  
SHARED\_SECRET \= os.environ\["PI\_SECRET"\]  
MUTEX \= {}  \# Prevent simultaneous triggers per gate

def validate(key): return hmac.compare\_digest(  
    hashlib.sha256(key.encode()).hexdigest(),  
    hashlib.sha256(SHARED\_SECRET.encode()).hexdigest()  
)

@app.route('/trigger', methods=\['POST'\])  
def trigger():  
    if not validate(request.headers.get('X-Api-Key','')): return jsonify({'error':'Unauthorized'}),401  
    gate \= request.json.get('gate\_id')  
    pin \= RELAY\_PINS.get(gate)  
    if not pin: return jsonify({'error':'Unknown gate'}),400  
    if MUTEX.get(gate): return jsonify({'error':'Gate busy'}),409  \# Mutex lock  
    MUTEX\[gate\] \= True  
    try:  
        GPIO.output(pin, GPIO.HIGH)  
        time.sleep(0.5)  
        GPIO.output(pin, GPIO.LOW)  
    finally:  
        MUTEX\[gate\] \= False  
    return jsonify({'status':'triggered'}),200  
\`\`\`

\#\#\# Offline Cache  
Pi maintains SQLite database of last 24 hours of valid guest codes and resident UUIDs. If internet lost: validates locally. Logs events to local queue. Syncs when internet restores.

\#\#\# GSM Fallback  
Edge Function sends SMS via Twilio to GSM relay SIM. Relay triggers on receipt from whitelisted caller ID. 3–8 second delay. No local network required.

\---

\#\# 10\. NOTIFICATION SYSTEM

\#\#\# Email Templates Required (Resend)

| Trigger | Template |  
|---|---|  
| Resident invited | Magic link setup |  
| Staff invited | Magic link setup |  
| Manager invited | Magic link \+ TOTP setup |  
| Trustee invited | Magic link \+ TOTP setup |  
| Corporate agent invited | Magic link \+ TOTP setup |  
| Password reset | New magic link |  
| Emergency suspended | Suspension notice |  
| False alarm 1st/2nd/3rd | Strike warnings |  
| Payment overdue | Day 0, 10, 17 warnings |  
| Payment suspended | Suspension notice |  
| Report escalated (72hr) | Manager escalation |  
| Document expiring | 30-day warning to manager |  
| Approval request submitted | To all trustees |  
| Approval threshold reached | To estate manager |  
| Intake form submitted (prospect) | Acknowledgement |  
| Intake form submitted (Bryson) | Lead notification |  
| Data deletion completed | Confirmation to resident |  
| Resident message (custom) | Branded estate email |  
| Estate broadcast | Branded estate email to all |

\#\#\# Push Notification Matrix

| Trigger | Recipients | Priority |  
|---|---|---|  
| Emergency triggered | All security on estate | High |  
| Emergency cancelled/resolved | Security \+ triggering resident | Normal |  
| False alarm flagged | Triggering resident | Normal |  
| Guest arrived/exited | Inviting resident | Normal |  
| Parcel confirmed | Resident | Normal |  
| Report status updated | Submitting resident | Normal |  
| New task assigned | Staff member | Normal |  
| Approval request submitted | All trustees | Normal |  
| Approval voted | Estate manager | Normal |  
| Management broadcast | All estate residents | Normal |  
| Walk-in PIN changed | All estate residents | Normal |  
| Document expiring 30 days | Manager | Normal |

\---

\#\# 11\. FILE STORAGE (Supabase Storage)

| Bucket | Contents | Public | Notes |  
|---|---|---|---|  
| \`report-photos\` | Maintenance report images \+ thumbs | No — signed URLs | Max 5MB, JPEG/PNG only |  
| \`company-logos\` | Contractor logos | Yes | Max 2MB |  
| \`estate-logos\` | Estate branding | Yes | Max 2MB |  
| \`event-images\` | Community event photos | Yes | Max 5MB |  
| \`amenity-photos\` | Amenity images | Yes | Max 5MB |  
| \`task-completion-photos\` | Staff task completion | No — signed URLs | Max 5MB |  
| \`documents\` | Estate documents (PDFs) | No — signed URLs | Max 20MB, PDF only |  
| \`approval-documents\` | Approval request PDFs | No — signed URLs | Max 10MB per file, 3 files max |

\*\*Video files are never accepted.\*\* Storage policies reject any file with \`video/\*\` MIME type.

Thumbnails: Supabase Image Transform at 300×300px for all list views. Full resolution served on demand via 1-hour signed URL.

\---

\#\# 12\. ERROR TAXONOMY

All errors logged to \`system\_failures\` in \`estatehq-ops\`. Visible in Ops dashboard failure log.

\`\`\`  
GATE  
  gate\_trigger\_failed  
  gate\_hardware\_timeout  
  gate\_pi\_offline  
  gate\_pi\_unreachable  
  gate\_rate\_limit\_exceeded  
  gate\_mutex\_collision  
  gate\_invalid\_secret

NOTIFICATIONS  
  push\_delivery\_failed  
  push\_token\_expired  
  push\_token\_invalid  
  whatsapp\_delivery\_failed  
  whatsapp\_number\_invalid  
  whatsapp\_landline\_detected  
  email\_delivery\_failed  
  email\_bounce

AUTH  
  magic\_link\_expired  
  magic\_link\_delivery\_failed  
  totp\_setup\_failed  
  session\_expired\_mid\_action  
  wrong\_app\_role\_rejected

PAYMENTS  
  payment\_webhook\_failed  
  payment\_link\_expired  
  stripe\_subscription\_error  
  stripe\_customer\_creation\_failed

AI  
  report\_classification\_failed  
  approval\_summary\_failed  
  performance\_compute\_failed

SYSTEM  
  edge\_function\_error  
  realtime\_disconnect  
  storage\_upload\_failed  
  database\_connection\_error  
  csv\_import\_failed  
  supabase\_timeout  
  pi\_cache\_sync\_failed

DATA  
  deletion\_request\_failed  
  audit\_log\_write\_failed  
  rls\_violation\_detected  
\`\`\`

\---

\#\# 13\. SECURITY HARDENING

\#\#\# Authentication  
\- TOTP mandatory for all management roles — cannot be disabled  
\- Magic links: single-use, 24-hour expiry, cryptographically signed  
\- Refresh token rotation: stolen token invalidated on first use  
\- Superadmin: IP logged every login, 24-hour hard session expiry  
\- Brute force: Supabase default rate limiting \+ Cloudflare WAF

\#\#\# Database  
\- RLS default deny on all tables  
\- CI blocks deployment if cross-estate isolation test fails  
\- No \`SELECT \*\` — explicit column lists only  
\- All inputs validated with Zod before any database write  
\- Audit logs: INSERT only, no UPDATE or DELETE policy, ever

\#\#\# API / Edge Functions  
\- Rate limits enforced at Edge Function level (gate: 10/min, guest codes: 20/hr, emergency: 3/hr)  
\- Service role key: server-side only, never in client code, rotated quarterly  
\- All secrets in Cloudflare Pages env vars or Supabase Vault  
\- HTTPS enforced everywhere via Cloudflare

\#\#\# Mobile  
\- Session tokens in \`expo-secure-store\` (iOS Keychain / Android Keystore)  
\- No sensitive data in AsyncStorage  
\- No credentials in app bundle  
\- Jailbreak/root detection via \`expo-device\` — warn user, do not block

\#\#\# Infrastructure  
\- Cloudflare WAF (Pro): blocks SQLi, XSS, CSRF before hitting app  
\- Cloudflare Zero Trust on \`ops.estatehq.co.za\` — approved emails only  
\- Cloudflare DDoS: automatic, included in Pro plan  
\- GitHub Dependabot: automatic vulnerability alerts  
\- \`npm audit\` before every production deployment

\#\#\# CSV / File Upload  
\- UTF-8 BOM stripped from all CSV/XLSX imports  
\- Windows \`\\r\\n\` line endings normalised  
\- CSV injection prevention: cells starting with \`=\`, \`+\`, \`-\`, \`@\` prefixed with \`'\` on export  
\- XLSX parsing: \`xlsx\` library with strict column validation  
\- Video files rejected at storage policy level

\---

\#\# 14\. CI/CD & DEPLOYMENT

\#\#\# Web Apps (Management, Corporate, Ops)  
\- Push to \`main\` → Vercel auto-deploys  
\- Push to any branch → Vercel preview URL  
\- Secrets: Cloudflare Pages env vars (not in repo)  
\- Domain: Cloudflare DNS → Vercel

\#\#\# Mobile Apps  
\- EAS Build for production builds  
\- EAS Update for OTA JS bundle updates (no App Store submission needed for bug fixes)  
\- TestFlight (iOS internal) \+ Play Store internal track for testing

\#\#\# Database Migrations  
\- All migrations in \`supabase/migrations/\` — tracked in version control  
\- Applied via \`supabase db push\` in CI pipeline  
\- Never modify production schema directly — always via migration file

\#\#\# Pre-Deploy Checklist (CI enforces)  
1\. \`npm audit\` — zero HIGH or CRITICAL  
2\. TypeScript build — zero errors  
3\. RLS isolation test suite — all pass  
4\. Cross-estate query test — returns 0 rows  
5\. \`supabase db push \--dry-run\` — migration valid  
HEREDOC

echo "Backend done"

Output  
Backend done

Done

present files

