import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDateTime, hostnameFromUrl } from "@/lib/utils";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getAudit, reportFromAudit } from "@/services/audits";
import { ScoreRing } from "@/features/reports/score-ring";
import { CategoryCards, CategoryDetails } from "@/features/reports/category-cards";
import { ScoreRadar } from "@/features/reports/score-radar";
import { ExecutiveSummarySection } from "@/features/reports/executive-summary";
import { FindingsList } from "@/features/reports/findings-list";
import { Recommendations } from "@/features/reports/recommendations";
import { GrowthPlanSection } from "@/features/reports/growth-plan";
import { DownloadPdfButton } from "@/features/reports/download-pdf-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { retryAuditAction } from "@/actions/audits";
import { ConsultantChat } from "@/features/reports/consultant-chat";
import { CompetitorAnalysis } from "@/features/reports/competitor-analysis";
import { listReportMessages, latestCompetitorAnalysis } from "@/services/platform";
import type { CompetitorComparison } from "@/types/competitor";

export const metadata = { title: "Audit Report" };
export const maxDuration = 60;

export default async function AuditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();
  const audit = await getAudit(supabase, id, user.id);
  if (!audit) notFound();

  const report = reportFromAudit(audit);
  const [messages, competitorRow] = await Promise.all([
    listReportMessages(supabase, id).catch(() => []),
    latestCompetitorAnalysis(supabase, id).catch(() => null),
  ]);
  const comparison = (competitorRow?.payload as CompetitorComparison | null) ?? null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm text-muted-foreground">{hostnameFromUrl(audit.website_url)}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{audit.business_name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {audit.industry} · {formatDateTime(audit.created_at)}
          </p>
          {audit.business_description ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{audit.business_description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{audit.status}</Badge>
          {report ? <DownloadPdfButton audit={audit} report={report} /> : null}
          <Button variant="outline" asChild>
            <Link href="/audits/history">All audits</Link>
          </Button>
        </div>
      </div>

      {audit.status === "failed" ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-4 py-8">
            <div>
              <h2 className="text-lg font-semibold">This audit did not complete</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {audit.error_message || "Something went wrong while generating the report."}
              </p>
            </div>
            <form action={retryAuditAction.bind(null, audit.id)}>
              <Button type="submit">Retry audit</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {audit.status === "analyzing" || audit.status === "pending" ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <h2 className="mt-4 text-lg font-semibold">Analysis in progress</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Refresh this page in a moment. The report will appear when scoring is complete.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {report ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <Card>
              <CardContent className="flex flex-col items-center py-8">
                <p className="mb-4 text-sm font-medium text-muted-foreground">Overall Business Score</p>
                <ScoreRing score={report.overallScore} />
              </CardContent>
            </Card>
            <ScoreRadar categories={report.categories} />
          </div>
          <CategoryCards categories={report.categories} />
          <CategoryDetails categories={report.categories} />
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Executive summary</h2>
            <ExecutiveSummarySection summary={report.executiveSummary} />
          </section>
          <div className="grid gap-4 md:grid-cols-2">
            <FindingsList title="Strengths" items={report.strengths} tone="positive" />
            <FindingsList title="Weaknesses" items={report.weaknesses} tone="negative" />
          </div>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Recommendations</h2>
            <Recommendations items={report.recommendations} />
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Growth plan</h2>
            <GrowthPlanSection plan={report.growthPlan} />
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Competitors</h2>
            <CompetitorAnalysis
              auditId={audit.id}
              comparison={comparison}
              primaryScore={report.overallScore}
              primaryName={audit.business_name}
              primaryCategories={report.categories}
            />
          </section>
          <section id="consultant" className="space-y-3">
            <ConsultantChat auditId={audit.id} messages={messages} />
          </section>
        </>
      ) : null}
    </div>
  );
}
