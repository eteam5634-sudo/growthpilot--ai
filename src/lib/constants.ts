export const APP_NAME = "GrowthPilot AI";
export const APP_TAGLINE = "Turn Website Weaknesses Into Growth Opportunities";

export const INDUSTRIES = [
  "Ecommerce",
  "SaaS",
  "Marketing Agency",
  "Professional Services",
  "Healthcare",
  "Education",
  "Finance",
  "Real Estate",
  "Hospitality",
  "Local Business",
  "Nonprofit",
  "Other",
] as const;

export const AUDIT_CATEGORIES = [
  { key: "seo", label: "SEO", description: "Search visibility and technical foundations" },
  { key: "conversion", label: "Conversion", description: "Calls to action, funnel, and persuasion" },
  { key: "ux", label: "UX", description: "Clarity, navigation, and usability" },
  { key: "trust", label: "Trust", description: "Credibility, proof, and risk reduction" },
  { key: "brand", label: "Brand", description: "Messaging, positioning, and consistency" },
] as const;

export const SCORE_WEIGHTS = {
  seo: 0.25,
  conversion: 0.25,
  ux: 0.2,
  trust: 0.15,
  brand: 0.15,
} as const;

export const PROTECTED_PATHS = [
  "/dashboard",
  "/audits",
  "/audit",
  "/reports",
  "/history",
  "/consultant",
  "/profile",
  "/settings",
  "/clients",
  "/billing",
  "/messages",
  "/competitors",
  "/admin",
];
export const AUTH_PATHS = ["/login", "/signup", "/register", "/forgot-password", "/reset-password"];
