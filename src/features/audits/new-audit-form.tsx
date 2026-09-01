"use client";

import { useActionState, useEffect, useState } from "react";
import { INDUSTRIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { runAuditAction } from "@/actions/audits";
import type { ClientRow } from "@/types/database";

const STEPS = [
  "Validating URL and collecting website data",
  "Scoring SEO, conversion, UX, trust, and brand",
  "Writing the executive summary",
  "Saving the report and growth plan",
];

export function NewAuditForm({
  clients,
  defaultIndustry,
  defaults,
}: {
  clients: ClientRow[];
  defaultIndustry?: string | null;
  defaults?: {
    websiteUrl?: string;
    businessName?: string;
    industry?: string;
    clientId?: string;
    businessDescription?: string;
  };
}) {
  const [industry, setIndustry] = useState(defaults?.industry || defaultIndustry || "");
  const [clientId, setClientId] = useState(defaults?.clientId || "");
  const [step, setStep] = useState(0);
  const [state, action, pending] = useActionState(runAuditAction, undefined);

  useEffect(() => {
    if (!pending) {
      setStep(0);
      return;
    }
    const timer = window.setInterval(() => {
      setStep((current) => (current < STEPS.length - 1 ? current + 1 : current));
    }, 7000);
    return () => window.clearInterval(timer);
  }, [pending]);

  return (
    <Card className="relative overflow-hidden">
      {pending ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 p-8 text-center backdrop-blur-sm">
          <Loader2 className="mb-4 size-8 animate-spin text-primary" />
          <h3 className="text-lg font-semibold">Running AI audit</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{STEPS[step]}</p>
          <Progress className="mt-6 w-full max-w-sm" value={((step + 1) / STEPS.length) * 100} />
          <ul className="mt-6 space-y-2 text-left text-sm text-muted-foreground">
            {STEPS.map((item, index) => (
              <li key={item} className="flex items-center gap-2">
                <span className={`size-1.5 rounded-full ${index <= step ? "bg-primary" : "bg-muted-foreground/40"}`} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <CardHeader>
        <CardTitle>New website audit</CardTitle>
        <CardDescription>
          Enter the site you want analyzed. We will crawl the homepage and generate a scored growth report.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              name="websiteUrl"
              placeholder="https://www.yourbusiness.com"
              defaultValue={defaults?.websiteUrl}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              name="businessName"
              placeholder="Northline Apparel"
              defaultValue={defaults?.businessName}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <input type="hidden" name="industry" value={industry} />
            <Select value={industry} onValueChange={setIndustry} required>
              <SelectTrigger id="industry">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessDescription">Business description</Label>
            <Textarea
              id="businessDescription"
              name="businessDescription"
              placeholder="What you sell, who you serve, and what growth looks like."
              defaultValue={defaults?.businessDescription}
            />
          </div>
          {clients.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="clientId">Link to client (optional)</Label>
              <input type="hidden" name="clientId" value={clientId} />
              <Select value={clientId || "none"} onValueChange={(value) => setClientId(value === "none" ? "" : value)}>
                <SelectTrigger id="clientId">
                  <SelectValue placeholder="No client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" size="lg" disabled={pending || !industry}>
            Run AI Audit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
