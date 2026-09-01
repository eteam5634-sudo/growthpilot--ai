import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteAudit, getAudit, reportFromAudit } from "@/services/audits";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const audit = await getAudit(supabase, id, user.id);
  if (!audit) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ audit, report: reportFromAudit(audit) });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await deleteAudit(supabase, id, user.id);
  return NextResponse.json({ ok: true });
}
