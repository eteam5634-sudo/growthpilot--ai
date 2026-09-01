import Link from "next/link";
import {
  auditsCreatedByDay,
  getAdminOverviewStats,
  listAllAudits,
  listAllUsers,
  usersCreatedByDay,
} from "@/services/admin";
import { requireAdmin } from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminTrendChart } from "@/features/admin/trend-chart";
import { AdminEmptyState, AdminErrorState, AdminMetricCard, AdminPageHeader } from "@/features/admin/admin-ui";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Admin" };

function formatMoney(cents: number | null | undefined) {
  const value = typeof cents === "number" && Number.isFinite(cents) ? cents : 0;
  return `$${(value / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function AdminHomePage() {
  const { supabase } = await requireAdmin();

  let statsError: string | null = null;
  const [stats, userGrowth, auditActivity, recentUsers, recentAudits] = await Promise.all([
    getAdminOverviewStats(supabase).catch((err: Error) => {
      statsError = err?.message || "Failed to load overview stats";
      return null;
    }),
    usersCreatedByDay(supabase).catch(() => []),
    auditsCreatedByDay(supabase).catch(() => []),
    listAllUsers(supabase).catch(() => []),
    listAllAudits(supabase).catch(() => []),
  ]);

  const safeStats = {
    totalUsers: stats?.totalUsers ?? 0,
    activeUsers: stats?.activeUsers ?? 0,
    totalAudits: stats?.totalAudits ?? 0,
    totalReports: stats?.totalReports ?? 0,
    totalRevenueCents: stats?.totalRevenueCents ?? 0,
    freeUsers: stats?.freeUsers ?? 0,
    starterUsers: stats?.starterUsers ?? 0,
    professionalUsers: stats?.professionalUsers ?? 0,
    agencyUsers: stats?.agencyUsers ?? 0,
  };

  const cards = [
    { label: "Total users", value: safeStats.totalUsers },
    { label: "Active users", value: safeStats.activeUsers },
    { label: "Total audits", value: safeStats.totalAudits },
    { label: "Total reports", value: safeStats.totalReports },
    { label: "Total revenue", value: formatMoney(safeStats.totalRevenueCents) },
    { label: "Free users", value: safeStats.freeUsers },
    { label: "Starter users", value: safeStats.starterUsers },
    { label: "Professional users", value: safeStats.professionalUsers },
    { label: "Agency users", value: safeStats.agencyUsers },
  ];

  const growthRows = (userGrowth ?? []).filter((row) => row?.created_at);
  const auditRows = (auditActivity ?? []).filter((row) => row?.created_at);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <AdminPageHeader title="Admin dashboard" description="Platform metrics from Supabase." />
      {statsError ? <AdminErrorState message={`Could not load overview: ${statsError}`} /> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <AdminMetricCard key={card.label} label={card.label} value={card.value} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminTrendChart title="User growth" rows={growthRows} />
        <AdminTrendChart title="Audit activity" rows={auditRows} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(recentUsers ?? []).length === 0 ? (
              <AdminEmptyState message="No users yet." />
            ) : (
              (recentUsers ?? []).slice(0, 5).map((u, index) => (
                <Link
                  key={u?.id || `user-${index}`}
                  href={`/admin/users/${u?.id || ""}`}
                  className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/40"
                >
                  <div className="font-medium">{u?.full_name || u?.email || "Unknown user"}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(u?.created_at)} · {u?.account_status || "active"}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent audits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(recentAudits ?? []).length === 0 ? (
              <AdminEmptyState message="No audits yet." />
            ) : (
              (recentAudits ?? []).slice(0, 5).map((audit, index) => (
                <div key={audit?.id || `audit-${index}`} className="rounded-lg border px-3 py-2 text-sm">
                  <div className="font-medium">{audit?.business_name || "Untitled audit"}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(audit?.created_at)} · {audit?.status || "unknown"}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
