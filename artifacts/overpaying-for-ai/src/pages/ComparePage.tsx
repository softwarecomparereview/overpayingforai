import { useParams, Link } from "wouter";
import comparisonsData from "@/data/comparisons.json";
import modelsData from "@/data/models.json";
import type { AIModel } from "@/engine/types";
import { freshnessLabel, isPricingStale } from "@/utils/pricingFreshness";
import { getPrimaryCta, modelIdToProviderId } from "@/utils/affiliateResolver";
import { RecommendationCtas } from "@/components/monetization/RecommendationCtas";
import { WinnerBlock } from "@/components/conversion/WinnerBlock";
import { deriveSavingsFromComparison, formatSavingsLabel } from "@/utils/savingsEngine";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { SeoContentBlock } from "@/components/seo/SeoContentBlock";
import { generateTitle, generateMetaDescription, generateSchemaProduct } from "@/utils/seo";
import { trackCompareCtaClick } from "@/utils/analytics";
import {
  QuickDecisionBlock,
  CostBreakdownSection,
  QualityTradeoffSection,
  AvoidSection,
  CheapestStackSection,
  FinalVerdictSection,
  EditorialInsight,
} from "@/components/comparison/ComparisonSections";

type ComparisonEntry = typeof comparisonsData[number] & {
  quickVerdict?: string;
  bestForA?: string[];
  bestForB?: string[];
  avoidA?: string[];
  avoidB?: string[];
  costBreakdown?: string;
  qualityNotesA?: string;
  qualityNotesB?: string;
  cheapestStack?: string;
  finalVerdict?: { quality?: string; budget?: string; hybrid?: string };
  editorialInsight?: string;
  pricingSource?: string;
  pricingNotes?: string;
};

const comparisons = comparisonsData as ComparisonEntry[];
const models = modelsData as AIModel[];

