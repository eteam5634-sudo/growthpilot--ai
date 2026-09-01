import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getAdminMonthMetrics, listAnalyticsEvents } from "@/services/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminTrendChart } from "@/features/admin/trend-chart";
import { AdminErrorState, AdminMetricCard, AdminPageHeader } from "@/features/admin/admin-ui";

export const metadata = { title: "Admin analytics" };

function formatMoney(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AdminAnalyticsPage() {
  const { supabase } = await requireAdmin();
  let error: string | null = null;
  const [metrics, events] = await Promise.all([
    getAdminMonthMetrics(supabase).catch((err: Error) => {
      error = err.message;
      return null;
    }),
    listAnalyticsEvents(supabase, 30).catch(() => []),
  ]);

  const counts = events.reduce<Record<string, number>>((acc, row) => {
    const key = String((row as { event?: string }).event || "unknown");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <AdminPageHeader
        title="Analytics"
        description="Monthly growth metrics and platform event volume."
      />
      {error ? <AdminErrorState message={error} /> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminMetricCard label="New users this month" value={metrics?.newUsersThisMonth ?? 0} />
        <AdminMetricCard label="Audits this month" value={metrics?.auditsThisMonth ?? 0} />
        <AdminMetricCard
          label="Revenue this month"
          value={formatMoney(metrics?.revenueThisMonthCents ?? 0)}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top active users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!metrics?.topActiveUsers.length ? (
              <p className="text-sm text-muted-foreground">No audit activity this month.</p>
            ) : (
              metrics.topActiveUsers.map((user) => (
                <Link
                  key={user.user_id}
                  href={`/admin/users/${user.user_id}`}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:bg-muted/40"
                >
                  <div>
                    <div className="font-medium">{user.full_name || user.email}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                  <div className="tabular-nums text-muted-foreground">{user.audit_count} audits</div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 content-start">
          {Object.entries(counts).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-sm text-muted-foreground">
                No analytics events in the last 30 days.
              </CardContent>
            </Card>
          ) : (
            Object.entries(counts).map(([label, value]) => (
              <AdminMetricCard key={label} label={label} value={value} />
            ))
          )}
        </div>
      </div>
      <AdminTrendChart
        title="Event volume (30d)"
        rows={events.map((event) => ({ created_at: String((event as { created_at: string }).created_at) }))}
      />
    </div>
  );
}
