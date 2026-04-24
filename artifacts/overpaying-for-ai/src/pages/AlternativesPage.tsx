import { useParams, Link } from "wouter";
import alternativesData from "@/data/alternatives-pages.json";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";

type AlternativesPage = typeof alternativesData[number];
const pages = alternativesData as AlternativesPage[];

export function AlternativesPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = pages.find((p) => p.slug === slug);

  if (!page) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          We don't have an alternatives guide for that topic yet.
        </p>
        <Link href="/best" className="text-primary hover:underline">
          Browse best AI tools →
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageSeo
        title={page.title}
        description={page.metaDescription}
        canonicalUrl={`/alternatives/${page.slug}`}
      />

      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span>Alternatives</span>
        <span>/</span>
        <span className="text-foreground truncate">{page.h1}</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{page.h1}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-5">{page.intro}</p>
        <Link
          href={page.primaryCta.href}
          className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-lg px-5 py-2.5 font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          {page.primaryCta.label} →
        </Link>
      </header>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-5">Top alternatives</h2>
        <div className="space-y-5">
          {page.alternatives.map((alt, i) => (
            <div key={alt.name} className="border border-border rounded-xl p-5 bg-card">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground bg-muted rounded px-2 py-0.5">
                    #{i + 1}
                  </span>
                  <h3 className="font-bold text-foreground text-lg">{alt.name}</h3>
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                  {alt.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                <span className="font-medium">Pricing:</span> {alt.pricingSummary}
              </p>
              <div className="space-y-2 mb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-1">
                    Why it beats ChatGPT here
                  </p>
                  <p className="text-sm text-foreground">{alt.whyBetter}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Where it falls short
                  </p>
                  <p className="text-sm text-muted-foreground">{alt.notBetter}</p>
                </div>
              </div>
              {alt.comparisonLink && (
                <Link
                  href={alt.comparisonLink}
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  See full comparison →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="border border-border rounded-xl bg-muted/20 p-6 mb-10">
        <h2 className="text-lg font-bold mb-2">Find the cheapest option for your usage</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your monthly token usage and see exactly what each alternative costs. Most developers pay under $5/month via API when they switch away from ChatGPT Plus.
        </p>
        <Link
          href="/calculator"
          className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-lg px-5 py-2.5 font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Calculate your AI cost →
        </Link>
      </section>

      {page.faq && page.faq.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-5">Frequently Asked Questions</h2>
          <div className="space-y-5">
            {page.faq.map((item) => (
              <div key={item.q}>
                <h3 className="font-semibold text-foreground mb-1.5">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <InternalLinks links={page.internalLinks} heading="Related comparisons" />
    </article>
  );
}
