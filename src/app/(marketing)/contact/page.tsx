import { ContactForm } from "@/components/marketing/contact-form";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
      <div>
        <p className="text-sm font-medium text-primary">Contact</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Talk to the GrowthPilot team</h1>
        <p className="mt-4 text-muted-foreground leading-7">
          Agency onboarding, custom limits, or a walkthrough of a sample report — send a note and we will reply
          from hello@growthpilot.ai.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          Prefer email?{" "}
          <a className="text-primary hover:underline" href="mailto:hello@growthpilot.ai">
            hello@growthpilot.ai
          </a>
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
