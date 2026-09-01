import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recommendation } from "@/types/report";

function priorityVariant(priority: Recommendation["priority"]) {
  if (priority === "high") return "danger" as const;
  if (priority === "medium") return "warning" as const;
  return "secondary" as const;
}

export function Recommendations({ items }: { items: Recommendation[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No recommendations were stored for this report.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={`${item.priority}-${item.issue}`}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Problem</p>
              <CardTitle className="mt-1 text-base">{item.issue}</CardTitle>
            </div>
            <Badge variant={priorityVariant(item.priority)}>{item.priority} priority</Badge>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Suggested solution
              </div>
              <p className="mt-1 text-sm leading-6">{item.suggestedFix}</p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Expected impact
              </div>
              <p className="mt-1 text-sm leading-6">{item.expectedImpact}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
