import { useParams, Link } from "wouter";
import bestOfData from "@/data/best-of.json";
import modelsData from "@/data/models.json";
import type { AIModel } from "@/engine/types";

const bestOf = bestOfData as typeof bestOfData;
const models = modelsData as AIModel[];

export function BestPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = bestOf.find((b) => b.slug === slug);

  if (!page) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Page not found</h1>
        <p className="text-muted-foreground mb-6">That list doesn't exist yet.</p>
        <Link href="/" className="text-primary hover:underline">Back to home</Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span>Best Lists</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2.5 py-1 rounded">
            {page.category}
          </span>
          <span className="text-xs text-muted-foreground">Updated {page.updatedAt}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">{page.title}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{page.description}</p>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-5 mb-10 text-sm text-foreground leading-relaxed">
        {page.intro}
      </div>

      {/* Picks */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-6">Top Picks</h2>
        <div className="space-y-4">
          {page.picks.map((pick) => {
            const model = models.find((m) => m.id === pick.modelId);
            return (
              <div
                key={pick.rank}
                className={`border rounded-lg p-5 flex gap-4 ${pick.rank === 1 ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
                data-testid={`pick-${pick.rank}`}
              >
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${pick.rank === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {pick.rank}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground">{pick.title}</h3>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium">{pick.badge}</span>
                  </div>
                  {model && (
                    <p className="text-xs text-muted-foreground mb-2">{model.provider}</p>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">{pick.why}</p>
                  <p className="text-sm font-semibold text-foreground mb-3">{pick.monthlyEstimate}</p>
                  <Link
                    href="/calculator"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    Calculate your cost with {pick.title} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      {page.faqs && page.faqs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {page.faqs.map((item, i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Internal Links */}
      <section className="border-t border-border pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Related</h2>
        <div className="flex flex-wrap gap-3">
          {page.internalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm px-3 py-1.5 rounded border border-border bg-muted/30 hover:bg-muted transition-colors text-foreground"
            >
              {link.text}
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}

export function BestIndex() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Best AI Lists</h1>
      <p className="text-muted-foreground mb-8">Ranked picks for every use case and budget — updated regularly.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {bestOf.map((b) => (
          <Link
            key={b.slug}
            href={`/best/${b.slug}`}
            className="block border border-border rounded-lg p-5 hover:border-primary/40 hover:bg-muted/30 transition-colors"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded mb-3 inline-block">
              {b.category}
            </span>
            <h2 className="font-semibold text-foreground mb-2 text-base">{b.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
