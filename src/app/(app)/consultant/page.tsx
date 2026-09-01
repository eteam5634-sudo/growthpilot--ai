import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { listCompletedReports } from "@/services/audits";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hostnameFromUrl } from "@/lib/utils";

export const metadata = { title: "AI Consultant" };

export default async function ConsultantPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const audits = await listCompletedReports(supabase, user.id).catch(() => []);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Consultant</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask questions against a completed report. The consultant uses your scores, recommendations, and
          business details as context.
        </p>
      </div>
      {audits.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No reports to discuss yet"
          description="Run an audit first. Chat lives on each report so answers stay specific."
          action={
            <Button asChild>
              <Link href="/audits/new">Run AI Audit</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {audits.map((audit) => (
            <Card key={audit.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{audit.business_name}</CardTitle>
                  <CardDescription>{hostnameFromUrl(audit.website_url)}</CardDescription>
                </div>
                <Button asChild size="sm">
                  <Link href={`/reports/${audit.id}#consultant`}>Open chat</Link>
                </Button>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Try: “Why is my SEO score low?”, “What should I fix first?”, or “How can I increase conversions?”
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
