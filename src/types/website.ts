export type HeadingSnapshot = {
  h1: string[];
  h2: string[];
  h3: string[];
};

export type LinkSnapshot = {
  internal: number;
  external: number;
  total: number;
};

export type ImageSnapshot = {
  total: number;
  missingAlt: number;
};

export type WebsiteSnapshot = {
  url: string;
  finalUrl: string;
  fetched: boolean;
  statusCode: number | null;
  fetchMs: number | null;
  title: string | null;
  description: string | null;
  canonical: string | null;
  robots: string | null;
  viewport: boolean;
  https: boolean;
  headings: HeadingSnapshot;
  links: LinkSnapshot;
  images: ImageSnapshot;
  forms: number;
  buttons: string[];
  jsonLdTypes: string[];
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  socialLinks: string[];
  emailsFound: number;
  phonesFound: number;
  wordCount: number;
  textSample: string;
  error: string | null;
};
