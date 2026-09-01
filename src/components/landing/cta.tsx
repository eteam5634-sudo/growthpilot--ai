import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border bg-sidebar px-6 py-14 text-center text-sidebar-foreground sm:px-12">
        <div className="glow-orb pointer-events-none absolute left-10 top-0 size-48" />
        <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to see what is holding your site back?
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">
          Create a free account, run your first audit, and leave with a prioritized growth plan.
        </p>
        <div className="relative mt-8">
          <Button size="lg" asChild>
            <Link href="/signup">Start Free Audit</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
