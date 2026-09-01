import { clampScore } from "@/lib/utils";
import type { CategoryScore } from "@/types/report";
import type { WebsiteSnapshot } from "@/types/website";

function scoreFrom(points: number, max: number) {
  return clampScore((points / max) * 100);
}

export function heuristicSeo(snapshot: WebsiteSnapshot): CategoryScore {
  let points = 0;
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (snapshot.title && snapshot.title.length >= 20 && snapshot.title.length <= 65) {
    points += 20;
    strengths.push("Page title is present and reasonably sized for search results.");
  } else {
    weaknesses.push("Title tag is missing or not in the 20–65 character range.");
  }

  if (snapshot.description && snapshot.description.length >= 70) {
    points += 15;
    strengths.push("Meta description is present and can support click-through.");
  } else {
    weaknesses.push("Meta description is missing or too short to compete in SERPs.");
  }

  if (snapshot.headings.h1.length === 1) {
    points += 15;
    strengths.push("A single H1 gives search engines a clear topical signal.");
  } else if (snapshot.headings.h1.length === 0) {
    weaknesses.push("No H1 heading was detected.");
  } else {
    weaknesses.push("Multiple H1 headings may dilute topical focus.");
    points += 6;
  }

  if (snapshot.https) {
    points += 10;
    strengths.push("The site is served over HTTPS.");
  } else {
    weaknesses.push("The site is not using HTTPS.");
  }

  if (snapshot.canonical) {
    points += 10;
    strengths.push("A canonical URL is defined.");
  } else {
    weaknesses.push("No canonical tag was found.");
  }

  if (snapshot.viewport) points += 5;
  else weaknesses.push("Viewport meta tag is missing, which hurts mobile indexing.");

  if (snapshot.images.total > 0 && snapshot.images.missingAlt / snapshot.images.total < 0.3) {
    points += 10;
    strengths.push("Most images include alt text.");
  } else {
    weaknesses.push("Too many images are missing alt text.");
  }

  if (snapshot.headings.h2.length >= 2) {
    points += 10;
    strengths.push("Supporting H2 headings structure the page.");
  } else {
    weaknesses.push("The page lacks a clear heading hierarchy.");
  }

  if (snapshot.jsonLdTypes.length > 0) {
    points += 5;
    strengths.push("Structured data (JSON-LD) is present.");
  } else {
    weaknesses.push("No structured data was detected.");
  }

  return {
    score: snapshot.fetched ? scoreFrom(points, 100) : 38,
    summary: snapshot.fetched
      ? "Technical SEO foundations were scored from on-page tags, headings, and crawlable metadata."
      : "Live crawl failed, so SEO scoring is conservative until the page can be fetched.",
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
  };
}

export function heuristicConversion(snapshot: WebsiteSnapshot): CategoryScore {
  const ctaKeywords = /get started|start|book|demo|buy|shop|pricing|contact|sign up|subscribe|quote|trial/i;
  const ctaCount = snapshot.buttons.filter((label) => ctaKeywords.test(label)).length;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let points = 30;

  if (ctaCount >= 2) {
    points += 25;
    strengths.push("Multiple action-oriented calls to action are visible.");
  } else if (ctaCount === 1) {
    points += 12;
    strengths.push("At least one primary call to action is present.");
  } else {
    weaknesses.push("No strong call-to-action language was detected.");
  }

  if (snapshot.forms > 0) {
    points += 20;
    strengths.push("A form is available to capture demand.");
  } else {
    weaknesses.push("No lead capture form was found on the homepage.");
  }

  if (snapshot.wordCount > 150 && snapshot.wordCount < 2500) {
    points += 15;
    strengths.push("Copy length is enough to explain the offer without overwhelming visitors.");
  } else if (snapshot.wordCount <= 150) {
    weaknesses.push("Homepage copy is thin, which can weaken persuasion.");
  } else {
    points += 8;
    weaknesses.push("Homepage copy is dense and may slow decision-making.");
  }

  if (!snapshot.fetched) points = 40;

  return {
    score: clampScore(points),
    summary: "Conversion scoring looks at CTAs, forms, and whether the offer is easy to act on.",
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
  };
}

