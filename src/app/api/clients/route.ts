import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listClients } from "@/services/clients";
import { normalizeWebsiteUrl } from "@/lib/utils";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const clients = await listClients(supabase, user.id);
    return NextResponse.json({ clients });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await request.json().catch(() => null);
  const name = String(json?.name || "").trim();
  if (name.length < 2) {
    return NextResponse.json({ error: "Enter a client name" }, { status: 400 });
  }

  const websiteUrl = json?.websiteUrl ? String(json.websiteUrl).trim() : "";
  const { data, error } = await supabase
    .from("clients")
    .insert({
      user_id: user.id,
      name,
      website_url: websiteUrl ? normalizeWebsiteUrl(websiteUrl) : null,
      industry: json?.industry ? String(json.industry) : null,
      description: json?.description ? String(json.description) : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ client: data }, { status: 201 });
}