export function ComparePage() {
  const { slug } = useParams<{ slug: string }>();
  const page = comparisons.find((c) => c.slug === slug);

  if (!page) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Comparison not found</h1>
        <p className="text-muted-foreground mb-6">That comparison page doesn't exist yet.</p>
        <Link href="/" className="text-primary hover:underline">Back to home</Link>
      </div>
    );
  }

  const modelA = models.find((m) => m.id === page.modelA);
  const modelB = models.find((m) => m.id === page.modelB);
  const cheapest = models.find((m) => m.id === page.cheapestOption);
  const freshestDate = [modelA?.last_updated, modelB?.last_updated].filter(Boolean)[0];
  const stale = freshestDate ? isPricingStale(freshestDate) : false;

  const nameA = modelA?.name ?? page.modelA;
  const nameB = modelB?.name ?? page.modelB;

  const seoTitle = generateTitle(page.title, "compare");
  const seoDesc = generateMetaDescription(page.title, "compare");
  const seoSchema = cheapest
    ? generateSchemaProduct(cheapest.name, page.description)
    : undefined;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageSeo title={seoTitle} description={seoDesc} schema={seoSchema} />
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span>Comparisons</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">{page.title}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{page.description}</p>
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Quick verdict</p>
          <p className="text-sm text-foreground leading-relaxed mb-3">
            {page.quickVerdict ?? page.summary}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/calculator"
              onClick={() => trackCompareCtaClick({
                sourceComponent: "ComparePage/HeroQuickVerdict",
                ctaLabel: "Use calculator from compare hero",
                destinationPath: "/calculator",
                comparisonSlug: page.slug,
              })}
              className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Calculate your exact cost →
            </Link>
            <Link
              href="/decision-engine"
              onClick={() => trackCompareCtaClick({
                sourceComponent: "ComparePage/HeroQuickVerdict",
                ctaLabel: "Use decision engine from compare hero",
                destinationPath: "/decision-engine",
                comparisonSlug: page.slug,
              })}
              className="inline-flex items-center border border-border px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              Need a stack recommendation?
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Summary</h2>
        <p className="text-foreground leading-relaxed">{page.summary}</p>
      </div>

      <QuickDecisionBlock
        quickVerdict={page.quickVerdict}
        nameA={nameA}
        nameB={nameB}
        bestForA={page.bestForA}
        bestForB={page.bestForB}
      />

      {cheapest && (() => {
        const savings = deriveSavingsFromComparison(page.cheapestOption, page.modelA, page.modelB);
        const savingsLabel = formatSavingsLabel(savings);
        const providerId = modelIdToProviderId(cheapest.id);
        const primary = getPrimaryCta(providerId, "cheapest", "/calculator");
        const secondary = getPrimaryCta("", "default", "/decision-engine");
        return (
          <WinnerBlock
            badge="Cheapest"
            title={`Cheapest option: ${cheapest.name}`}
            rationale={page.cheapestOptionNote}
            savingsLabel={savingsLabel}
            primaryCta={primary.isAffiliate
              ? { ...primary, label: `Try ${cheapest.name}` }
              : { ...primary, label: `Calculate your savings` }
            }
            secondaryCta={{ ...secondary, href: "/decision-engine", isExternal: false, isAffiliate: false, fallbackUsed: true, status: "unavailable", label: "Use decision engine" }}
            className="mb-10"
            trackingContext={{ providerId: modelIdToProviderId(cheapest.id), pageType: "compare", sourceComponent: "ComparePage/WinnerBlock" }}
          />
        );
      })()}

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Pricing Comparison</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {modelA && (
            <ModelCard model={modelA} label="Option A" bestFor={page.bestFor.modelA} />
          )}
          {modelB && (
            <ModelCard model={modelB} label="Option B" bestFor={page.bestFor.modelB} />
          )}
        </div>
        <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border text-sm text-muted-foreground">
          {page.pricingComparison}
        </div>
        {freshestDate && (
          <p className={`mt-3 text-xs flex items-center gap-1.5 ${stale ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${stale ? "bg-amber-500" : "bg-green-500"}`} />
            {freshnessLabel(freshestDate)}
            {stale && " · Pricing may have changed. Verify with provider."}
          </p>
        )}
      </section>

      <CostBreakdownSection costBreakdown={page.costBreakdown} />

      {cheapest && (() => {
        const cheapestProviderId = modelIdToProviderId(cheapest.id);
        const cheapestPrimary = getPrimaryCta(cheapestProviderId, "cheapest", "/calculator");
        const cheapestSecondary = getPrimaryCta("", "default", "/calculator");
        return (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Cheapest Option</h2>
            <div className="border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold px-2 py-0.5 rounded">Cheapest</span>
                <span className="font-semibold text-foreground">{cheapest.name}</span>
                <span className="text-sm text-muted-foreground">by {cheapest.provider}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{page.cheapestOptionNote}</p>
              <div className="pt-3 border-t border-green-100 dark:border-green-900">
                <RecommendationCtas
                  primary={cheapestPrimary.isAffiliate
                    ? { ...cheapestPrimary, label: `Try ${cheapest.name}` }
                    : { ...cheapestPrimary, label: `Calculate your savings with ${cheapest.name}` }
                  }
                  secondary={cheapestPrimary.isAffiliate ? {
                    ...cheapestSecondary,
                    href: "/calculator",
                    label: "Calculate your cost",
                    isExternal: false,
                    isAffiliate: false,
                    fallbackUsed: true,
                    status: "unavailable",
                  } : undefined}
                  primaryClassName="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 dark:text-green-400 hover:underline"
                  secondaryClassName="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
                />
              </div>
            </div>
          </section>
        );
      })()}

      <QualityTradeoffSection
        nameA={nameA}
        nameB={nameB}
        qualityNotesA={page.qualityNotesA}
        qualityNotesB={page.qualityNotesB}
      />

      <AvoidSection
        nameA={nameA}
        nameB={nameB}
        avoidA={page.avoidA}
        avoidB={page.avoidB}
      />

      <CheapestStackSection cheapestStack={page.cheapestStack} />

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Our Recommendation</h2>
        <div className="border border-primary/20 bg-primary/5 rounded-lg p-5">
          <p className="text-foreground leading-relaxed mb-4">{page.recommendation}</p>
          <p className="text-sm text-muted-foreground mb-4">
            If you're picking today: start with the cheaper viable option, then validate your monthly usage in the calculator before committing.
          </p>
          <div className="pt-3 border-t border-primary/10 flex flex-wrap gap-3">
            <Link
              href="/calculator"
              onClick={() => trackCompareCtaClick({
                sourceComponent: "ComparePage/Recommendation",
                ctaLabel: "Use calculator from compare recommendation",
                destinationPath: "/calculator",
                comparisonSlug: page.slug,
              })}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Validate this with your usage →
            </Link>
            <Link
              href="/compare/claude-vs-gpt-cost"
              onClick={() => trackCompareCtaClick({
                sourceComponent: "ComparePage/Recommendation",
                ctaLabel: "Go to claude vs gpt from compare recommendation",
                destinationPath: "/compare/claude-vs-gpt-cost",
                comparisonSlug: page.slug,
              })}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              See the highest-intent comparison →
            </Link>
          </div>
        </div>
      </section>

      <FinalVerdictSection finalVerdict={page.finalVerdict} />

      {page.faq && page.faq.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {page.faq.map((item, i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <EditorialInsight
        editorialInsight={page.editorialInsight}
        pricingNotes={page.pricingNotes}
      />

      <SeoContentBlock />
      <InternalLinks links={page.internalLinks} />
    </article>
  );
}

function ModelCard({
  model,
  label,
  bestFor,
}: {
  model: AIModel;
  label: string;
  bestFor: string;
}) {
  const isSubscription = model.planType === "subscription";
  return (
    <div className="border border-border rounded-lg p-5 bg-card" data-testid={`model-card-${model.id}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        {model.hasFreeTier && (
          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded font-medium">Free tier</span>
        )}
      </div>
      <h3 className="font-bold text-foreground text-lg">{model.name}</h3>
      <p className="text-sm text-muted-foreground mb-3">{model.provider}</p>
      {isSubscription ? (
        <p className="text-2xl font-bold text-foreground">
          ${model.monthlySubscriptionCostIfAny ?? 0}
          <span className="text-sm font-normal text-muted-foreground">/month</span>
        </p>
      ) : (
        <div className="text-sm text-foreground space-y-1">
          <p>Input: <strong>${(model.inputCostPer1k * 1000).toFixed(3)}/1M tokens</strong></p>
          <p>Output: <strong>${(model.outputCostPer1k * 1000).toFixed(3)}/1M tokens</strong></p>
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground leading-relaxed">{bestFor}</p>
      </div>
    </div>
  );
}

const FEATURED_SLUGS = [
  { slug: "subscription-vs-api-ai-cost", label: "Most common question" },
  { slug: "gpt-4o-vs-gpt-4o-mini-cost", label: "Biggest API cost win" },
  { slug: "deepseek-vs-gpt4o-cost", label: "Most dramatic price gap" },
];

export function CompareIndex() {
  const featuredSlugs = new Set(FEATURED_SLUGS.map((f) => f.slug));
  const featuredComparisons = FEATURED_SLUGS.map(({ slug, label }) => {
    const match = comparisons.find((c) => c.slug === slug);
    return match ? { ...match, label } : null;
  }).filter((c): c is ComparisonEntry & { label: string } => Boolean(c));
  const remainingComparisons = comparisons.filter((c) => !featuredSlugs.has(c.slug));

  return (
    <div className="bg-white">
      <section className="border-b border-border bg-slate-900 text-white py-14 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1.35fr_0.85fr] gap-6 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Compare models</p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">AI Cost Comparisons</h1>
              <p className="text-white/60 text-base max-w-2xl leading-relaxed">
                Each comparison answers one question: which model or plan is cheaper for your actual use case? Start with the three picks below if you want the fastest path to a useful answer.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {FEATURED_SLUGS.map((item) => (
                  <span key={item.slug} className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 text-white/70">
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Fastest paths</p>
              <div className="space-y-3">
                <Link href="/calculator" className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-white/20 hover:bg-white/10 transition-colors">
                  <p className="text-sm font-semibold text-white">Use the calculator first</p>
                  <p className="text-xs text-white/60 mt-1">Best when you already know your usage and want exact monthly cost.</p>
                </Link>
                <Link href="/decision-engine" className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-white/20 hover:bg-white/10 transition-colors">
                  <p className="text-sm font-semibold text-white">Use the decision engine</p>
                  <p className="text-xs text-white/60 mt-1">Best when you need a ranked stack recommendation, not just one comparison.</p>
                </Link>
                <Link href="/resources" className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:border-white/20 hover:bg-white/10 transition-colors">
                  <p className="text-sm font-semibold text-white">Browse all resources</p>
                  <p className="text-xs text-white/60 mt-1">Best when you want guides, best-of pages, and comparisons together.</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-slate-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-xs font-semibold text-primary mb-2">Step 1</p>
              <h2 className="font-bold text-foreground mb-2">Start with the most likely question</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">Subscription vs API, GPT-4o vs mini, and DeepSeek vs GPT-4o cover the highest-intent pricing decisions first.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-xs font-semibold text-primary mb-2">Step 2</p>
              <h2 className="font-bold text-foreground mb-2">Validate against your usage</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">Use the calculator when the comparison is directionally useful but you need your own exact cost.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-xs font-semibold text-primary mb-2">Step 3</p>
              <h2 className="font-bold text-foreground mb-2">Escalate to a stack recommendation</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">Use the decision engine when one model comparison is too narrow for your actual workflow.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Start here</p>
            <h2 className="text-2xl font-bold text-foreground">Three high-intent comparisons</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">These answer the questions most people ask first before they explore the rest of the comparison library.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mb-10">
            {featuredComparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="group rounded-2xl border border-primary/20 bg-primary/5 p-5 hover:border-primary/50 hover:bg-primary/10 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">{c.label}</span>
                  <span className="text-primary text-sm">→</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-base group-hover:text-primary transition-colors">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
              </Link>
            ))}
          </div>

          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">More comparisons</p>
              <h2 className="text-2xl font-bold text-foreground">Explore the full comparison library</h2>
            </div>
            <p className="text-sm text-muted-foreground hidden md:block">Not sure which applies? <Link href="/calculator" className="text-primary font-medium hover:underline">Use the calculator →</Link></p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {remainingComparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="block border border-border rounded-xl p-5 hover:border-primary/40 hover:bg-muted/30 transition-colors"
              >
                <h2 className="font-semibold text-foreground mb-2 text-base">{c.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-slate-50 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-foreground mb-1">Need a faster answer?</h2>
            <p className="text-sm text-muted-foreground">Use the calculator for exact cost or the decision engine for a full stack recommendation.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/calculator" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-colors">
              Calculate cost →
            </Link>
            <Link href="/decision-engine" className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-foreground font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
              Decision engine
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
