import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { normalizePlan, type PlanId } from "@/lib/billing";
import type {
  AuditRow,
  ContactInquiryRow,
  PaymentRow,
  ReportRow,
  SubscriptionRow,
  UserRow,
} from "@/types/database";

type Db = SupabaseClient<Database>;

export type AdminUserRow = UserRow & {
  subscriptions?: Pick<SubscriptionRow, "plan" | "status"> | null;
};

export type AdminSubscriptionRow = SubscriptionRow & {
  users: Pick<UserRow, "id" | "email" | "full_name"> | null;
};

export type AdminPaymentRow = PaymentRow & {
  users: Pick<UserRow, "id" | "email" | "full_name"> | null;
};

export type AdminAuditRow = AuditRow & {
  users: Pick<UserRow, "id" | "email" | "full_name"> | null;
};

export type AdminReportRow = ReportRow & {
  audits: Pick<AuditRow, "id" | "business_name" | "website_url" | "user_id" | "created_at"> | null;
};

export type AdminOverviewStats = {
  totalUsers: number;
  activeUsers: number;
  totalAudits: number;
  totalReports: number;
  totalRevenueCents: number;
  freeUsers: number;
  starterUsers: number;
  professionalUsers: number;
  agencyUsers: number;
};

export type AdminMonthMetrics = {
  newUsersThisMonth: number;
  auditsThisMonth: number;
  revenueThisMonthCents: number;
  topActiveUsers: Array<{
    user_id: string;
    email: string;
    full_name: string | null;
    audit_count: number;
  }>;
};

export async function listAllUsers(supabase: Db, query?: string) {
  let request = supabase.from("users").select("*").order("created_at", { ascending: false }).limit(200);
  if (query) {
    request = request.or(`email.ilike.%${query}%,full_name.ilike.%${query}%`);
  }
  const { data, error } = await request;
  if (error) throw error;
  return (data ?? []) as UserRow[];
}

