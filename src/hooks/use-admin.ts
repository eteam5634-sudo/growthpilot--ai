"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContactInquiryRow, PaymentRow, SubscriptionRow, UserRow } from "@/types/database";

export function useAdminUsers(initial: UserRow[] = []) {
  const [users, setUsers] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback((query?: string) => {
    startTransition(async () => {
      setError(null);
      const supabase = createClient();
      let request = supabase.from("users").select("*").order("created_at", { ascending: false }).limit(200);
      if (query) request = request.or(`email.ilike.%${query}%,full_name.ilike.%${query}%`);
      const { data, error: err } = await request;
      if (err) {
        setError(err.message);
        return;
      }
      setUsers((data ?? []) as UserRow[]);
    });
  }, []);

  useEffect(() => {
    setUsers(initial);
  }, [initial]);

  return { users, error, loading: pending, refresh };
}

export function useAdminSubscriptions(initial: SubscriptionRow[] = []) {
  const [rows, setRows] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      setError(null);
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("subscriptions")
        .select("*, users(id, email, full_name)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (err) {
        setError(err.message);
        return;
      }
      setRows((data ?? []) as SubscriptionRow[]);
    });
  }, []);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  return { rows, error, loading: pending, refresh };
}

export function useAdminPayments(initial: PaymentRow[] = []) {
  const [rows, setRows] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      setError(null);
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("payments")
        .select("*, users(id, email, full_name)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (err) {
        setError(err.message);
        return;
      }
      setRows((data ?? []) as PaymentRow[]);
    });
  }, []);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  return { rows, error, loading: pending, refresh };
}

export function useAdminContacts(initial: ContactInquiryRow[] = []) {
  const [rows, setRows] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      setError(null);
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (err) {
        setError(err.message);
        return;
      }
      setRows((data ?? []) as ContactInquiryRow[]);
    });
  }, []);

  useEffect(() => {
    setRows(initial);
  }, [initial]);

  return { rows, error, loading: pending, refresh };
}
