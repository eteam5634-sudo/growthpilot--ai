const quotes = [
  {
    quote:
      "We finally had a clear list of what was actually hurting conversions, not another 40-page PDF of generic SEO tips.",
    name: "Maya Chen",
    role: "Head of Growth, Northline Apparel",
  },
  {
    quote:
      "I ran our agency site through GrowthPilot before a client pitch. The trust and messaging gaps were embarrassingly obvious — and easy to fix.",
    name: "Daniel Okonkwo",
    role: "Founder, Bright Harbor Agency",
  },
  {
    quote:
      "The 30-day plan is what sold me. It told my team what to do this week instead of drowning us in audit noise.",
    name: "Priya Shah",
    role: "Ecommerce Director, Solstice Home",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-primary">Loved by operators</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Built for people who have to ship growth, not slides
        </h2>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {quotes.map((item) => (
          <blockquote key={item.name} className="rounded-2xl border bg-card p-6 shadow-sm">
            <p className="text-sm leading-6 text-foreground/90">“{item.quote}”</p>
            <footer className="mt-5">
              <div className="text-sm font-semibold">{item.name}</div>
              <div className="text-xs text-muted-foreground">{item.role}</div>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
