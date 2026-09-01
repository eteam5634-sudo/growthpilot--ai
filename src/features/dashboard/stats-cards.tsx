import { Activity, FileText, Gauge, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatsCards({
  totalAudits,
  averageScore,
  reportsGenerated,
  recentActivity,
}: {
  totalAudits: number;
  averageScore: number | null;
  reportsGenerated: number;
  recentActivity: number;
}) {
  const items = [
    { label: "Total Audits", value: totalAudits.toString(), icon: Activity },
    {
      label: "Average Score",
      value: averageScore == null ? "—" : String(averageScore),
      icon: Gauge,
    },
    {
      label: "Reports Generated",
      value: reportsGenerated.toString(),
      icon: FileText,
    },
    {
      label: "Recent Activity",
      value: recentActivity.toString(),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
            <item.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
