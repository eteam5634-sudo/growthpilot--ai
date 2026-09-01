import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { INDUSTRIES } from "@/lib/constants";
import { normalizeWebsiteUrl } from "@/lib/utils";
import { generateAuditReport } from "@/services/audit-engine";
import { createAudit, markAuditFailed, saveCompletedAudit } from "@/services/audits";
import { getUsage, incrementAuditUsage } from "@/services/billing";
import { PLANS, normalizePlan } from "@/lib/billing";
import { trackEvent } from "@/lib/analytics";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("audits")
    .select("id, website_url, business_name, industry, overall_score, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ audits: data ?? [] });
}

export const maxDuration = 60;

const bodySchema = z.object({
  websiteUrl: z.string().min(3),
  businessName: z.string().min(2).max(120),
  industry: z
    .string()
    .refine((value) => (INDUSTRIES as readonly string[]).includes(value), "Select an industry"),
  businessDescription: z.string().max(800).optional(),
  clientId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const usage = await getUsage(supabase, user.id).catch(() => null);
  if (usage && !usage.canRun) {
    const plan = PLANS[normalizePlan(usage.plan)];
    return NextResponse.json(
      {
        error: `Monthly audit limit reached for the ${plan.name} plan (${plan.auditsPerMonth}/month).`,
      },
      { status: 402 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const websiteUrl = normalizeWebsiteUrl(parsed.data.websiteUrl);
  const audit = await createAudit(supabase, user.id, {
    websiteUrl,
    businessName: parsed.data.businessName,
    industry: parsed.data.industry,
    businessDescription: parsed.data.businessDescription,
    clientId: parsed.data.clientId,
  });
  await trackEvent(supabase, user.id, "audit_started", { auditId: audit.id });
  await incrementAuditUsage(supabase, user.id);

  try {
    const report = await generateAuditReport({
      websiteUrl,
      businessName: parsed.data.businessName,
      industry: parsed.data.industry,
      businessDescription: parsed.data.businessDescription,
    });
    await saveCompletedAudit(supabase, audit.id, report);
    await trackEvent(supabase, user.id, "audit_completed", { auditId: audit.id });
    return NextResponse.json({ id: audit.id, status: "completed" });
  } catch (error) {
    await markAuditFailed(
      supabase,
      audit.id,
      error instanceof Error ? error.message : "Audit generation failed"
    );
    return NextResponse.json({ error: "Audit failed", id: audit.id }, { status: 500 });
  }
}
