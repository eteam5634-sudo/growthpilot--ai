import Link from "next/link";
import { Swords } from "lucide-react";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { listCompetitorAnalyses } from "@/services/platform";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { formatDate, hostnameFromUrl } from "@/lib/utils";
import type { CompetitorComparison } from "@/types/competitor";

export const metadata = { title: "Competitor Analysis" };

export default async function CompetitorsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const rows = await listCompetitorAnalyses(supabase, user.id).catch(() => []);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Competitor analysis</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          History from the competitor_analyses table.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Swords}
          title="No competitor analyses yet"
          description="Run a competitor comparison from any completed audit report."
          action={
            <Button asChild>
              <Link href="/reports">View reports</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {rows.map((row) => {
            const audit = row.audits as { business_name: string; website_url: string } | null;
            const payload = row.payload as CompetitorComparison | null;
            return (
              <Link
                key={row.id}
                href={`/competitors/${row.id}`}
                className="flex flex-col justify-between gap-3 rounded-xl border bg-card px-4 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium">{audit?.business_name ?? "Competitor run"}</p>
                  <p className="text-sm text-muted-foreground">
                    {audit?.website_url ? hostnameFromUrl(audit.website_url) : ""} ·{" "}
                    {formatDate(row.created_at)}
                  </p>
                  {payload?.insights?.[0] ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{payload.insights[0]}</p>
                  ) : null}
                </div>
                <span className="text-sm text-primary">View details →</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
