"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm({ origin }: { origin: string }) {
  const [state, action, pending] = useActionState(forgotPasswordAction, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="origin" value={origin} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="you@company.com" />
      </div>
      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.success}</p> : null}
      <Button className="w-full" disabled={pending}>
        {pending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
