import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getCompetitorAnalysis } from "@/services/platform";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { CompetitorComparison } from "@/types/competitor";

export const metadata = { title: "Competitor analysis detail" };

export default async function CompetitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();
  const row = await getCompetitorAnalysis(supabase, id, user.id).catch(() => null);
  if (!row) notFound();

  const audit = row.audits as { business_name: string; website_url: string; id: string } | null;
  const comparison = row.payload as CompetitorComparison;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Competitor analysis</p>
          <h1 className="text-2xl font-semibold tracking-tight">{audit?.business_name ?? "Analysis"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(row.created_at)}</p>
        </div>
        <div className="flex gap-2">
          {audit?.id ? (
            <Button variant="outline" asChild>
              <Link href={`/reports/${audit.id}`}>View audit report</Link>
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link href="/competitors">All analyses</Link>
          </Button>
        </div>
      </div>

      {comparison.insights?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {comparison.insights.map((item) => (
              <p key={item} className="text-sm leading-6 text-muted-foreground">
                • {item}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {comparison.competitors?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Competitor scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {comparison.competitors.map((competitor) => (
              <div key={competitor.url} className="rounded-lg border p-3">
                <p className="font-medium">{competitor.hostname || competitor.url}</p>
                <p className="text-sm text-muted-foreground">Overall: {competitor.scores?.overall ?? "—"}</p>
                {competitor.strengths?.length ? (
                  <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                    {competitor.strengths.slice(0, 3).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {comparison.opportunities?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {comparison.opportunities.map((item) => (
              <p key={item} className="text-sm leading-6 text-muted-foreground">
                • {item}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
