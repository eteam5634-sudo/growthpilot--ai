import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { categoryEntries } from "@/lib/scores";
import { scoreColorClass } from "@/lib/scores";
import type { CategoryScores } from "@/types/report";

export function CategoryCards({ categories }: { categories: CategoryScores }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {categoryEntries(categories).map((category) => (
        <Card key={category.key}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              {category.label}
              <span className={scoreColorClass(category.score)}>{category.score}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={category.score} />
            <p className="text-xs leading-5 text-muted-foreground">{category.summary}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CategoryDetails({ categories }: { categories: CategoryScores }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {categoryEntries(categories).map((category) => (
        <Card key={`${category.key}-details`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {category.label}
              <span className={`text-base ${scoreColorClass(category.score)}`}>{category.score}/100</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{category.summary}</p>
            <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                Strengths
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(category.strengths || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                Weaknesses
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(category.weaknesses || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            </div>
            {category.recommendations && category.recommendations.length > 0 ? (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  Recommendations
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {category.recommendations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
