import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { setUserRoleAction, setUserAccountStatusAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/features/admin/admin-ui";
import { formatDate, hostnameFromUrl } from "@/lib/utils";
import type { AuditRow, UserRow } from "@/types/database";

export const metadata = { title: "Admin user" };

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data: user } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  if (!user) notFound();
  const profile = user as UserRow;
  const { data: audits } = await supabase
    .from("audits")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });
  const rows = (audits ?? []) as AuditRow[];
  const isAdmin = profile.role === "admin";
  const isSuspended = profile.account_status === "suspended";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <AdminPageHeader
        title={profile.full_name || profile.email}
        description={profile.email}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{profile.role || "user"}</Badge>
            <Badge variant={isSuspended ? "destructive" : "outline"}>
              {profile.account_status ?? "active"}
            </Badge>
            <form action={setUserRoleAction.bind(null, profile.id, isAdmin ? "user" : "admin")}>
              <Button type="submit" variant="outline" size="sm">
                {isAdmin ? "Remove admin" : "Make admin"}
              </Button>
            </form>
            <form
              action={setUserAccountStatusAction.bind(
                null,
                profile.id,
                isSuspended ? "active" : "suspended"
              )}
            >
              <Button type="submit" variant="outline" size="sm">
                {isSuspended ? "Activate" : "Suspend"}
              </Button>
            </form>
          </div>
        }
      />
      <div className="rounded-xl border">
        {rows.length === 0 ? (
          <p className="px-4 py-8 text-sm text-muted-foreground">This account has no audits yet.</p>
        ) : (
          rows.map((audit) => (
            <Link
              key={audit.id}
              href={`/reports/${audit.id}`}
              className="flex items-center justify-between border-b px-4 py-3 last:border-0 hover:bg-muted/40"
            >
              <div>
                  <div className="font-medium">{audit?.business_name || "Untitled audit"}</div>
                  <div className="text-xs text-muted-foreground">
                    {hostnameFromUrl(audit?.website_url)} · {formatDate(audit?.created_at)}
                  </div>
                </div>
                <Badge variant="secondary">{audit?.status || "unknown"}</Badge>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
