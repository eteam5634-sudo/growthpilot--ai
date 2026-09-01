import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/services/users";
import { getSettings } from "@/services/platform";
import { adminEmails, isAdminUser } from "@/lib/admin";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const supabase = await createClient();
  const settings = await getSettings(supabase, user.id).catch(() => null);

let profile = await getProfile(supabase, user.id);
  const email = (user.email || "").toLowerCase();
  if (email && adminEmails().includes(email) && profile?.role !== "admin") {
    await supabase.from("users").update({ role: "admin" }).eq("id", user.id);
    profile = await getProfile(supabase, user.id).catch(() => profile);
  }
  const isAdmin = isAdminUser(user, profile);
  const isAgency = settings?.workspace_type !== "solo";

  return (
    <div className="flex min-h-full">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64 border-r">
          <AppSidebar isAdmin={isAdmin} isAgency={isAgency} />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          isAgency={isAgency}
          user={{
            email: profile?.email || user.email || "",
            name: profile?.full_name || (user.user_metadata?.full_name as string | undefined) || null,
            isAdmin,
          }}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
