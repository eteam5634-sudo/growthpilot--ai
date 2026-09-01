export type CompetitorScorecard = {
  url: string;
  hostname: string;
  fetched: boolean;
  scores: {
    seo: number;
    conversion: number;
    ux: number;
    trust: number;
    brand: number;
    overall: number;
  };
  summary: string;
  strengths: string[];
  weaknesses: string[];
};

export type CompetitorComparison = {
  competitors: CompetitorScorecard[];
  insights: string[];
  opportunities: string[];
  contentStrategy: string;
  conversionMethods: string;
  trustElements: string;
};
