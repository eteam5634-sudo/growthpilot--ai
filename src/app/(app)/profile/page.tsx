import Link from "next/link";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/services/users";
import { getSettings } from "@/services/platform";
import { getUserProfileStats } from "@/services/admin";
import { getUsage } from "@/services/billing";
import { ProfileForm, PasswordForm } from "@/features/profile/profile-forms";
import { SettingsForm } from "@/features/settings/settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { planDisplayName as billingPlanName } from "@/lib/billing";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  const supabase = await createClient();
  const [profile, settings, stats, usage] = await Promise.all([
    getProfile(supabase, user.id).catch(() => null),
    getSettings(supabase, user.id).catch(() => null),
    getUserProfileStats(supabase, user.id).catch(() => ({ totalAudits: 0, totalReports: 0, subscription: null })),
    getUsage(supabase, user.id).catch(() => null),
  ]);

  const accountStatus = profile?.account_status ?? "active";
  const plan = usage?.plan ?? stats.subscription?.plan ?? "free";

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Account details, preferences, and usage pulled from Supabase.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account overview</CardTitle>
          <CardDescription>Data from the users, audits, and subscriptions tables.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Full name</p>
            <p className="font-medium">{profile?.full_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium">{profile?.email || user.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Registered</p>
            <p className="font-medium">{formatDate(profile?.created_at ?? user?.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Account status</p>
            <Badge variant={accountStatus === "active" ? "secondary" : "destructive"}>{accountStatus}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Audits completed</p>
            <p className="font-medium">{stats.totalReports}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Reports generated</p>
            <p className="font-medium">{stats.totalReports}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current plan</p>
            <p className="font-medium">{billingPlanName(plan)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Billing</p>
            <Link href="/billing" className="text-sm text-primary hover:underline">
              Manage subscription
            </Link>
          </div>
        </CardContent>
      </Card>

      <ProfileForm
        fullName={profile?.full_name || (user.user_metadata?.full_name as string | undefined) || ""}
        email={profile?.email || user.email || ""}
      />
      <SettingsForm settings={settings} />
      <PasswordForm />
    </div>
  );
}
