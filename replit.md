# Estavo

Estate management SaaS platform with four portals: Superadmin provisioning, Management Dashboard, Trustee Portal, and Corporate Dashboard.

## Run & Operate

- `pnpm --filter @workspace/superadmin run dev` — Superadmin portal (port 19460)
- `pnpm --filter @workspace/estavo-app run dev` — All three estate portals (port 19461)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Next.js 15 (App Router) for both portals
- Styling: Tailwind CSS 4 (inline config)
- DB/Auth: Supabase (client in `artifacts/estavo-app/lib/supabase.ts`)

## Where things live

- `artifacts/superadmin/` — Superadmin provisioning portal at `/superadmin/`
- `artifacts/estavo-app/` — Three-portal app at `/app/`
  - `app/(management)/` — Estate Manager routes: /dashboard, /residents, /gates, /maintenance, etc.
  - `app/(trustees)/` — Trustee routes: /trustees, /trustees/meetings, /trustees/documents, etc.
  - `app/(corporate)/` — Corporate Agent routes: /corporate, /corporate/analytics, /corporate/financials, etc.
  - `lib/mock-data.ts` — All mock data (swap for Supabase queries once env vars are set)
  - `components/ui.tsx` — Shared UI components (StatCard, Badge, PageHeader, PillFilter, etc.)

## Architecture decisions

- Both portals are Next.js 15 App Router apps (not Vite) — chosen for RSC and SSR capabilities, which suit data-heavy dashboards.
- Three portals share one Next.js app under `/app/` using route groups `(management)`, `(trustees)`, `(corporate)` — each group has its own sidebar layout.
- All data is currently mocked in `lib/mock-data.ts`; Supabase client is ready to swap in.
- Design system: white bg (#FFFFFF), surface (#FAFAFB), accent #3D6BF5 electric blue.

## Product

- **Superadmin portal** (`/superadmin/`) — provision new estates, onboard customers with a 6-step wizard
- **Management Dashboard** (`/app/dashboard`) — estate managers see stats, gate log, maintenance, announcements
- **Trustee Portal** (`/app/trustees`) — trustees vote on estate approvals, review meeting resolutions, manage documents
- **Corporate Dashboard** (`/app/corporate`) — corporate agents view portfolio health, analytics, financials, compliance

## User preferences

- App branding: ESTAVO (not EstateHQ)
- Light theme throughout; no dark mode currently

## Gotchas

- `.next/` directories are gitignored — do not commit build output
- artifact.toml cannot be written directly via the write tool; use bash cp + verifyAndReplaceArtifactToml
- Supabase env vars needed: `NEXT_PUBLIC_SUPABASE_PLATFORM_URL`, `NEXT_PUBLIC_SUPABASE_PLATFORM_ANON_KEY`, `SUPABASE_APP_URL`, `SUPABASE_APP_SERVICE_ROLE_KEY`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
