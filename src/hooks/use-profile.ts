"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import type { UserRow, UserSettingsRow } from "@/types/database";
import { getUserProfileStats } from "@/services/admin";

export function useProfile() {
  const { user, loading: authLoading } = useUser();
  const [profile, setProfile] = useState<UserRow | null>(null);
  const [settings, setSettings] = useState<UserSettingsRow | null>(null);
  const [stats, setStats] = useState<{ totalAudits: number; totalReports: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    try {
      const [{ data: profileRow }, { data: settingsRow }, profileStats] = await Promise.all([
        supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_settings").select("*").eq("user_id", user.id).maybeSingle(),
        getUserProfileStats(supabase, user.id),
      ]);
      setProfile((profileRow as UserRow | null) ?? null);
      setSettings((settingsRow as UserSettingsRow | null) ?? null);
      setStats({ totalAudits: profileStats.totalAudits, totalReports: profileStats.totalReports });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    refresh();
  }, [user, authLoading, refresh]);

  return { user, profile, settings, stats, loading: authLoading || loading, error, refresh };
}
