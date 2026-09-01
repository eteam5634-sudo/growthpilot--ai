"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().min(2, "Enter your name").max(120),
  email: z.string().email("Enter a valid email"),
  company: z.string().max(120).optional(),
  message: z.string().min(12, "Tell us a little more").max(2000),
});

export async function submitContactAction(_: unknown, formData: FormData) {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: String(formData.get("company") || ""),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_inquiries").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    company: parsed.data.company || null,
    message: parsed.data.message,
  });

  if (error) {
    return { error: "We could not send that just now. Email hello@growthpilot.ai instead." };
  }

  return { success: "Thanks — we will get back to you shortly." };
}
