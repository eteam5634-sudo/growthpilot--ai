import Link from "next/link";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getUsage, getSubscription, listPayments } from "@/services/billing";
import { UsageMetrics } from "@/features/dashboard/usage-metrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS, normalizePlan, planDisplayName } from "@/lib/billing";
import { formatDate } from "@/lib/utils";
import { startCheckoutAction } from "@/actions/billing";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const [usage, subscription, payments] = await Promise.all([
    getUsage(supabase, user.id).catch(() => null),
    getSubscription(supabase, user.id).catch(() => null),
    listPayments(supabase, user.id).catch(() => []),
  ]);

  if (!usage) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center text-muted-foreground">
        Unable to load billing data. Run migration 0003 and 0004 in Supabase.
      </div>
    );
  }

  const planKey = normalizePlan(usage.plan);
  const renewal = usage.renewalDate ?? subscription?.expires_at ?? subscription?.current_period_end;

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Current plan, usage limits, and payment history from Supabase.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/pricing">Compare plans</Link>
        </Button>
      </div>

      <UsageMetrics usage={usage} />

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Stripe-ready subscription record.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Plan</p>
            <p className="font-medium">{planDisplayName(usage.plan)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant="secondary">{usage.status || "active"}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Audits remaining</p>
            <p className="font-medium">
              {usage.remaining == null ? "Unlimited" : usage.remaining}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Renewal / period end</p>
            <p className="font-medium">{renewal ? formatDate(renewal) : "—"}</p>
          </div>
        </CardContent>
      </Card>

      {planKey !== "agency" ? (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(["starter", "professional", "agency"] as const)
              .filter((id) => id !== planKey)
              .map((id) => (
                <form key={id} action={startCheckoutAction.bind(null, id)}>
                  <Button type="submit" variant={id === "professional" ? "default" : "outline"} size="sm">
                    Upgrade to {PLANS[id].name}
                  </Button>
                </form>
              ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
          <CardDescription>Records from the payments table.</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      ${((payment.amount_cents ?? 0) / 100).toFixed(2)}{" "}
                      {(payment.currency || "usd").toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(payment.created_at)}</p>
                  </div>
                  <Badge variant="secondary">{payment.status || "unknown"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
