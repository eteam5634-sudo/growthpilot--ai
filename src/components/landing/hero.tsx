import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
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
              <Link href="/demo">
                <PlayCircle />
                View Demo Report
              </Link>
            </Button>
          </div>
        </div>
        <div className="animate-fade-up rounded-2xl border bg-card/80 p-5 shadow-xl backdrop-blur" style={{ animationDelay: "120ms" }}>
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="font-medium">Business Score</span>
            <span className="text-muted-foreground">growthpilot.ai</span>
          </div>
          <div className="mb-6 flex items-end gap-3">
            <span className="text-6xl font-semibold tracking-tight text-primary">78</span>
            <span className="mb-2 text-sm text-muted-foreground">/ 100 overall</span>
          </div>
          <div className="space-y-3">
            {[
              ["SEO", 82],
              ["Conversion", 64],
              ["UX", 76],
              ["Trust", 71],
              ["Brand", 80],
            ].map(([label, score]) => (
              <div key={String(label)}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>{label}</span>
                  <span className="text-muted-foreground">{score}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
