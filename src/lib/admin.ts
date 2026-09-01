import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/services/users";
import { adminEmails } from "@/lib/admin-emails";
import type { UserRow } from "@/types/database";

export { adminEmails } from "@/lib/admin-emails";

/** Access requires users.role = 'admin'. ADMIN_EMAILS are auto-promoted on check. */
export function isAdminUser(_user: User, profile: UserRow | null) {
  return profile?.role === "admin";
}

export async function requireAdmin() {
  const user = await requireUser();
  const supabase = await createClient();
  let profile = await getProfile(supabase, user.id).catch(() => null);

  const email = (user.email || "").toLowerCase();
  if (email && adminEmails().includes(email) && profile?.role !== "admin") {
    await supabase.from("users").update({ role: "admin" }).eq("id", user.id);
    profile = await getProfile(supabase, user.id).catch(() => profile);
  }

  if (!isAdminUser(user, profile)) {
    redirect("/dashboard");
  }
  return { user, supabase, profile };
}
