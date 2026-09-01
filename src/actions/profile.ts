"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { updateProfile } from "@/services/users";

export async function updateProfileAction(_: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      fullName: z.string().min(2, "Enter your name").max(80),
      email: z.string().email("Enter a valid email"),
    })
    .safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
    });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profile details" };
  }

  const supabase = await createClient();
  const { error: authError } = await supabase.auth.updateUser({
    email: parsed.data.email,
    data: { full_name: parsed.data.fullName },
  });
  if (authError) return { error: authError.message };

  await updateProfile(supabase, user.id, {
    full_name: parsed.data.fullName,
    email: parsed.data.email,
  });

  return { success: "Profile updated." };
}

export async function updatePasswordAction(_: unknown, formData: FormData) {
  await requireUser();
  const parsed = z
    .object({
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirm: z.string().min(8),
    })
    .refine((value) => value.password === value.confirm, {
      message: "Passwords do not match",
      path: ["confirm"],
    })
    .safeParse({
      password: formData.get("password"),
      confirm: formData.get("confirm"),
    });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid password" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };
  return { success: "Password updated." };
}
