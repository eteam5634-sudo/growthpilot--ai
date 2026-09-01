"use client";

import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { formatDate } from "@/lib/utils";
import { categoryEntries } from "@/lib/scores";
import type { AuditRow } from "@/types/database";
import type { ParsedReport } from "@/types/report";

const styles = StyleSheet.create({
  page: { padding: 40, paddingBottom: 56, fontSize: 11, fontFamily: "Helvetica", color: "#0f172a" },
  kicker: { fontSize: 10, color: "#0f766e", marginBottom: 4, textTransform: "uppercase" },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  meta: { color: "#64748b", marginBottom: 18 },
  scoreBox: {
    border: "1pt solid #e2e8f0",
    borderRadius: 8,
    padding: 14,
    marginBottom: 18,
  },
  score: { fontSize: 28, fontFamily: "Helvetica-Bold", color: "#0f766e" },
  h2: { fontSize: 14, fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 8 },
  p: { lineHeight: 1.5, marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  item: { marginBottom: 8, paddingBottom: 8, borderBottom: "1pt solid #e2e8f0" },
  label: { fontSize: 9, color: "#64748b", marginBottom: 2, textTransform: "uppercase" },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#94a3b8",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function Footer({ businessName }: { businessName: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>Confidential — prepared by GrowthPilot AI</Text>
      <Text>
        {businessName} · <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Text>
    </View>
  );
}

export function ReportPdfDocument({
  audit,
  report,
}: {
  audit: AuditRow;
  report: ParsedReport;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.kicker}>GrowthPilot AI Audit Report</Text>
        <Text style={styles.title}>{audit.business_name}</Text>
        <Text style={styles.meta}>
          {audit.website_url}  ·  {audit.industry}  ·  {formatDate(audit.created_at)}
        </Text>
        {audit.business_description ? <Text style={styles.p}>{audit.business_description}</Text> : null}

        <View style={styles.scoreBox}>
          <Text style={styles.label}>Overall business score</Text>
          <Text style={styles.score}>{report.overallScore}/100</Text>
          {categoryEntries(report.categories).map((category) => (
            <View key={category.key} style={styles.row}>
              <Text>{category.label}</Text>
              <Text>{category.score}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.h2}>Executive summary</Text>
        <Text style={styles.p}>{report.executiveSummary.businessOverview}</Text>
        <Text style={styles.label}>Growth opportunities</Text>
        {report.executiveSummary.topOpportunities.map((item) => (
          <Text key={item} style={styles.p}>
            • {item}
          </Text>
        ))}
        <Text style={styles.label}>Biggest problems</Text>
        {report.executiveSummary.keyRisks.map((item) => (
          <Text key={item} style={styles.p}>
            • {item}
          </Text>
        ))}
        <Text style={styles.h2}>Strengths</Text>
        {report.strengths.map((item) => (
          <Text key={item} style={styles.p}>
            • {item}
          </Text>
        ))}
        <Text style={styles.h2}>Weaknesses</Text>
        {report.weaknesses.map((item) => (
          <Text key={item} style={styles.p}>
            • {item}
          </Text>
        ))}
        <Footer businessName={audit.business_name} />
      </Page>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Category analysis</Text>
        {categoryEntries(report.categories).map((category) => (
          <View key={category.key} style={styles.item} wrap={false}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
              {category.label} — {category.score}/100
            </Text>
            <Text style={styles.p}>{category.summary}</Text>
            {(category.strengths || []).slice(0, 3).map((item) => (
              <Text key={item} style={styles.p}>
                Strength: {item}
              </Text>
            ))}
            {(category.weaknesses || []).slice(0, 3).map((item) => (
              <Text key={item} style={styles.p}>
                Weakness: {item}
              </Text>
            ))}
          </View>
        ))}
        <Footer businessName={audit.business_name} />
      </Page>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h2}>Recommendations</Text>
        {report.recommendations.map((item) => (
          <View key={item.issue} style={styles.item} wrap={false}>
            <Text style={styles.label}>{item.priority} priority</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>{item.issue}</Text>
            <Text style={styles.p}>Fix: {item.suggestedFix}</Text>
            <Text style={styles.p}>Impact: {item.expectedImpact}</Text>
          </View>
        ))}
        <Text style={styles.h2}>Growth plan</Text>
        <Text style={styles.label}>Immediate actions</Text>
        {report.growthPlan.immediateActions.map((item, index) => (
          <Text key={item} style={styles.p}>
            {index + 1}. {item}
          </Text>
        ))}
        <Text style={styles.label}>Next 30 days</Text>
        {report.growthPlan.next30Days.map((item, index) => (
          <Text key={item} style={styles.p}>
            {index + 1}. {item}
          </Text>
        ))}
        <Footer businessName={audit.business_name} />
      </Page>
    </Document>
  );
}

export async function downloadAuditPdf(audit: AuditRow, report: ParsedReport) {
  const blob = await pdf(<ReportPdfDocument audit={audit} report={report} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `growthpilot-audit-${(audit.business_name ?? "report").replace(/\s+/g, "-").toLowerCase()}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
