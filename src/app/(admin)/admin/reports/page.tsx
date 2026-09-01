import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { listAllReports } from "@/services/admin";
import { AdminEmptyState, AdminErrorState, AdminPageHeader, AdminTableShell } from "@/features/admin/admin-ui";
import { formatDate, hostnameFromUrl } from "@/lib/utils";

export const metadata = { title: "Admin reports" };

export default async function AdminReportsPage() {
  const { supabase } = await requireAdmin();
  let error: string | null = null;
  const rows = await listAllReports(supabase).catch((err: Error) => {
    error = err.message;
    return [];
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <AdminPageHeader title="Reports" description="Scores from completed audits." />
      {error ? <AdminErrorState message={error} /> : null}
      {rows.length === 0 && !error ? (
        <AdminEmptyState message="No reports yet." />
      ) : (
        <AdminTableShell>
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Audit</th>
                <th className="px-4 py-3 font-medium">SEO</th>
                <th className="px-4 py-3 font-medium">Conversion</th>
                <th className="px-4 py-3 font-medium">UX</th>
                <th className="px-4 py-3 font-medium">Trust</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((report) => (
                <tr key={report.id} className="border-t">
                  <td className="px-4 py-3">
                    <Link href={`/reports/${report.audit_id}`} className="font-medium hover:underline">
                      {report.audits?.business_name || report.audit_id}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {report.audits?.website_url
                        ? hostnameFromUrl(report.audits.website_url)
                        : null}
                      {report.audits?.created_at ? ` · ${formatDate(report.audits.created_at)}` : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{report.seo_score}</td>
                  <td className="px-4 py-3 tabular-nums">{report.conversion_score}</td>
                  <td className="px-4 py-3 tabular-nums">{report.ux_score}</td>
                  <td className="px-4 py-3 tabular-nums">{report.trust_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      )}
    </div>
  );
}
