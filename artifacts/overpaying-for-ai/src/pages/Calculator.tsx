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
import { trackFeatureOpen } from "@/utils/analytics";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { CTABlock } from "@/components/monetization/CTABlock";
import { generateTitle, generateMetaDescription, generateSchemaSoftwareApp } from "@/utils/seo";
import { getPrimaryCta, providerNameToId } from "@/utils/affiliateResolver";
import { trackGaEvent } from "@/utils/ga4";

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

  useEffect(() => { trackFeatureOpen("calculator"); }, []);

  useEffect(() => {
    if (!selectedScenario) return;
    inputsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedScenario]);

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <PageSeo title={CALCULATOR_SEO_TITLE} description={CALCULATOR_SEO_DESC} schema={CALCULATOR_SCHEMA} />
      <div className="mb-5 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5 sm:mb-2">AI Cost Calculator</h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-prose">
          Estimate your monthly AI spend and discover cheaper alternatives.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Recommendations are based on use case, usage level, and cost sensitivity.
        </p>
      </div>

      <div className="border border-border rounded-xl bg-card p-4 sm:p-6 mb-6 sm:mb-8">
        <ScenarioSelector scenarios={SCENARIOS} onSelect={applyScenario} selectedId={selectedScenario?.id ?? null} />

        {selectedScenario && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Selected: {selectedScenario.name}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Preset applied · {formatTokenCount(selectedScenario.inputs.monthlyInputTokens)} input · {formatTokenCount(selectedScenario.inputs.monthlyOutputTokens)} output
            </p>
          </div>
        )}

        <div className="mb-6" ref={inputsRef}>
          <label className="text-sm font-medium text-foreground block mb-2">Usage Preset</label>
          <div className="flex flex-wrap gap-2">
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
            AI Model
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
              Monthly Input Tokens
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
              Monthly Output Tokens
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

      {result && (
        <div className="space-y-6" data-testid="results">
          <div className="border border-border rounded-xl bg-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Cost</p>
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
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg px-4 py-3">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  You are overpaying by {formatCost(result.savingsEstimate)}/month.
                </p>
              </div>
            )}

            {bestSetup && primaryTarget && (
              <div className="mt-4 border border-primary/20 bg-primary/5 rounded-xl p-4 sm:p-5 space-y-3">
                <p className="text-sm font-semibold text-foreground">Best setup for you: {bestSetup.model.name}</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Estimated monthly cost: {formatCost(bestSetup.estimatedCost)}</li>
                  <li>Typical current spend: {formatCost(result.estimatedMonthlyCost)}</li>
                  <li>Potential savings: {formatCost(bestSetup.savings)}/month ({bestSetup.savingsPercent.toFixed(0)}%)</li>
                </ul>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <a
                    href={primaryTarget.href}
                    target={primaryTarget.isExternal ? "_blank" : undefined}
                    rel={primaryTarget.isExternal ? "noopener noreferrer sponsored" : undefined}
                    onClick={() => trackGaEvent("calculator_result_primary_cta_click", { destination: primaryTarget.href })}
                    className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-lg px-4 py-2 font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    {primaryTarget.isAffiliate ? "Switch to the cheaper setup" : "See the lower-cost option"}
                  </a>
                  <Link
                    href="/best"
                    onClick={() => trackGaEvent("calculator_result_secondary_cta_click")}
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Compare other best-value tools →
                  </Link>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
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
      )}

      <div className="mt-10 border-t border-border pt-8 no-print">
        <h2 className="font-semibold text-foreground mb-3">How are costs calculated?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          API costs are calculated as: (input tokens / 1000 × input cost per 1K) + (output
          tokens / 1000 × output cost per 1K). Subscription costs are flat monthly fees
          regardless of usage.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          1 token ≈ 0.75 words ≈ 4 characters of English text.{" "}
          <Link href="/guides/token-cost-explained" className="text-primary hover:underline">
            Learn more about tokens →
          </Link>
        </p>
      </div>

      <div className="mt-8 no-print">
        <CTABlock
          toolId="deepseek"
          toolName="DeepSeek V3"
          headline="Often 10× cheaper than GPT-4o for the same output"
          savingsText="Most content and coding tasks cost under $1/month with DeepSeek V3 via API."
          variant="secondary"
          trackingContext={{ pageType: "calculator", sourceComponent: "Calculator/CTABlock" }}
        />
      </div>

      <div className="no-print">
        <InternalLinks links={CALCULATOR_RELATED_LINKS} heading="Compare models" />
      </div>
    </div>
  );
}
