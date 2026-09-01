"use client";

import { useActionState } from "react";
import { createClientAction } from "@/actions/workspace";
import { INDUSTRIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function NewClientForm() {
  const [industry, setIndustry] = useState("");
  const [state, action, pending] = useActionState(createClientAction, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a client</CardTitle>
        <CardDescription>Store a profile so you can run multiple audits and track notes over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Client name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input id="websiteUrl" name="websiteUrl" placeholder="https://client.com" />
          </div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <input type="hidden" name="industry" value={industry} />
            <Select value={industry || "none"} onValueChange={(value) => setIndustry(value === "none" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unspecified</SelectItem>
                {INDUSTRIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Notes / brief</Label>
            <Textarea id="description" name="description" />
          </div>
          {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button disabled={pending}>{pending ? "Saving..." : "Create client"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
