import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-col">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="relative flex items-center justify-between px-6 py-5">
        <Logo />
        <ThemeToggle />
      </div>
      <div className="relative flex flex-1 items-center justify-center px-4 py-10">{children}</div>
    </div>
  );
}
