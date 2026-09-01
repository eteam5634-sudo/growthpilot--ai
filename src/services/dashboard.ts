import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { AuditRow, AuditWithReport, ClientNoteRow, ReportRow } from "@/types/database";
import { getUsage } from "@/services/billing";

export type DashboardStats = {
  totalAudits: number;
  totalReports: number;
  totalClients: number;
  totalCompetitorAnalyses: number;
  averageScore: number | null;
  usage: Awaited<ReturnType<typeof getUsage>>;
};

export type ClientActivityRow = ClientNoteRow & {
  clients: { name: string } | null;
};

export async function getDashboardStats(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<DashboardStats> {
  const [auditsRes, reportsRes, clientsRes, competitorsRes, usage] = await Promise.all([
    supabase.from("audits").select("id, overall_score", { count: "exact" }).eq("user_id", userId),
    supabase
      .from("audits")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("competitor_analyses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    getUsage(supabase, userId).catch(() => ({
      plan: "free" as const,
      status: "active" as const,
      used: 0,
      limit: 5,
      remaining: 5,
      competitorUsed: 0,
      competitorLimit: 2,
      competitorRemaining: 2,
      periodStart: new Date().toISOString().slice(0, 10),
      renewalDate: null,
      canRun: true,
      canRunCompetitor: true,
    })),
  ]);

  const scores = ((auditsRes.data ?? []) as Pick<AuditRow, "overall_score">[])
    .map((row) => row.overall_score)
    .filter((score): score is number => score != null);

  return {
    totalAudits: auditsRes.count ?? 0,
    totalReports: reportsRes.count ?? 0,
    totalClients: clientsRes.count ?? 0,
    totalCompetitorAnalyses: competitorsRes.count ?? 0,
    averageScore: scores.length
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : null,
    usage,
  };
}

export async function getRecentAudits(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 5
) {
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AuditRow[];
}

export async function getRecentReports(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 5
) {
  const { data, error } = await supabase
    .from("audits")
    .select("*, reports(*)")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AuditWithReport[];
}

export async function getRecentClientActivity(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 5
) {
  const { data, error } = await supabase
    .from("client_notes")
    .select("*, clients(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ClientActivityRow[];
}

export async function getAuditsForChart(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 30
) {
  const { data, error } = await supabase
    .from("audits")
    .select("id, created_at, overall_score, status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export type ReportListItem = AuditWithReport & { reports: ReportRow | ReportRow[] | null };
