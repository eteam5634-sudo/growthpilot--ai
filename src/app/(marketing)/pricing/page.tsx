import { PricingGrid } from "@/components/marketing/pricing-grid";

export const metadata = { title: "Pricing" };

function noticeFromSearch(value?: string) {
  if (value === "setup") {
    return "Stripe is not configured yet. Add STRIPE_SECRET_KEY and price IDs, or contact us to upgrade manually.";
  }
  if (value === "canceled") return "Checkout was canceled. You can try again whenever you are ready.";
  if (value === "error") return "Checkout could not start. Check Stripe keys or try again.";
  return null;
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">Pricing</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Free, Pro, and Agency</h1>
        <p className="mt-3 text-muted-foreground">
          Start with 3 audits a month. Upgrade when you need competitor analysis and client volume.
        </p>
      </div>
      <div className="mt-12">
        <PricingGrid notice={noticeFromSearch(checkout)} />
      </div>
    </div>
  );
}
