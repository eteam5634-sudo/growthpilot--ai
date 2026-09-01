import Link from "next/link";
import { Sparkles } from "lucide-react";
import { HistoryTable } from "@/features/audits/history-table";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { listAuditsPaginated } from "@/services/audits";

export const metadata = { title: "Audit History" };

export default async function AuditHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; q?: string }>;
}) {
  const { page: pageParam, status = "all", q = "" } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const user = await requireUser();
  const supabase = await createClient();
  const result = await listAuditsPaginated(supabase, user.id, {
    page,
    pageSize: 10,
    status,
    query: q,
  }).catch(() => ({ data: [], total: 0, page: 1, pageSize: 10, totalPages: 1 }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total} audit{result.total === 1 ? "" : "s"} from Supabase — search, filter, and paginate.
          </p>
        </div>
        <Button asChild>
          <Link href="/audits/new">New Audit</Link>
        </Button>
      </div>
      {result.total === 0 && !q && status === "all" ? (
        <EmptyState
          icon={Sparkles}
          title="No audits yet"
          description="Run your first AI audit to start building a history of scores and growth plans."
          action={
            <Button asChild>
              <Link href="/audits/new">Run AI Audit</Link>
            </Button>
          }
        />
      ) : (
        <HistoryTable
          audits={result.data}
          pagination={{
            page: result.page,
            totalPages: result.totalPages,
            total: result.total,
            status,
            query: q,
          }}
        />
      )}
    </div>
  );
}
