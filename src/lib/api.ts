import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function requireApiUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { user: null, supabase, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, supabase, response: null };
}
