"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sendConsultantMessageAction } from "@/actions/intelligence";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportMessageRow } from "@/types/database";

const SUGGESTED = [
  "Why is my SEO score low?",
  "What should I fix first?",
  "How can I increase conversions?",
];

export function ConsultantChat({
  auditId,
  messages,
}: {
  auditId: string;
  messages: ReportMessageRow[];
}) {
  const [state, action, pending] = useActionState(sendConsultantMessageAction.bind(null, auditId), undefined);
  const [draft, setDraft] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (state && "success" in state && state.success) {
      setDraft("");
      router.refresh();
    }
  }, [state, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI business consultant</CardTitle>
        <CardDescription>
          Ask about this report — for example, why SEO is low, what to fix first, or how to lift conversions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border bg-muted/30 p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No questions yet. Try “What should I fix first this week?”
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg px-3 py-2 text-sm leading-6 ${
                  message.role === "user" ? "ml-8 bg-primary/10" : "mr-8 bg-background"
                }`}
              >
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {message.role === "user" ? "You" : "Consultant"}
                </div>
                {message.content}
              </div>
            ))
          )}
        </div>
        <form action={action} className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((prompt) => (
              <Button
                key={prompt}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDraft(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
          <Textarea
            name="question"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Why is my conversion score low?"
            required
            minLength={8}
          />
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button disabled={pending}>{pending ? "Thinking..." : "Ask consultant"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
