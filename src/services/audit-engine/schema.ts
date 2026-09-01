import { z } from "zod";
import type { AuditReportPayload, CategoryScore } from "@/types/report";

const categorySchema: z.ZodType<CategoryScore> = z.object({
  score: z.number().min(0).max(100),
  summary: z.string().min(1),
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  recommendations: z.array(z.string()).optional(),
});

export const auditReportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  categories: z.object({
    seo: categorySchema,
    conversion: categorySchema,
    ux: categorySchema,
    trust: categorySchema,
    brand: categorySchema,
  }),
  executiveSummary: z.object({
    businessOverview: z.string().min(1),
    topOpportunities: z.array(z.string()).min(1),
    keyRisks: z.array(z.string()).min(1),
  }),
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  recommendations: z
    .array(
      z.object({
        priority: z.enum(["high", "medium", "low"]),
        issue: z.string().min(1),
        suggestedFix: z.string().min(1),
        expectedImpact: z.string().min(1),
      })
    )
    .min(1),
  growthPlan: z.object({
    immediateActions: z.array(z.string()).min(1),
    next30Days: z.array(z.string()).min(1),
  }),
}) satisfies z.ZodType<AuditReportPayload>;

export function parseAuditReport(payload: unknown): AuditReportPayload {
  return auditReportSchema.parse(payload);
}

export function extractJson(text: string) {
  const fenced = text.match(/```json([\s\S]*?)```/i);
  if (fenced) return JSON.parse(fenced[1]);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(text.slice(start, end + 1));
  }
  throw new Error("Model did not return JSON");
}
