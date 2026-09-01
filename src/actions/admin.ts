"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { normalizePlan, type PlanId } from "@/lib/billing";
import {
  cancelSubscription,
  setUserAccountStatus,
  setUserRole,
  updateSubscriptionPlan,
} from "@/services/admin";

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/audits");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/contacts");
  revalidatePath("/admin/analytics");
}

export async function setUserRoleAction(userId: string, role: "user" | "admin") {
  const { supabase, user } = await requireAdmin();
  if (user.id === userId && role !== "admin") {
    return;
  }
  await setUserRole(supabase, userId, role);
  revalidateAdmin();
  revalidatePath(`/admin/users/${userId}`);
}

export async function setUserAccountStatusAction(userId: string, status: "active" | "suspended") {
  const { supabase, user } = await requireAdmin();
  if (user.id === userId && status === "suspended") {
    return;
  }
  await setUserAccountStatus(supabase, userId, status);
  revalidateAdmin();
  revalidatePath(`/admin/users/${userId}`);
}

export async function updateSubscriptionPlanAction(subscriptionId: string, plan: string) {
  const { supabase } = await requireAdmin();
  const nextPlan = normalizePlan(plan);
  await updateSubscriptionPlan(supabase, subscriptionId, nextPlan);
  revalidateAdmin();
}

export async function cancelSubscriptionAction(subscriptionId: string) {
  const { supabase } = await requireAdmin();
  await cancelSubscription(supabase, subscriptionId);
  revalidateAdmin();
}

export async function upgradeSubscriptionAction(subscriptionId: string, currentPlan: PlanId) {
  const order: Array<Exclude<PlanId, "pro">> = ["free", "starter", "professional", "agency"];
  const current = normalizePlan(currentPlan);
  const index = order.indexOf(current);
  const next = order[Math.min(index + 1, order.length - 1)];
  return updateSubscriptionPlanAction(subscriptionId, next);
}

export async function downgradeSubscriptionAction(subscriptionId: string, currentPlan: PlanId) {
  const order: Array<Exclude<PlanId, "pro">> = ["free", "starter", "professional", "agency"];
  const current = normalizePlan(currentPlan);
  const index = order.indexOf(current);
  const next = order[Math.max(index - 1, 0)];
  return updateSubscriptionPlanAction(subscriptionId, next);
}
