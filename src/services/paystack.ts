import { normalizePlan, type PlanId } from "@/lib/billing";
import { paystackPlanCode } from "@/lib/paystack";

type PaystackResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

type InitializeData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackTransaction = {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  paid_at?: string;
  customer?: { customer_code?: string; email?: string };
  metadata?: Record<string, unknown>;
  plan?: { plan_code?: string; name?: string };
  subscription_code?: string;
};

function paystackSecret() {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return secret;
}

export async function initializePaystackSubscriptionCheckout(params: {
  email: string;
  plan: Exclude<PlanId, "free" | "pro">;
  userId: string;
  callbackUrl: string;
}) {
  const planCode = paystackPlanCode(params.plan);
  if (!planCode) {
    throw new Error(`Paystack plan code missing for ${params.plan}`);
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      plan: planCode,
      callback_url: params.callbackUrl,
      metadata: {
        user_id: params.userId,
        plan: params.plan,
        custom_fields: [
          { display_name: "User ID", variable_name: "user_id", value: params.userId },
          { display_name: "Plan", variable_name: "plan", value: params.plan },
        ],
      },
    }),
  });

  const json = (await response.json()) as PaystackResponse<InitializeData> & {
    message?: string;
  };

  if (!response.ok || !json.status || !json.data?.authorization_url) {
    throw new Error(json.message || "Paystack initialize failed");
  }

  return json.data;
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${paystackSecret()}` },
    cache: "no-store",
  });

  const json = (await response.json()) as PaystackResponse<PaystackTransaction> & {
    message?: string;
  };

  if (!response.ok || !json.status) {
    throw new Error(json.message || "Paystack verify failed");
  }

  return json.data;
}

export function planFromPaystackMetadata(metadata: Record<string, unknown> | undefined): PlanId | null {
  const plan = metadata?.plan;
  if (
    plan === "starter" ||
    plan === "professional" ||
    plan === "pro" ||
    plan === "agency"
  ) {
    return normalizePlan(String(plan));
  }
  return null;
}

export function userIdFromPaystackMetadata(metadata: Record<string, unknown> | undefined): string | null {
  const userId = metadata?.user_id;
  return typeof userId === "string" && userId.length > 0 ? userId : null;
}
