import Link from "next/link";
import { PLANS, normalizePlan, planDisplayName } from "@/lib/billing";
import type { UsageSnapshot } from "@/services/billing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const EMPTY_USAGE: UsageSnapshot = {
  plan: "free",
  status: "active",
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
};

export function UsageMetrics({ usage }: { usage?: UsageSnapshot | null }) {
  const safe = usage ?? EMPTY_USAGE;
  const plan = PLANS[normalizePlan(safe.plan)] ?? PLANS.free;
  const used = safe.used ?? 0;
  const limit = safe.limit;
  const competitorUsed = safe.competitorUsed ?? 0;
  const competitorLimit = safe.competitorLimit;
  const auditPercent =
    limit == null || limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const competitorPercent =
    competitorLimit == null || competitorLimit === 0
      ? 0
      : Math.min(100, Math.round((competitorUsed / competitorLimit) * 100));

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Usage this month</CardTitle>
          <CardDescription>
            {planDisplayName(safe.plan)} plan · {plan.description || ""}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/billing">Billing</Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Audits</span>
            <span className="font-medium">
              {used}
              {limit == null ? " / unlimited" : ` / ${limit}`}
            </span>
          </div>
          {limit != null ? <Progress value={auditPercent} className="h-2" /> : null}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Competitor analyses</span>
            <span className="font-medium">
              {competitorUsed}
              {competitorLimit == null ? " / unlimited" : ` / ${competitorLimit}`}
            </span>
          </div>
          {competitorLimit != null ? <Progress value={competitorPercent} className="h-2" /> : null}
        </div>
      </CardContent>
    </Card>
  );
}
