import { useParams, Link } from "wouter";
import worthItData from "@/data/worth-it-pages.json";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { trackCalculatorStart } from "@/utils/analytics";
import { FreshnessIndicator } from "@/components/FreshnessIndicator";

const PRICING_VERIFIED_DATE = "2026-04-25";

type WorthItPage = typeof worthItData[number];
const pages = worthItData as WorthItPage[];

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );
}

export function WorthItPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = pages.find((p) => p.slug === slug);

  if (!page) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          That page doesn't exist yet.
        </p>
        <Link href="/calculator" className="text-primary hover:underline">
          Use the AI cost calculator →
        </Link>
      </div>
    );
  }

  const hasToolComparison = "toolComparison" in page && Array.isArray((page as { toolComparison?: unknown[] }).toolComparison);
  const hasAlternatives = "alternatives" in page && Array.isArray((page as { alternatives?: unknown[] }).alternatives);
  const toolComparison = hasToolComparison ? (page as { toolComparison: Array<{ name: string; price: string; bestFor: string; notFor: string }> }).toolComparison : [];
  const alternatives = hasAlternatives ? (page as { alternatives: Array<{ name: string; price: string; bestFor: string }> }).alternatives : [];
  const hasCostComparison = "costComparison" in page && typeof (page as { costComparison?: unknown }).costComparison === "object";
  const costComparison = hasCostComparison ? (page as { costComparison: { heading: string; content: string } }).costComparison : null;
  const hasRecommendation = "recommendation" in page && typeof (page as { recommendation?: unknown }).recommendation === "string";
  const recommendation = hasRecommendation ? (page as { recommendation: string }).recommendation : null;
  const pricingNote = (page as { pricingNote?: string }).pricingNote ?? null;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageSeo
        title={page.title}
        description={page.metaDescription}
        canonicalUrl={`/worth-it/${page.slug}`}
      />

      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span>Is it worth it?</span>
        <span>/</span>
        <span className="text-foreground truncate">{page.h1}</span>
      </nav>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">Worth It?</span>
          {pricingNote && (
            <span className="text-xs text-muted-foreground italic">{pricingNote}</span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{page.h1}</h1>
        <FreshnessIndicator
          dateStr={PRICING_VERIFIED_DATE}
          source="Vendor documentation"
          className="mb-4"
        />
        <div className="border border-primary/20 bg-primary/5 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Bottom line</p>
          <p className="text-base font-medium text-foreground leading-snug">{page.verdict}</p>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">{page.intro}</p>
      </header>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Worth it if…</h2>
        <ul className="space-y-2">
          {page.worthItFor.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
              <CheckIcon />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Not worth it if…</h2>
        <ul className="space-y-2">
          {page.notWorthItFor.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <XIcon />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {toolComparison.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-5">How the main options compare</h2>
          <div className="space-y-3">
            {toolComparison.map((tool) => (
              <div key={tool.name} className="border border-border rounded-xl p-4 bg-card">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
                  <h3 className="font-semibold text-foreground">{tool.name}</h3>
                  <span className="text-sm text-muted-foreground">{tool.price}</span>
                </div>
                <p className="text-sm text-foreground mb-1">✓ {tool.bestFor}</p>
                <p className="text-sm text-muted-foreground">✗ {tool.notFor}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {alternatives.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-5">Alternatives to consider</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {alternatives.map((alt) => (
              <div key={alt.name} className="border border-border rounded-lg p-4 bg-card">
                <p className="font-medium text-foreground mb-0.5">{alt.name}</p>
                <p className="text-xs text-muted-foreground mb-1.5">{alt.price}</p>
                <p className="text-sm text-foreground">{alt.bestFor}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {costComparison && (
        <section className="border border-border rounded-xl bg-muted/20 p-6 mb-10">
          <h2 className="text-lg font-bold mb-3">{costComparison.heading}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{costComparison.content}</p>
          <Link
            href="/calculator"
            onClick={() => trackCalculatorStart({ pageSlug: page.slug, pageType: "worth-it", sourceComponent: "WorthItPage/CostComparisonCta" })}
            className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-lg px-5 py-2.5 font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Calculate your exact cost →
          </Link>
        </section>
      )}

      {!costComparison && (
        <div className="border border-primary/20 bg-primary/5 rounded-xl p-5 mb-10">
          <p className="font-semibold text-foreground mb-2">Not sure which plan is right for you?</p>
          <p className="text-sm text-muted-foreground mb-3">
            Enter your monthly usage to see exactly what API access would cost vs a flat subscription.
          </p>
          <Link
            href="/calculator"
            onClick={() => trackCalculatorStart({ pageSlug: page.slug, pageType: "worth-it", sourceComponent: "WorthItPage/DefaultCta" })}
            className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-lg px-5 py-2.5 font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Calculate your AI cost →
          </Link>
        </div>
      )}

      {recommendation && (
        <section className="border-l-4 border-primary pl-4 mb-10">
          <p className="text-sm font-semibold text-foreground mb-1">Our recommendation</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{recommendation}</p>
        </section>
      )}

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

      <InternalLinks links={page.internalLinks} heading="Related guides" trackingContext={{ pageSlug: page.slug, pageType: "worth-it" }} />

      <p className="text-xs text-muted-foreground mt-8 pt-6 border-t border-border">
        This page contains editorial assessments based on publicly available pricing.
        Some links may be affiliate links — see our{" "}
        <Link href="/affiliate-disclosure" className="underline hover:text-foreground">
          affiliate disclosure
        </Link>.
      </p>
    </article>
  );
}
