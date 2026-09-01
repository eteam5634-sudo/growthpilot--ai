"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuditRow } from "@/types/database";

const ScoreTrendChart = dynamic(
  () => import("@/features/dashboard/score-trend-chart").then((mod) => mod.ScoreTrendChart),
  {
    loading: () => <Skeleton className="h-72 w-full rounded-xl" />,
    ssr: false,
  }
);

export function ScoreTrendChartLazy({ audits }: { audits: Pick<AuditRow, "created_at" | "overall_score">[] }) {
  return <ScoreTrendChart audits={audits as AuditRow[]} />;
}
