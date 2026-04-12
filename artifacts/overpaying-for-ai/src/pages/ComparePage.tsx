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
      </div>

      {/* Summary Card */}
      <div className="bg-muted/50 border border-border rounded-lg p-5 mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Summary</h2>
        <p className="text-foreground leading-relaxed">{page.summary}</p>
      </div>

      {/* Quick Decision Block — high up, high conversion value */}
      <QuickDecisionBlock
        quickVerdict={page.quickVerdict}
        nameA={nameA}
        nameB={nameB}
        bestForA={page.bestForA}
        bestForB={page.bestForB}
      />

      {/* Winner Block — derived from cheapestOption in comparison data */}
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

      {/* Pricing Table */}
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

      {/* Real-World Cost Breakdown */}
      <CostBreakdownSection costBreakdown={page.costBreakdown} />

      {/* Cheapest Option */}
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

      {/* Output Quality & Workflow Tradeoffs */}
      <QualityTradeoffSection
        nameA={nameA}
        nameB={nameB}
        qualityNotesA={page.qualityNotesA}
        qualityNotesB={page.qualityNotesB}
      />

      {/* When NOT to use each tool */}
      <AvoidSection
        nameA={nameA}
        nameB={nameB}
        avoidA={page.avoidA}
        avoidB={page.avoidB}
      />

      {/* Cheapest Viable Alternative */}
      <CheapestStackSection cheapestStack={page.cheapestStack} />

      {/* Recommendation */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Our Recommendation</h2>
        <div className="border border-primary/20 bg-primary/5 rounded-lg p-5">
          <p className="text-foreground leading-relaxed mb-4">{page.recommendation}</p>
          <div className="pt-3 border-t border-primary/10 flex flex-wrap gap-3">
            <Link
              href="/calculator"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Calculate your cost →
            </Link>
            <Link
              href="/decision-engine"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              Take the decision quiz →
            </Link>
          </div>
        </div>
      </section>

      {/* Final Verdict */}
      <FinalVerdictSection finalVerdict={page.finalVerdict} />

      {/* FAQ */}
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

      {/* Editorial Insight — unique per page, last content before SEO blocks */}
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
  const featuredComparisons = FEATURED_SLUGS.map(({ slug, label }) => ({
    ...comparisons.find((c) => c.slug === slug),
    label,
  })).filter((c) => c.slug);
  const remainingComparisons = comparisons.filter((c) => !featuredSlugs.has(c.slug));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">AI Cost Comparisons</h1>
      <p className="text-muted-foreground mb-3">
        Each comparison helps you answer one question: which model or plan is cheaper for your actual use case?
        If you're not sure where to start, the three picks below answer the questions we see most often.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        Not sure which applies to you? <Link href="/decision-engine" className="text-primary font-medium hover:underline">Use the decision engine →</Link>
      </p>

      {/* Start here — 3 featured comparisons */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Start here</p>
        <div className="space-y-3">
          {featuredComparisons.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="flex items-start gap-4 border border-primary/20 bg-primary/5 rounded-lg p-5 hover:border-primary/50 hover:bg-primary/10 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">{c.label}</span>
                </div>
                <h2 className="font-semibold text-foreground mb-1 text-base">{c.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
              </div>
              <span className="text-primary text-lg mt-1 shrink-0">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Full list */}
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">More comparisons</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {remainingComparisons.map((c) => (
          <Link
            key={c.slug}
            href={`/compare/${c.slug}`}
            className="block border border-border rounded-lg p-5 hover:border-primary/40 hover:bg-muted/30 transition-colors"
          >
            <h2 className="font-semibold text-foreground mb-2 text-base">{c.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
