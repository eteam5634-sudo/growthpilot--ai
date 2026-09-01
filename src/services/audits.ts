import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { AuditRow, AuditWithReport, ReportRow } from "@/types/database";
import type { Paginated } from "@/lib/pagination";
import { paginateRange, totalPages } from "@/lib/pagination";
import type { NewAuditInput } from "@/types/audit";
import type { AuditReportPayload, ParsedReport } from "@/types/report";
import { clampScore } from "@/lib/utils";
import { normalizeCategories } from "@/lib/scores";

function firstReport(reports: ReportRow | ReportRow[] | null) {
  if (!reports) return null;
  return Array.isArray(reports) ? reports[0] ?? null : reports;
}

export function parseReportRow(row: ReportRow): ParsedReport {
  const categories = normalizeCategories(row.category_details);
  categories.seo.score = clampScore(row.seo_score);
  categories.conversion.score = clampScore(row.conversion_score);
  categories.ux.score = clampScore(row.ux_score);
  categories.trust.score = clampScore(row.trust_score);
  categories.brand.score = clampScore(row.brand_score);
  const executive = (row.executive_summary || {}) as ParsedReport["executiveSummary"];

  return {
    id: row.id,
    auditId: row.audit_id,
    createdAt: row.created_at,
    overallScore: Math.round(
      (row.seo_score + row.conversion_score + row.ux_score + row.trust_score + row.brand_score) / 5
    ),
    categories,
    executiveSummary: {
      businessOverview: executive.businessOverview || "",
      topOpportunities: Array.isArray(executive.topOpportunities) ? executive.topOpportunities : [],
      keyRisks: Array.isArray(executive.keyRisks) ? executive.keyRisks : [],
    },
    strengths: Array.isArray(row.strengths) ? (row.strengths as string[]) : [],
    weaknesses: Array.isArray(row.weaknesses) ? (row.weaknesses as string[]) : [],
    recommendations: Array.isArray(row.recommendations)
      ? (row.recommendations as ParsedReport["recommendations"])
      : [],
    growthPlan: {
      immediateActions: Array.isArray((row.growth_plan as ParsedReport["growthPlan"])?.immediateActions)
        ? (row.growth_plan as ParsedReport["growthPlan"]).immediateActions
        : [],
      next30Days: Array.isArray((row.growth_plan as ParsedReport["growthPlan"])?.next30Days)
        ? (row.growth_plan as ParsedReport["growthPlan"]).next30Days
        : [],
    },
  };
}

export async function listAudits(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AuditRow[];
}

export async function listAuditsPaginated(
  supabase: SupabaseClient<Database>,
  userId: string,
  options: { page?: number; pageSize?: number; status?: string; query?: string } = {}
) {
  const { page = 1, pageSize = 10, status, query } = options;
  const { from, to } = paginateRange(page, pageSize);

  let request = supabase
    .from("audits")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && status !== "all") {
    request = request.eq("status", status as AuditRow["status"]);
  }
  if (query?.trim()) {
    request = request.or(
      `business_name.ilike.%${query}%,website_url.ilike.%${query}%,industry.ilike.%${query}%`
    );
  }

  const { data, error, count } = await request;
  if (error) throw error;

  const result: Paginated<AuditRow> = {
    data: (data ?? []) as AuditRow[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: totalPages(count ?? 0, pageSize),
  };
  return result;
}

export async function listReportsPaginated(
  supabase: SupabaseClient<Database>,
  userId: string,
  options: { page?: number; pageSize?: number } = {}
) {
  const { page = 1, pageSize = 10 } = options;
  const { from, to } = paginateRange(page, pageSize);

  const { data, error, count } = await supabase
    .from("audits")
    .select("*, reports(*)", { count: "exact" })
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data ?? []) as AuditWithReport[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: totalPages(count ?? 0, pageSize),
  } satisfies Paginated<AuditWithReport>;
}

export async function getAudit(supabase: SupabaseClient<Database>, id: string, userId: string) {
  const { data, error } = await supabase
    .from("audits")
    .select("*, reports(*)")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data as AuditWithReport | null) ?? null;
}

export async function createAudit(supabase: SupabaseClient<Database>, userId: string, input: NewAuditInput) {
  const { data, error } = await supabase
    .from("audits")
    .insert({
      user_id: userId,
      website_url: input.websiteUrl,
      business_name: input.businessName,
      industry: input.industry,
      business_description: input.businessDescription || null,
      client_id: input.clientId || null,
      status: "analyzing",
    })
    .select()
    .single();

  if (error) throw error;
  return data as AuditRow;
}

export async function saveCompletedAudit(
  supabase: SupabaseClient<Database>,
  auditId: string,
  report: AuditReportPayload
) {
  const { error: reportError } = await supabase.from("reports").insert({
    audit_id: auditId,
    seo_score: report.categories.seo.score,
    conversion_score: report.categories.conversion.score,
    ux_score: report.categories.ux.score,
    trust_score: report.categories.trust.score,
    brand_score: report.categories.brand.score,
    category_details: report.categories,
    executive_summary: report.executiveSummary,
    strengths: report.strengths,
    weaknesses: report.weaknesses,
    recommendations: report.recommendations,
    growth_plan: report.growthPlan,
  });

  if (reportError) throw reportError;

  const { error: auditError } = await supabase
    .from("audits")
    .update({
      status: "completed",
      overall_score: report.overallScore,
      error_message: null,
    })
    .eq("id", auditId);

  if (auditError) throw auditError;
}

export async function markAuditFailed(supabase: SupabaseClient<Database>, auditId: string, message: string) {
  const { error } = await supabase
    .from("audits")
    .update({
      status: "failed",
      error_message: message,
    })
    .eq("id", auditId);

  if (error) throw error;
}

export async function deleteAudit(supabase: SupabaseClient<Database>, auditId: string, userId: string) {
  const { error } = await supabase.from("audits").delete().eq("id", auditId).eq("user_id", userId);
  if (error) throw error;
}

export async function listCompletedReports(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 8
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

export function reportFromAudit(audit: AuditWithReport): ParsedReport | null {
  const row = firstReport(audit.reports);
  if (!row) return null;
  const parsed = parseReportRow(row);
  return {
    ...parsed,
    overallScore: audit.overall_score ?? parsed.overallScore,
  };
}
