import { useEffect, useMemo } from "react";
import { Link } from "wouter";
import modelsData from "@/data/models.json";
import type { AIModel } from "@/engine/types";
import { PageSeo } from "@/components/seo/PageSeo";
import { getPrimaryCta, modelIdToProviderId } from "@/utils/affiliateResolver";
import { AffiliateCta } from "@/components/monetization/AffiliateCta";
import { track } from "@/utils/analytics";

const models = modelsData as AIModel[];

const PAGE_TYPE = "models";

/**
 * Returns true only if the model has fully verified pricing.
 * Models flagged as manual-review, legacy, or third-party-source are excluded
 * from winner and category recommendation logic.
 */
function isPricingVerified(m: AIModel): boolean {
  if (m.needsManualReview) return false;
  if (
    m.verificationStatus === "manual-review" ||
    m.verificationStatus === "legacy" ||
    m.verificationStatus === "third-party-source"
  ) return false;
  return true;
}

interface ValueClass {
  label: "Best value" | "Situational" | "Premium / expensive";
  className: string;
}

function classifyValue(m: AIModel): ValueClass {
  if (m.costScore >= 70) {
    return { label: "Best value", className: "bg-green-100 text-green-800 border-green-300" };
  }
  if (m.costScore >= 40) {
    return { label: "Situational", className: "bg-yellow-100 text-yellow-800 border-yellow-300" };
  }
  return { label: "Premium / expensive", className: "bg-red-100 text-red-800 border-red-300" };
}

/**
 * Estimate monthly cost for a "moderate" usage profile.
 * Documented assumption: 500K input tokens + 200K output tokens / month.
 * For subscription plans, returns the flat monthly subscription cost.
 */
const MODERATE_INPUT_K = 500; // 500k tokens
const MODERATE_OUTPUT_K = 200; // 200k tokens

function estimateMonthly(m: AIModel): number {
  if (m.planType === "subscription") {
    return m.monthlySubscriptionCostIfAny ?? 0;
  }
  return m.inputCostPer1k * MODERATE_INPUT_K + m.outputCostPer1k * MODERATE_OUTPUT_K;
}

