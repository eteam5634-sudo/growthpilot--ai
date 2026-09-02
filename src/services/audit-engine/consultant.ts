import { createChatCompletion, isAiConfigured } from "@/services/ai";
import type { AuditRow, ReportMessageRow } from "@/types/database";
import type { ParsedReport, Recommendation } from "@/types/report";

type ConsultantInput = {
  question: string;
  audit: Pick<AuditRow, "business_name" | "website_url" | "industry" | "business_description" | "overall_score">;
  report: ParsedReport;
  history?: Pick<ReportMessageRow, "role" | "content">[];
};

function compactAuditContext(input: ConsultantInput) {
  const { audit, report } = input;
  return {
    business: audit.business_name,
    url: audit.website_url,
    industry: audit.industry,
    description: audit.business_description,
    overallScore: audit.overall_score ?? report.overallScore,
    scores: Object.fromEntries(
      Object.entries(report.categories).map(([key, category]) => [
        key,
        { score: category.score, summary: category.summary, weaknesses: category.weaknesses.slice(0, 3) },
      ])
    ),
    topRecommendations: report.recommendations.slice(0, 6).map((item) => ({
      priority: item.priority,
      issue: item.issue,
      suggestedFix: item.suggestedFix,
      expectedImpact: item.expectedImpact,
    })),
    immediateActions: report.growthPlan.immediateActions.slice(0, 5),
    next30Days: report.growthPlan.next30Days.slice(0, 5),
    weaknesses: report.weaknesses.slice(0, 6),
  };
}

function formatRecommendation(rec: Recommendation) {
  return `${rec.issue}\n\nSuggested fix: ${rec.suggestedFix}\n\nExpected impact: ${rec.expectedImpact}`;
}

function fallbackConsultantAnswer(input: ConsultantInput): string {
  const question = input.question.toLowerCase();
  const { report, audit } = input;
  const overall = audit.overall_score ?? report.overallScore;

  if (question.includes("seo")) {
    const seo = report.categories.seo;
    const rec =
      report.recommendations.find((item) =>
        /seo|meta|search|title|keyword/i.test(`${item.issue} ${item.suggestedFix}`)
      ) ?? report.recommendations[0];
    return [
      `Your SEO score is ${seo.score}/100 for ${audit.business_name}.`,
      seo.summary,
      seo.weaknesses.length ? `Main SEO gaps:\n${seo.weaknesses.map((item) => `- ${item}`).join("\n")}` : "",
      rec ? `Start here:\n${formatRecommendation(rec)}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (question.includes("conversion") || question.includes("convert")) {
    const conversion = report.categories.conversion;
    const rec =
      report.recommendations.find((item) =>
        /conversion|cta|funnel|lead|sales/i.test(`${item.issue} ${item.suggestedFix}`)
      ) ?? report.recommendations[0];
    return [
      `Your conversion score is ${conversion.score}/100.`,
      conversion.summary,
      conversion.weaknesses.length
        ? `Conversion blockers:\n${conversion.weaknesses.map((item) => `- ${item}`).join("\n")}`
        : "",
      rec ? `Recommended next step:\n${formatRecommendation(rec)}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (
    question.includes("fix first") ||
    question.includes("priority") ||
    question.includes("start") ||
    question.includes("first")
  ) {
    const prioritized = [
      ...report.recommendations.filter((item) => item.priority === "high"),
      ...report.recommendations.filter((item) => item.priority !== "high"),
    ];
    const top = prioritized[0];
    if (top) {
      return [
        `For ${audit.business_name} (overall score ${overall}/100), fix this first:`,
        formatRecommendation(top),
        report.growthPlan.immediateActions[0]
          ? `Quick win from your growth plan: ${report.growthPlan.immediateActions[0]}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    }
  }

  const top = report.recommendations[0];
  if (top) {
    return [
      `Based on your audit for ${audit.business_name} (${overall}/100 overall):`,
      formatRecommendation(top),
      report.weaknesses.length
        ? `Other weaknesses to address next:\n${report.weaknesses
            .slice(0, 3)
            .map((item) => `- ${item}`)
            .join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    `Your site currently scores ${overall}/100 overall.`,
    report.weaknesses.length
      ? `Focus on:\n${report.weaknesses
          .slice(0, 3)
          .map((item) => `- ${item}`)
          .join("\n")}`
      : "Re-run the audit with a valid OpenAI key for deeper consultant answers.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function callOpenAI(input: ConsultantInput): Promise<string | null> {
  if (!isAiConfigured()) return null;

  const prior = (input.history ?? []).slice(-8).map((message) => ({
    role: message.role as "user" | "assistant",
    content: message.content,
  }));

  const completion = await createChatCompletion({
    temperature: 0.3,
    max_tokens: 900,
    messages: [
      {
        role: "system",
        content:
          "You are GrowthPilot AI, a concise growth consultant. Use only the provided audit context. Reply in 2-5 short paragraphs or a tight bullet list.",
      },
      {
        role: "user",
        content: `Audit context:\n${JSON.stringify(compactAuditContext(input))}`,
      },
      ...prior,
      { role: "user", content: input.question },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || null;
}

export async function answerConsultantQuestion(input: ConsultantInput): Promise<string> {
  try {
    const answer = await callOpenAI(input);
    if (answer) return answer;
  } catch (error) {
    console.error("[consultant] OpenAI request failed:", error);
  }

  return fallbackConsultantAnswer(input);
}
