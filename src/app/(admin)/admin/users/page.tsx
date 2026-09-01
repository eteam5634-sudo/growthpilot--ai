import { requireAdmin } from "@/lib/admin";
import { listAllUsers } from "@/services/admin";
import { Input } from "@/components/ui/input";
import { AdminPageHeader, AdminErrorState } from "@/features/admin/admin-ui";
import { AdminUsersTable } from "@/features/admin/users-table";

export const metadata = { title: "Admin users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { supabase } = await requireAdmin();
  let error: string | null = null;
  const users = await listAllUsers(supabase, q).catch((err: Error) => {
    error = err.message;
    return [];
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <AdminPageHeader
        title="Users"
        description="Manage roles and account status across the platform."
      />
      <form>
        <Input name="q" defaultValue={q} placeholder="Search name or email" className="max-w-sm" />
      </form>
      {error ? <AdminErrorState message={error} /> : null}
      <AdminUsersTable users={users} />
    </div>
  );
}
