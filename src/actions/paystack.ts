"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { normalizePlan } from "@/lib/billing";
import { planFromPaystackPlanCode } from "@/lib/paystack";
import { recordPayment, syncSubscriptionPlan } from "@/services/billing";
import { planFromPaystackMetadata, userIdFromPaystackMetadata, verifyPaystackTransaction } from "@/services/paystack";

/** Verify Paystack callback after redirect (backup when webhooks are delayed). */
export async function verifyPaystackCheckoutAction(reference: string, userId: string) {
  if (!reference || !userId) return { ok: false as const };

  try {
    const transaction = await verifyPaystackTransaction(reference);
    if (transaction.status !== "success") return { ok: false as const };

    const metadata = transaction.metadata ?? {};
    const metadataUserId = userIdFromPaystackMetadata(metadata);
    if (metadataUserId && metadataUserId !== userId) {
      return { ok: false as const };
    }

    const plan =
      planFromPaystackMetadata(metadata) ??
      planFromPaystackPlanCode(transaction.plan?.plan_code) ??
      "free";

    if (plan === "free") return { ok: false as const };

    const supabase = createServiceClient();
    const periodEnd = transaction.paid_at ? new Date(transaction.paid_at).toISOString() : null;

    await syncSubscriptionPlan(supabase, {
      userId,
      plan: normalizePlan(plan),
      status: "active",
      stripeCustomerId: transaction.customer?.customer_code ?? null,
      stripeSubscriptionId: transaction.subscription_code ?? transaction.reference,
      currentPeriodEnd: periodEnd,
    });

    await recordPayment(supabase, {
      userId,
      stripePaymentId: transaction.reference,
      amountCents: transaction.amount,
      currency: transaction.currency || "ngn",
      status: "succeeded",
      paymentMethod: "paystack",
      stripePaymentIntent: transaction.reference,
    });

    return { ok: true as const };
  } catch {
    return { ok: false as const };
  }
}
