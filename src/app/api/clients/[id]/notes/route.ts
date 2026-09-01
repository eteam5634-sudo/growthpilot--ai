import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClient, listClientNotes } from "@/services/clients";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getClient(supabase, id, user.id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const notes = await listClientNotes(supabase, id, user.id);
  return NextResponse.json({ notes });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getClient(supabase, id, user.id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const json = await request.json().catch(() => null);
  const body = String(json?.body || "").trim();
  if (body.length < 4) {
    return NextResponse.json({ error: "Enter a note" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("client_notes")
    .insert({ client_id: id, user_id: user.id, body })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data }, { status: 201 });
}
