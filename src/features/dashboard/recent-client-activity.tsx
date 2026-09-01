import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClientActivityRow } from "@/services/dashboard";

export function RecentClientActivity({ notes }: { notes: ClientActivityRow[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent client activity</CardTitle>
        <Link href="/clients" className="text-sm text-primary hover:underline">
          Clients
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No client notes yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="rounded-lg border px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{note.clients?.name ?? "Client"}</span>
                <span className="text-xs text-muted-foreground">{formatDate(note.created_at)}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{note.body}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
