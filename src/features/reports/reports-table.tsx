"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { formatDate, hostnameFromUrl } from "@/lib/utils";
import { scoreColorClass } from "@/lib/scores";
import { deleteAuditAction } from "@/actions/audits";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AuditWithReport, ReportRow } from "@/types/database";

function firstReport(reports: ReportRow | ReportRow[] | null) {
  if (!reports) return null;
  return Array.isArray(reports) ? reports[0] ?? null : reports;
}

export function ReportsTable({
  audits,
  pagination,
}: {
  audits: AuditWithReport[];
  pagination?: { page: number; totalPages: number; total: number };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Business</TableHead>
              <TableHead>SEO</TableHead>
              <TableHead>Conversion</TableHead>
              <TableHead>UX</TableHead>
              <TableHead>Trust</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audits.map((audit) => {
              const report = firstReport(audit.reports);
              return (
                <TableRow key={audit.id}>
                  <TableCell>
                    <div className="font-medium">{audit.business_name}</div>
                    <div className="text-xs text-muted-foreground">{hostnameFromUrl(audit.website_url)}</div>
                  </TableCell>
                  <TableCell className={report ? scoreColorClass(report.seo_score) : ""}>
                    {report?.seo_score ?? "—"}
                  </TableCell>
                  <TableCell className={report ? scoreColorClass(report.conversion_score) : ""}>
                    {report?.conversion_score ?? "—"}
                  </TableCell>
                  <TableCell className={report ? scoreColorClass(report.ux_score) : ""}>
                    {report?.ux_score ?? "—"}
                  </TableCell>
                  <TableCell className={report ? scoreColorClass(report.trust_score) : ""}>
                    {report?.trust_score ?? "—"}
                  </TableCell>
                  <TableCell>{formatDate(audit.created_at)}</TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/reports/${audit.id}`}>View</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/reports/${audit.id}#pdf`}>PDF</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => {
                        if (!confirm("Delete this report?")) return;
                        startTransition(async () => {
                          await deleteAuditAction(audit.id);
                          router.refresh();
                        });
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} reports
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1} asChild>
              <Link href={`/reports?page=${pagination.page - 1}`}>Previous</Link>
            </Button>
            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} asChild>
              <Link href={`/reports?page=${pagination.page + 1}`}>Next</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
