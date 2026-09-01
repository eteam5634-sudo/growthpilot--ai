import { requireAdmin } from "@/lib/admin";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/features/admin/admin-ui";

export const metadata = { title: "Admin settings" };

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <AdminPageHeader
        title="Admin settings"
        description="Configure operator access for GrowthPilot."
      />
      <Card>
        <CardHeader>
          <CardTitle>Admin access</CardTitle>
          <CardDescription>
            Admin pages require <code>users.role = &apos;admin&apos;</code>. Set{" "}
            <code>ADMIN_EMAILS</code> in the environment (comma-separated) to auto-promote matching
            accounts on login, or run:
            <br />
            <code className="mt-2 block rounded bg-muted px-2 py-1 text-xs">
              update public.users set role = &apos;admin&apos; where email = &apos;you@company.com&apos;;
            </code>
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Contact inquiries</CardTitle>
          <CardDescription>
            Inbound messages are listed under{" "}
            <a href="/admin/contacts" className="underline">
              Contacts
            </a>
            .
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
