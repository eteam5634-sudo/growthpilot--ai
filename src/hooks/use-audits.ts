"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import type { AuditRow } from "@/types/database";

export function useAudits(limit?: number) {
  const { user, loading: authLoading } = useUser();
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    let query = supabase
      .from("audits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error: queryError } = await query;
    if (queryError) {
      setError(queryError.message);
    } else {
      setAudits((data ?? []) as AuditRow[]);
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

  return { audits, loading: authLoading || loading, error, refresh };
}
