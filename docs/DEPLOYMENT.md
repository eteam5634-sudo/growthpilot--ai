# Deploying GrowthPilot AI

## 1. Database

In the Supabase SQL editor, run these files in order:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_platform_expansion.sql`
3. `supabase/migrations/0003_saas_platform.sql`

Migration 0003 adds admin roles, analytics, billing (`subscriptions`, `payments`, `usage_limits`), competitors, contact inquiries, and admin RLS policies.

## 2. Auth settings

Authentication → URL configuration:

- Site URL: your app origin (`http://localhost:3000` locally)
- Redirect URLs:
  - `{origin}/auth/callback`
  - `{origin}/auth/callback?next=/dashboard`
  - `{origin}/auth/callback?next=/reset-password`

Enable Email (password) under Authentication → Providers.

## 3. Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional Stripe billing
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO=
STRIPE_PRICE_AGENCY=

# Optional admin bootstrap
ADMIN_EMAILS=you@example.com
```

Without `OPENAI_API_KEY`, audits still complete using crawl heuristics. Chat falls back to the top recommendation.

`SUPABASE_SERVICE_ROLE_KEY` is required for the Stripe webhook to update subscriptions. Never expose it to the client.

## 4. Stripe webhook

1. Create products/prices in Stripe for Pro and Agency.
2. Set `STRIPE_PRICE_PRO` and `STRIPE_PRICE_AGENCY` to the price IDs.
3. Add a webhook endpoint: `https://your-domain.com/api/stripe/webhook`
4. Subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
5. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

## 5. Vercel

1. Import the GitHub repo.
2. Add the env vars above.
3. Set serverless max duration to **60 seconds** (audit, competitor, and chat routes).
4. Deploy.

## 6. JSON APIs (mobile-ready)

Cookie-authenticated session from the same Supabase project:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Service health |
| GET | `/api/audits` | List audits |
| POST | `/api/audits` | Run an audit (usage limits enforced) |
| GET | `/api/audits/:id` | Audit + report |
| DELETE | `/api/audits/:id` | Delete audit |
| GET/POST | `/api/audits/:id/chat` | Consultant thread |
| GET/POST | `/api/audits/:id/competitors` | Competitor comparison |
| GET | `/api/clients` | Agency clients |
| POST | `/api/clients` | Create a client |
| GET | `/api/clients/:id` | Client, notes, and audits |
| DELETE | `/api/clients/:id` | Delete a client |
| GET/POST | `/api/clients/:id/notes` | Client notes |
| POST | `/api/stripe/webhook` | Stripe subscription sync |

## 7. Admin access

Set `ADMIN_EMAILS` to a comma-separated list of emails. On login, matching users can access `/admin`. You can also promote users from **Admin → Users**.
