import { useParams, Link } from "wouter";
import pricingData from "@/data/pricing-pages.json";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { AffiliateCta } from "@/components/monetization/AffiliateCta";
import { getAffiliateTarget } from "@/utils/affiliateResolver";
import { trackCalculatorStart } from "@/utils/analytics";
import { FreshnessIndicator } from "@/components/FreshnessIndicator";

const PRICING_VERIFIED_DATE = "2026-04-25";

type PricingPage = typeof pricingData[number];
const pages = pricingData as PricingPage[];

export function PricingPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = pages.find((p) => p.slug === slug);

  if (!page) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Pricing page not found</h1>
        <p className="text-muted-foreground mb-6">
          We don't have a pricing breakdown for that tool yet.
        </p>
        <Link href="/calculator" className="text-primary hover:underline">
          Use the AI cost calculator instead →
        </Link>
      </div>
    );
  }

  const primaryCta = getAffiliateTarget(page.providerId, "default", "/calculator");

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageSeo
        title={page.title}
        description={page.metaDescription}
        canonicalUrl={`/pricing/${page.slug}`}
      />

      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <span>Pricing</span>
        <span>/</span>
        <span className="text-foreground">{page.toolName}</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{page.h1}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">{page.intro}</p>
        <FreshnessIndicator
          dateStr={PRICING_VERIFIED_DATE}
          source="Vendor documentation"
          className="mt-2"
        />
      </header>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-5">Plans and Pricing</h2>
        <div className="space-y-4">
          {page.plans.map((plan) => (
            <div key={plan.name} className="border border-border rounded-xl p-5 bg-card">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <h3 className="font-semibold text-foreground text-lg">{plan.name}</h3>
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {plan.price}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-1">
                    Best for
                  </p>
                  <p className="text-sm text-foreground">{plan.bestFor}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    Not for
                  </p>
                  <p className="text-sm text-muted-foreground">{plan.notFor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 italic">{page.pricingNote}</p>
      </section>

      <section className="border border-border rounded-xl bg-muted/20 p-6 mb-10">
        <h2 className="text-lg font-bold mb-3">{page.verdictSection.heading}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{page.verdictSection.content}</p>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <Link
            href="/calculator"
            onClick={() => trackCalculatorStart({ pageSlug: page.slug, pageType: "pricing", sourceComponent: "PricingPage/VerdictCta" })}
            className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-lg px-5 py-2.5 font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Calculate your exact cost →
          </Link>
          {primaryCta.isExternal ? (
            <AffiliateCta
              target={{ ...primaryCta, label: `Try ${page.toolName}` }}
              className="inline-flex items-center justify-center border border-border rounded-lg px-5 py-2.5 font-medium text-sm hover:bg-muted transition-colors"
              trackingContext={{
                providerId: page.providerId,
                ctaType: "secondary",
                pageType: "pricing",
                sourceComponent: "PricingPage/VerdictCta",
              }}
            />
          ) : null}
        </div>
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

      <InternalLinks links={page.internalLinks} heading="Related comparisons" trackingContext={{ pageSlug: page.slug, pageType: "pricing" }} />

      <p className="text-xs text-muted-foreground mt-8 pt-6 border-t border-border">
        Pricing based on publicly available rates. Check current provider pricing before subscribing.
        Some links may be affiliate links — see our{" "}
        <Link href="/affiliate-disclosure" className="underline hover:text-foreground">
          affiliate disclosure
        </Link>.
      </p>
    </article>
  );
}
