"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import type { ClientRow } from "@/types/database";

export function useClients() {
  const { user, loading: authLoading } = useUser();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: queryError } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (queryError) {
      setError(queryError.message);
    } else {
      setClients((data ?? []) as ClientRow[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    refresh();
  }, [user, authLoading, refresh]);

  return { clients, loading: authLoading || loading, error, refresh };
}
