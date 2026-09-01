export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm font-medium text-primary">About</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Built for operators who need a clear next step</h1>
      <div className="mt-6 space-y-4 text-muted-foreground leading-7">
        <p>
          GrowthPilot AI is an AI business audit platform. Paste a URL and get a score, a diagnosis, and a
          30-day plan — the same workflow a growth consultant would run, delivered in minutes.
        </p>
        <p>
          We built it for founders, marketers, and agencies who already know the site “could convert better”
          but do not have a prioritized list of what to fix first.
        </p>
        <p>
          The product combines a live page crawl, heuristic scoring, and OpenAI analysis across SEO, conversion,
          UX, trust, and brand. Reports, chat, competitor comparison, and client workspaces all sit on the same
          Supabase backend so the web app and a future Android client can share one API.
        </p>
      </div>
    </div>
  );
}
