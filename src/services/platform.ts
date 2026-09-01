import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/supabase";
import type { CompetitorAnalysisRow, ReportMessageRow, UserSettingsRow } from "@/types/database";
import type { CompetitorComparison } from "@/types/competitor";

export async function getSettings(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return (data as UserSettingsRow | null) ?? null;
}

export async function upsertSettings(
  supabase: SupabaseClient<Database>,
  userId: string,
  values: { company_name?: string | null; workspace_type?: "solo" | "agency"; default_industry?: string | null }
) {
  const { error } = await supabase.from("user_settings").upsert({ user_id: userId, ...values });
  if (error) throw error;
}

export async function listReportMessages(supabase: SupabaseClient<Database>, auditId: string) {
  const { data, error } = await supabase
    .from("report_messages")
    .select("*")
    .eq("audit_id", auditId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ReportMessageRow[];
}

export async function saveReportMessage(
  supabase: SupabaseClient<Database>,
  values: { audit_id: string; user_id: string; role: "user" | "assistant"; content: string }
) {
  const { data, error } = await supabase.from("report_messages").insert(values).select().single();
  if (error) throw error;
  return data as ReportMessageRow;
}

export async function latestCompetitorAnalysis(supabase: SupabaseClient<Database>, auditId: string) {
  const { data, error } = await supabase
    .from("competitor_analyses")
    .select("*")
    .eq("audit_id", auditId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as CompetitorAnalysisRow | null) ?? null;
}

export async function saveCompetitorAnalysis(
  supabase: SupabaseClient<Database>,
  values: { audit_id: string; user_id: string; payload: CompetitorComparison }
) {
  const { data, error } = await supabase
    .from("competitor_analyses")
    .insert({
      audit_id: values.audit_id,
      user_id: values.user_id,
      payload: values.payload as unknown as Json,
    })
    .select()
    .single();
  if (error) throw error;
  return data as CompetitorAnalysisRow;
}

export async function listCompetitorAnalyses(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 50
): Promise<
  (CompetitorAnalysisRow & {
    audits: { business_name: string; website_url: string } | null;
  })[]
> {
  const { data, error } = await supabase
    .from("competitor_analyses")
    .select("*, audits(business_name, website_url)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as (CompetitorAnalysisRow & {
    audits: { business_name: string; website_url: string } | null;
  })[];
}

export async function getCompetitorAnalysis(
  supabase: SupabaseClient<Database>,
  id: string,
  userId: string
): Promise<
  | (CompetitorAnalysisRow & {
      audits: { business_name: string; website_url: string; id: string } | null;
    })
  | null
> {
  const { data, error } = await supabase
    .from("competitor_analyses")
    .select("*, audits(business_name, website_url, id)")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as
    | (CompetitorAnalysisRow & {
        audits: { business_name: string; website_url: string; id: string } | null;
      })
    | null;
}

export async function listAllReportMessages(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 100
) {
  const { data, error } = await supabase
    .from("report_messages")
    .select("*, audits(business_name, website_url)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as (ReportMessageRow & {
    audits: { business_name: string; website_url: string } | null;
  })[];
}
