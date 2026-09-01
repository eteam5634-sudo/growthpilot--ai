import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { listAllAudits } from "@/services/admin";
import { Badge } from "@/components/ui/badge";
import { AdminEmptyState, AdminErrorState, AdminPageHeader, AdminTableShell } from "@/features/admin/admin-ui";
import { formatDate, hostnameFromUrl } from "@/lib/utils";

export const metadata = { title: "Admin audits" };

export default async function AdminAuditsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { supabase } = await requireAdmin();
  let error: string | null = null;
  const rows = await listAllAudits(
    supabase,
    status === "completed" || status === "failed" || status === "analyzing" || status === "pending"
      ? status
      : undefined
  ).catch((err: Error) => {
    error = err.message;
    return [];
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <AdminPageHeader title="Audits" description="Every audit across the platform." />
      <form className="flex flex-wrap gap-2 text-sm">
        {["", "completed", "failed", "analyzing", "pending"].map((value) => (
          <button
            key={value || "all"}
            name="status"
            value={value}
            className={`rounded-full border px-3 py-1 ${
              status === value || (!status && !value) ? "bg-primary text-primary-foreground" : ""
            }`}
          >
            {value || "All"}
          </button>
        ))}
      </form>
      {error ? <AdminErrorState message={error} /> : null}
      {rows.length === 0 && !error ? (
        <AdminEmptyState message="No audits found." />
      ) : (
        <AdminTableShell>
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Website URL</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((audit) => (
                <tr key={audit.id} className="border-t">
                  <td className="px-4 py-3">
                    <Link href={`/reports/${audit.id}`} className="font-medium hover:underline">
                      {hostnameFromUrl(audit.website_url)}
                    </Link>
                    <div className="text-xs text-muted-foreground">{audit.business_name}</div>
                  </td>
                  <td className="px-4 py-3">
                    {audit.users ? (
                      <Link href={`/admin/users/${audit.users.id}`} className="hover:underline">
                        {audit.users.full_name || audit.users.email}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">{audit.user_id}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{audit.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(audit.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      )}
    </div>
  );
}
