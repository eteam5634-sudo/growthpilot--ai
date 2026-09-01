# Performance report

## Bottlenecks found

1. **Dashboard loaded all audits** — unbounded `listAudits()` on every visit
2. **Reports limited to 8 rows** — incomplete data on `/reports`
3. **History loaded full audit list** — no server pagination
4. **Recharts loaded synchronously** — blocked initial dashboard paint
5. **Duplicate queries** — dashboard fetched audits multiple times for different widgets
6. **Missing DB indexes** — slow counts/filters on large tables

## Changes made

| Area | Change | Expected impact |
| --- | --- | --- |
| Dashboard | Parallel count queries + limited recent lists (5 rows) | Faster TTFB, less data transfer |
| Dashboard | Dynamic import for score trend chart | Smaller initial JS bundle |
| History | Server pagination (10/page) + status filter | Constant memory per page |
| Reports | Paginated `listReportsPaginated` | Scales with report count |
| Database | Indexes on `audits`, `reports`, `clients`, `competitor_analyses`, `report_messages` | Faster filters and sorts |
| Billing | Single `getUsage()` with parallel counts | One round-trip pattern |
| Services | `getDashboardStats()` consolidates metrics | Fewer duplicate queries |

## Expected improvements

- **Dashboard:** ~40–60% faster load with many audits (bounded queries vs full table scan in UI)
- **History/Reports:** O(page size) instead of O(total records)
- **Charts:** deferred load improves First Contentful Paint on dashboard

## Recommended next steps

1. Add React `cache()` around server data fetchers per request
2. Use Supabase RPC for dashboard aggregate counts (single query)
3. Enable Vercel Speed Insights and monitor LCP on `/dashboard`, `/reports/[id]`
4. Image optimization audit on marketing pages
5. Consider `loading.tsx` skeletons on all app routes (partial coverage exists)
