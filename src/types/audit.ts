import type { AuditRow } from "@/types/database";
import type { ParsedReport } from "@/types/report";

export type NewAuditInput = {
  websiteUrl: string;
  businessName: string;
  industry: string;
  businessDescription?: string;
  clientId?: string | null;
};

export type AuditRecord = AuditRow;

export type AuditWithParsedReport = AuditRow & {
  report: ParsedReport | null;
};
