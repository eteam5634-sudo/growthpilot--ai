"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

function safeDayLabel(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  try {
    return format(date, "MMM d");
  } catch {
    return null;
  }
}

export function AdminTrendChart({
  title,
  rows,
}: {
  title: string;
  rows: { created_at?: string | null }[];
}) {
  const grouped = (rows ?? []).reduce<Record<string, number>>((acc, row) => {
    const key = safeDayLabel(row?.created_at);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const data = Object.entries(grouped).map(([label, count]) => ({ label, count }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data in this window yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={28} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.15)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
