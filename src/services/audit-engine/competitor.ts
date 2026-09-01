import { overallFromCategories } from "@/lib/scores";
import { hostnameFromUrl } from "@/lib/utils";
import { getOpenAIClient } from "@/lib/openai/client";
import { fetchWebsiteSnapshot } from "@/services/website-analyzer";
import {
  heuristicBrand,
  heuristicConversion,
  heuristicSeo,
  heuristicTrust,
  heuristicUx,
} from "@/services/audit-engine/heuristics";
import { buildCompetitorPrompt } from "@/services/audit-engine/prompts";
import { extractJson } from "@/services/audit-engine/schema";
import type { NewAuditInput } from "@/types/audit";
import type { CompetitorComparison, CompetitorScorecard } from "@/types/competitor";
import type { WebsiteSnapshot } from "@/types/website";

function scorecardFromSnapshot(snapshot: WebsiteSnapshot): CompetitorScorecard {
  const seo = heuristicSeo(snapshot);
  const conversion = heuristicConversion(snapshot);
  const ux = heuristicUx(snapshot);
  const trust = heuristicTrust(snapshot);
  const brand = heuristicBrand(snapshot);
  const categories = { seo, conversion, ux, trust, brand };

  return {
    url: snapshot.finalUrl || snapshot.url,
    hostname: hostnameFromUrl(snapshot.finalUrl || snapshot.url),
    fetched: snapshot.fetched,
    scores: {
      seo: seo.score,
      conversion: conversion.score,
      ux: ux.score,
      trust: trust.score,
      brand: brand.score,
      overall: overallFromCategories(categories),
    },
    summary: snapshot.fetched
      ? `${hostnameFromUrl(snapshot.url)} shows a crawlable homepage with a ${seo.score} SEO baseline.`
      : "Live crawl failed; scoring is conservative.",
    strengths: [seo.strengths[0], conversion.strengths[0], trust.strengths[0]].filter(Boolean) as string[],
    weaknesses: [seo.weaknesses[0], conversion.weaknesses[0], ux.weaknesses[0]].filter(Boolean) as string[],
  };
}

export async function generateCompetitorComparison(
  business: NewAuditInput,
  competitorUrls: string[]
): Promise<CompetitorComparison> {
  const uniqueUrls = [...new Set(competitorUrls)].slice(0, 3);
  const [primarySnapshot, ...competitorSnapshots] = await Promise.all([
    fetchWebsiteSnapshot(business.websiteUrl),
    ...uniqueUrls.map((url) => fetchWebsiteSnapshot(url)),
  ]);

  const fallback: CompetitorComparison = {
    competitors: competitorSnapshots.map(scorecardFromSnapshot),
    insights: [
      "Compare homepage CTAs and proof density against each competitor.",
      "Look for keyword themes competitors own in titles and H1s that you do not.",
    ],
    opportunities: [
      "Adopt the clearest competitor value proposition structure, then differentiate on outcome.",
      "Match or exceed the strongest trust block you observed (reviews, logos, or contact).",
    ],
    contentStrategy: "Competitors that rank messaging around a single commercial outcome tend to be easier to evaluate.",
    conversionMethods: "Watch for form placement, pricing visibility, and repeated CTAs.",
    trustElements: "Contact details, testimonials, and security cues are the fastest trust gaps to close.",
  };

  const openai = getOpenAIClient();
  if (!openai) return fallback;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are GrowthPilot AI. Reply with JSON only.",
        },
        {
          role: "user",
          content: buildCompetitorPrompt({
            business,
            primarySnapshot,
            competitorSnapshots,
          }),
        },
      ],
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty competitor response");
    const parsed = extractJson(content) as CompetitorComparison;
    if (!parsed.competitors?.length) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}
