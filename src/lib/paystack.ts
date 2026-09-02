import { normalizePlan, type PlanId } from "@/lib/billing";

export type PaystackPlanId = Exclude<ReturnType<typeof normalizePlan>, "free">;

export function isPaystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

export function paystackPlanCode(plan: PaystackPlanId): string | null {
  if (plan === "starter") return process.env.PAYSTACK_PLAN_STARTER ?? null;
  if (plan === "professional") {
    return process.env.PAYSTACK_PLAN_PROFESSIONAL ?? process.env.PAYSTACK_PLAN_PRO ?? null;
  }
  if (plan === "agency") return process.env.PAYSTACK_PLAN_AGENCY ?? null;
  return null;
}

export function planFromPaystackPlanCode(code: string | null | undefined): PlanId | null {
  if (!code) return null;
  if (code === process.env.PAYSTACK_PLAN_STARTER) return "starter";
  if (
    code === process.env.PAYSTACK_PLAN_PROFESSIONAL ||
    code === process.env.PAYSTACK_PLAN_PRO
  ) {
    return "professional";
  }
  if (code === process.env.PAYSTACK_PLAN_AGENCY) return "agency";
  return null;
}

export function paystackCheckoutAvailable(plan: PaystackPlanId) {
  return isPaystackConfigured() && Boolean(paystackPlanCode(plan));
}

export function stripeCheckoutAvailable(plan: PaystackPlanId) {
  if (plan === "starter") {
    return Boolean(process.env.STRIPE_SECRET_KEY && (process.env.STRIPE_PRICE_STARTER || process.env.STRIPE_PRICE_PRO));
  }
  if (plan === "professional") {
    return Boolean(
      process.env.STRIPE_SECRET_KEY &&
        (process.env.STRIPE_PRICE_PROFESSIONAL || process.env.STRIPE_PRICE_PRO)
    );
  }
  if (plan === "agency") {
    return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_AGENCY);
  }
  return false;
}

export function preferredCheckoutProvider(plan: PaystackPlanId): "paystack" | "stripe" | null {
  if (paystackCheckoutAvailable(plan)) return "paystack";
  if (stripeCheckoutAvailable(plan)) return "stripe";
  return null;
}

export function paymentProviderLabel() {
  if (isPaystackConfigured()) return "Paystack";
  if (process.env.STRIPE_SECRET_KEY) return "Stripe";
  return null;
}
