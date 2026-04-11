export function MediaKit() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <title>Media Kit | OverpayingForAI</title>
      <meta name="description" content="Partnership and media information for OverpayingForAI." />

      <div className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded mb-4 inline-block">
          Partnerships
        </span>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Media Kit</h1>
        <p className="text-muted-foreground leading-relaxed">
          Information for brands, tools, and AI providers interested in working with us.
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-bold mb-3">About</h2>
          <p className="text-muted-foreground leading-relaxed">
            OverpayingForAI.com helps individuals and businesses reduce AI costs by comparing tools,
            pricing, and usage strategies. We are an independent, data-driven resource — not a
            marketing outlet.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Audience</h2>
          <ul className="space-y-2 text-muted-foreground">
            {[
              "Developers integrating AI APIs into products",
              "Startups and SMBs evaluating AI tooling spend",
              "Professionals using ChatGPT, Claude, or Gemini daily",
              "Engineering leads making model selection decisions",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-emerald-600 shrink-0 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Traffic Intent</h2>
          <p className="text-muted-foreground mb-3 leading-relaxed">
            Visitors arrive with high commercial intent. Top search categories include:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "cheapest AI tools",
              "AI pricing comparisons",
              "cost optimization",
              "ChatGPT alternatives",
              "Claude vs GPT-4o",
              "API vs subscription cost",
            ].map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium bg-muted text-muted-foreground px-3 py-1.5 rounded border border-border"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">What We Offer</h2>
          <ul className="space-y-2 text-muted-foreground">
            {[
              "Featured placements in comparison pages",
              "Inclusion in best AI tools lists",
              "Exposure via the decision engine recommendation flow",
              "SEO-driven traffic from cost-intent queries",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-emerald-600 shrink-0 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Partnership Model</h2>
          <div className="space-y-3">
            {[
              { label: "Revenue share", note: "Preferred — performance-based, aligned incentives." },
              { label: "CPA / CPL", note: "Cost per acquisition or lead, negotiated per campaign." },
              { label: "Long-term content partnerships", note: "Co-created guides, comparisons, and featured placements." },
            ].map((item) => (
              <div key={item.label} className="border border-border rounded-lg p-4 bg-card">
                <p className="font-semibold text-foreground mb-1">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border pt-8">
          <h2 className="text-xl font-bold mb-3">Get in Touch</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Interested in a partnership or want to discuss placement opportunities?
          </p>
          <a
            href="mailto:partners@overpayingforai.com"
            className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-foreground/80 transition-colors"
          >
            partners@overpayingforai.com →
          </a>
        </section>
      </div>
    </article>
  );
}
