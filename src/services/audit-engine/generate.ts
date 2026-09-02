import { overallFromCategories } from "@/lib/scores";
import { clampScore } from "@/lib/utils";
import { generateAuditWithAi } from "@/services/ai";
import { fetchWebsiteSnapshot } from "@/services/website-analyzer";
import {
  heuristicBrand,
  heuristicConversion,
  heuristicSeo,
  heuristicTrust,
  heuristicUx,
} from "@/services/audit-engine/heuristics";
import { buildAuditPrompt } from "@/services/audit-engine/prompts";
import type { NewAuditInput } from "@/types/audit";
import type { AuditReportPayload, CategoryScores } from "@/types/report";

function buildHeuristicReport(input: NewAuditInput, categories: CategoryScores): AuditReportPayload {
  const overallScore = overallFromCategories(categories);
  const strengths = Object.values(categories).flatMap((item) => item.strengths).slice(0, 6);
  const weaknesses = Object.values(categories).flatMap((item) => item.weaknesses).slice(0, 6);

  return {
    overallScore,
    categories: {
      seo: {
        ...categories.seo,
        recommendations: categories.seo.recommendations ?? [
          "Rewrite title and meta description around one commercial keyword.",
        ],
      },
      conversion: {
        ...categories.conversion,
        recommendations: categories.conversion.recommendations ?? [
          "Place one dominant CTA above the fold and repeat it after the offer.",
        ],
      },
      ux: {
        ...categories.ux,
        recommendations: categories.ux.recommendations ?? [
          "Tighten heading hierarchy and reduce homepage density on mobile.",
        ],
      },
      trust: {
        ...categories.trust,
        recommendations: categories.trust.recommendations ?? [
          "Add visible contact details and at least one proof element near the CTA.",
        ],
      },
      brand: {
        ...categories.brand,
        recommendations: categories.brand.recommendations ?? [
          "Lead with a customer outcome instead of a company description.",
        ],
      },
    },
    executiveSummary: {
      businessOverview: `${input.businessName} is a ${input.industry.toLowerCase()} business${
        input.businessDescription ? `. ${input.businessDescription}` : ""
      }. This first-pass audit combines a live website crawl with structured growth scoring across SEO, conversion, UX, trust, and brand.`,
      topOpportunities: weaknesses.slice(0, 3).map((item) => `Improve: ${item}`),
      keyRisks: [
        "Inconsistent messaging can increase bounce rate and reduce qualified demand.",
        "Missing trust and conversion cues may leak revenue from otherwise interested visitors.",
      ],
    },
    strengths: strengths.length ? strengths : ["The site is reachable and can be improved quickly."],
    weaknesses: weaknesses.length ? weaknesses : ["The crawl returned limited evidence; deepen on-page content and metadata."],
    recommendations: [
      {
        priority: "high",
        issue: "Primary conversion path is unclear",
        suggestedFix: "Place one dominant CTA above the fold and repeat it after the offer explanation.",
        expectedImpact: "Higher click-through to the next step in the funnel.",
      },
      {
        priority: "high",
        issue: "Search metadata is incomplete",
        suggestedFix: "Rewrite title and meta description around a commercial keyword and a specific outcome.",
        expectedImpact: "Better search snippet performance and more qualified visits.",
      },
      {
        priority: "medium",
        issue: "Trust signals are thin",
        suggestedFix: "Add testimonials, logos, guarantees, and visible contact details near the CTA.",
        expectedImpact: "Reduced hesitation and improved conversion rate.",
      },
      {
        priority: "medium",
        issue: "Brand message is generic",
        suggestedFix: "Lead with a customer outcome, not a company description.",
        expectedImpact: "Clearer positioning and stronger recall.",
      },
      {
        priority: "low",
        issue: "Internal linking is limited",
        suggestedFix: "Add contextual links from the homepage to key service, product, and proof pages.",
        expectedImpact: "Better crawl paths and more pages per session.",
      },
    ],
    growthPlan: {
      immediateActions: [
        "Fix title, H1, and meta description around one commercial promise.",
        "Make the primary CTA unmistakable on desktop and mobile.",
        "Add contact details and at least one proof element above the fold.",
      ],
      next30Days: [
        "Ship a focused landing-page narrative: problem, proof, offer, CTA.",
        "Improve image alt text and heading hierarchy for SEO.",
        "Add a lead capture form or booking path with a single next step.",
        "Publish one proof asset (case study, reviews, or client logos).",
        "Measure baseline conversion on the primary CTA.",
      ],
    },
  };
}

function roundScores(report: AuditReportPayload): AuditReportPayload {
  const categories = Object.fromEntries(
    Object.entries(report.categories).map(([key, value]) => [
      key,
      { ...value, score: clampScore(value.score) },
    ])
  ) as CategoryScores;

  return {
    ...report,
    overallScore: clampScore(report.overallScore || overallFromCategories(categories)),
    categories,
  };
}

export async function generateAuditReport(input: NewAuditInput): Promise<AuditReportPayload> {
  const snapshot = await fetchWebsiteSnapshot(input.websiteUrl);
  const heuristics: CategoryScores = {
    seo: heuristicSeo(snapshot),
    conversion: heuristicConversion(snapshot),
    ux: heuristicUx(snapshot),
    trust: heuristicTrust(snapshot),
    brand: heuristicBrand(snapshot),
  };

  const fallback = buildHeuristicReport(input, heuristics);

  try {
    const aiReport = await generateAuditWithAi({
      business: input,
      snapshot,
      heuristics,
    });
    return roundScores(aiReport);
  } catch {
    return roundScores(fallback);
  }
}
