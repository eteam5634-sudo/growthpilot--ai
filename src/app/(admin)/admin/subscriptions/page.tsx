import { requireAdmin } from "@/lib/admin";
import { listAllSubscriptions } from "@/services/admin";
import { AdminPageHeader, AdminErrorState } from "@/features/admin/admin-ui";
import { AdminSubscriptionsTable } from "@/features/admin/subscriptions-table";

export const metadata = { title: "Admin subscriptions" };

export default async function AdminSubscriptionsPage() {
  const { supabase } = await requireAdmin();
  let error: string | null = null;
  const rows = await listAllSubscriptions(supabase).catch((err: Error) => {
    error = err.message;
    return [];
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <AdminPageHeader
        title="Subscriptions"
        description="Upgrade, downgrade, or cancel user plans."
      />
      {error ? <AdminErrorState message={error} /> : null}
      <AdminSubscriptionsTable rows={rows} />
    </div>
  );
}
