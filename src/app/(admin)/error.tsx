"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[40vh] max-w-lg flex-col items-center justify-center gap-3 text-center">
      <h2 className="text-xl font-semibold">Admin page failed to load</h2>
      <p className="text-sm text-muted-foreground">{error.message || "Check Supabase migrations and admin permissions."}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
