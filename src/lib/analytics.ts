import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/supabase";

export type AnalyticsEventName =
  | "audit_started"
  | "audit_completed"
  | "audit_failed"
  | "ai_chat"
  | "competitor_analysis"
  | "pdf_download"
  | "checkout_started"
  | "contact_submitted";

export async function trackEvent(
  supabase: SupabaseClient<Database>,
  userId: string | null,
  event: AnalyticsEventName,
  metadata: Record<string, unknown> = {}
) {
  if (!userId) return;
  try {
    await supabase.from("analytics_events").insert({
      user_id: userId,
      event,
      metadata: metadata as Json,
    });
  } catch {
    // Analytics must never block the product path.
  }
}
