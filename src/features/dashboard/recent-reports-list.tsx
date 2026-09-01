import Link from "next/link";
import { formatDate, hostnameFromUrl } from "@/lib/utils";
import { scoreColorClass } from "@/lib/scores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditWithReport } from "@/types/database";

export function RecentReportsList({ reports }: { reports: AuditWithReport[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent reports</CardTitle>
        <Link href="/reports" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completed reports yet.</p>
        ) : (
          reports.map((audit) => (
            <Link
              key={audit.id}
              href={`/reports/${audit.id}`}
              className="flex items-center justify-between rounded-lg border px-3 py-2 transition-colors hover:bg-muted/40"
            >
              <div>
                <div className="text-sm font-medium">{audit.business_name}</div>
                <div className="text-xs text-muted-foreground">
                  {hostnameFromUrl(audit.website_url)} · {formatDate(audit.created_at)}
                </div>
              </div>
              {audit.overall_score != null ? (
                <span className={`text-lg font-semibold ${scoreColorClass(audit.overall_score)}`}>
                  {audit.overall_score}
                </span>
              ) : null}
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
