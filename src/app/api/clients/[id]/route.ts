import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getClient, listClientAudits, listClientNotes } from "@/services/clients";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getClient(supabase, id, user.id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [notes, audits] = await Promise.all([
    listClientNotes(supabase, id, user.id),
    listClientAudits(supabase, id, user.id),
  ]);

  return NextResponse.json({ client, notes, audits });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("clients").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
