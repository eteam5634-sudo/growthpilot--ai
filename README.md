# GrowthPilot AI

AI-powered website audits for business owners, marketers, agencies, and ecommerce teams.

Enter a URL. GrowthPilot crawls the homepage, scores SEO, conversion, UX, trust, and brand, then produces a report with recommendations, a 30-day plan, competitor comparison, and an in-report consultant.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 + Shadcn-style UI
- Supabase (Postgres + Auth + RLS)
- OpenAI
- Recharts
- `@react-pdf/renderer`
- Stripe Checkout (optional)

## Install

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

See `.env.example` for the full list. Minimum:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Values live in Supabase **Project Settings → API**.

## Database

Run all three files in the Supabase SQL editor, in order:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_platform_expansion.sql`
3. `supabase/migrations/0003_saas_platform.sql`

Then add redirect URLs under **Authentication → URL configuration** (see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)).

## Product

| Route | Purpose |
| --- | --- |
| `/` `/features` `/pricing` `/about` `/contact` | Marketing site |
| `/login` `/signup` `/register` `/forgot-password` | Auth |
| `/dashboard` | Stats, trends, recent activity |
| `/audits/new` (`/audit/new`) | Run an AI audit |
| `/reports` `/reports/[id]` | Reports list and detail |
| `/history` | Search, sort, delete, reopen |
| `/consultant` | Open AI consultant on a report |
| `/clients` | Agency client profiles and notes |
| `/profile` | Name, email, password |
| `/settings` | Workspace, billing, appearance |
| `/admin/*` | Admin console (users, audits, analytics) |

## Scripts

```bash
npm run dev        # local development
npm run build      # production build
npm run typecheck  # TypeScript
npm run lint       # ESLint
```

## How an audit works

1. The user submits URL, business name, industry, and description.
2. Usage limits are checked against their plan (Free: 3/mo, Pro: 50/mo, Agency: unlimited).
3. A server action stores an `audits` row and crawls the homepage.
4. Heuristic scorers plus OpenAI (when configured) produce the report JSON.
5. Scores land in `reports`. The user is redirected to `/reports/[id]`.

## Folder layout

```text
src/app        pages and JSON APIs
src/actions    server actions
src/components shared UI and layout
src/features   dashboard, audits, reports, clients, admin
src/services   crawl, audit engine, billing, data access
src/lib        supabase, openai, scoring, analytics
supabase/migrations
docs/          deployment and mobile guides
```

## Deploy

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Vercel, Stripe webhooks, and admin setup.

## Mobile (Capacitor)

See [docs/MOBILE.md](docs/MOBILE.md) for Android APK preparation.
