import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/ensure-profile";
import { getProfile } from "@/services/users";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function assertActiveAccount(user: User) {
  const supabase = await createClient();
  const profile = await getProfile(supabase, user.id).catch(() => null);
  if (profile?.account_status === "suspended") {
    await supabase.auth.signOut();
    redirect("/login?error=suspended");
  }
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
    throw new Error("Unauthorized");
  }
  await ensureProfile(user);
  await assertActiveAccount(user);
  return user;
}