export async function listAllAudits(supabase: Db, status?: AuditRow["status"]) {
  let request = supabase
    .from("audits")
    .select("*, users(id, email, full_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) request = request.eq("status", status);
  const { data, error } = await request;
  if (error) throw error;
  return (data ?? []) as AdminAuditRow[];
}

export async function listAllReports(supabase: Db) {
  const { data, error } = await supabase
    .from("reports")
    .select("*, audits(id, business_name, website_url, user_id, created_at)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as AdminReportRow[];
}

export async function listAllSubscriptions(supabase: Db) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, users(id, email, full_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as AdminSubscriptionRow[];
}

export async function listAllPayments(supabase: Db) {
  const { data, error } = await supabase
    .from("payments")
    .select("*, users(id, email, full_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as AdminPaymentRow[];
}

export async function listAnalyticsEvents(supabase: Db, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("analytics_events")
    .select("*")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) throw error;
  return data ?? [];
}

export async function listContactInquiries(supabase: Db) {
  const { data, error } = await supabase
    .from("contact_inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as ContactInquiryRow[];
}

export async function countTable(
  supabase: Db,
  table:
    | "users"
    | "audits"
    | "reports"
    | "analytics_events"
    | "clients"
    | "competitor_analyses"
    | "subscriptions"
    | "payments"
    | "contact_inquiries"
) {
  const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function setUserRole(supabase: Db, userId: string, role: "user" | "admin") {
  const { error } = await supabase.from("users").update({ role }).eq("id", userId);
  if (error) throw error;
}

export async function setUserAccountStatus(
  supabase: Db,
  userId: string,
  accountStatus: "active" | "suspended"
) {
  const { error } = await supabase
    .from("users")
    .update({ account_status: accountStatus } as never)
    .eq("id", userId);
  if (error) throw error;
}

export async function updateSubscriptionPlan(
  supabase: Db,
  subscriptionId: string,
  plan: Exclude<PlanId, "pro">
) {
  const { error } = await supabase
    .from("subscriptions")
    .update({ plan, status: "active", updated_at: new Date().toISOString() } as never)
    .eq("id", subscriptionId);
  if (error) throw error;
}

export async function cancelSubscription(supabase: Db, subscriptionId: string) {
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      plan: "free",
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", subscriptionId);
  if (error) throw error;
}

export async function getUserProfileStats(supabase: Db, userId: string) {
  const [audits, reports, subscription] = await Promise.all([
    supabase.from("audits").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("audits")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  return {
    totalAudits: audits.count ?? 0,
    totalReports: reports.count ?? 0,
    subscription: subscription.data,
  };
}

export async function usersCreatedByDay(supabase: Db, days = 14) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("users")
    .select("id, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function auditsCreatedByDay(supabase: Db, days = 14) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("audits")
    .select("id, created_at, status")
    .gte("created_at", since)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

function monthStartIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function getAdminOverviewStats(supabase: Db): Promise<AdminOverviewStats> {
  const [usersRes, auditsRes, reportsRes, paymentsRes, subsRes] = await Promise.all([
    supabase.from("users").select("*"),
    supabase.from("audits").select("id", { count: "exact", head: true }),
    supabase.from("reports").select("id", { count: "exact", head: true }),
    supabase.from("payments").select("amount_cents, status"),
    supabase.from("subscriptions").select("user_id, plan, status"),
  ]);

  if (usersRes.error) throw usersRes.error;

  const users = (usersRes.data ?? []) as unknown as Array<{ id: string; account_status?: string | null }>;
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => !u.account_status || u.account_status === "active").length;

  const totalRevenueCents = (paymentsRes.data ?? [])
    .filter((p) => {
      const status = String(p.status).toLowerCase();
      return status === "succeeded" || status === "paid";
    })
    .reduce((sum, p) => sum + (p.amount_cents ?? 0), 0);

  const planCounts = { free: 0, starter: 0, professional: 0, agency: 0 };
  const subscribedUserIds = new Set<string>();
  for (const sub of subsRes.data ?? []) {
    subscribedUserIds.add(sub.user_id);
    if (sub.status === "canceled") {
      planCounts.free += 1;
      continue;
    }
            planCounts[normalizePlan(sub?.plan)] += 1;
  }
  planCounts.free += Math.max(0, totalUsers - subscribedUserIds.size);

  return {
    totalUsers,
    activeUsers,
    totalAudits: auditsRes.count ?? 0,
    totalReports: reportsRes.count ?? 0,
    totalRevenueCents,
    freeUsers: planCounts.free,
    starterUsers: planCounts.starter,
    professionalUsers: planCounts.professional,
    agencyUsers: planCounts.agency,
  };
}

export async function getAdminMonthMetrics(supabase: Db): Promise<AdminMonthMetrics> {
  const since = monthStartIso();
  const [usersRes, auditsRes, paymentsRes, auditUsersRes] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("audits").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("payments").select("amount_cents, status").gte("created_at", since),
    supabase.from("audits").select("user_id").gte("created_at", since).limit(2000),
  ]);

  const revenueThisMonthCents = (paymentsRes.data ?? [])
    .filter((p) => {
      const status = String(p.status).toLowerCase();
      return status === "succeeded" || status === "paid";
    })
    .reduce((sum, p) => sum + (p.amount_cents ?? 0), 0);

  const counts = new Map<string, number>();
  for (const row of auditUsersRes.data ?? []) {
    if (!row.user_id) continue;
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }
  const topIds = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);

  let topActiveUsers: AdminMonthMetrics["topActiveUsers"] = [];
  if (topIds.length > 0) {
    const { data: profiles } = await supabase.from("users").select("id, email, full_name").in("id", topIds);
    topActiveUsers = topIds.map((id) => {
      const profile = (profiles ?? []).find((u) => u.id === id);
      return {
        user_id: id,
        email: profile?.email ?? id,
        full_name: profile?.full_name ?? null,
        audit_count: counts.get(id) ?? 0,
      };
    });
  }

  return {
    newUsersThisMonth: usersRes.count ?? 0,
    auditsThisMonth: auditsRes.count ?? 0,
    revenueThisMonthCents,
    topActiveUsers,
  };
}
