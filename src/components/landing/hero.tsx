import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="glow-orb pointer-events-none absolute -left-24 top-10 size-[380px]" />
      <div className="glow-orb pointer-events-none absolute -right-16 top-32 size-[280px]" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        <div className="animate-fade-up max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            AI website audits for growing teams
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            AI-Powered Business Growth Audit
          </h1>
          <p className="mt-5 text-lg leading-7 text-muted-foreground">
            Analyze your website, discover problems, and receive actionable AI recommendations.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start Free Audit
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">
                <Sparkles />
                View Plans
              </Link>
            </Button>
          </div>
        </div>
        <div
          className="animate-fade-up rounded-2xl border bg-card/80 p-5 shadow-xl backdrop-blur"
          style={{ animationDelay: "120ms" }}
        >
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="font-medium">What you get</span>
            <span className="text-muted-foreground">growthpilot.ai</span>
          </div>
          <ul className="space-y-4 text-sm">
            {[
              "Live website crawl — SEO, UX, conversion, trust",
              "AI-generated scores and executive summary",
              "Prioritized recommendations and 30-day growth plan",
              "PDF export and in-report AI consultant",
            ].map((item) => (
              <li key={item} className="flex gap-2 text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            Sign up free — 5 audits per month on the Free plan.
          </p>
        </div>
      </div>
    </section>
  );
}
