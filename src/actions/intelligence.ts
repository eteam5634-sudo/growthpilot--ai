"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { normalizeWebsiteUrl } from "@/lib/utils";
import { generateCompetitorComparison } from "@/services/audit-engine/competitor";
import { answerConsultantQuestion } from "@/services/audit-engine/consultant";
import { getAudit, reportFromAudit } from "@/services/audits";
import { listReportMessages, saveCompetitorAnalysis, saveReportMessage } from "@/services/platform";
import { revalidatePath } from "next/cache";
import { getUsage, incrementCompetitorUsage } from "@/services/billing";
import { PLANS, normalizePlan } from "@/lib/billing";
import { trackEvent } from "@/lib/analytics";

export async function runCompetitorAnalysisAction(auditId: string, _: unknown, formData: FormData) {
  const user = await requireUser();
  const urls = ["competitorUrl1", "competitorUrl2", "competitorUrl3"]
    .map((key) => String(formData.get(key) || "").trim())
    .filter(Boolean)
    .map(normalizeWebsiteUrl);

  if (urls.length === 0) {
    return { error: "Enter at least one competitor URL." };
  }

  const supabase = await createClient();
  const audit = await getAudit(supabase, auditId, user.id);
  if (!audit) return { error: "Audit not found." };

  const usage = await getUsage(supabase, user.id).catch(() => null);
  if (usage && !usage.canRunCompetitor) {
    const plan = PLANS[normalizePlan(usage.plan)];
    return {
      error: `You have used all ${plan.competitorPerMonth} competitor analyses on the ${plan.name} plan this month.`,
    };
  }

  try {
    const payload = await generateCompetitorComparison(
      {
        websiteUrl: audit.website_url,
        businessName: audit.business_name,
        industry: audit.industry,
        businessDescription: audit.business_description || undefined,
      },
      urls
    );
    await saveCompetitorAnalysis(supabase, { audit_id: auditId, user_id: user.id, payload });
    await incrementCompetitorUsage(supabase, user.id);
    await supabase.from("competitors").delete().eq("audit_id", auditId).eq("user_id", user.id);
    await supabase
      .from("competitors")
      .insert(
        urls.map((website_url) => ({
          audit_id: auditId,
          user_id: user.id,
          website_url,
          analysis: payload as never,
        }))
      )
      .then(({ error }) => {
        if (error) console.error(error.message);
      });
    await trackEvent(supabase, user.id, "competitor_analysis", { auditId, competitors: urls.length });
    revalidatePath(`/audits/${auditId}`);
    revalidatePath(`/reports/${auditId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Competitor analysis failed." };
  }
}

export async function sendConsultantMessageAction(auditId: string, _: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .string()
    .min(8, "Ask a more specific question")
    .max(500)
    .safeParse(String(formData.get("question") || "").trim());

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a question." };
  }

  const supabase = await createClient();
  const audit = await getAudit(supabase, auditId, user.id);
  const report = audit ? reportFromAudit(audit) : null;
  if (!audit || !report) return { error: "Report not found." };

  const history = await listReportMessages(supabase, auditId);

  let answer: string;
  try {
    answer = await answerConsultantQuestion({
      question: parsed.data,
      audit,
      report,
      history,
    });
  } catch (error) {
    console.error("[consultant] answer generation failed:", error);
    return { error: "The consultant could not answer just now. Try again." };
  }

  if (!answer.trim()) {
    return { error: "The consultant returned an empty answer. Try again." };
  }

  try {
    await saveReportMessage(supabase, {
      audit_id: auditId,
      user_id: user.id,
      role: "user",
      content: parsed.data,
    });
    await saveReportMessage(supabase, {
      audit_id: auditId,
      user_id: user.id,
      role: "assistant",
      content: answer,
    });
  } catch (error) {
    console.error("[consultant] failed to save messages:", error);
    return {
      error:
        "The answer was generated but could not be saved. Run migration 0002 in Supabase to create the report_messages table.",
    };
  }

  revalidatePath(`/audits/${auditId}`);
  revalidatePath(`/reports/${auditId}`);
  revalidatePath("/consultant");
  await trackEvent(supabase, user.id, "ai_chat", { auditId });
  return { success: true };
}
