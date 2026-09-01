import { SCORE_WEIGHTS } from "@/lib/constants";
import { clampScore, scoreTone } from "@/lib/utils";
import type { CategoryKey, CategoryScore, CategoryScores } from "@/types/report";

const CATEGORY_KEYS: CategoryKey[] = ["seo", "conversion", "ux", "trust", "brand"];

function emptyCategory(): CategoryScore {
  return {
    score: 0,
    summary: "No analysis stored for this category.",
    strengths: [],
    weaknesses: [],
    recommendations: [],
  };
}

export function normalizeCategories(raw: unknown): CategoryScores {
  const source = raw && typeof raw === "object" ? (raw as Partial<Record<CategoryKey, Partial<CategoryScore>>>) : {};

  return Object.fromEntries(
    CATEGORY_KEYS.map((key) => {
      const item = source[key];
      return [
        key,
        {
          score: clampScore(Number(item?.score) || 0),
          summary: item?.summary || emptyCategory().summary,
          strengths: Array.isArray(item?.strengths) ? item.strengths : [],
          weaknesses: Array.isArray(item?.weaknesses) ? item.weaknesses : [],
          recommendations: Array.isArray(item?.recommendations) ? item.recommendations : [],
        },
      ];
    })
  ) as CategoryScores;
}

export function overallFromCategories(scores: CategoryScores) {
  const weighted =
    scores.seo.score * SCORE_WEIGHTS.seo +
    scores.conversion.score * SCORE_WEIGHTS.conversion +
    scores.ux.score * SCORE_WEIGHTS.ux +
    scores.trust.score * SCORE_WEIGHTS.trust +
    scores.brand.score * SCORE_WEIGHTS.brand;

  return clampScore(weighted);
}

export function scoreColorClass(score: number) {
  const tone = scoreTone(score);
  if (tone === "high") return "text-emerald-500";
  if (tone === "medium") return "text-amber-500";
  return "text-rose-500";
}

export function scoreBarClass(score: number) {
  const tone = scoreTone(score);
  if (tone === "high") return "bg-emerald-500";
  if (tone === "medium") return "bg-amber-500";
  return "bg-rose-500";
}

export function scoreRingColor(score: number) {
  const tone = scoreTone(score);
  if (tone === "high") return "#10b981";
  if (tone === "medium") return "#f59e0b";
  return "#f43f5e";
}

export function categoryEntries(scores: CategoryScores) {
  return [
    { key: "seo" as CategoryKey, label: "SEO", ...scores.seo },
    { key: "conversion" as CategoryKey, label: "Conversion", ...scores.conversion },
    { key: "ux" as CategoryKey, label: "UX", ...scores.ux },
    { key: "trust" as CategoryKey, label: "Trust", ...scores.trust },
    { key: "brand" as CategoryKey, label: "Brand", ...scores.brand },
  ];
}
