import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function toValidDate(value: string | Date | null | undefined): Date | null {
  if (value == null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatDate(value: string | Date | null | undefined, fallback = "—") {
  const date = toValidDate(value);
  if (!date) return fallback;
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return fallback;
  }
}

export function formatDateTime(value: string | Date | null | undefined, fallback = "—") {
  const date = toValidDate(value);
  if (!date) return fallback;
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    return fallback;
  }
}

export function normalizeWebsiteUrl(input: string | null | undefined) {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function hostnameFromUrl(url: string | null | undefined) {
  if (!url) return "";
  try {
    return new URL(url).hostname?.replace(/^www\./, "") || url;
  } catch {
    return url?.replace?.(/^www\./, "") || url || "";
  }
}

export function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreTone(score: number) {
  if (score >= 80) return "high" as const;
  if (score >= 60) return "medium" as const;
  return "low" as const;
}

export function scoreLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Needs work";
  return "Critical";
}
