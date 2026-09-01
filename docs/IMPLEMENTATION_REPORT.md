# GrowthPilot — Supabase integration report

## Connected pages

| Route | Supabase tables |
| --- | --- |
| `/dashboard` | `audits`, `reports`, `clients`, `competitor_analyses`, `usage_limits`, `subscriptions` |
| `/profile` | `users`, `user_settings`, `audits`, `subscriptions` |
| `/history` | `audits` (paginated, filtered) |
| `/reports` | `audits` + `reports` (paginated) |
| `/reports/[id]` | `audits`, `reports`, `report_messages`, `competitor_analyses` |
| `/clients`, `/clients/[id]` | `clients`, `client_notes`, `audits` |
| `/competitors`, `/competitors/[id]` | `competitor_analyses`, `audits` |
| `/messages` | `report_messages`, `audits` |
| `/billing` | `subscriptions`, `usage_limits`, `payments`, `audits`, `competitor_analyses` |
| `/admin/*` | `users`, `audits`, `reports`, `clients`, `competitor_analyses`, `analytics_events` |

## New migrations

Run in order after `0001`–`0003`:

4. **`0004_billing_v2.sql`** — expanded plans (`starter`, `professional`), competitor usage columns, account status, payment fields, performance indexes

## Reusable hooks (`src/hooks/`)

- `useProfile()` — `users`, `user_settings`, audit/report counts
- `useAudits()` — `audits`
- `useReports()` — `audits` + `reports`
- `useClients()` — `clients`
- `useSubscription()` — `subscriptions`, `usage_limits`, `payments`

## Plan limits (enforced backend)

| Plan | Audits/mo | Competitor analyses/mo |
| --- | --- | --- |
| Free | 5 | 2 |
| Starter | 25 | 10 |
| Professional | 100 | 50 |
| Agency | Unlimited | Unlimited |

Enforced in `runAuditAction`, `POST /api/audits`, and `runCompetitorAnalysisAction`.

## AI consultant fixes

- OpenAI failures fall back to report-based answers
- Messages saved only after answer is generated
- Compact audit context reduces token errors
- Chat UI refreshes after successful reply

## Performance improvements

See [PERFORMANCE.md](./PERFORMANCE.md).

## Remaining before production

1. Run all migrations (`0001` → `0004`) in Supabase SQL Editor
2. Set env vars: `SUPABASE_SERVICE_ROLE_KEY`, Stripe price IDs for starter/professional/agency
3. Configure Stripe webhook → `/api/stripe/webhook`
4. Add `account_status` check on login (block suspended users)
5. Client edit form (update action) — create path exists; inline edit on detail page optional
6. Regenerate `src/types/supabase.ts` from Supabase CLI after migrations
7. End-to-end browser test on Vercel with real keys
