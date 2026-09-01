import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { reportFromAudit } from "@/services/audits";
import type { AuditWithReport } from "@/types/database";

export function LatestRecommendations({ audits }: { audits: AuditWithReport[] }) {
  const latest = audits
    .map((audit) => ({ audit, report: reportFromAudit(audit) }))
    .find((item) => item.report?.recommendations?.length);

  const items = latest?.report?.recommendations.slice(0, 4) ?? [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Latest recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Complete an audit to see prioritized fixes here.
          </p>
        ) : (
          items.map((item) => (
            <Link
              key={item.issue}
              href={`/audits/${latest?.audit.id}`}
              className="block rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{item.issue}</p>
                <Badge variant={item.priority === "high" ? "danger" : item.priority === "medium" ? "warning" : "secondary"}>
                  {item.priority}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{item.suggestedFix}</p>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
