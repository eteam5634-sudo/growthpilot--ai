import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { ClientNoteRow, ClientRow } from "@/types/database";

export async function listClients(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClientRow[];
}

export async function getClient(supabase: SupabaseClient<Database>, id: string, userId: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as ClientRow | null) ?? null;
}

export async function listClientNotes(supabase: SupabaseClient<Database>, clientId: string, userId: string) {
  const { data, error } = await supabase
    .from("client_notes")
    .select("*")
    .eq("client_id", clientId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ClientNoteRow[];
}

export async function listClientAudits(supabase: SupabaseClient<Database>, clientId: string, userId: string) {
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("client_id", clientId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
