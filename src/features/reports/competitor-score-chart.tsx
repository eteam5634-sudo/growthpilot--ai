"use client";

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CompetitorComparison } from "@/types/competitor";
import type { CategoryScores } from "@/types/report";

export function CompetitorScoreChart({
  comparison,
  primaryName,
  primaryScore,
  primaryCategories,
}: {
  comparison: CompetitorComparison;
  primaryName?: string;
  primaryScore?: number;
  primaryCategories?: CategoryScores;
}) {
  const data = [
    {
      name: "Overall",
      [primaryName || "You"]: primaryScore ?? 0,
      ...Object.fromEntries(comparison.competitors.map((item) => [item.hostname, item.scores.overall])),
    },
    {
      name: "SEO",
      [primaryName || "You"]: primaryCategories?.seo.score ?? 0,
      ...Object.fromEntries(comparison.competitors.map((item) => [item.hostname, item.scores.seo])),
    },
    {
      name: "Conversion",
      [primaryName || "You"]: primaryCategories?.conversion.score ?? 0,
      ...Object.fromEntries(comparison.competitors.map((item) => [item.hostname, item.scores.conversion])),
    },
    {
      name: "UX",
      [primaryName || "You"]: primaryCategories?.ux.score ?? 0,
      ...Object.fromEntries(comparison.competitors.map((item) => [item.hostname, item.scores.ux])),
    },
    {
      name: "Trust",
      [primaryName || "You"]: primaryCategories?.trust.score ?? 0,
      ...Object.fromEntries(comparison.competitors.map((item) => [item.hostname, item.scores.trust])),
    },
    {
      name: "Brand",
      [primaryName || "You"]: primaryCategories?.brand.score ?? 0,
      ...Object.fromEntries(comparison.competitors.map((item) => [item.hostname, item.scores.brand])),
    },
  ];

  const series = [
    { key: primaryName || "You", color: "#10b981" },
    ...comparison.competitors.map((item, index) => ({
      key: item.hostname,
      color: ["#6366f1", "#f59e0b", "#f43f5e"][index] || "#94a3b8",
    })),
  ];

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {series.map((item) => (
            <Bar key={item.key} dataKey={item.key} fill={item.color} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
