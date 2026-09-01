"use client";

import { useActionState } from "react";
import { updateProfileAction, updatePasswordAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileForm({ fullName, email }: { fullName: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update the name and email attached to this workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Name</Label>
            <Input id="fullName" name="fullName" defaultValue={fullName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={email} required />
          </div>
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state?.success ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.success}</p> : null}
          <Button disabled={pending}>{pending ? "Saving..." : "Save changes"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Choose a new password with at least 8 characters.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" name="password" type="password" required minLength={8} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" name="confirm" type="password" required minLength={8} />
          </div>
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state?.success ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.success}</p> : null}
          <Button disabled={pending}>{pending ? "Updating..." : "Change password"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
