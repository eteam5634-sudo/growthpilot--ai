const quotes = [
  {
    quote:
      "A clear list of what was hurting conversions — not another generic SEO PDF.",
    role: "Growth lead, ecommerce brand",
  },
  {
    quote:
      "Trust and messaging gaps showed up immediately. We fixed them before the next campaign.",
    role: "Agency founder",
  },
  {
    quote:
      "The 30-day plan told our team what to do this week instead of drowning in audit noise.",
    role: "Marketing director",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">Built for operators</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Ship growth, not slides
        </h2>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {quotes.map((item) => (
          <blockquote key={item.role} className="rounded-2xl border bg-card p-6 shadow-sm">
            <p className="text-sm leading-6 text-foreground/90">“{item.quote}”</p>
            <footer className="mt-5">
              <div className="text-xs text-muted-foreground">{item.role}</div>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
