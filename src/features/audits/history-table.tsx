"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { formatDate, hostnameFromUrl } from "@/lib/utils";
import { scoreColorClass } from "@/lib/scores";
import { deleteAuditAction } from "@/actions/audits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AuditRow } from "@/types/database";

function statusVariant(status: AuditRow["status"]) {
  if (status === "completed") return "success" as const;
  if (status === "failed") return "danger" as const;
  if (status === "analyzing") return "warning" as const;
  return "secondary" as const;
}

type Pagination = {
  page: number;
  totalPages: number;
  total: number;
  status: string;
  query: string;
};

export function HistoryTable({
  audits,
  pagination,
}: {
  audits: AuditRow[];
  pagination?: Pagination;
}) {
  const [query, setQuery] = useState(pagination?.query ?? "");
  const [status, setStatus] = useState(pagination?.status ?? "all");
  const [sort, setSort] = useState<"date" | "score" | "name">("date");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  const serverPaginated = Boolean(pagination);

  const rows = useMemo(() => {
    if (serverPaginated) return audits;
    const filtered = audits.filter((audit) => {
      const haystack = `${audit.business_name} ${audit.website_url} ${audit.industry}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesStatus = status === "all" || audit.status === status;
      return matchesQuery && matchesStatus;
    });
    return [...filtered].sort((a, b) => {
      if (sort === "score") return (b.overall_score ?? -1) - (a.overall_score ?? -1);
      if (sort === "name") return a.business_name.localeCompare(b.business_name);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [audits, query, sort, status, serverPaginated]);

  function applyServerFilters(nextPage = 1) {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (status !== "all") params.set("status", status);
    if (nextPage > 1) params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by business, URL, or industry"
          className="sm:max-w-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="analyzing">Analyzing</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        {!serverPaginated ? (
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="date">Sort by date</option>
            <option value="score">Sort by score</option>
            <option value="name">Sort by name</option>
          </select>
        ) : (
          <Button type="button" variant="outline" onClick={() => applyServerFilters(1)}>
            Apply filters
          </Button>
        )}
      </div>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Website</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Overall score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No audits match that search.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((audit) => (
                <TableRow key={audit.id}>
                  <TableCell className="font-medium">{hostnameFromUrl(audit.website_url)}</TableCell>
                  <TableCell>{audit.business_name}</TableCell>
                  <TableCell>{formatDate(audit.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(audit.status)}>{audit.status}</Badge>
                  </TableCell>
                  <TableCell className={audit.overall_score != null ? scoreColorClass(audit.overall_score) : ""}>
                    {audit.overall_score ?? "—"}
                  </TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/reports/${audit.id}`}>View</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pending && pendingId === audit.id}
                      onClick={() => {
                        if (!confirm("Delete this audit and its report?")) return;
                        setPendingId(audit.id);
                        startTransition(async () => {
                          await deleteAuditAction(audit.id);
                          router.refresh();
                        });
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => applyServerFilters(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => applyServerFilters(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
