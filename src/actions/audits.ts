"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { normalizeWebsiteUrl } from "@/lib/utils";
import { INDUSTRIES } from "@/lib/constants";
import { generateAuditReport } from "@/services/audit-engine";
import { createAudit, deleteAudit, markAuditFailed, saveCompletedAudit } from "@/services/audits";
import { getUsage, incrementAuditUsage } from "@/services/billing";
import { trackEvent } from "@/lib/analytics";
import { PLANS, normalizePlan } from "@/lib/billing";
const newAuditSchema = z.object({
  websiteUrl: z.string().min(3, "Enter a website URL"),
  businessName: z.string().min(2, "Enter a business name").max(120),
  industry: z
    .string()
    .refine((value) => (INDUSTRIES as readonly string[]).includes(value), "Select an industry"),
  businessDescription: z.string().max(800).optional(),
  clientId: z.union([z.literal(""), z.string().uuid()]).optional(),
});

export async function runAuditAction(_: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = newAuditSchema.safeParse({
    websiteUrl: formData.get("websiteUrl"),
    businessName: formData.get("businessName"),
    industry: formData.get("industry"),
    businessDescription: String(formData.get("businessDescription") || ""),
    clientId: String(formData.get("clientId") || ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const websiteUrl = normalizeWebsiteUrl(parsed.data.websiteUrl);
  try {
    new URL(websiteUrl);
  } catch {
    return { error: "Enter a valid website URL." };
  }

  const supabase = await createClient();
  const usage = await getUsage(supabase, user.id).catch(() => null);
  if (usage && !usage.canRun) {
    const plan = PLANS[normalizePlan(usage.plan)];
    return {
      error: `You have used all ${plan.auditsPerMonth} audits on the ${plan.name} plan this month. Upgrade to continue.`,
    };
  }

  const audit = await createAudit(supabase, user.id, {
    websiteUrl,
    businessName: parsed.data.businessName,
    industry: parsed.data.industry,
    businessDescription: parsed.data.businessDescription || undefined,
    clientId: parsed.data.clientId || null,
  });
  await trackEvent(supabase, user.id, "audit_started", { auditId: audit.id });
  await incrementAuditUsage(supabase, user.id);

  try {
    const report = await generateAuditReport({
      websiteUrl,
      businessName: parsed.data.businessName,
      industry: parsed.data.industry,
      businessDescription: parsed.data.businessDescription || undefined,
    });
    await saveCompletedAudit(supabase, audit.id, report);
    await trackEvent(supabase, user.id, "audit_completed", { auditId: audit.id });
  } catch (error) {
    await markAuditFailed(
      supabase,
      audit.id,
      error instanceof Error ? error.message : "Audit generation failed"
    );
    await trackEvent(supabase, user.id, "audit_failed", { auditId: audit.id });
    return { error: "The audit could not be completed. Please try again." };
  }

  redirect(`/reports/${audit.id}`);
}

export async function retryAuditAction(auditId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: audit } = await supabase
    .from("audits")
    .select("*")
    .eq("id", auditId)
    .eq("user_id", user.id)
    .single();

  if (!audit) redirect("/history");

  await supabase
    .from("audits")
    .update({ status: "analyzing", error_message: null })
    .eq("id", auditId);

  try {
    const report = await generateAuditReport({
      websiteUrl: audit.website_url,
      businessName: audit.business_name,
      industry: audit.industry,
      businessDescription: audit.business_description || undefined,
    });
    await supabase.from("reports").delete().eq("audit_id", auditId);
    await saveCompletedAudit(supabase, auditId, report);
    await trackEvent(supabase, user.id, "audit_completed", { auditId });
  } catch (error) {
    await markAuditFailed(
      supabase,
      auditId,
      error instanceof Error ? error.message : "Audit generation failed"
    );
    await trackEvent(supabase, user.id, "audit_failed", { auditId });
  }

  redirect(`/reports/${auditId}`);
}

export async function deleteAuditAction(auditId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await deleteAudit(supabase, auditId, user.id);
  revalidatePath("/audits/history");
  revalidatePath("/history");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
}
