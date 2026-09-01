"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { trackEvent } from "@/lib/analytics";
import { normalizePlan, type PlanId } from "@/lib/billing";

function stripePriceForPlan(plan: ReturnType<typeof normalizePlan>) {
  if (plan === "starter") return process.env.STRIPE_PRICE_STARTER ?? process.env.STRIPE_PRICE_PRO;
  if (plan === "professional") return process.env.STRIPE_PRICE_PRO ?? process.env.STRIPE_PRICE_PROFESSIONAL;
  if (plan === "agency") return process.env.STRIPE_PRICE_AGENCY;
  return null;
}

export async function startCheckoutAction(plan: PlanId) {
  const user = await requireUser();
  const normalized = normalizePlan(plan);
  if (normalized === "free") redirect("/billing");

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = stripePriceForPlan(normalized);

  const supabase = await createClient();
  await trackEvent(supabase, user.id, "checkout_started", { plan: normalized });

  if (!secret || !priceId) {
    redirect(`/pricing?checkout=setup&plan=${normalized}`);
  }

  const body = new URLSearchParams({
    mode: "subscription",
    success_url: `${origin}/billing?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=canceled`,
    customer_email: user.email || "",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    "metadata[user_id]": user.id,
    "metadata[plan]": normalized,
    "subscription_data[metadata][user_id]": user.id,
    "subscription_data[metadata][plan]": normalized,
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const session = (await response.json()) as { url?: string; error?: { message?: string } };
  if (!response.ok || !session.url) {
    redirect(`/pricing?checkout=error`);
  }

  redirect(session.url);
}
