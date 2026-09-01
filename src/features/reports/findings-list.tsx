import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FindingsList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "positive" | "negative";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing recorded in this section yet.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                <span
                  className={`mt-2 size-1.5 shrink-0 rounded-full ${
                    tone === "positive" ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                {item}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
