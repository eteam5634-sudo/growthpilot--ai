"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import type { AuditWithReport } from "@/types/database";

export function useReports(limit?: number) {
  const { user, loading: authLoading } = useUser();
  const [reports, setReports] = useState<AuditWithReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    let query = supabase
      .from("audits")
      .select("*, reports(*)")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error: queryError } = await query;
    if (queryError) {
      setError(queryError.message);
    } else {
      setReports((data ?? []) as AuditWithReport[]);
    }
    setLoading(false);
  }, [user, limit]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    refresh();
  }, [user, authLoading, refresh]);

  return { reports, loading: authLoading || loading, error, refresh };
}
