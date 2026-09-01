import { Gauge, Layout, Megaphone, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "AI Website Audit",
    description: "Crawl a live homepage and score the commercial performance of the business in minutes.",
    icon: Sparkles,
  },
  {
    title: "SEO Analysis",
    description: "Titles, metadata, structure, and crawl signals that decide whether you get found.",
    icon: Search,
  },
  {
    title: "Conversion Optimization",
    description: "CTA clarity, forms, and funnel friction that silently leak revenue.",
    icon: Gauge,
  },
  {
    title: "UX Review",
    description: "Scanability, navigation, and mobile readiness that shape first impressions.",
    icon: Layout,
  },
  {
    title: "Growth Recommendations",
    description: "Prioritized fixes with expected impact, plus a 30-day action plan.",
    icon: Megaphone,
  },
  {
    title: "AI Consultant",
    description: "Ask why a score is low and what to fix first, with the full report as context.",
    icon: ShieldCheck,
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">What you get</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          A complete growth audit, not a generic checklist
        </h2>
        <p className="mt-3 text-muted-foreground">
          Each report scores the five areas that most often stall website-led growth.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
