import { NewAuditForm } from "@/features/audits/new-audit-form";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { listClients } from "@/services/clients";
import { getSettings } from "@/services/platform";

export const metadata = { title: "New Audit" };
export const maxDuration = 60;

export default async function NewAuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    clientId?: string;
    websiteUrl?: string;
    businessName?: string;
    industry?: string;
    description?: string;
  }>;
}) {
  const user = await requireUser();
  const supabase = await createClient();
  const params = await searchParams;
  const [clients, settings] = await Promise.all([
    listClients(supabase, user.id).catch(() => []),
    getSettings(supabase, user.id).catch(() => null),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Audit</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Analyze a website and generate a scored growth report with prioritized recommendations.
        </p>
      </div>
      <NewAuditForm
        clients={clients}
        defaultIndustry={settings?.default_industry}
        defaults={{
          websiteUrl: params.websiteUrl,
          businessName: params.businessName,
          industry: params.industry,
          clientId: params.clientId,
          businessDescription: params.description,
        }}
      />
    </div>
  );
}
