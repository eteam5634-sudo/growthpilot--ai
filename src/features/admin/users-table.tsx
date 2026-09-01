"use client";

import Link from "next/link";
import { useTransition } from "react";
import { setUserAccountStatusAction, setUserRoleAction } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserRow } from "@/types/database";
import { formatDate } from "@/lib/utils";

export function AdminUsersTable({ users }: { users: UserRow[] }) {
  const [pending, startTransition] = useTransition();
  const rows = users ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
        No users match that search.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Created</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((user) => {
            const role = user?.role || "user";
            const isAdmin = role === "admin";
            const accountStatus = user?.account_status || "active";
            const isSuspended = accountStatus === "suspended";
            return (
              <tr key={user?.id || user?.email} className="border-t">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${user?.id || ""}`} className="font-medium hover:underline">
                    {user?.full_name || "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user?.email || "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={isSuspended ? "destructive" : "outline"}>{accountStatus}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(user?.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending || !user?.id}
                      onClick={() =>
                        startTransition(async () => {
                          if (!user?.id) return;
                          await setUserRoleAction(user.id, isAdmin ? "user" : "admin");
                        })
                      }
                    >
                      {isAdmin ? "Remove admin" : "Make admin"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending || !user?.id}
                      onClick={() =>
                        startTransition(async () => {
                          if (!user?.id) return;
                          await setUserAccountStatusAction(user.id, isSuspended ? "active" : "suspended");
                        })
                      }
                    >
                      {isSuspended ? "Activate" : "Suspend"}
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
