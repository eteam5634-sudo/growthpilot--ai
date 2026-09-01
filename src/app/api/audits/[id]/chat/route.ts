import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAudit, reportFromAudit } from "@/services/audits";
import { listReportMessages, saveReportMessage } from "@/services/platform";
import { answerConsultantQuestion } from "@/services/audit-engine/consultant";

export const maxDuration = 60;

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const audit = await getAudit(supabase, id, user.id);
  if (!audit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await listReportMessages(supabase, id);
  return NextResponse.json({ messages });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const question = String(body?.question || "").trim();
  if (question.length < 8) {
    return NextResponse.json({ error: "Ask a more specific question" }, { status: 400 });
  }

  const audit = await getAudit(supabase, id, user.id);
  const report = audit ? reportFromAudit(audit) : null;
  if (!audit || !report) return NextResponse.json({ error: "Report not found" }, { status: 404 });

  const history = await listReportMessages(supabase, id);

  let answer: string;
  try {
    answer = await answerConsultantQuestion({ question, audit, report, history });
  } catch (error) {
    console.error("[consultant] API answer generation failed:", error);
    return NextResponse.json({ error: "The consultant could not answer just now." }, { status: 500 });
  }

  const userMessage = await saveReportMessage(supabase, {
    audit_id: id,
    user_id: user.id,
    role: "user",
    content: question,
  });
  const assistantMessage = await saveReportMessage(supabase, {
    audit_id: id,
    user_id: user.id,
    role: "assistant",
    content: answer,
  });

  return NextResponse.json({ message: assistantMessage, userMessage });
}
