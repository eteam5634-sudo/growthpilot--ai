import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import {
  type PlanId,
  auditLimitForPlan,
  canRunAudit,
  canRunCompetitorAnalysis,
  competitorLimitForPlan,
  normalizePlan,
} from "@/lib/billing";
import type { PaymentRow, SubscriptionRow, UsageLimitRow } from "@/types/database";

function startOfMonth(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)).toISOString().slice(0, 10);
}

function monthYear(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getSubscription(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return (data as SubscriptionRow | null) ?? null;
}

export async function listPayments(supabase: SupabaseClient<Database>, userId: string, limit = 20) {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as PaymentRow[];
}

export async function ensureBillingRecords(supabase: SupabaseClient<Database>, userId: string) {
  const periodStart = startOfMonth();
  const month = monthYear();
  await supabase
    .from("subscriptions")
    .upsert({ user_id: userId, plan: "free", status: "active" }, { onConflict: "user_id" });

  const { data: existing } = await supabase
    .from("usage_limits")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  const row = existing as UsageLimitRow | null;
  const plan = normalizePlan(row?.plan ?? "free");
  const auditLimit = auditLimitForPlan(plan);
  const competitorLimit = competitorLimitForPlan(plan);

  if (!row) {
    await supabase.from("usage_limits").insert({
      user_id: userId,
      plan: plan as never,
      audits_used: 0,
      competitor_reports_used: 0,
      audits_limit: auditLimit,
      competitor_reports_limit: competitorLimit,
      period_start: periodStart,
      month_year: month,
    } as never);
    return;
  }

  if (row.period_start !== periodStart) {
    await supabase
      .from("usage_limits")
      .update({
        audits_used: 0,
        competitor_reports_used: 0,
        period_start: periodStart,
        month_year: month,
        audits_limit: auditLimit,
        competitor_reports_limit: competitorLimit,
        plan: plan as never,
      } as never)
      .eq("user_id", userId);
  }
}

export type UsageSnapshot = Awaited<ReturnType<typeof getUsage>>;

export async function getUsage(supabase: SupabaseClient<Database>, userId: string) {
  await ensureBillingRecords(supabase, userId).catch(() => undefined);
  const periodStart = startOfMonth();
  const [{ data: sub }, { data: usage }, auditCount, competitorCount] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("usage_limits").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("audits")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", `${periodStart}T00:00:00.000Z`),
    supabase
      .from("competitor_analyses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", `${periodStart}T00:00:00.000Z`),
  ]);

  const subscription = (sub as SubscriptionRow | null) ?? null;
  const plan = normalizePlan(subscription?.plan ?? (usage as UsageLimitRow | null)?.plan ?? "free") as PlanId;
  const used = auditCount.count ?? (usage as UsageLimitRow | null)?.audits_used ?? 0;
  const competitorUsed =
    competitorCount.count ?? (usage as UsageLimitRow | null)?.competitor_reports_used ?? 0;
  const limit = auditLimitForPlan(plan);
  const competitorLimit = competitorLimitForPlan(plan);

  return {
    plan,
    status: subscription?.status ?? "active",
    used,
    limit,
    remaining: limit == null ? null : Math.max(limit - used, 0),
    competitorUsed,
    competitorLimit,
    competitorRemaining:
      competitorLimit == null ? null : Math.max(competitorLimit - competitorUsed, 0),
    periodStart,
    renewalDate: subscription?.expires_at ?? subscription?.current_period_end ?? null,
    canRun: canRunAudit(plan, used),
    canRunCompetitor: canRunCompetitorAnalysis(plan, competitorUsed),
  };
}

export async function incrementAuditUsage(supabase: SupabaseClient<Database>, userId: string) {
  try {
    await ensureBillingRecords(supabase, userId);
    const { data } = await supabase.from("usage_limits").select("audits_used").eq("user_id", userId).maybeSingle();
    const used = (data as { audits_used: number } | null)?.audits_used ?? 0;
    await supabase.from("usage_limits").update({ audits_used: used + 1 }).eq("user_id", userId);
  } catch {
    // Best-effort counter; audit table is source of truth.
  }
}

export async function incrementCompetitorUsage(supabase: SupabaseClient<Database>, userId: string) {
  try {
    await ensureBillingRecords(supabase, userId);
    const { data } = await supabase
      .from("usage_limits")
      .select("competitor_reports_used")
      .eq("user_id", userId)
      .maybeSingle();
    const used = (data as { competitor_reports_used: number } | null)?.competitor_reports_used ?? 0;
    await supabase
      .from("usage_limits")
      .update({ competitor_reports_used: used + 1 } as never)
      .eq("user_id", userId);
  } catch {
    // Best-effort counter.
  }
}

type SubscriptionStatus = SubscriptionRow["status"];

export async function syncSubscriptionPlan(
  supabase: SupabaseClient<Database>,
  params: {
    userId: string;
    plan: PlanId;
    status?: SubscriptionStatus;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    currentPeriodEnd?: string | null;
  }
) {
  const plan = normalizePlan(params.plan);
  const status = params.status ?? "active";
  await supabase.from("subscriptions").upsert(
    {
      user_id: params.userId,
      plan: plan as never,
      status,
      stripe_customer_id: params.stripeCustomerId ?? null,
      stripe_subscription_id: params.stripeSubscriptionId ?? null,
      current_period_end: params.currentPeriodEnd ?? null,
      expires_at: params.currentPeriodEnd ?? null,
      started_at: new Date().toISOString(),
    } as never,
    { onConflict: "user_id" }
  );

  await supabase.from("usage_limits").upsert(
    {
      user_id: params.userId,
      plan: plan as never,
      audits_limit: auditLimitForPlan(plan),
      competitor_reports_limit: competitorLimitForPlan(plan),
    } as never,
    { onConflict: "user_id" }
  );
}

export async function recordPayment(
  supabase: SupabaseClient<Database>,
  params: {
    userId: string;
    stripePaymentId: string;
    amountCents: number;
    currency: string;
    status: string;
    paymentMethod?: string;
    stripePaymentIntent?: string;
  }
) {
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("stripe_payment_id", params.stripePaymentId)
    .maybeSingle();
  if (existing) return;

  await supabase.from("payments").insert({
    user_id: params.userId,
    stripe_payment_id: params.stripePaymentId,
    stripe_payment_intent: params.stripePaymentIntent ?? params.stripePaymentId,
    amount_cents: params.amountCents,
    currency: params.currency,
    status: params.status,
    payment_method: params.paymentMethod ?? "card",
  } as never);
}
