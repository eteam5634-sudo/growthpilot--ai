"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, hostnameFromUrl } from "@/lib/utils";
import type { AuditRow } from "@/types/database";

export function ScoreTrendChart({
  audits,
  title = "Score trend",
  label = "host",
}: {
  audits: AuditRow[];
  title?: string;
  label?: "host" | "date";
}) {
  const data = audits
    .filter((audit) => audit.overall_score != null)
    .slice(0, 8)
    .reverse()
    .map((audit) => ({
      name:
        label === "date"
          ? formatDate(audit.created_at)
          : (hostnameFromUrl(audit.website_url)?.replace(/\.[a-z]+$/i, "") || "site"),
      score: audit.overall_score,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px]">
        {data.length === 0 ? (
          <p className="pt-12 text-center text-sm text-muted-foreground">
            Completed audits will appear here as a score trend.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
