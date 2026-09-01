import type { AuditRow } from "@/types/database";
import type { ParsedReport } from "@/types/report";

export const DEMO_AUDIT: AuditRow = {
  id: "demo",
  user_id: "demo",
  website_url: "https://northwind-goods.example",
  business_name: "Northwind Goods",
  industry: "Ecommerce",
  business_description: "Direct-to-consumer home goods brand selling furniture and textiles online.",
  client_id: null,
  overall_score: 78,
  status: "completed",
  error_message: null,
  created_at: "2026-08-12T10:00:00.000Z",
  updated_at: "2026-08-12T10:00:00.000Z",
};

export const DEMO_REPORT: ParsedReport = {
  id: "demo-report",
  auditId: "demo",
  createdAt: DEMO_AUDIT.created_at,
  overallScore: 78,
  categories: {
    seo: {
      score: 82,
      summary: "Title and headings are present, but keyword targeting is broad and meta description is truncated.",
      strengths: ["Unique title tag", "Logical H1/H2 structure"],
      weaknesses: ["Thin category copy", "Missing FAQ schema"],
      recommendations: ["Add commercial keywords to collection pages"],
    },
    conversion: {
      score: 64,
      summary: "Primary CTA is below the fold on mobile and the path from browse to checkout has extra friction.",
      strengths: ["Clear product photography", "Visible cart"],
      weaknesses: ["Weak hero CTA", "No urgency or social proof near add-to-cart"],
      recommendations: ["Move the primary CTA into the first viewport"],
    },
    ux: {
      score: 76,
      summary: "Desktop navigation is clean; mobile menu depth and filter UX slow shoppers down.",
      strengths: ["Readable typography", "Consistent layout"],
      weaknesses: ["Filter drawer covers products", "Slow image loading"],
      recommendations: ["Lazy-load galleries and simplify filters"],
    },
    trust: {
      score: 71,
      summary: "Reviews exist, but they are buried and contact details are only in the footer.",
      strengths: ["HTTPS and policy pages", "Return policy is linked"],
      weaknesses: ["No homepage testimonials", "No trust badges near checkout"],
      recommendations: ["Surface verified reviews on the homepage and PDP"],
    },
    brand: {
      score: 80,
      summary: "The brand feels premium, but the value proposition is generic on first paint.",
      strengths: ["Cohesive visual identity", "Strong photography"],
      weaknesses: ["Headline could apply to any retailer"],
      recommendations: ["Lead with a specific outcome, not a category label"],
    },
  },
  executiveSummary: {
    businessOverview:
      "Northwind Goods is a DTC home brand with a visually strong storefront. Traffic potential is solid, but conversion is limited by a weak first-screen offer and thin proof.",
    topOpportunities: [
      "Rewrite the homepage hero around a specific customer outcome",
      "Move proof and CTA above the fold on mobile",
      "Expand collection-page copy for SEO and shopper confidence",
    ],
    keyRisks: [
      "Paid traffic will underperform until the CTA and reviews are visible immediately",
      "Category pages may struggle to rank against more complete competitors",
    ],
  },
  strengths: [
    "Premium visual identity and product photography",
    "Clear information architecture on desktop",
    "Core policy and checkout pages are in place",
  ],
  weaknesses: [
    "Hero message is generic",
    "Social proof is not visible at decision points",
    "Collection pages lack unique content",
  ],
  recommendations: [
    {
      priority: "high",
      issue: "The homepage does not state why a shopper should buy now.",
      suggestedFix: "Replace the generic headline with a specific outcome and a single primary CTA.",
      expectedImpact: "Higher first-session conversion from paid and organic traffic.",
    },
    {
      priority: "high",
      issue: "Reviews and guarantees are below the fold.",
      suggestedFix: "Add a review strip and shipping promise next to add-to-cart.",
      expectedImpact: "Reduced hesitation on product pages.",
    },
    {
      priority: "medium",
      issue: "Collection pages are thin for search.",
      suggestedFix: "Add 150–250 words of unique copy plus FAQs on top collections.",
      expectedImpact: "Improved rankings and qualified organic sessions.",
    },
  ],
  growthPlan: {
    immediateActions: [
      "Rewrite homepage hero and CTA",
      "Surface reviews on homepage and PDPs",
      "Add trust badges beside checkout",
    ],
    next30Days: [
      "Expand the top 10 collection pages",
      "Simplify mobile filters",
      "Launch a comparison table versus two competitors",
    ],
  },
};
