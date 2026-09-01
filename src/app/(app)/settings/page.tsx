import { SettingsForm } from "@/features/settings/settings-form";
import { BillingCard } from "@/features/settings/billing-card";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/services/platform";
import { getUsage } from "@/services/billing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const user = await requireUser();
  const supabase = await createClient();
  const [settings, usage] = await Promise.all([
    getSettings(supabase, user.id).catch(() => null),
    getUsage(supabase, user.id).catch(() => ({
      plan: "free" as const,
      status: "active" as const,
      used: 0,
      limit: 5,
      remaining: 5,
      competitorUsed: 0,
      competitorLimit: 2,
      competitorRemaining: 2,
      periodStart: new Date().toISOString().slice(0, 10),
      renewalDate: null,
      canRun: true,
      canRunCompetitor: true,
    })),
  ]);

  const checkoutNotice =
    checkout === "success"
      ? "Your subscription is active. Plan changes may take a moment to appear."
      : checkout === "canceled"
        ? "Checkout was canceled. You can upgrade anytime from pricing."
        : null;

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Workspace defaults, billing, and appearance.
        </p>
      </div>
      <BillingCard usage={usage} checkoutNotice={checkoutNotice} />
      <SettingsForm settings={settings} />
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Use the sun/moon control in the navbar to switch light and dark mode.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Theme is saved in this browser and applies across the dashboard, reports, and landing page.
        </CardContent>
      </Card>
    </div>
  );
}
