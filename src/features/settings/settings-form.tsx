"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "@/actions/workspace";
import { INDUSTRIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { UserSettingsRow } from "@/types/database";

export function SettingsForm({ settings }: { settings: UserSettingsRow | null }) {
  const [workspaceType, setWorkspaceType] = useState(settings?.workspace_type || "solo");
  const [industry, setIndustry] = useState(settings?.default_industry || "");
  const [state, action, pending] = useActionState(updateSettingsAction, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace settings</CardTitle>
        <CardDescription>Control how GrowthPilot behaves for you or your agency.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input id="companyName" name="companyName" defaultValue={settings?.company_name || ""} />
          </div>
          <div className="space-y-2">
            <Label>Workspace type</Label>
            <input type="hidden" name="workspaceType" value={workspaceType} />
            <Select value={workspaceType} onValueChange={(value) => setWorkspaceType(value as "solo" | "agency")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Solo / in-house</SelectItem>
                <SelectItem value="agency">Agency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Default industry</Label>
            <input type="hidden" name="defaultIndustry" value={industry} />
            <Select value={industry || "none"} onValueChange={(value) => setIndustry(value === "none" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {INDUSTRIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          {state && "success" in state && state.success ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.success}</p>
          ) : null}
          <Button disabled={pending}>{pending ? "Saving..." : "Save settings"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
