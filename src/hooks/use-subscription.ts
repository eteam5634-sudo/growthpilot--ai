"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import { getUsage, getSubscription, listPayments } from "@/services/billing";
import type { PaymentRow, SubscriptionRow } from "@/types/database";
import type { UsageSnapshot } from "@/services/billing";

export function useSubscription() {
  const { user, loading: authLoading } = useUser();
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    try {
      const [usageData, sub, paymentRows] = await Promise.all([
        getUsage(supabase, user.id),
        getSubscription(supabase, user.id),
        listPayments(supabase, user.id).catch(() => []),
      ]);
      setUsage(usageData);
      setSubscription(sub);
      setPayments(paymentRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscription");
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

  return { usage, subscription, payments, loading: authLoading || loading, error, refresh };
}
