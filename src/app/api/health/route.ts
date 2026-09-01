import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "growthpilot-ai",
    version: "0.2.0",
  });
}
