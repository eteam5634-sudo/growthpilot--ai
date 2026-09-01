export type CategoryKey = "seo" | "conversion" | "ux" | "trust" | "brand";

export type CategoryScore = {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations?: string[];
};

export type CategoryScores = Record<CategoryKey, CategoryScore>;

export type ExecutiveSummary = {
  businessOverview: string;
  topOpportunities: string[];
  keyRisks: string[];
};

export type RecommendationPriority = "high" | "medium" | "low";

export type Recommendation = {
  priority: RecommendationPriority;
  issue: string;
  suggestedFix: string;
  expectedImpact: string;
};

export type GrowthPlan = {
  immediateActions: string[];
  next30Days: string[];
};

export type AuditReportPayload = {
  overallScore: number;
  categories: CategoryScores;
  executiveSummary: ExecutiveSummary;
  strengths: string[];
  weaknesses: string[];
  recommendations: Recommendation[];
  growthPlan: GrowthPlan;
};

export type ParsedReport = AuditReportPayload & {
  id: string;
  auditId: string;
  createdAt: string;
};
