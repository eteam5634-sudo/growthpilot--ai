import Link from "next/link";
import { startCheckoutAction } from "@/actions/billing";
import { PLANS, normalizePlan, type PlanId } from "@/lib/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { UsageSnapshot } from "@/services/billing";

export function BillingCard({
  usage,
  checkoutNotice,
}: {
  usage: UsageSnapshot;
  checkoutNotice?: string | null;
}) {
  const plan = PLANS[normalizePlan(usage.plan)];
  const usagePercent =
    usage.limit == null || usage.limit === 0
      ? 0
      : Math.min(100, Math.round((usage.used / usage.limit) * 100));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan & usage</CardTitle>
        <CardDescription>
          {plan.name} plan · {plan.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {checkoutNotice ? (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            {checkoutNotice}
          </p>
        ) : null}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="text-2xl font-semibold">{plan.name}</p>
            <p className="text-sm text-muted-foreground">
              {plan.price} / {plan.priceLabel}
            </p>
          </div>
          {usage.plan !== "agency" ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/pricing">Change plan</Link>
            </Button>
          ) : null}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Audits this month</span>
            <span className="font-medium">
              {usage.used}
              {usage.limit == null ? " / unlimited" : ` / ${usage.limit}`}
            </span>
          </div>
          {usage.limit != null ? <Progress value={usagePercent} className="h-2" /> : null}
          {usage.remaining === 0 && usage.limit != null ? (
            <p className="text-sm text-destructive">
              You have reached your monthly audit limit. Upgrade to keep running audits.
            </p>
          ) : null}
        </div>
        {usage.plan === "free" ? (
          <form action={startCheckoutAction.bind(null, "professional" satisfies PlanId)}>
            <Button type="submit" className="w-full sm:w-auto">
              Upgrade to Professional
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
