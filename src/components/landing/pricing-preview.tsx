import Link from "next/link";
import { PLANS } from "@/lib/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PricingPreview() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">Pricing</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Start free. Scale with Pro or Agency.</h2>
        <p className="mt-3 text-muted-foreground">Three plans designed for founders, marketers, and client teams.</p>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {Object.values(PLANS).map((plan) => (
          <Card key={plan.id} className={plan.highlighted ? "border-primary shadow-lg" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">
                {plan.price}
                <span className="text-sm font-normal text-muted-foreground"> / {plan.priceLabel}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Button asChild>
          <Link href="/pricing">Compare plans</Link>
        </Button>
      </div>
    </section>
  );
}
