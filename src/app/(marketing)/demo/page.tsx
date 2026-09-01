import { DEMO_AUDIT, DEMO_REPORT } from "@/lib/demo-report";
import { ScoreRing } from "@/features/reports/score-ring";
import { CategoryCards, CategoryDetails } from "@/features/reports/category-cards";
import { ScoreRadar } from "@/features/reports/score-radar";
import { ExecutiveSummarySection } from "@/features/reports/executive-summary";
import { FindingsList } from "@/features/reports/findings-list";
import { Recommendations } from "@/features/reports/recommendations";
import { GrowthPlanSection } from "@/features/reports/growth-plan";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const metadata = { title: "Demo report" };

export default function DemoReportPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-12 sm:px-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Sample report · {DEMO_AUDIT.website_url}</p>
          <h1 className="text-3xl font-semibold tracking-tight">{DEMO_AUDIT.business_name}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{DEMO_AUDIT.business_description}</p>
        </div>
        <Button asChild>
          <Link href="/signup">Start Free Audit</Link>
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardContent className="flex flex-col items-center py-8">
            <p className="mb-4 text-sm font-medium text-muted-foreground">Overall Business Score</p>
            <ScoreRing score={DEMO_REPORT.overallScore} />
          </CardContent>
        </Card>
        <ScoreRadar categories={DEMO_REPORT.categories} />
      </div>
      <CategoryCards categories={DEMO_REPORT.categories} />
      <CategoryDetails categories={DEMO_REPORT.categories} />
      <ExecutiveSummarySection summary={DEMO_REPORT.executiveSummary} />
      <div className="grid gap-4 md:grid-cols-2">
        <FindingsList title="Strengths" items={DEMO_REPORT.strengths} tone="positive" />
        <FindingsList title="Weaknesses" items={DEMO_REPORT.weaknesses} tone="negative" />
      </div>
      <Recommendations items={DEMO_REPORT.recommendations} />
      <GrowthPlanSection plan={DEMO_REPORT.growthPlan} />
    </div>
  );
}
