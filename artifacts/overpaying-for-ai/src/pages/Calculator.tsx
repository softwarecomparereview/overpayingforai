import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import {
  runCalculator,
  getAllModels,
  getModelById,
  formatCost,
  formatTokenCount,
} from "@/engine/calculator";
import type { CalculatorResult } from "@/engine/types";
import { freshnessLabel, isPricingStale } from "@/utils/pricingFreshness";
import { ScenarioSelector, type ScenarioPreset } from "@/components/ScenarioSelector";
import scenarios from "@/data/scenarios.json";
import { trackDecisionEvent, trackFeatureOpen } from "@/utils/analytics";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { CTABlock } from "@/components/monetization/CTABlock";
import { generateTitle, generateMetaDescription, generateSchemaSoftwareApp } from "@/utils/seo";
import { getPrimaryCta, providerNameToId } from "@/utils/affiliateResolver";
import { AffiliateCta } from "@/components/monetization/AffiliateCta";

const CALCULATOR_SEO_TITLE = generateTitle("", "calculator");
const CALCULATOR_SEO_DESC = generateMetaDescription("", "calculator");
const CALCULATOR_SCHEMA = generateSchemaSoftwareApp();

const CALCULATOR_RELATED_LINKS = [
  { href: "/best", text: "Best AI Tools by Value" },
  { href: "/compare/gpt-4o-vs-gpt-4o-mini-cost", text: "GPT-4o vs GPT-4o mini" },
  { href: "/compare/claude-vs-gpt-cost", text: "Claude vs GPT-4o" },
  { href: "/compare/deepseek-vs-gpt4o-cost", text: "DeepSeek vs GPT-4o" },
];

const models = getAllModels();
const SCENARIOS = scenarios as ScenarioPreset[];

const PRESET_USAGES = [
  { label: "Light (chat, occasional)", inputTokens: 100_000, outputTokens: 50_000 },
  { label: "Moderate (daily use)", inputTokens: 500_000, outputTokens: 200_000 },
  { label: "Heavy (power user)", inputTokens: 2_000_000, outputTokens: 800_000 },
  { label: "Scale (building products)", inputTokens: 10_000_000, outputTokens: 4_000_000 },
];

function buildShareUrl(modelId: string, input: number, output: number): string {
  const params = new URLSearchParams({ m: modelId, i: String(input), o: String(output) });
  return `${window.location.origin}${window.location.pathname}?${params}`;
}