export function heuristicUx(snapshot: WebsiteSnapshot): CategoryScore {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let points = 20;

  if (snapshot.viewport) {
    points += 20;
    strengths.push("A viewport tag is present for mobile rendering.");
  } else {
    weaknesses.push("Missing viewport configuration can break mobile UX.");
  }

  if (snapshot.fetchMs && snapshot.fetchMs < 2500) {
    points += 20;
    strengths.push("Initial HTML was retrieved quickly.");
  } else {
    weaknesses.push("The page took longer than expected to respond.");
  }

  if (snapshot.headings.h1.length > 0 && snapshot.headings.h2.length > 0) {
    points += 15;
    strengths.push("Content is organized with a readable heading structure.");
  } else {
    weaknesses.push("Navigation of content is harder without a clear heading structure.");
  }

  if (snapshot.links.internal >= 5) {
    points += 15;
    strengths.push("Internal links help visitors move to deeper pages.");
  } else {
    weaknesses.push("Limited internal linking may trap visitors on the homepage.");
  }

  if (snapshot.wordCount > 80) points += 10;
  else weaknesses.push("Very little readable content was detected.");

  if (!snapshot.fetched) points = 42;

  return {
    score: clampScore(points),
    summary: "UX scoring evaluates structure, mobile readiness, and how easily a visitor can scan the page.",
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
  };
}

export function heuristicTrust(snapshot: WebsiteSnapshot): CategoryScore {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let points = 20;

  if (snapshot.https) {
    points += 20;
    strengths.push("HTTPS is enabled, which is a baseline trust signal.");
  } else {
    weaknesses.push("Lack of HTTPS undermines visitor confidence.");
  }

  if (snapshot.emailsFound > 0 || snapshot.phonesFound > 0) {
    points += 15;
    strengths.push("Contact details are visible, which reduces perceived risk.");
  } else {
    weaknesses.push("No obvious email or phone contact details were found.");
  }

  if (snapshot.socialLinks.length > 0) {
    points += 15;
    strengths.push("Social profiles are linked from the site.");
  } else {
    weaknesses.push("No social proof links were detected.");
  }

  if (snapshot.jsonLdTypes.some((type) => /organization|localbusiness|review/i.test(type))) {
    points += 15;
    strengths.push("Organization or review structured data supports credibility.");
  } else {
    weaknesses.push("No organization or review schema was found.");
  }

  if (snapshot.hasOpenGraph) {
    points += 10;
    strengths.push("Open Graph tags improve branded sharing.");
  }

  if (!snapshot.fetched) points = 45;

  return {
    score: clampScore(points),
    summary: "Trust scoring looks at security, contactability, proof, and credibility markup.",
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
  };
}

export function heuristicBrand(snapshot: WebsiteSnapshot): CategoryScore {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  let points = 25;

  if (snapshot.title) {
    points += 15;
    strengths.push("The brand or offer is named in the page title.");
  } else {
    weaknesses.push("The page title does not communicate a distinctive brand.");
  }

  if (snapshot.description && snapshot.description.length > 80) {
    points += 15;
    strengths.push("The meta description communicates a positioning statement.");
  } else {
    weaknesses.push("Brand positioning is weakly expressed in metadata.");
  }

  if (snapshot.hasOpenGraph && snapshot.hasTwitterCard) {
    points += 15;
    strengths.push("Social sharing cards are configured for consistent brand presentation.");
  } else {
    weaknesses.push("Social preview tags are incomplete, which weakens brand consistency.");
  }

  if (snapshot.headings.h1[0] && snapshot.headings.h1[0].length < 80) {
    points += 15;
    strengths.push("The H1 is concise enough to work as a brand headline.");
  } else {
    weaknesses.push("The primary headline is missing or too long to land a clear message.");
  }

  if (snapshot.wordCount > 120) points += 10;
  else weaknesses.push("There is not enough copy to establish a differentiated message.");

  if (!snapshot.fetched) points = 44;

  return {
    score: clampScore(points),
    summary: "Brand scoring evaluates headline clarity, positioning, and consistency across metadata.",
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
  };
}
