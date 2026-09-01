import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditRow } from "@/types/database";

export function GrowthInsights({ audits }: { audits: AuditRow[] }) {
  const completed = audits.filter((audit) => audit.status === "completed" && audit.overall_score != null);
  const insights: string[] = [];

  if (completed.length === 0) {
    insights.push("Run your first audit to unlock personalized growth insights.");
  } else {
    const latest = completed[0];
    const average =
      completed.reduce((sum, audit) => sum + (audit.overall_score ?? 0), 0) / completed.length;

    if ((latest.overall_score ?? 0) < 70) {
      insights.push("Your latest overall score is below 70. Focus first on conversion and trust gaps.");
    } else {
      insights.push("Latest score is in a healthy range. Push for compounding wins in SEO and brand clarity.");
    }

    if (completed.length >= 2) {
      const previous = completed[1];
      const delta = (latest.overall_score ?? 0) - (previous.overall_score ?? 0);
      insights.push(
        delta >= 0
          ? `Overall score improved by ${delta} points versus the previous audit.`
          : `Overall score dropped by ${Math.abs(delta)} points. Revisit unresolved recommendations.`
      );
    }

    insights.push(`Average completed-audit score is currently ${Math.round(average)}.`);
    insights.push("Download the PDF after each audit so stakeholders can execute without logging in.");
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Growth Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {insights.map((insight) => (
            <li key={insight} className="flex gap-3 text-sm leading-6 text-muted-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              {insight}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
