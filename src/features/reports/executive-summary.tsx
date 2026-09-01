import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExecutiveSummary } from "@/types/report";

export function ExecutiveSummarySection({ summary }: { summary: ExecutiveSummary }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Business overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-muted-foreground">{summary.businessOverview}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Top opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            {summary.topOpportunities.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Biggest problems</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            {summary.keyRisks.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-rose-500" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
