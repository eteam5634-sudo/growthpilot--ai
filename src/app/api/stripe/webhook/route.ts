import { NextResponse } from "next/server";
import { normalizePlan, type PlanId } from "@/lib/billing";
import { verifyStripeWebhookSignature } from "@/lib/stripe-webhook";
import { createServiceClient } from "@/lib/supabase/service";
import { recordPayment, syncSubscriptionPlan } from "@/services/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StripeEvent = {
  type: string;
  data: { object: Record<string, unknown> };
};

function stripeMetadata(object: Record<string, unknown>): Record<string, unknown> | undefined {
  const metadata = object.metadata;
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return undefined;
}

function stripeString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function planFromMetadata(metadata: Record<string, unknown> | undefined): PlanId | null {
  const plan = metadata?.plan;
  if (
    plan === "free" ||
    plan === "starter" ||
    plan === "professional" ||
    plan === "pro" ||
    plan === "agency"
  ) {
    return plan as PlanId;
  }
  return null;
}

function mapSubscriptionStatus(status: string | undefined): "active" | "trialing" | "past_due" | "canceled" | "incomplete" {
  if (status === "trialing") return "trialing";
  if (status === "past_due") return "past_due";
  if (status === "canceled" || status === "unpaid") return "canceled";
  if (status === "incomplete" || status === "incomplete_expired") return "incomplete";
  return "active";
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!verifyStripeWebhookSignature(payload, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const metadata = stripeMetadata(session);
        const userId = String(metadata?.user_id || "");
        const plan = planFromMetadata(metadata);
        if (!userId || !plan || plan === "free") break;

        await syncSubscriptionPlan(supabase, {
          userId,
          plan: normalizePlan(plan),
          status: "active",
          stripeCustomerId: stripeString(session.customer),
          stripeSubscriptionId: stripeString(session.subscription),
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object;
        const metadata = stripeMetadata(subscription);
        const userId = String(metadata?.user_id || "");
        const plan = planFromMetadata(metadata);
        if (!userId || !plan) break;

        const periodEnd =
          typeof subscription.current_period_end === "number"
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null;

        await syncSubscriptionPlan(supabase, {
          userId,
          plan: normalizePlan(plan),
          status: mapSubscriptionStatus(stripeString(subscription.status) ?? undefined),
          stripeCustomerId: stripeString(subscription.customer),
          stripeSubscriptionId: stripeString(subscription.id),
          currentPeriodEnd: periodEnd,
        });
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const metadata = stripeMetadata(subscription);
        const userId = String(metadata?.user_id || "");
        if (!userId) break;

        await syncSubscriptionPlan(supabase, {
          userId,
          plan: "free",
          status: "canceled",
          stripeCustomerId: stripeString(subscription.customer),
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
        });
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const metadata = stripeMetadata(invoice);
        const userId = String(metadata?.user_id || "");
        if (!userId) break;

        await recordPayment(supabase, {
          userId,
          stripePaymentId: String(invoice.payment_intent || invoice.id),
          amountCents: Number(invoice.amount_paid || 0),
          currency: String(invoice.currency || "usd"),
          status: "succeeded",
        });
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handler failed:", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
