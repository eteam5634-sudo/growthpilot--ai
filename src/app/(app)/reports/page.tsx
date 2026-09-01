import Link from "next/link";
import { FileBarChart } from "lucide-react";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { listReportsPaginated } from "@/services/audits";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { ReportsTable } from "@/features/reports/reports-table";

export const metadata = { title: "Reports" };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const user = await requireUser();
  const supabase = await createClient();
  const result = await listReportsPaginated(supabase, user.id, { page, pageSize: 10 }).catch(() => ({
    data: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total} report{result.total === 1 ? "" : "s"} from Supabase with category scores.
          </p>
        </div>
        <Button asChild>
          <Link href="/audits/new">New Audit</Link>
        </Button>
      </div>
      {result.total === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title="No reports yet"
          description="Run an AI audit to generate your first growth report."
          action={
            <Button asChild>
              <Link href="/audits/new">Run AI Audit</Link>
            </Button>
          }
        />
      ) : (
        <ReportsTable
          audits={result.data}
          pagination={{ page: result.page, totalPages: result.totalPages, total: result.total }}
        />
      )}
    </div>
  );
}
