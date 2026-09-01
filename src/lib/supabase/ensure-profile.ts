import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/services/users";
import { adminEmails } from "@/lib/admin-emails";
import { ensureBillingRecords } from "@/services/billing";
import type { User } from "@supabase/supabase-js";

export async function ensureProfile(user: User) {
  const supabase = await createClient();
  let profile = await getProfile(supabase, user.id);

  if (!profile) {
    const fullName =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      "";

    const { error } = await supabase.from("users").upsert({
      id: user.id,
      email: user.email ?? "",
      full_name: fullName,
    });
    if (error) throw error;
    profile = await getProfile(supabase, user.id);
  }

  const email = (user.email || "").toLowerCase();
  if (email && adminEmails().includes(email) && profile?.role !== "admin") {
    await supabase.from("users").update({ role: "admin" }).eq("id", user.id);
    profile = await getProfile(supabase, user.id);
  }

  await ensureBillingRecords(supabase, user.id).catch(() => undefined);
  return profile;
}
