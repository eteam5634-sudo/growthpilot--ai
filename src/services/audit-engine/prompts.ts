import type { NewAuditInput } from "@/types/audit";
import type { WebsiteSnapshot } from "@/types/website";
import type { CategoryScores } from "@/types/report";

export function buildAuditPrompt(input: {
  business: NewAuditInput;
  snapshot: WebsiteSnapshot;
  heuristics: CategoryScores;
}) {
  const { business, snapshot, heuristics } = input;

  return `You are a senior growth consultant writing a website audit for a paying SaaS customer.
Be specific, practical, and commercially useful. Do not mention that you are an AI.

Business
- Name: ${business.businessName}
- Industry: ${business.industry}
- URL: ${business.websiteUrl}
- Description: ${business.businessDescription || "Not provided"}

Website snapshot (from a live crawl; it may be incomplete)
${JSON.stringify(snapshot, null, 2)}

Heuristic baseline scores (use as evidence, not as the final answer)
${JSON.stringify(heuristics, null, 2)}

Analyze these areas in depth:

SEO: meta title, meta description, headings, keywords, content structure
Conversion: calls-to-action, sales funnel, lead generation, user journey
UX: navigation, mobile experience, website structure, readability
Trust: reviews, testimonials, social proof, contact information
Brand: value proposition, messaging clarity, target audience

Return ONLY valid JSON matching this TypeScript shape:
{
  "overallScore": number,
  "categories": {
    "seo": { "score": number, "summary": string, "strengths": string[], "weaknesses": string[], "recommendations": string[] },
    "conversion": { "score": number, "summary": string, "strengths": string[], "weaknesses": string[], "recommendations": string[] },
    "ux": { "score": number, "summary": string, "strengths": string[], "weaknesses": string[], "recommendations": string[] },
    "trust": { "score": number, "summary": string, "strengths": string[], "weaknesses": string[], "recommendations": string[] },
    "brand": { "score": number, "summary": string, "strengths": string[], "weaknesses": string[], "recommendations": string[] }
  },
  "executiveSummary": {
    "businessOverview": string,
    "topOpportunities": string[],
    "keyRisks": string[]
  },
  "strengths": string[],
  "weaknesses": string[],
  "recommendations": [
    { "priority": "high" | "medium" | "low", "issue": string, "suggestedFix": string, "expectedImpact": string }
  ],
  "growthPlan": {
    "immediateActions": string[],
    "next30Days": string[]
  }
}

Rules:
- Scores are integers 0-100.
- Each category summary is an explanation of the score.
- Each category needs 2-4 strengths, 2-4 weaknesses, and 2-3 category-specific recommendations.
- Include 5-8 prioritized recommendations (high first). issue = the problem.
- Immediate actions: 3-5 items for this week.
- Next 30 days: 4-6 improvements.
- If the crawl failed, say so in the overview and still produce a useful industry-informed audit.
- Keep language executive-ready. Avoid filler.`;
}

export function buildCompetitorPrompt(input: {
  business: NewAuditInput;
  primarySnapshot: unknown;
  competitorSnapshots: unknown[];
}) {
  return `You are a competitive growth analyst. Compare the primary business against competitor websites.
Return JSON only. Do not mention that you are an AI.

Primary business: ${JSON.stringify(input.business)}
Primary snapshot: ${JSON.stringify(input.primarySnapshot)}
Competitor snapshots: ${JSON.stringify(input.competitorSnapshots)}

Return:
{
  "competitors": [
    {
      "url": string,
      "hostname": string,
      "fetched": boolean,
      "scores": { "seo": number, "conversion": number, "ux": number, "trust": number, "brand": number, "overall": number },
      "summary": string,
      "strengths": string[],
      "weaknesses": string[]
    }
  ],
  "insights": string[],
  "opportunities": string[],
  "contentStrategy": string,
  "conversionMethods": string,
  "trustElements": string
}

Keep 2-5 insights and 2-5 opportunities. Be specific about what the primary site should copy, avoid, or outperform.`;
}

export function buildConsultantPrompt(input: {
  question: string;
  audit: unknown;
  report: unknown;
}) {
  return `You are GrowthPilot AI, a business consultant. Answer using only the audit report as evidence.
Be concise, practical, and specific. If the report lacks evidence, say what you would inspect next.

Audit: ${JSON.stringify(input.audit)}
Report: ${JSON.stringify(input.report)}

User question: ${input.question}`;
}
