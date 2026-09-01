import { Activity, FileText, Swords, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardStats({
  totalAudits,
  totalReports,
  totalClients,
  totalCompetitorAnalyses,
  averageScore,
}: {
  totalAudits: number;
  totalReports: number;
  totalClients: number;
  totalCompetitorAnalyses: number;
  averageScore: number | null;
}) {
  const items = [
    { label: "Total Audits", value: totalAudits.toString(), icon: Activity },
    { label: "Total Reports", value: totalReports.toString(), icon: FileText },
    { label: "Total Clients", value: totalClients.toString(), icon: Users },
    { label: "Competitor Analyses", value: totalCompetitorAnalyses.toString(), icon: Swords },
  ];

  return (
    <div className="space-y-4">
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
      {averageScore != null ? (
        <p className="text-sm text-muted-foreground">
          Average business score across completed audits:{" "}
          <span className="font-medium text-foreground">{averageScore}/100</span>
        </p>
      ) : null}
    </div>
  );
}
