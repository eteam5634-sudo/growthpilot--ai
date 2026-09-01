export type PlanId = "free" | "starter" | "professional" | "agency" | "pro";

export type PlanDefinition = {
  id: Exclude<PlanId, "pro">;
  name: string;
  price: string;
  priceLabel: string;
  description: string;
  auditsPerMonth: number | null;
  competitorPerMonth: number | null;
  features: string[];
  highlighted?: boolean;
};

export const PLANS: Record<Exclude<PlanId, "pro">, PlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    priceLabel: "per month",
    description: "Try GrowthPilot with essential audits and competitor snapshots.",
    auditsPerMonth: 5,
    competitorPerMonth: 2,
    features: [
      "5 AI audits per month",
      "2 competitor analyses per month",
      "Full category scores and PDF export",
      "In-report AI consultant",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: "$29",
    priceLabel: "per month",
    description: "For solo marketers running regular site checks.",
    auditsPerMonth: 25,
    competitorPerMonth: 10,
    features: [
      "25 AI audits per month",
      "10 competitor analyses per month",
      "Growth plans and PDF reports",
      "Email support",
    ],
  },
  professional: {
    id: "professional",
    name: "Professional",
    price: "$79",
    priceLabel: "per month",
    description: "For growing teams that audit multiple properties.",
    auditsPerMonth: 100,
    competitorPerMonth: 50,
    highlighted: true,
    features: [
      "100 AI audits per month",
      "50 competitor analyses per month",
      "Priority recommendations",
      "Competitor comparison",
      "Email support",
    ],
  },
  agency: {
    id: "agency",
    name: "Agency",
    price: "$149",
    priceLabel: "per month",
    description: "Unlimited audits for client work, notes, and multi-site tracking.",
    auditsPerMonth: null,
    competitorPerMonth: null,
    features: [
      "Unlimited AI audits",
      "Unlimited competitor analyses",
      "Client workspace and notes",
      "Team-ready reports",
      "Priority support",
    ],
  },
};

export function normalizePlan(plan: string | null | undefined): Exclude<PlanId, "pro"> {
  if (plan === "pro" || plan === "professional") return "professional";
  if (plan === "starter" || plan === "agency") return plan;
  return "free";
}

export function auditLimitForPlan(plan: PlanId): number | null {
  return PLANS[normalizePlan(plan)].auditsPerMonth;
}

export function competitorLimitForPlan(plan: PlanId): number | null {
  return PLANS[normalizePlan(plan)].competitorPerMonth;
}

export function canRunAudit(plan: PlanId, usedThisPeriod: number) {
  const limit = auditLimitForPlan(plan);
  if (limit == null) return true;
  return usedThisPeriod < limit;
}

export function canRunCompetitorAnalysis(plan: PlanId, usedThisPeriod: number) {
  const limit = competitorLimitForPlan(plan);
  if (limit == null) return true;
  return usedThisPeriod < limit;
}

export function planDisplayName(plan: PlanId | string | null | undefined) {
  return PLANS[normalizePlan(plan)].name;
}
