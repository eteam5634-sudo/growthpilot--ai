import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeWebsiteUrl } from "@/lib/utils";
import { getAudit } from "@/services/audits";
import { generateCompetitorComparison } from "@/services/audit-engine/competitor";
import { latestCompetitorAnalysis, saveCompetitorAnalysis } from "@/services/platform";

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

  const analysis = await latestCompetitorAnalysis(supabase, id);
  return NextResponse.json({ analysis });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const urls = Array.isArray(body?.urls)
    ? body.urls.map((url: unknown) => normalizeWebsiteUrl(String(url || "").trim())).filter(Boolean)
    : [];

  if (urls.length === 0) {
    return NextResponse.json({ error: "Enter at least one competitor URL" }, { status: 400 });
  }

  const audit = await getAudit(supabase, id, user.id);
  if (!audit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const payload = await generateCompetitorComparison(
    {
      websiteUrl: audit.website_url,
      businessName: audit.business_name,
      industry: audit.industry,
      businessDescription: audit.business_description || undefined,
    },
    urls.slice(0, 3)
  );

  const analysis = await saveCompetitorAnalysis(supabase, {
    audit_id: id,
    user_id: user.id,
    payload,
  });

  return NextResponse.json({ analysis });
}
