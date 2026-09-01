import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { listAllReportMessages } from "@/services/platform";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime, hostnameFromUrl } from "@/lib/utils";

export const metadata = { title: "Messages" };

import type { ReportMessageRow } from "@/types/database";

type MessageRow = ReportMessageRow & {
  audits: { business_name: string; website_url: string } | null;
};

export default async function MessagesPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const messages = (await listAllReportMessages(supabase, user.id).catch(() => [])) as MessageRow[];

  const threads = new Map<string, MessageRow[]>();
  for (const message of messages) {
    const key = message.audit_id;
    if (!threads.has(key)) threads.set(key, []);
    threads.get(key)!.push(message);
  }

  const threadList = [...threads.entries()].map(([auditId, msgs]) => ({
    auditId,
    audit: msgs[0]?.audits,
    messages: msgs.sort((a, b) => a.created_at.localeCompare(b.created_at)),
    lastAt: msgs[0]?.created_at,
  }));

  threadList.sort((a, b) => (b.lastAt ?? "").localeCompare(a.lastAt ?? ""));

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultant conversations from the report_messages table.
        </p>
      </div>

      {threadList.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Ask the AI consultant on any audit report to start a thread."
          action={
            <Button asChild>
              <Link href="/consultant">Open consultant</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {threadList.map((thread) => (
            <Card key={thread.auditId}>
              <CardContent className="py-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <p className="font-medium">{thread.audit?.business_name ?? "Audit report"}</p>
                    <p className="text-sm text-muted-foreground">
                      {thread.audit?.website_url ? hostnameFromUrl(thread.audit.website_url) : ""}
                      {thread.lastAt ? ` · ${formatDateTime(thread.lastAt)}` : ""}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {thread.messages[thread.messages.length - 1]?.content}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/reports/${thread.auditId}`}>Open report</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
