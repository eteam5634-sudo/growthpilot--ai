import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { UserRow } from "@/types/database";

export async function getProfile(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return (data as UserRow | null) ?? null;
}

export async function updateProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  values: { full_name?: string; email?: string }
) {
  const { error } = await supabase.from("users").update(values).eq("id", userId);
  if (error) throw error;
}
