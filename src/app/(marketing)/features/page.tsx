import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";

export const metadata = { title: "Features" };

export default function FeaturesPage() {
  return (
    <div className="pb-16">
      <section className="mx-auto max-w-6xl px-4 pb-8 pt-16 sm:px-6">
        <p className="text-sm font-medium text-primary">Product</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Everything you need to grow a website</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          GrowthPilot combines SEO, conversion, UX, trust, and brand analysis with an AI consultant that
          already knows your report.
        </p>
      </section>
      <Features />
      <HowItWorks />
    </div>
  );
}