export function Calculator() {
  const inputsRef = useRef<HTMLDivElement | null>(null);
  const calculationCountRef = useRef(0);

  const params = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();

  const [modelId, setModelId] = useState(params.get("m") ?? "gpt-4o");
  const [inputTokens, setInputTokens] = useState(Number(params.get("i")) || 500_000);
  const [outputTokens, setOutputTokens] = useState(Number(params.get("o")) || 200_000);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioPreset | null>(null);

  const calculate = useCallback(() => {
    try {
      const r = runCalculator({
        modelId,
        monthlyInputTokens: inputTokens,
        monthlyOutputTokens: outputTokens,
        mode: "api",
      });
      setResult(r);
      calculationCountRef.current += 1;
      trackDecisionEvent("calculator_completed", {
        page_type: "calculator",
        source_component: "Calculator/CalculateButton",
        page_path: typeof window !== "undefined" ? window.location.pathname : "/calculator",
        selected_model: r.model.id,
        selected_provider: r.model.provider,
        calculation_index: calculationCountRef.current,
      });
    } catch (e) {
      console.error(e);
    }
  }, [modelId, inputTokens, outputTokens]);

  const applyPreset = (preset: (typeof PRESET_USAGES)[0]) => {
    setInputTokens(preset.inputTokens);
    setOutputTokens(preset.outputTokens);
    setResult(null);
  };

  const applyScenario = (scenario: ScenarioPreset) => {
    setSelectedScenario(scenario);
    setModelId(scenario.inputs.modelId);
    setInputTokens(scenario.inputs.monthlyInputTokens);
    setOutputTokens(scenario.inputs.monthlyOutputTokens);
    setResult(null);
    if (typeof window !== "undefined") {
      const analytics = (
        window as typeof window & {
          analytics?: { track?: (event: string, props?: Record<string, unknown>) => void };
        }
      ).analytics;
      analytics?.track?.("scenario_selected", {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
      });
    }
  };

  useEffect(() => {
    trackFeatureOpen("calculator", {
      pageType: "calculator",
      sourceComponent: "Calculator/PageOpen",
    });
  }, []);

  useEffect(() => {
    if (!selectedScenario) return;
    inputsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedScenario]);

  useEffect(() => {
    if (!result) return;
    trackDecisionEvent("calculator_results_viewed", {
      page_type: "calculator",
      source_component: "Calculator/ResultsBlock",
      page_path: typeof window !== "undefined" ? window.location.pathname : "/calculator",
      selected_model: result.model.id,
      selected_provider: result.model.provider,
      has_cheaper_alternative: Boolean(result.cheaperAlternatives.length),
      calculation_index: calculationCountRef.current,
    });
  }, [result]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(buildShareUrl(modelId, inputTokens, outputTokens));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedModel = getModelById(modelId);
  const dateStr = selectedModel?.last_updated;
  const stale = dateStr ? isPricingStale(dateStr) : false;
  const bestSetup = result?.cheaperAlternatives[0] ?? null;
  const bestSetupProviderId = bestSetup ? providerNameToId(bestSetup.model.provider) : "";
  const primaryTarget = bestSetup
    ? getPrimaryCta(bestSetupProviderId, "cheapest", "/best")
    : null;

  return (
    <div className="bg-white">
      <PageSeo title={CALCULATOR_SEO_TITLE} description={CALCULATOR_SEO_DESC} schema={CALCULATOR_SCHEMA} />

      <section className="border-b border-border bg-slate-900 text-white py-14 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Calculator</p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Find your cheapest viable AI setup</h1>
              <p className="text-white/70 text-base max-w-2xl leading-relaxed mb-5">
                Estimate your real monthly AI spend and immediately see lower-cost alternatives. Built for teams comparing GPT-4o, Claude, Gemini, DeepSeek, and subscription plans.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 text-white/70">Exact monthly estimate</span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 text-white/70">Top cheaper alternatives</span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 text-white/70">No sign-up required</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">What this gives you</p>
              <div className="space-y-3 text-sm text-white/80">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="font-semibold text-white">A real monthly cost</p>
                  <p className="text-xs text-white/60 mt-1">Not a vague pricing page — your usage, your estimate.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="font-semibold text-white">A cheaper viable option</p>
                  <p className="text-xs text-white/60 mt-1">See whether you can downgrade model cost without ruining quality.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="font-semibold text-white">A next step</p>
                  <p className="text-xs text-white/60 mt-1">Move into compare pages or the decision engine when you need more confidence.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-slate-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Use this if…</p>
              <p className="text-sm text-muted-foreground leading-relaxed">You’re paying for GPT-4o, Claude, or a subscription and want a cheaper equivalent.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Best for</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Fast API vs subscription checks before you commit to a plan or switch models.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Next step</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Use compare pages for model-level tradeoffs or the decision engine for a broader stack recommendation.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
            <div className="border border-border rounded-2xl bg-card p-4 sm:p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Start with a common scenario</p>
                <p className="text-sm text-muted-foreground">Pick a preset to prefill the calculator, or enter usage manually below.</p>
              </div>

              <ScenarioSelector scenarios={SCENARIOS} onSelect={applyScenario} selectedId={selectedScenario?.id ?? null} />

              {selectedScenario && (
                <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">Selected: {selectedScenario.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Preset applied · {formatTokenCount(selectedScenario.inputs.monthlyInputTokens)} input · {formatTokenCount(selectedScenario.inputs.monthlyOutputTokens)} output
                  </p>
                </div>
              )}

              <div className="mt-6" ref={inputsRef}>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Usage preset</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {PRESET_USAGES.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p)}
                      className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                        inputTokens === p.inputTokens && outputTokens === p.outputTokens
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                      }`}
                      data-testid={`preset-${p.label.split(" ")[0].toLowerCase()}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-sm font-medium text-foreground block mb-2" htmlFor="model-select">
                  AI model
                </label>
                <select
                  id="model-select"
                  value={modelId}
                  onChange={(e) => {
                    setModelId(e.target.value);
                    setResult(null);
                  }}
                  className="w-full border border-border rounded-lg px-3 py-2.5 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  data-testid="model-select"
                >
                  <optgroup label="API Models">
                    {models.filter((m) => m.planType === "api").map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.provider}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Subscriptions">
                    {models.filter((m) => m.planType === "subscription").map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.provider}
                      </option>
                    ))}
                  </optgroup>
                </select>

                {dateStr && (
                  <div
                    className={`mt-2 flex items-center gap-2 text-xs ${
                      stale ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        stale ? "bg-amber-500" : "bg-green-500"
                      }`}
                    />
                    <span>{freshnessLabel(dateStr)}</span>
                    {stale && (
                      <span className="ml-1">
                        · Pricing may have changed.{" "}
                        <a
                          href={selectedModel?.source ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:no-underline"
                        >
                          Verify with provider.
                        </a>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2" htmlFor="input-tokens">
                    Monthly input tokens
                  </label>
                  <input
                    id="input-tokens"
                    type="number"
                    value={inputTokens}
                    min={0}
                    step={100000}
                    onChange={(e) => {
                      setInputTokens(Number(e.target.value));
                      setResult(null);
                    }}
                    className="w-full border border-border rounded-lg px-3 py-2.5 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    data-testid="input-tokens"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTokenCount(inputTokens)} tokens · ~{Math.round(inputTokens * 0.75).toLocaleString()} words
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2" htmlFor="output-tokens">
                    Monthly output tokens
                  </label>
                  <input
                    id="output-tokens"
                    type="number"
                    value={outputTokens}
                    min={0}
                    step={50000}
                    onChange={(e) => {
                      setOutputTokens(Number(e.target.value));
                      setResult(null);
                    }}
                    className="w-full border border-border rounded-lg px-3 py-2.5 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    data-testid="output-tokens"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTokenCount(outputTokens)} tokens · ~{Math.round(outputTokens * 0.75).toLocaleString()} words
                  </p>
                </div>
              </div>

              <button
                onClick={calculate}
                className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-semibold text-sm hover:bg-primary/90 transition-colors"
                data-testid="calculate-btn"
              >
                Calculate Monthly Cost
              </button>
            </div>

            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">How to use this</p>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li><span className="font-semibold text-foreground">1.</span> Pick a common scenario or enter your token usage.</li>
                  <li><span className="font-semibold text-foreground">2.</span> Choose the model or subscription you’re comparing today.</li>
                  <li><span className="font-semibold text-foreground">3.</span> Use the result block to see the cheapest viable next step.</li>
                </ol>
              </div>

              <div className="rounded-2xl border border-border bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">What the result tells you</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Estimated monthly spend for the current model</li>
                  <li>• Whether you are overpaying right now</li>
                  <li>• The best cheaper alternative to test next</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Good next steps</p>
                <div className="space-y-3">
                  <Link href="/compare/claude-vs-gpt-cost" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                    See Claude vs GPT-4o →
                  </Link>
                  <Link href="/compare/gpt-4o-vs-gpt-4o-mini-cost" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                    See GPT-4o vs GPT-4o mini →
                  </Link>
                  <Link href="/decision-engine" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                    Use the decision engine →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {result && (
        <section className="border-t border-border bg-slate-50 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Your result</p>
              <h2 className="text-2xl font-bold text-foreground">Your current cost and cheaper alternatives</h2>
            </div>

            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
              <div className="space-y-6" data-testid="results">
                <div className="border border-border rounded-2xl bg-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Estimated monthly cost</p>
                      <p className="text-4xl font-bold text-foreground" data-testid="total-cost">
                        {formatCost(result.estimatedMonthlyCost)}
                      </p>
                      {result.model.planType === "api" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Input: {formatCost(result.inputCost)} · Output: {formatCost(result.outputCost)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{result.model.name}</p>
                      <p className="text-xs text-muted-foreground">{result.model.provider}</p>
                    </div>
                  </div>

                  {result.savingsEstimate !== null && result.savingsEstimate > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg px-4 py-3 mb-4">
                      <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                        You are overpaying by {formatCost(result.savingsEstimate)}/month.
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.recommendation}
                  </p>
                </div>

                <div className="flex items-center gap-3 no-print">
                  <button
                    onClick={copyShareLink}
                    className="text-sm border border-border rounded-lg px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    data-testid="share-btn"
                  >
                    {copied ? "Copied!" : "Copy Share Link"}
                  </button>
                  <Link href="/best" className="text-sm text-primary hover:underline">See best-value tool picks →</Link>
                </div>
              </div>

              <div className="space-y-4">
                {bestSetup && primaryTarget && (
                  <div className="border border-primary/20 bg-primary/5 rounded-2xl p-5 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">Best setup for you</p>
                    <p className="text-lg font-semibold text-foreground">{bestSetup.model.name}</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>Estimated monthly cost: {formatCost(bestSetup.estimatedCost)}</li>
                      <li>Typical current spend: {formatCost(result.estimatedMonthlyCost)}</li>
                      <li>Potential savings: {formatCost(bestSetup.savings)}/month ({bestSetup.savingsPercent.toFixed(0)}%)</li>
                    </ul>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                      <AffiliateCta
                        target={{
                          ...primaryTarget,
                          label: primaryTarget.isAffiliate ? "Switch to the cheaper setup" : "See the lower-cost option",
                        }}
                        className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-lg px-4 py-2 font-semibold text-sm hover:bg-primary/90 transition-colors"
                        trackingContext={{
                          providerId: bestSetupProviderId,
                          ctaType: "primary",
                          pageType: "calculator",
                          sourceComponent: "Calculator/ResultsPrimaryCta",
                        }}
                      />
                      <AffiliateCta
                        target={{
                          href: "/best",
                          label: "Compare other best-value tools",
                          isExternal: false,
                          isAffiliate: false,
                          fallbackUsed: true,
                          status: "unavailable",
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                        trackingContext={{
                          providerId: "",
                          ctaType: "secondary",
                          pageType: "calculator",
                          sourceComponent: "Calculator/ResultsSecondaryCta",
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-border bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">What to do next</p>
                  <div className="space-y-3">
                    <Link href="/compare/claude-vs-gpt-cost" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Validate with Claude vs GPT-4o →
                    </Link>
                    <Link href="/compare/gpt-4o-vs-gpt-4o-mini-cost" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Validate with GPT-4o vs mini →
                    </Link>
                    <Link href="/decision-engine" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Use the decision engine for a broader recommendation →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-border bg-white py-12 no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1fr_1fr] gap-6 items-start">
          <div className="border border-border rounded-2xl bg-white p-6">
            <h2 className="font-semibold text-foreground mb-3">How are costs calculated?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              API costs are calculated as: (input tokens / 1000 × input cost per 1K) + (output tokens / 1000 × output cost per 1K). Subscription costs are flat monthly fees regardless of usage.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              1 token ≈ 0.75 words ≈ 4 characters of English text.{" "}
              <Link href="/guides/token-cost-explained" className="text-primary hover:underline">
                Learn more about tokens →
              </Link>
            </p>
          </div>

          <div className="space-y-6">
            <CTABlock
              toolId="deepseek"
              toolName="DeepSeek V3"
              headline="Often 10× cheaper than GPT-4o for the same output"
              savingsText="Most content and coding tasks cost under $1/month with DeepSeek V3 via API."
              variant="secondary"
              trackingContext={{ pageType: "calculator", sourceComponent: "Calculator/CTABlock" }}
            />
            <InternalLinks links={CALCULATOR_RELATED_LINKS} heading="Compare models" />
          </div>
        </div>
      </section>
    </div>
  );
}
