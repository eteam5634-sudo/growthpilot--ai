import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await requireAdmin();

  return (
    <div className="flex min-h-full">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64 border-r">
          <AdminSidebar />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          user={{
            email: profile?.email || user.email || "",
            name: profile?.full_name || (user.user_metadata?.full_name as string | undefined) || null,
            isAdmin: true,
          }}
          mobileNav={<AdminSidebar />}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
