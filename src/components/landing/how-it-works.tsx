const steps = [
  {
    step: "01",
    title: "Enter website",
    body: "Add the URL, business name, industry, and a short description of what you sell.",
  },
  {
    step: "02",
    title: "AI analyzes business",
    body: "GrowthPilot crawls the page and scores SEO, conversion, UX, trust, and brand.",
  },
  {
    step: "03",
    title: "Receive growth report",
    body: "Get an overall score, prioritized recommendations, a 30-day plan, and a downloadable PDF.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            From URL to action plan in minutes
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">{item.step}</div>
              <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
