import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/ensure-profile";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
    throw new Error("Unauthorized");
  }
  await ensureProfile(user);
  return user;
}
