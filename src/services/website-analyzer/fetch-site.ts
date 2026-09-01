import type { WebsiteSnapshot } from "@/types/website";

const FETCH_TIMEOUT_MS = 12000;

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function extractJsonLdTypes(html: string) {
  const types: string[] = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html))) {
    try {
      const parsed = JSON.parse(match[1]);
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        const typeValue = node?.["@type"];
        if (typeof typeValue === "string") types.push(typeValue);
        if (Array.isArray(typeValue)) types.push(...typeValue.filter((item) => typeof item === "string"));
      }
    } catch {
      // ignore invalid JSON-LD
    }
  }
  return unique(types);
}

export async function fetchWebsiteSnapshot(url: string): Promise<WebsiteSnapshot> {
  const started = Date.now();
  const empty: WebsiteSnapshot = {
    url,
    finalUrl: url,
    fetched: false,
    statusCode: null,
    fetchMs: null,
    title: null,
    description: null,
    canonical: null,
    robots: null,
    viewport: false,
    https: url.startsWith("https://"),
    headings: { h1: [], h2: [], h3: [] },
    links: { internal: 0, external: 0, total: 0 },
    images: { total: 0, missingAlt: 0 },
    forms: 0,
    buttons: [],
    jsonLdTypes: [],
    hasOpenGraph: false,
    hasTwitterCard: false,
    socialLinks: [],
    emailsFound: 0,
    phonesFound: 0,
    wordCount: 0,
    textSample: "",
    error: null,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GrowthPilotAI/1.0; +https://growthpilot.ai) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const fetchMs = Date.now() - started;
    const html = await response.text();
    const cheerio = await import("cheerio");
    const $ = cheerio.load(html);
    const finalUrl = response.url || url;
    const hostname = new URL(finalUrl).hostname;

    const title = $("title").first().text().trim() || null;
    const description =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      null;

    const headings = {
      h1: $("h1")
        .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
        .get()
        .filter(Boolean)
        .slice(0, 8),
      h2: $("h2")
        .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
        .get()
        .filter(Boolean)
        .slice(0, 12),
      h3: $("h3")
        .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
        .get()
        .filter(Boolean)
        .slice(0, 12),
    };

    let internal = 0;
    let external = 0;
    const socialHosts = ["facebook.com", "instagram.com", "linkedin.com", "twitter.com", "x.com", "youtube.com", "tiktok.com"];
    const socialLinks: string[] = [];

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      try {
        const resolved = new URL(href, finalUrl);
        if (resolved.hostname === hostname || resolved.hostname === `www.${hostname}` || hostname === `www.${resolved.hostname}`) {
          internal += 1;
        } else {
          external += 1;
          if (socialHosts.some((host) => resolved.hostname.includes(host))) {
            socialLinks.push(resolved.hostname);
          }
        }
      } catch {
        // ignore invalid hrefs
      }
    });

    const images = $("img");
    const missingAlt = images.filter((_, el) => !$(el).attr("alt")?.trim()).length;

    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const emailsFound = (bodyText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []).length;
    const phonesFound = (bodyText.match(/(\+?\d[\d\s().-]{7,}\d)/g) || []).length;

    const buttons = unique(
      $("a, button")
        .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
        .get()
        .filter((text) => text.length > 1 && text.length < 48)
        .slice(0, 20)
    );

    return {
      url,
      finalUrl,
      fetched: true,
      statusCode: response.status,
      fetchMs,
      title,
      description,
      canonical: $('link[rel="canonical"]').attr("href") || null,
      robots: $('meta[name="robots"]').attr("content") || null,
      viewport: Boolean($('meta[name="viewport"]').attr("content")),
      https: finalUrl.startsWith("https://"),
      headings,
      links: { internal, external, total: internal + external },
      images: { total: images.length, missingAlt },
      forms: $("form").length,
      buttons,
      jsonLdTypes: extractJsonLdTypes(html),
      hasOpenGraph: $('meta[property^="og:"]').length > 0,
      hasTwitterCard: $('meta[name^="twitter:"]').length > 0,
      socialLinks: unique(socialLinks),
      emailsFound,
      phonesFound,
      wordCount: bodyText ? bodyText.split(" ").length : 0,
      textSample: bodyText.slice(0, 2500),
      error: response.ok ? null : `Website responded with status ${response.status}`,
    };
  } catch (error) {
    return {
      ...empty,
      fetchMs: Date.now() - started,
      error: error instanceof Error ? error.message : "Unable to fetch website",
    };
  } finally {
    clearTimeout(timeout);
  }
}
