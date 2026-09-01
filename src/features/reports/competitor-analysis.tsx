"use client";

import { useActionState } from "react";
import { runCompetitorAnalysisAction } from "@/actions/intelligence";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { scoreColorClass } from "@/lib/scores";
import type { CompetitorComparison } from "@/types/competitor";
import type { CategoryScores } from "@/types/report";
import { CompetitorScoreChart } from "@/features/reports/competitor-score-chart";

const COMPARISON_ROWS = [
  ["Overall", "overall"],
  ["SEO", "seo"],
  ["Conversion", "conversion"],
  ["UX", "ux"],
  ["Trust", "trust"],
  ["Brand", "brand"],
] as const;

export function CompetitorAnalysis({
  auditId,
  comparison,
  primaryScore,
  primaryName,
  primaryCategories,
}: {
  auditId: string;
  comparison: CompetitorComparison | null;
  primaryScore?: number;
  primaryName?: string;
  primaryCategories?: CategoryScores;
}) {
  const [state, action, pending] = useActionState(runCompetitorAnalysisAction.bind(null, auditId), undefined);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Competitor analysis</CardTitle>
          <CardDescription>
            Add up to three competitor URLs. We crawl their homepages and compare SEO, content, conversion, and trust.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="competitorUrl1">Competitor 1</Label>
              <Input id="competitorUrl1" name="competitorUrl1" placeholder="https://competitor.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitorUrl2">Competitor 2</Label>
              <Input id="competitorUrl2" name="competitorUrl2" placeholder="https://rival.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitorUrl3">Competitor 3</Label>
              <Input id="competitorUrl3" name="competitorUrl3" placeholder="https://alt.com" />
            </div>
            <div className="md:col-span-3">
              {state?.error ? <p className="mb-3 text-sm text-destructive">{state.error}</p> : null}
              <Button disabled={pending}>{pending ? "Comparing sites..." : "Run competitor analysis"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {comparison ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Score comparison</CardTitle>
              <CardDescription>Your site versus the competitors we crawled.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <CompetitorScoreChart
                comparison={comparison}
                primaryName={primaryName || "You"}
                primaryScore={primaryScore}
                primaryCategories={primaryCategories}
              />
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>{primaryName || "Your site"}</TableHead>
                    {comparison.competitors.map((competitor) => (
                      <TableHead key={competitor.url}>{competitor.hostname}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COMPARISON_ROWS.map(([label, key]) => {
                    const yours =
                      key === "overall"
                        ? primaryScore
                        : primaryCategories?.[key as keyof CategoryScores]?.score;
                    return (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{label}</TableCell>
                        <TableCell className={yours == null ? "" : scoreColorClass(yours)}>
                          {yours ?? "—"}
                        </TableCell>
                        {comparison.competitors.map((competitor) => {
                          const score = competitor.scores[key];
                          return (
                            <TableCell key={`${competitor.url}-${key}`} className={scoreColorClass(score)}>
                              {score}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-3">
            {comparison.competitors.map((competitor) => (
              <Card key={competitor.url}>
                <CardHeader>
                  <CardTitle className="text-base">{competitor.hostname}</CardTitle>
                  <CardDescription className="break-all">{competitor.url}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Overall</span>
                    <Badge>{competitor.scores.overall}</Badge>
                  </div>
                  {[
                    ["SEO", competitor.scores.seo],
                    ["Conversion", competitor.scores.conversion],
                    ["UX", competitor.scores.ux],
                    ["Trust", competitor.scores.trust],
                    ["Brand", competitor.scores.brand],
                  ].map(([label, score]) => (
                    <div key={String(label)} className="flex justify-between text-muted-foreground">
                      <span>{label}</span>
                      <span>{score}</span>
                    </div>
                  ))}
                  <p className="pt-2 text-muted-foreground">{competitor.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Comparison insights</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold">Insights</h3>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {(comparison.insights || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3 className="mt-4 text-sm font-semibold">Opportunities</h3>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {comparison.opportunities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">Content: </span>
                  {comparison.contentStrategy}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Conversion: </span>
                  {comparison.conversionMethods}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Trust: </span>
                  {comparison.trustElements}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
