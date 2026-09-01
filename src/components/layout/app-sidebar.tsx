"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  FileBarChart,
  History,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  Sparkles,
  Swords,
  UserRound,
  Users,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

export function AppSidebar({
  onNavigate,
  isAdmin,
  isAgency = true,
}: {
  onNavigate?: () => void;
  isAdmin?: boolean;
  isAgency?: boolean;
}) {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/audits/new", label: "New Audit", icon: Sparkles },
    { href: "/reports", label: "Reports", icon: FileBarChart },
    { href: "/history", label: "Audit History", icon: History },
    { href: "/competitors", label: "Competitors", icon: Swords },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/consultant", label: "AI Consultant", icon: MessageSquare },
    ...(isAgency ? [{ href: "/clients", label: "Clients", icon: Users }] : []),
    { href: "/billing", label: "Billing", icon: CreditCard },
    { href: "/profile", label: "Profile", icon: UserRound },
    { href: "/settings", label: "Settings", icon: Settings },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-5">
        <Logo className="text-sidebar-foreground" />
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {items.map((item) => {
          const active = (() => {
            if (item.href === "/history") {
              return pathname === "/history" || pathname.startsWith("/audits/history");
            }
            if (item.href === "/reports") {
              return pathname.startsWith("/reports") || /^\/audits\/[^/]+$/.test(pathname);
            }
            if (item.href === "/dashboard") {
              return pathname === "/dashboard";
            }
            return pathname === item.href || pathname.startsWith(`${item.href}/`);
          })();
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 text-xs text-white/40">GrowthPilot AI</div>
    </div>
  );
}
