import Link from "next/link";
import { Users } from "lucide-react";
import { NewClientForm } from "@/features/clients/client-forms";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { listClients } from "@/services/clients";
import { hostnameFromUrl } from "@/lib/utils";

export const metadata = { title: "Clients" };

export default async function ClientsPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const clients = await listClients(supabase, user.id).catch(() => []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Agency workspace for client profiles, notes, and repeated audits.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {clients.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No clients yet"
              description="Add a client profile to keep audits, notes, and improvements in one place."
            />
          ) : (
            clients.map((client) => (
              <Card key={client.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{client.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {client.industry || "Industry unset"}
                      {client.website_url ? ` · ${hostnameFromUrl(client.website_url)}` : ""}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/clients/${client.id}`}>Open</Link>
                  </Button>
                </CardHeader>
                {client.description ? (
                  <CardContent className="text-sm text-muted-foreground">{client.description}</CardContent>
                ) : null}
              </Card>
            ))
          )}
        </div>
        <NewClientForm />
      </div>
    </div>
  );
}
