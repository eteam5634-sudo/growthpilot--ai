import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GrowthPlan } from "@/types/report";

function PlanList({
  items,
  empty,
  variant,
}: {
  items: string[];
  empty: string;
  variant: "primary" | "muted";
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <ol className="space-y-3 text-sm leading-6 text-muted-foreground">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3">
          <span
            className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              variant === "primary" ? "bg-primary/15 text-primary" : "bg-muted"
            }`}
          >
            {index + 1}
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}

export function GrowthPlanSection({ plan }: { plan: GrowthPlan }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Immediate actions</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanList items={plan.immediateActions} empty="No immediate actions stored." variant="primary" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Next 30 days</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanList items={plan.next30Days} empty="No 30-day actions stored." variant="muted" />
        </CardContent>
      </Card>
    </div>
  );
}
