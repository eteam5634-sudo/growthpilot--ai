"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryEntries } from "@/lib/scores";
import type { CategoryScores } from "@/types/report";

export function ScoreRadar({ categories }: { categories: CategoryScores }) {
  const data = categoryEntries(categories).map((item) => ({
    subject: item.label,
    score: item.score,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Score profile</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
            <Radar dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
