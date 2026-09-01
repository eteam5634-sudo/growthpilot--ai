import { requireAdmin } from "@/lib/admin";
import { listAllPayments } from "@/services/admin";
import { Badge } from "@/components/ui/badge";
import { AdminEmptyState, AdminErrorState, AdminPageHeader, AdminTableShell } from "@/features/admin/admin-ui";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Admin payments" };

export default async function AdminPaymentsPage() {
  const { supabase } = await requireAdmin();
  let error: string | null = null;
  const rows = await listAllPayments(supabase).catch((err: Error) => {
    error = err.message;
    return [];
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <AdminPageHeader title="Payments" description="Payment history from the payments table." />
      {error ? <AdminErrorState message={error} /> : null}
      {rows.length === 0 && !error ? (
        <AdminEmptyState message="No payments recorded yet." />
      ) : (
        <AdminTableShell>
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Currency</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((payment) => (
                <tr key={payment.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {payment.users?.full_name || payment.users?.email || payment.user_id}
                    </div>
                    {payment.users?.full_name ? (
                      <div className="text-xs text-muted-foreground">{payment.users.email}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    ${((payment.amount_cents ?? 0) / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 uppercase text-muted-foreground">
                    {(payment.currency || "usd").toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{payment.payment_method || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{payment.status || "unknown"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      )}
    </div>
  );
}
