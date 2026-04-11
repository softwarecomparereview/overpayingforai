import { Link } from "wouter";
import { track } from "@/utils/analytics";
import comparisonsData from "@/data/comparisons.json";
import guidesData from "@/data/guides.json";
import bestOfData from "@/data/best-of.json";

export function ResourcesHub() {
  return (
    <div className="bg-white">
      <section className="border-b border-border bg-slate-900 text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Resources</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">All resources</h1>
          <p className="text-white/60 text-base max-w-xl leading-relaxed">
            Comparisons, guides, best-of lists, and cost breakdowns — everything you need to find the cheapest viable AI stack for your workload.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { href: "#comparisons", label: "Comparisons" },
              { href: "#guides", label: "Guides" },
              { href: "#best-lists", label: "Best Lists" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 hover:border-white/30 text-white/60 hover:text-white transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Tools quick links */}
      <section className="border-b border-border bg-emerald-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Interactive tools</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href="/calculator"
              onClick={() => track("card_clicked", { sourceSurface: "resources", cardType: "tool", slug: "calculator" })}
              className="group flex items-center gap-4 border border-emerald-200 bg-white rounded-xl px-5 py-4 hover:border-emerald-400 hover:shadow-sm transition-all"
            >
              <span className="text-2xl font-mono font-bold text-emerald-700">$</span>
              <div>
                <p className="font-semibold text-foreground text-sm group-hover:text-emerald-700 transition-colors">Cost Calculator</p>
                <p className="text-xs text-muted-foreground">Enter token usage, see real costs + cheaper alternatives</p>
              </div>
              <span className="ml-auto text-emerald-700 text-sm">→</span>
            </Link>
            <Link
              href="/decision-engine"
              onClick={() => track("card_clicked", { sourceSurface: "resources", cardType: "tool", slug: "decision-engine" })}
              className="group flex items-center gap-4 border border-border bg-white rounded-xl px-5 py-4 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <span className="text-2xl font-mono font-bold text-primary">→</span>
              <div>
                <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">Decision Engine</p>
                <p className="text-xs text-muted-foreground">5 questions → get 3 ranked model recommendations</p>
              </div>
              <span className="ml-auto text-primary text-sm">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Comparisons */}
      <section id="comparisons" className="border-b border-border bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Comparisons</p>
              <h2 className="text-2xl font-bold text-foreground">Model comparisons</h2>
              <p className="text-sm text-muted-foreground mt-1">Side-by-side pricing breakdowns for the tools people actually use.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {comparisonsData.map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                onClick={() => track("card_clicked", { sourceSurface: "resources", cardType: "comparison", slug: c.slug })}
                className="group block border border-border rounded-xl p-5 hover:border-primary/40 hover:bg-muted/10 transition-all"
              >
                <h3 className="font-semibold text-foreground text-sm leading-snug mb-2 group-hover:text-primary transition-colors">{c.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{c.summary}</p>
                <div className="mt-3 pt-3 border-t border-border/60 text-xs text-primary font-medium flex justify-between items-center">
                  <span>Read comparison</span><span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Guides */}
      <section id="guides" className="border-b border-border bg-slate-50 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Guides</p>
            <h2 className="text-2xl font-bold text-foreground">How to spend less on AI</h2>
            <p className="text-sm text-muted-foreground mt-1">Practical guides for developers, founders, and teams.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {guidesData.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                onClick={() => track("card_clicked", { sourceSurface: "resources", cardType: "guide", slug: g.slug })}
                className="group block border border-border rounded-xl p-5 bg-white hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{g.readTime}</span>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-2 group-hover:text-primary transition-colors leading-snug">{g.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{g.description}</p>
                <p className="text-xs text-primary font-medium mt-3">Read guide →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best lists */}
      <section id="best-lists" className="border-b border-border bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Best lists</p>
            <h2 className="text-2xl font-bold text-foreground">Best AI by use case</h2>
            <p className="text-sm text-muted-foreground mt-1">Shortlisted picks for common workloads and budgets.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {bestOfData.map((b) => (
              <Link
                key={b.slug}
                href={`/best/${b.slug}`}
                onClick={() => track("card_clicked", { sourceSurface: "resources", cardType: "best_of", slug: b.slug })}
                className="group block border border-border rounded-xl p-5 hover:border-primary/40 hover:bg-muted/10 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-xs font-semibold text-primary bg-primary/8 px-2.5 py-1 rounded">{b.category}</span>
                  <span className="text-muted-foreground text-sm opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
                <h3 className="font-bold text-foreground mb-2 leading-snug text-sm group-hover:text-primary transition-colors">{b.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-foreground text-background py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to find your cheapest stack?</h2>
          <p className="text-background/60 mb-6 max-w-md mx-auto text-sm leading-relaxed">
            Use the calculator to see your real monthly cost and the decision engine to get a personalised recommendation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/calculator"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "resources", variant: "bottom_cta" })}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              Open Calculator →
            </Link>
            <Link
              href="/decision-engine"
              className="border border-background/20 text-background font-semibold px-6 py-3 rounded-lg text-sm hover:bg-background/10 transition-colors"
            >
              Find my stack
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
