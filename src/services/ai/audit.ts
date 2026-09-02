import { createChatCompletion } from "@/services/ai/completion";
import { isAiConfigured } from "@/services/ai/client";
import { buildAuditPrompt } from "@/services/audit-engine/prompts";
import { extractJson, parseAuditReport } from "@/services/audit-engine/schema";
import type { NewAuditInput } from "@/types/audit";
import type { CategoryScores } from "@/types/report";
import type { WebsiteSnapshot } from "@/types/website";

export async function generateAuditWithAi(params: {
  business: NewAuditInput;
  snapshot: WebsiteSnapshot;
  heuristics: CategoryScores;
}) {
  if (!isAiConfigured()) {
    throw new Error("AI not configured");
  }

  const completion = await createChatCompletion({
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are GrowthPilot AI, a precise growth auditor. Reply with JSON only.",
      },
      {
        role: "user",
        content: buildAuditPrompt(params),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");
  return parseAuditReport(extractJson(content));
}
