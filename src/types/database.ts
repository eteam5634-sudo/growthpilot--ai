export type AuditStatus = "pending" | "analyzing" | "completed" | "failed";

export type UserRole = "user" | "admin";
export type PlanId = "free" | "starter" | "professional" | "agency" | "pro";
export type AccountStatus = "active" | "suspended";

export type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role?: UserRole;
  account_status?: AccountStatus;
  created_at: string;
  updated_at: string;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: PlanId;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  started_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type UsageLimitRow = {
  user_id: string;
  plan: PlanId;
  audits_used: number;
  competitor_reports_used?: number;
  audits_limit?: number | null;
  competitor_reports_limit?: number | null;
  month_year?: string | null;
  period_start: string;
  updated_at: string;
};

export type PaymentRow = {
  id: string;
  user_id: string;
  stripe_payment_id: string | null;
  stripe_payment_intent?: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  payment_method?: string | null;
  created_at: string;
};

export type AnalyticsEventRow = {
  id: string;
  user_id: string | null;
  event: string;
  metadata: unknown;
  created_at: string;
};

export type CompetitorRow = {
  id: string;
  user_id: string;
  audit_id: string;
  website_url: string;
  analysis: unknown;
  created_at: string;
};

export type ContactInquiryRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  created_at: string;
};

export type AuditRow = {
  id: string;
  user_id: string;
  website_url: string;
  business_name: string;
  industry: string;
  business_description: string | null;
  client_id: string | null;
  overall_score: number | null;
  status: AuditStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientRow = {
  id: string;
  user_id: string;
  name: string;
  website_url: string | null;
  industry: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientNoteRow = {
  id: string;
  client_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

export type CompetitorAnalysisRow = {
  id: string;
  audit_id: string;
  user_id: string;
  payload: unknown;
  created_at: string;
};

export type ReportMessageRow = {
  id: string;
  audit_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type UserSettingsRow = {
  user_id: string;
  company_name: string | null;
  workspace_type: "solo" | "agency";
  default_industry: string | null;
  created_at: string;
  updated_at: string;
};

export type ReportRow = {
  id: string;
  audit_id: string;
  seo_score: number;
  conversion_score: number;
  ux_score: number;
  trust_score: number;
  brand_score: number;
  category_details: unknown;
  executive_summary: unknown;
  strengths: unknown;
  weaknesses: unknown;
  recommendations: unknown;
  growth_plan: unknown;
  created_at: string;
};

export type AuditWithReport = AuditRow & {
  reports: ReportRow | ReportRow[] | null;
};
