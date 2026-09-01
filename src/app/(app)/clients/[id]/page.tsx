import Link from "next/link";
import { notFound } from "next/navigation";
import { addClientNoteAction } from "@/actions/workspace";
import { DeleteClientButton } from "@/features/clients/delete-client-button";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getClient, listClientAudits, listClientNotes } from "@/services/clients";
import { formatDate, hostnameFromUrl } from "@/lib/utils";
import { scoreColorClass } from "@/lib/scores";
import { ScoreTrendChart } from "@/features/dashboard/score-trend-chart";

export const metadata = { title: "Client" };

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();
  const client = await getClient(supabase, id, user.id).catch(() => null);
  if (!client) notFound();

  const [notes, audits] = await Promise.all([
    listClientNotes(supabase, id, user.id).catch(() => []),
    listClientAudits(supabase, id, user.id).catch(() => []),
  ]);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Client</p>
          <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {client.industry || "Industry unset"}
            {client.website_url ? ` · ${hostnameFromUrl(client.website_url)}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link
              href={`/audits/new?clientId=${client.id}${
                client.website_url ? `&websiteUrl=${encodeURIComponent(client.website_url)}` : ""
              }&businessName=${encodeURIComponent(client.name)}${
                client.industry ? `&industry=${encodeURIComponent(client.industry)}` : ""
              }${client.description ? `&description=${encodeURIComponent(client.description)}` : ""}`}
            >
              New audit
            </Link>
          </Button>
          <DeleteClientButton clientId={client.id} />
        </div>
      </div>

      {client.description ? (
        <Card>
          <CardHeader>
            <CardTitle>Brief</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{client.description}</CardContent>
        </Card>
      ) : null}

      {audits.filter((audit) => audit.overall_score != null).length >= 1 ? (
        <ScoreTrendChart audits={audits} title="Score movement" label="date" />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Audits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {audits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No audits linked yet. Link one from New Audit.</p>
            ) : (
              audits.map((audit) => (
                <Link
                  key={audit.id}
                  href={`/audits/${audit.id}`}
                  className="flex items-center justify-between rounded-lg border px-3 py-3 text-sm hover:bg-muted/50"
                >
                  <span>{formatDate(audit.created_at)}</span>
                  {audit.overall_score != null ? (
                    <span className={scoreColorClass(audit.overall_score)}>{audit.overall_score}</span>
                  ) : (
                    <Badge variant="secondary">{audit.status}</Badge>
                  )}
                </Link>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={addClientNoteAction.bind(null, client.id)} className="space-y-3">
              <Textarea name="body" placeholder="Progress, objections, next meeting..." required />
              <Button type="submit" size="sm">
                Add note
              </Button>
            </form>
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="rounded-lg border p-3 text-sm">
                  <p className="text-xs text-muted-foreground">{formatDate(note.created_at)}</p>
                  <p className="mt-1 leading-6">{note.body}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
