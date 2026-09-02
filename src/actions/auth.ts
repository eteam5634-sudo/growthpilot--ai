"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function originFromHeaders(formData: FormData) {
  return String(formData.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
}

export async function signUpAction(_: unknown, formData: FormData) {
  const parsed = credentialsSchema
    .extend({
      fullName: z.string().min(2, "Enter your name"),
    })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      fullName: formData.get("fullName"),
    });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }

  const supabase = await createClient();
  const origin = originFromHeaders(formData);
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) return { error: error.message };
  return { success: "Check your email to confirm your account." };
}

export async function signInAction(_: unknown, formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  const profile = await supabase
    .from("users")
    .select("account_status")
    .eq("id", data.user.id)
    .maybeSingle();

  if ((profile.data as { account_status?: string } | null)?.account_status === "suspended") {
    await supabase.auth.signOut();
    return { error: "Your account has been suspended. Contact support for help." };
  }

  const next = String(formData.get("next") || "/dashboard");
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(_: unknown, formData: FormData) {
  const email = z.string().email("Enter a valid email").safeParse(formData.get("email"));
  if (!email.success) return { error: email.error.issues[0]?.message ?? "Invalid email" };

  const supabase = await createClient();
  const origin = originFromHeaders(formData);
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) return { error: error.message };
  return { success: "If an account exists, a reset link is on its way." };
}

export async function resetPasswordAction(_: unknown, formData: FormData) {
  const password = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .safeParse(formData.get("password"));
  if (!password.success) return { error: password.error.issues[0]?.message ?? "Invalid password" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) return { error: error.message };
  redirect("/dashboard");
}
