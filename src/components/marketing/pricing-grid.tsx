"use client";

import { startCheckoutAction } from "@/actions/billing";
import { PLANS, type PlanId } from "@/lib/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PricingGrid({
  currentPlan,
  notice,
}: {
  currentPlan?: PlanId;
  notice?: string | null;
}) {
  return (
    <div className="space-y-6">
      {notice ? <p className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">{notice}</p> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.values(PLANS).map((plan) => {
          const current = currentPlan === plan.id || (currentPlan === "pro" && plan.id === "professional");
          return (
            <Card key={plan.id} className={plan.highlighted ? "border-primary shadow-lg" : ""}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-semibold">
                  {plan.price}
                  <span className="text-sm font-normal text-muted-foreground"> / {plan.priceLabel}</span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                {plan.id === "free" ? (
                  <Button className="w-full" variant={current ? "secondary" : "outline"} asChild>
                    <a href="/signup">{current ? "Current plan" : "Start free"}</a>
                  </Button>
                ) : (
                  <form action={startCheckoutAction.bind(null, plan.id)}>
                    <Button className="w-full" type="submit" variant={current ? "secondary" : "default"}>
                      {current ? "Current plan" : `Upgrade to ${plan.name}`}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
