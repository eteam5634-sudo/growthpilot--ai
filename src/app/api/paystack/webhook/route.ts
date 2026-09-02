import { NextResponse } from "next/server";
import { normalizePlan, type PlanId } from "@/lib/billing";
import { planFromPaystackPlanCode } from "@/lib/paystack";
import { verifyPaystackWebhookSignature } from "@/lib/paystack-webhook";
import { createServiceClient } from "@/lib/supabase/service";
import { recordPayment, syncSubscriptionPlan } from "@/services/billing";
import { planFromPaystackMetadata, userIdFromPaystackMetadata } from "@/services/paystack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaystackEvent = {
  event: string;
  data: Record<string, unknown>;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function planFromEventData(data: Record<string, unknown>): PlanId | null {
  const metadata = asRecord(data.metadata);
  const fromMetadata = planFromPaystackMetadata(metadata);
  if (fromMetadata && fromMetadata !== "free") return fromMetadata;

  const plan = asRecord(data.plan);
  const fromPlanCode = planFromPaystackPlanCode(asString(plan?.plan_code));
  if (fromPlanCode && fromPlanCode !== "free") return fromPlanCode;

  return null;
}

function userIdFromEventData(data: Record<string, unknown>): string | null {
  const metadata = asRecord(data.metadata);
  const fromMetadata = userIdFromPaystackMetadata(metadata);
  if (fromMetadata) return fromMetadata;

  const customFields = metadata?.custom_fields;
  if (Array.isArray(customFields)) {
    for (const field of customFields) {
      const row = asRecord(field);
      if (row?.variable_name === "user_id" && typeof row.value === "string") {
        return row.value;
      }
    }
  }

  return null;
}

async function handleChargeSuccess(supabase: ReturnType<typeof createServiceClient>, data: Record<string, unknown>) {
  const userId = userIdFromEventData(data);
  const plan = planFromEventData(data);
  if (!userId || !plan || plan === "free") return;

  const customer = asRecord(data.customer);
  const planObj = asRecord(data.plan);
  const nextPayment = asString(data.next_payment_date) || asString(data.paid_at);
  const periodEnd = nextPayment ? new Date(nextPayment).toISOString() : null;

  await syncSubscriptionPlan(supabase, {
    userId,
    plan: normalizePlan(plan),
    status: "active",
    stripeCustomerId: asString(customer?.customer_code),
    stripeSubscriptionId: asString(data.subscription_code) ?? asString(data.reference),
    currentPeriodEnd: periodEnd,
  });

  const amount = Number(data.amount ?? 0);
  const currency = asString(data.currency) || "ngn";
  const reference = asString(data.reference);
  if (reference && amount > 0) {
    await recordPayment(supabase, {
      userId,
      stripePaymentId: reference,
      amountCents: amount,
      currency,
      status: "succeeded",
      paymentMethod: "paystack",
      stripePaymentIntent: reference,
    });
  }
}

async function handleSubscriptionActive(
  supabase: ReturnType<typeof createServiceClient>,
  data: Record<string, unknown>,
  status: "active" | "canceled"
) {
  const subscriptionCode = asString(data.subscription_code);
  const customer = asRecord(data.customer);
  const plan = planFromEventData(data);
  const nextPayment = asString(data.next_payment_date);
  const periodEnd = nextPayment ? new Date(nextPayment).toISOString() : null;

  let userId = userIdFromEventData(data);

  if (!userId && subscriptionCode) {
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionCode)
      .maybeSingle();
    userId = existing?.user_id ?? null;
  }

  if (!userId) return;

  if (status === "canceled") {
    await syncSubscriptionPlan(supabase, {
      userId,
      plan: "free",
      status: "canceled",
      stripeCustomerId: asString(customer?.customer_code),
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    });
    return;
  }

  if (!plan) return;

  await syncSubscriptionPlan(supabase, {
    userId,
    plan: normalizePlan(plan),
    status: "active",
    stripeCustomerId: asString(customer?.customer_code),
    stripeSubscriptionId: subscriptionCode,
    currentPeriodEnd: periodEnd,
  });
}

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Paystack not configured" }, { status: 503 });
  }

  const payload = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackWebhookSignature(payload, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(payload) as PaystackEvent;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const data = event.data ?? {};

  try {
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(supabase, data);
        break;
      case "subscription.create":
        await handleSubscriptionActive(supabase, data, "active");
        break;
      case "subscription.disable":
      case "subscription.not_renew":
        await handleSubscriptionActive(supabase, data, "canceled");
        break;
      case "invoice.payment_failed": {
        const userId = userIdFromEventData(data);
        if (!userId) break;
        await syncSubscriptionPlan(supabase, {
          userId,
          plan: planFromEventData(data) ?? "free",
          status: "past_due",
          stripeSubscriptionId: asString(data.subscription_code),
        });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Paystack webhook handler failed:", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
