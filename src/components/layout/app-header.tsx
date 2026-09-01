"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

type UserMenuProps = {
  email: string;
  name: string | null;
  isAdmin?: boolean;
};

export function AppHeader({
  user,
  isAgency,
  mobileNav,
}: {
  user: UserMenuProps;
  isAgency?: boolean;
  mobileNav?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu className="size-5" />
          </Button>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            {mobileNav ?? (
              <AppSidebar
                onNavigate={() => setOpen(false)}
                isAdmin={user.isAdmin}
                isAgency={isAgency}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden text-sm text-muted-foreground lg:block">Website growth intelligence</div>
      <div className="ml-auto flex items-center gap-2">
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/audits/new">New Audit</Link>
        </Button>
        <ThemeToggle />
        <UserMenu email={user.email} name={user.name} isAdmin={user.isAdmin} />
      </div>
    </header>
  );
}
