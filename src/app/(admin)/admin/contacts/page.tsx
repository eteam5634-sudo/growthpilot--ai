import { requireAdmin } from "@/lib/admin";
import { listContactInquiries } from "@/services/admin";
import { Card, CardContent } from "@/components/ui/card";
import { AdminEmptyState, AdminErrorState, AdminPageHeader } from "@/features/admin/admin-ui";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Admin contacts" };

export default async function AdminContactsPage() {
  const { supabase } = await requireAdmin();
  let error: string | null = null;
  const inquiries = await listContactInquiries(supabase).catch((err: Error) => {
    error = err.message;
    return [];
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <AdminPageHeader
        title="Contacts"
        description="Inbound messages from the contact_inquiries table."
      />
      {error ? <AdminErrorState message={error} /> : null}
      {inquiries.length === 0 && !error ? (
        <AdminEmptyState message="No contact inquiries yet." />
      ) : (
        <div className="space-y-3">
          {inquiries.map((item) => (
            <Card key={item.id}>
              <CardContent className="space-y-2 p-4 text-sm">
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                  <div className="font-medium">
                    {item.name} · {item.email}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(item.created_at)}</div>
                </div>
                {item.company ? <div className="text-xs text-muted-foreground">{item.company}</div> : null}
                <p className="leading-6 text-muted-foreground">{item.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
