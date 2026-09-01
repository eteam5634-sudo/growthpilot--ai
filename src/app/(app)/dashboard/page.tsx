import Link from "next/link";
import dynamic from "next/dynamic";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  getDashboardStats,
  getRecentAudits,
  getRecentClientActivity,
  getRecentReports,
  getAuditsForChart,
} from "@/services/dashboard";
import { listCompletedReports } from "@/services/audits";
import { DashboardStats } from "@/features/dashboard/dashboard-stats";
import { UsageMetrics } from "@/features/dashboard/usage-metrics";
import { RecentAudits } from "@/features/dashboard/recent-audits";
import { RecentReportsList } from "@/features/dashboard/recent-reports-list";
import { RecentClientActivity } from "@/features/dashboard/recent-client-activity";
import { LatestRecommendations } from "@/features/dashboard/latest-recommendations";
import { Button } from "@/components/ui/button";

const ScoreTrendChartLazy = dynamic(
  () =>
    import("@/features/dashboard/score-trend-chart-lazy").then((mod) => mod.ScoreTrendChartLazy),
  { loading: () => <div className="h-72 animate-pulse rounded-xl bg-muted" /> }
);

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [stats, recentAudits, recentReports, clientActivity, chartAudits, completed] =
    await Promise.all([
      getDashboardStats(supabase, user.id).catch(() => ({
        totalAudits: 0,
        totalReports: 0,
        totalClients: 0,
        totalCompetitorAnalyses: 0,
        averageScore: null,
        usage: {
          plan: "free" as const,
          status: "active" as const,
          used: 0,
          limit: 5,
          remaining: 5,
          competitorUsed: 0,
          competitorLimit: 2,
          competitorRemaining: 2,
          periodStart: new Date().toISOString().slice(0, 10),
          renewalDate: null,
          canRun: true,
          canRunCompetitor: true,
        },
      })),
      getRecentAudits(supabase, user.id, 5).catch(() => []),
      getRecentReports(supabase, user.id, 5).catch(() => []),
      getRecentClientActivity(supabase, user.id, 5).catch(() => []),
      getAuditsForChart(supabase, user.id, 30).catch(() => []),
      listCompletedReports(supabase, user.id, 4).catch(() => []),
    ]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live metrics from your Supabase workspace — audits, reports, clients, and usage.
          </p>
        </div>
        <Button asChild>
          <Link href="/audits/new">New Audit</Link>
        </Button>
      </div>

      <DashboardStats
        totalAudits={stats.totalAudits}
        totalReports={stats.totalReports}
        totalClients={stats.totalClients}
        totalCompetitorAnalyses={stats.totalCompetitorAnalyses}
        averageScore={stats.averageScore}
      />

      <UsageMetrics usage={stats.usage} />

      <ScoreTrendChartLazy audits={chartAudits} />

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentAudits audits={recentAudits} />
        <RecentReportsList reports={recentReports} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentClientActivity notes={clientActivity} />
        <LatestRecommendations audits={completed} />
      </div>
    </div>
  );
}
