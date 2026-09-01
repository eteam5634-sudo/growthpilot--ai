"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { INDUSTRIES } from "@/lib/constants";
import { normalizeWebsiteUrl } from "@/lib/utils";
import { upsertSettings } from "@/services/platform";

export async function createClientAction(_: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      name: z.string().min(2).max(120),
      websiteUrl: z.string().optional(),
      industry: z.string().optional(),
      description: z.string().max(800).optional(),
    })
    .safeParse({
      name: formData.get("name"),
      websiteUrl: String(formData.get("websiteUrl") || ""),
      industry: String(formData.get("industry") || ""),
      description: String(formData.get("description") || ""),
    });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid client details" };

  const supabase = await createClient();
  const websiteUrl = parsed.data.websiteUrl ? normalizeWebsiteUrl(parsed.data.websiteUrl) : null;
  const { data, error } = await supabase
    .from("clients")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      website_url: websiteUrl,
      industry: parsed.data.industry || null,
      description: parsed.data.description || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  redirect(`/clients/${data.id}`);
}

export async function addClientNoteAction(clientId: string, formData: FormData) {
  const user = await requireUser();
  const body = z.string().min(4).max(2000).safeParse(String(formData.get("body") || "").trim());
  if (!body.success) return;

  const supabase = await createClient();
  const { error } = await supabase.from("client_notes").insert({
    client_id: clientId,
    user_id: user.id,
    body: body.data,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteClientAction(clientId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", clientId).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  redirect("/clients");
}

export async function updateSettingsAction(_: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      companyName: z.string().max(120).optional(),
      workspaceType: z.enum(["solo", "agency"]),
      defaultIndustry: z.string().optional(),
    })
    .safeParse({
      companyName: String(formData.get("companyName") || ""),
      workspaceType: formData.get("workspaceType"),
      defaultIndustry: String(formData.get("defaultIndustry") || ""),
    });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid settings" };

  const industry = parsed.data.defaultIndustry;
  if (industry && !(INDUSTRIES as readonly string[]).includes(industry) && industry !== "") {
    return { error: "Select a valid industry." };
  }

  const supabase = await createClient();
  await upsertSettings(supabase, user.id, {
    company_name: parsed.data.companyName || null,
    workspace_type: parsed.data.workspaceType,
    default_industry: industry || null,
  });
  revalidatePath("/settings");
  return { success: "Settings saved." };
}
