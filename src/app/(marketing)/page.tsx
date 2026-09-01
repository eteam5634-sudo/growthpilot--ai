import { Cta } from "@/components/landing/cta";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { Testimonials } from "@/components/landing/testimonials";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <PricingPreview />
      <Testimonials />
      <Cta />
    </>
  );
}