function formatPrice(n: number): string {
  if (n === 0) return "$0";
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(2)}`;
}

function formatMonthly(n: number): string {
  if (n === 0) return "Free";
  if (n < 1) return `~$${n.toFixed(2)}/mo`;
  if (n < 100) return `~$${n.toFixed(0)}/mo`;
  return `~$${Math.round(n)}/mo`;
}

function rationaleFor(m: AIModel): string {
  return m.notes || `Strong fit for ${(m.bestFor || []).slice(0, 2).join(", ") || "general use"}.`;
}

interface QuickWinner {
  key: string;
  title: string;
  model: AIModel;
  rationale: string;
}

function pickQuickWinners(): QuickWinner[] {
  // Restrict value-oriented picks to paid API models so we surface buying decisions,
  // not free tiers. Cheapest pick can include any priced model.
  // Exclude models with unverified/manual-review/legacy/third-party-source pricing.
  const paidApi = models.filter(
    (m) => m.planType === "api" && m.outputCostPer1k > 0 && isPricingVerified(m),
  );

  // Best Overall Value: highest (qualityScore + costScore) among paid API models
  const bestOverall = [...paidApi]
    .sort((a, b) => b.qualityScore + b.costScore - (a.qualityScore + a.costScore))[0];

  // Cheapest Overall: lowest moderate-monthly estimate among priced API models
  const cheapest = [...paidApi]
    .sort((a, b) => estimateMonthly(a) - estimateMonthly(b))[0];

  // Best for Coding: paid API model whose bestFor includes "coding"
  const codingPool = paidApi.filter((m) => (m.bestFor || []).includes("coding"));
  const bestCoding = [...(codingPool.length ? codingPool : paidApi)]
    .sort((a, b) => b.qualityScore + b.costScore - (a.qualityScore + a.costScore))[0];

  // Best for Writing
  const writingPool = paidApi.filter((m) => (m.bestFor || []).includes("writing"));
  const bestWriting = [...(writingPool.length ? writingPool : paidApi)]
    .sort((a, b) => b.qualityScore + b.costScore - (a.qualityScore + a.costScore))[0];

  return [
    { key: "value", title: "Best Overall Value", model: bestOverall, rationale: "Highest balance of quality and cost across the dataset." },
    { key: "cheapest", title: "Cheapest Overall", model: cheapest, rationale: "Lowest typical monthly spend for routine moderate usage." },
    { key: "coding", title: "Best for Coding", model: bestCoding, rationale: "Strong code quality at meaningfully lower cost than premium flagships." },
    { key: "writing", title: "Best for Writing", model: bestWriting, rationale: "Reliable writing quality without paying flagship-tier rates." },
  ];
}

interface CategoryWinner {
  category: string;
  bestForKey: string;
  rationale: string;
  model: AIModel;
}

const CATEGORY_DEFS: Array<{ category: string; key: string; rationale: string }> = [
  { category: "General AI", key: "general", rationale: "Best general-purpose value across mixed workloads." },
  { category: "Coding", key: "coding", rationale: "Strong code generation at a lower cost than premium tier." },
  { category: "Writing", key: "writing", rationale: "Quality writing output without paying flagship rates." },
  { category: "Research", key: "research", rationale: "Solid long-form reasoning at a defensible price." },
  { category: "Productivity", key: "automation", rationale: "Cheap enough to run high-volume automated tasks." },
  { category: "Customer Support", key: "support", rationale: "Low cost per ticket while keeping helpful responses." },
];

function pickCategoryWinners(): CategoryWinner[] {
  // Only models with verified pricing are eligible for category winner slots.
  const verifiedModels = models.filter(isPricingVerified);
  return CATEGORY_DEFS.map(({ category, key, rationale }) => {
    const pool = verifiedModels.filter((m) => (m.bestFor || []).includes(key));
    const winner = [...(pool.length ? pool : verifiedModels)]
      .sort((a, b) => estimateMonthly(a) - estimateMonthly(b) || b.qualityScore - a.qualityScore)[0];
    return { category, bestForKey: key, model: winner, rationale };
  }).filter((c) => !!c.model);
}

interface CtaPayload {
  cta_label: string;
  cta_location: string;
  model_name?: string;
  provider?: string;
}

function fireCta(eventName:
  | "models_primary_cta_click"
  | "models_secondary_cta_click"
  | "models_quick_winner_click"
  | "models_table_action_click"
  | "models_category_winner_click"
  | "models_final_cta_click"
  | "model_pricing_cta_click", payload: CtaPayload) {
  track(eventName, { page_type: PAGE_TYPE, ...payload });
}

export function ModelsPage() {
  useEffect(() => {
    track("page_view_models", { page_type: PAGE_TYPE });
  }, []);

  const quickWinners = useMemo(pickQuickWinners, []);
  const categoryWinners = useMemo(pickCategoryWinners, []);

  // Pricing table: rank by cheapest moderate monthly first, but keep all models.
  const ranked = useMemo(
    () => [...models].sort((a, b) => estimateMonthly(a) - estimateMonthly(b)),
    [],
  );

  const reviewedDate = useMemo(() => {
    const dates = models.map((m) => m.last_updated).filter(Boolean).sort();
    return dates[dates.length - 1] || "";
  }, []);

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "AI Models — Pricing & Best-Value Comparison",
    itemListElement: ranked.slice(0, 20).map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${m.name} (${m.provider})`,
    })),
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl" data-testid="page-models">
      <PageSeo
        title="AI Models Compared — Cheapest & Best Value | OverpayingForAI"
        description="Compare AI model pricing side by side. See the cheapest models, best value picks, and category winners for coding, writing, research, and support."
        canonicalUrl="/models"
        schema={schema}
      />

      {/* 1. HERO */}
      <section className="mb-10 text-center" data-testid="models-hero">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Stop Overpaying for AI Models</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
          Most teams waste 50–90% of AI spend by using the wrong default model. Compare costs,
          see the cheapest options by use case, and choose a better-fit model.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/calculator"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:opacity-90"
            onClick={() => fireCta("models_primary_cta_click", { cta_label: "Calculate My Cost", cta_location: "hero" })}
            data-testid="hero-primary-cta"
          >
            Calculate My Cost
          </Link>
          <Link
            href="/decision-engine"
            className="inline-block border border-input bg-background px-6 py-3 rounded-md font-semibold hover:bg-accent"
            onClick={() => fireCta("models_secondary_cta_click", { cta_label: "Use Decision Engine", cta_location: "hero" })}
            data-testid="hero-secondary-cta"
          >
            Use Decision Engine
          </Link>
        </div>
        {reviewedDate && (
          <p className="text-xs text-muted-foreground mt-4">Pricing data is periodically reviewed for accuracy.</p>
        )}
      </section>

      {/* 2. QUICK WINNERS */}
      <section className="mb-12" data-testid="quick-winners">
        <h2 className="text-2xl font-bold mb-6">Best value picks right now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickWinners.map((w) => {
            const cta = getPrimaryCta(modelIdToProviderId(w.model.id), "default", "/calculator");
            return (
              <div
                key={w.key}
                className="border rounded-lg p-4 bg-card flex flex-col"
                data-testid={`quick-winner-${w.key}`}
              >
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{w.title}</div>
                <div className="font-bold text-lg">{w.model.name}</div>
                <div className="text-sm text-muted-foreground mb-2">{w.model.provider}</div>
                <p className="text-sm mb-3 flex-grow">{w.rationale}</p>
                <div className="text-xs text-muted-foreground mb-3">
                  <div>In: {formatPrice(w.model.inputCostPer1k)}/1K</div>
                  <div>Out: {formatPrice(w.model.outputCostPer1k)}/1K</div>
                  <div className="mt-1">Typical moderate usage: {formatMonthly(estimateMonthly(w.model))}</div>
                </div>
                <AffiliateCta
                  target={{ ...cta, label: "Use this model" }}
                  className="block text-center bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-semibold hover:opacity-90 mb-2"
                  trackingContext={{
                    providerId: w.model.provider.toLowerCase(),
                    providerName: w.model.provider,
                    ctaType: "primary",
                    pageType: PAGE_TYPE,
                    sourceComponent: "quick_winners",
                  }}
                  onClick={() =>
                    fireCta("models_quick_winner_click", {
                      cta_label: "Use this model",
                      cta_location: "quick_winners",
                      model_name: w.model.name,
                      provider: w.model.provider,
                    })
                  }
                />
                <a
                  href="#pricing-table"
                  className="text-sm text-primary hover:underline text-center"
                  onClick={() =>
                    fireCta("models_secondary_cta_click", {
                      cta_label: "Compare options",
                      cta_location: "quick_winners",
                      model_name: w.model.name,
                      provider: w.model.provider,
                    })
                  }
                >
                  Compare options →
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. OVERPAYING WARNING */}
      <section
        className="mb-12 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20 p-6 rounded-md"
        data-testid="overpaying-strip"
      >
        <h2 className="text-xl font-bold mb-2">Most users overpay with one bad default</h2>
        <p className="mb-4">
          Using GPT-4o or Claude Sonnet for every task can multiply costs unnecessarily. Smaller
          models often cut spend by 90%+ for routine coding, support, writing, and summarization.
        </p>
        <Link
          href="/calculator"
          className="inline-block bg-orange-600 text-white px-5 py-2 rounded-md font-semibold hover:bg-orange-700"
          onClick={() =>
            fireCta("models_primary_cta_click", {
              cta_label: "Find a cheaper setup",
              cta_location: "overpaying_strip",
            })
          }
          data-testid="overpaying-cta"
        >
          Find a cheaper setup
        </Link>
      </section>

      {/* GPT-5.5 CALLOUT */}
      <section className="mb-8 border border-primary/20 bg-primary/5 rounded-lg p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">New model</p>
        <h2 className="text-lg font-bold mb-2">GPT-5.5 is powerful, but expensive as a default</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          GPT-5.5 is best treated as a premium model for complex coding, professional work, and agentic workflows.
          If you route every simple prompt to GPT-5.5, you may overpay quickly. Use cheaper models for routine tasks
          and reserve GPT-5.5 for work where the higher success rate matters.
        </p>
        <Link
          href="/pricing/gpt-5-5-pricing"
          className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
          onClick={() => fireCta("model_pricing_cta_click", { cta_label: "See GPT-5.5 pricing", cta_location: "gpt55_callout", model_name: "GPT-5.5" })}
        >
          See GPT-5.5 pricing →
        </Link>
      </section>

      {/* 4. PRICING TABLE */}
      <section className="mb-12" id="pricing-table" data-testid="pricing-table">
        <h2 className="text-2xl font-bold mb-2">Full AI model pricing comparison</h2>
        <p className="text-sm text-muted-foreground mb-1">
          Ranked by typical moderate monthly usage (~{MODERATE_INPUT_K}K input + {MODERATE_OUTPUT_K}K output tokens).
        </p>
        <p className="text-xs text-muted-foreground mb-4 italic">
          Pricing can change. Model prices are shown from the listed provider source and last verified date.
        </p>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">Model</th>
                <th className="text-left p-3">Provider</th>
                <th className="text-right p-3">Input/1K</th>
                <th className="text-right p-3">Output/1K</th>
                <th className="text-right p-3">Typical /mo</th>
                <th className="text-left p-3">Best for</th>
                <th className="text-left p-3">Value</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((m) => {
                const value = classifyValue(m);
                const cta = getPrimaryCta(modelIdToProviderId(m.id), "default", "/calculator");
                const actionLabel = cta.isExternal ? "Use this model" : "Calculate cost";
                return (
                  <tr key={m.id} className="border-t" data-testid={`row-${m.id}`}>
                    <td className="p-3">
                      <div className="font-semibold">{m.name}</div>
                      {m.needsManualReview && (
                        <div className="mt-0.5">
                          <span className="inline-block text-xs text-amber-700 dark:text-amber-400 font-medium">
                            ⚠ Needs manual pricing review
                          </span>
                          {m.pricingDisplayNote && (
                            <div className="text-xs text-muted-foreground mt-0.5 leading-snug max-w-xs">
                              {m.pricingDisplayNote}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3">{m.provider}</td>
                    <td className="p-3 text-right">
                      {formatPrice(m.inputCostPer1k)}
                      {m.cachedInputCostPer1k != null && (
                        <div className="text-xs text-muted-foreground">{formatPrice(m.cachedInputCostPer1k)} cached</div>
                      )}
                    </td>
                    <td className="p-3 text-right">{formatPrice(m.outputCostPer1k)}</td>
                    <td className="p-3 text-right">{formatMonthly(estimateMonthly(m))}</td>
                    <td className="p-3 text-xs">{(m.bestFor || []).slice(0, 3).join(", ")}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded border ${value.className}`}>
                        {value.label}
                      </span>
                    </td>
                    <td className="p-3">
                      <AffiliateCta
                        target={{ ...cta, label: actionLabel }}
                        className="text-primary hover:underline text-sm font-semibold"
                        trackingContext={{
                          providerId: m.provider.toLowerCase(),
                          providerName: m.provider,
                          ctaType: "primary",
                          pageType: PAGE_TYPE,
                          sourceComponent: "pricing_table",
                        }}
                        onClick={() =>
                          fireCta("models_table_action_click", {
                            cta_label: actionLabel,
                            cta_location: "pricing_table",
                            model_name: m.name,
                            provider: m.provider,
                          })
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Monthly figures are estimates based on a documented moderate-usage profile and are not a quote.
        </p>
      </section>

      {/* 6. CATEGORY WINNERS */}
      <section className="mb-12" data-testid="category-winners">
        <h2 className="text-2xl font-bold mb-6">Cheapest models by category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryWinners.map((c) => {
            const cta = getPrimaryCta(modelIdToProviderId(c.model.id), "default", "/calculator");
            return (
              <div
                key={c.category}
                className="border rounded-lg p-4 bg-card"
                data-testid={`category-${c.bestForKey}`}
              >
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{c.category}</div>
                <div className="font-bold text-lg">{c.model.name}</div>
                <div className="text-sm text-muted-foreground mb-2">{c.model.provider}</div>
                <div className="text-xs text-muted-foreground mb-2">
                  In: {formatPrice(c.model.inputCostPer1k)}/1K · Out: {formatPrice(c.model.outputCostPer1k)}/1K
                </div>
                <p className="text-sm mb-3">{c.rationale}</p>
                <div className="flex gap-2 flex-wrap">
                  <AffiliateCta
                    target={{ ...cta, label: "Use this model" }}
                    className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-sm font-semibold hover:opacity-90"
                    trackingContext={{
                      providerId: c.model.provider.toLowerCase(),
                      providerName: c.model.provider,
                      ctaType: "primary",
                      pageType: PAGE_TYPE,
                      sourceComponent: "category_winners",
                    }}
                    onClick={() =>
                      fireCta("models_category_winner_click", {
                        cta_label: "Use this model",
                        cta_location: "category_winners",
                        model_name: c.model.name,
                        provider: c.model.provider,
                      })
                    }
                  />
                  <Link
                    href="/calculator"
                    className="border border-input px-3 py-1.5 rounded text-sm font-semibold hover:bg-accent"
                    onClick={() =>
                      fireCta("models_secondary_cta_click", {
                        cta_label: "Calculate exact cost",
                        cta_location: "category_winners",
                        model_name: c.model.name,
                        provider: c.model.provider,
                      })
                    }
                  >
                    Calculate exact cost
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. ACTIONABLE INSIGHTS */}
      <section className="mb-12" data-testid="insights">
        <h2 className="text-2xl font-bold mb-4">Actionable insights</h2>
        <ul className="space-y-2 mb-6">
          <li className="border-l-2 border-primary pl-3 text-sm">
            Cheapest capable model is dramatically less expensive than the most premium flagship — often 50× or more.
          </li>
          <li className="border-l-2 border-primary pl-3 text-sm">
            GPT-4o Mini is far cheaper than GPT-4o for routine coding and chat work.
          </li>
          <li className="border-l-2 border-primary pl-3 text-sm">
            DeepSeek V3 is a strong value option for research-heavy work.
          </li>
          <li className="border-l-2 border-primary pl-3 text-sm">
            Gemini Flash is one of the lowest-cost options for high-volume automation.
          </li>
        </ul>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/calculator"
            className="bg-primary text-primary-foreground px-5 py-2 rounded-md font-semibold hover:opacity-90"
            onClick={() =>
              fireCta("models_primary_cta_click", {
                cta_label: "Calculate your exact cost",
                cta_location: "insights",
              })
            }
          >
            Calculate your exact cost
          </Link>
          <Link
            href="/decision-engine"
            className="border border-input px-5 py-2 rounded-md font-semibold hover:bg-accent"
            onClick={() =>
              fireCta("models_secondary_cta_click", {
                cta_label: "Use the decision engine",
                cta_location: "insights",
              })
            }
          >
            Use the decision engine
          </Link>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section
        className="mb-8 text-center bg-muted rounded-lg p-8"
        data-testid="final-cta"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          The cheapest model is the one that fits your actual workload
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Use the calculator or decision engine to choose the lowest-cost model that still meets your quality needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/calculator"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:opacity-90"
            onClick={() =>
              fireCta("models_final_cta_click", {
                cta_label: "Calculate Cost",
                cta_location: "final_cta",
              })
            }
          >
            Calculate Cost
          </Link>
          <Link
            href="/decision-engine"
            className="border border-input bg-background px-6 py-3 rounded-md font-semibold hover:bg-accent"
            onClick={() =>
              fireCta("models_final_cta_click", {
                cta_label: "Use Decision Engine",
                cta_location: "final_cta",
              })
            }
          >
            Use Decision Engine
          </Link>
        </div>
      </section>
    </div>
  );
}
