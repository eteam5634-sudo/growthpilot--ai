import Link from "next/link";
import { formatDate, hostnameFromUrl, scoreLabel } from "@/lib/utils";
import { scoreColorClass } from "@/lib/scores";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditRow } from "@/types/database";

export function RecentAudits({ audits }: { audits: AuditRow[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Audits</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/audits/history">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {audits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audits yet. Run your first analysis to populate this feed.</p>
        ) : (
          audits.map((audit) => (
            <Link
              key={audit.id}
              href={`/audits/${audit.id}`}
              className="flex items-center justify-between rounded-lg border px-3 py-3 transition-colors hover:bg-muted/50"
            >
              <div>
                <div className="text-sm font-medium">{audit.business_name}</div>
                <div className="text-xs text-muted-foreground">
                  {hostnameFromUrl(audit.website_url)} · {formatDate(audit.created_at)}
                </div>
              </div>
              {audit.overall_score != null ? (
                <div className="text-right">
                  <div className={`text-lg font-semibold ${scoreColorClass(audit.overall_score)}`}>
                    {audit.overall_score}
                  </div>
                  <div className="text-[11px] text-muted-foreground">{scoreLabel(audit.overall_score)}</div>
                </div>
              ) : (
                <Badge variant="secondary">{audit.status}</Badge>
              )}
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
