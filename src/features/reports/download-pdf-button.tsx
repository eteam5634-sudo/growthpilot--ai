"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadAuditPdf } from "@/features/reports/report-pdf";
import type { AuditRow } from "@/types/database";
import type { ParsedReport } from "@/types/report";

export function DownloadPdfButton({ audit, report }: { audit: AuditRow; report: ParsedReport }) {
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="outline"
      onClick={async () => {
        setPending(true);
        try {
          await downloadAuditPdf(audit, report);
        } finally {
          setPending(false);
        }
      }}
      disabled={pending}
    >
      <Download />
      {pending ? "Preparing PDF..." : "Download Audit Report"}
    </Button>
  );
}
