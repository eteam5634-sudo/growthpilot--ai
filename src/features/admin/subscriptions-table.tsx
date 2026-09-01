"use client";

import { useTransition } from "react";
import {
  cancelSubscriptionAction,
  downgradeSubscriptionAction,
  upgradeSubscriptionAction,
} from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { planDisplayName, normalizePlan } from "@/lib/billing";
import type { AdminSubscriptionRow } from "@/services/admin";
import { formatDate } from "@/lib/utils";

export function AdminSubscriptionsTable({ rows }: { rows: AdminSubscriptionRow[] }) {
  const [pending, startTransition] = useTransition();
  const list = rows ?? [];

  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
        No subscriptions found. Run migrations 0003–0004 if tables are missing.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[800px] text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Plan</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Start</th>
            <th className="px-4 py-3 font-medium">Expiry</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((sub) => {
            const plan = normalizePlan(sub?.plan);
            const status = sub?.status || "unknown";
            const userLabel =
              sub?.users?.full_name || sub?.users?.email || sub?.user_id || "Unknown user";
            return (
              <tr key={sub?.id || sub?.user_id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-medium">{userLabel}</div>
                  {sub?.users?.full_name && sub?.users?.email ? (
                    <div className="text-xs text-muted-foreground">{sub.users.email}</div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{planDisplayName(plan)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={status === "canceled" ? "destructive" : "outline"}>{status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(sub?.started_at || sub?.created_at)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(sub?.expires_at || sub?.current_period_end)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending || !sub?.id || plan === "agency"}
                      onClick={() =>
                        startTransition(async () => {
                          if (!sub?.id) return;
                          await upgradeSubscriptionAction(sub.id, plan);
                        })
                      }
                    >
                      Upgrade
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending || !sub?.id || plan === "free"}
                      onClick={() =>
                        startTransition(async () => {
                          if (!sub?.id) return;
                          await downgradeSubscriptionAction(sub.id, plan);
                        })
                      }
                    >
                      Downgrade
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending || !sub?.id || status === "canceled"}
                      onClick={() =>
                        startTransition(async () => {
                          if (!sub?.id) return;
                          await cancelSubscriptionAction(sub.id);
                        })
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
