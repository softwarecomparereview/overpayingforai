import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
import { trackDecisionEvent, trackFeatureOpen, track, debugFunnelLog } from "@/utils/analytics";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { CTABlock } from "@/components/monetization/CTABlock";
import { generateSchemaSoftwareApp } from "@/utils/seo";
import { getScenarioSeo } from "@/utils/scenarioSeo";
import { getPrimaryCta, providerNameToId } from "@/utils/affiliateResolver";
import { AffiliateCta } from "@/components/monetization/AffiliateCta";

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

  const scenarioIdParam = params.get("scenario");
  const initialScenario = scenarioIdParam
    ? SCENARIOS.find((s) => s.id === scenarioIdParam) ?? null
    : null;

  const [modelId, setModelId] = useState(
    params.get("m") ?? initialScenario?.inputs.modelId ?? "gpt-4o"
  );
  const [inputTokens, setInputTokens] = useState(
    Number(params.get("i")) || initialScenario?.inputs.monthlyInputTokens || 500_000
  );
  const [outputTokens, setOutputTokens] = useState(
    Number(params.get("o")) || initialScenario?.inputs.monthlyOutputTokens || 200_000
  );
  const [copied, setCopied] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioPreset | null>(initialScenario);

  // Result is always computed from inputs — no button gating, no stale state.
  // This ensures the page renders a real, semantic, scrapable result on every render.
  const result = useMemo<CalculatorResult | null>(() => {
    try {
      return runCalculator({
        modelId,
        monthlyInputTokens: inputTokens,
        monthlyOutputTokens: outputTokens,
        mode: "api",
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [modelId, inputTokens, outputTokens]);

  // Manual "Calculate" button still tracks an explicit calculation event and
  // scrolls to the results, but does not gate visibility of the result block.
  const calculate = useCallback(() => {
    if (!result) return;
    calculationCountRef.current += 1;
    const recommended = result.cheaperAlternatives[0]?.model;
    const completePayload = {
      page_type: "calculator" as const,
      source_component: "Calculator/CalculateButton",
      page_path: typeof window !== "undefined" ? window.location.pathname : "/calculator",
      selected_model: result.model.id,
      selected_provider: result.model.provider,
      recommended_model: recommended?.id,
      savings_amount: result.savingsEstimate ?? 0,
      savings_percent: result.cheaperAlternatives[0]?.savingsPercent ?? 0,
      calculation_index: calculationCountRef.current,
    };
    trackDecisionEvent("calculator_complete", completePayload);
    track("calculator_complete", completePayload);
    debugFunnelLog("calculator", "calculator_complete", completePayload);
  }, [result]);

  // Fire `calculator_start` exactly once per session on the first user input.
  const startedRef = useRef(false);
  const fireStartOnce = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const payload = { page_type: "calculator" as const, selected_model: modelId };
    track("calculator_start", payload);
    debugFunnelLog("calculator", "calculator_start", payload);
  }, [modelId]);

  const applyPreset = (preset: (typeof PRESET_USAGES)[0]) => {
    fireStartOnce();
    setInputTokens(preset.inputTokens);
    setOutputTokens(preset.outputTokens);
  };

  const applyScenario = (scenario: ScenarioPreset) => {
    fireStartOnce();
    setSelectedScenario(scenario);
    setModelId(scenario.inputs.modelId);
    setInputTokens(scenario.inputs.monthlyInputTokens);
    setOutputTokens(scenario.inputs.monthlyOutputTokens);
    track("scenario_selected", {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
    });
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

  // De-dupe the "results_viewed" event by a stable signature of the inputs that
  // produce a result. With the move to useMemo-based result computation, `result`
  // changes on every keystroke; without dedupe this event would fire per keypress.
  // We track each unique modelId|input|output combination at most once per session.
  const lastViewedSigRef = useRef<string>("");
  useEffect(() => {
    if (!result) return;
    // Only fire after the user has interacted with any input (model, tokens, preset, scenario)
    // or has explicitly clicked Calculate. Prevents firing on the default pre-loaded result.
    if (!startedRef.current && calculationCountRef.current === 0) return;
    const sig = `${result.model.id}|${inputTokens}|${outputTokens}`;
    if (sig === lastViewedSigRef.current) return;
    lastViewedSigRef.current = sig;
    const recommended = result.cheaperAlternatives[0];
    const viewPayload = {
      page_type: "calculator" as const,
      source_component: "Calculator/ResultsBlock",
      page_path: typeof window !== "undefined" ? window.location.pathname : "/calculator",
      selected_model: result.model.id,
      selected_provider: result.model.provider,
      recommended_model: recommended?.model.id,
      savings_amount: recommended?.savings ?? 0,
      savings_percent: recommended?.savingsPercent ?? 0,
      has_cheaper_alternative: Boolean(result.cheaperAlternatives.length),
      calculation_index: calculationCountRef.current,
    };
    trackDecisionEvent("recommendation_result_view", viewPayload);
    track("calculator_result_view", viewPayload);
    debugFunnelLog("calculator", "calculator_result_view", viewPayload);
  }, [result, inputTokens, outputTokens]);

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

  // Compute "Best fit: API vs subscription" verdict by comparing the cheapest
  // viable API plan for these inputs against the cheapest subscription plan.
  // This produces deterministic, input-driven copy on every render.
  const allModels = models;
  const isSubscriptionSelected = selectedModel?.planType === "subscription";

  // Exclude the currently-selected model so it never appears as its own alternative.
  // Only include paid API models — free-tier API models are already the cheapest and
  // should not inflate savings estimates.
  const apiCandidates = allModels
    .filter((m) => m.planType === "api" && m.id !== modelId)
    .map((m) => {
      const inputCost = (inputTokens / 1000) * m.inputCostPer1k;
      const outputCost = (outputTokens / 1000) * m.outputCostPer1k;
      return { model: m, monthlyCost: inputCost + outputCost };
    })
    .sort((a, b) => a.monthlyCost - b.monthlyCost);

  // Only AI model subscriptions (chat/research/coding) that support real API-equivalent
  // usage. Exclude writing-tool subscriptions (Rytr, Jasper, Writesonic, Copy.ai) and
  // coding IDE subscriptions (Cursor, Copilot) — these are categorically different
  // products and should never win an API-vs-subscription cost race for LLM users.
  const subCandidates = allModels
    .filter(
      (m) =>
        m.planType === "subscription" &&
        (m.monthlySubscriptionCostIfAny ?? 0) > 0 &&
        m.supportsApiUsage !== false &&
        m.id !== modelId,
    )
    .map((m) => ({ model: m, monthlyCost: m.monthlySubscriptionCostIfAny ?? 0 }))
    .sort((a, b) => a.monthlyCost - b.monthlyCost);

  const cheapestApi = apiCandidates[0] ?? null;
  const cheapestSub = subCandidates[0] ?? null;
  const verdict: "API" | "subscription" =
    !cheapestSub
      ? "API"
      : !cheapestApi
        ? "subscription"
        : cheapestApi.monthlyCost <= cheapestSub.monthlyCost
          ? "API"
          : "subscription";
  const verdictWinner = verdict === "API" ? cheapestApi : cheapestSub;

  // If the user selected a subscription plan, note that the comparison is
  // between their subscription cost and API pricing — different purchase intents.
  const subscriptionConflationNote =
    isSubscriptionSelected
      ? ` Note: your selection is a flat subscription — switching to API requires technical integration and may not suit a no-code workflow.`
      : "";

  const verdictRationale =
    verdict === "API"
      ? cheapestApi && cheapestSub
        ? `At ${formatTokenCount(inputTokens)} input + ${formatTokenCount(outputTokens)} output tokens/month, paying per-token on ${cheapestApi.model.name} (${formatCost(cheapestApi.monthlyCost)}/mo) is cheaper than the cheapest flat subscription, ${cheapestSub.model.name} (${formatCost(cheapestSub.monthlyCost)}/mo).${subscriptionConflationNote}`
        : `At this usage level, an API/per-token plan is the cheapest path.${subscriptionConflationNote}`
      : cheapestApi && cheapestSub
        ? `At ${formatTokenCount(inputTokens)} input + ${formatTokenCount(outputTokens)} output tokens/month, the flat ${cheapestSub.model.name} subscription (${formatCost(cheapestSub.monthlyCost)}/mo) beats the cheapest API option, ${cheapestApi.model.name} (${formatCost(cheapestApi.monthlyCost)}/mo).${subscriptionConflationNote}`
        : `At this usage level, a flat subscription is the cheapest path.${subscriptionConflationNote}`;

  // Build the semantic options list: cheapest API + cheapest subscription +
  // up to 2 of the cheaper alternatives we already computed for the selected model.
  type ResultOption = {
    key: string;
    name: string;
    provider: string;
    planType: "api" | "subscription";
    monthlyCost: number;
  };
  const options: ResultOption[] = [];
  const seen = new Set<string>();
  const pushOpt = (o: ResultOption | null) => {
    if (!o || seen.has(o.key)) return;
    seen.add(o.key);
    options.push(o);
  };
  if (cheapestApi) {
    pushOpt({
      key: cheapestApi.model.id,
      name: cheapestApi.model.name,
      provider: cheapestApi.model.provider,
      planType: "api",
      monthlyCost: cheapestApi.monthlyCost,
    });
  }
  if (cheapestSub) {
    pushOpt({
      key: cheapestSub.model.id,
      name: cheapestSub.model.name,
      provider: cheapestSub.model.provider,
      planType: "subscription",
      monthlyCost: cheapestSub.monthlyCost,
    });
  }
  if (result) {
    pushOpt({
      key: result.model.id + "-current",
      name: result.model.name + " (your selection)",
      provider: result.model.provider,
      planType: result.model.planType,
      monthlyCost: result.estimatedMonthlyCost,
    });
    for (const a of result.cheaperAlternatives.slice(0, 2)) {
      pushOpt({
        key: a.model.id,
        name: a.model.name,
        provider: a.model.provider,
        planType: a.model.planType,
        monthlyCost: a.estimatedCost,
      });
    }
  }

  const primaryRecommendation = verdictWinner
    ? `Recommended: ${verdictWinner.model.name} (${verdictWinner.model.provider}) — ${formatCost(verdictWinner.monthlyCost)}/month at your usage. Best fit: ${verdict}.`
    : `Pick a model and enter usage to see a recommendation.`;
  const resultHeading = result
    ? `${result.model.name}: ${formatCost(result.estimatedMonthlyCost)}/month at ${formatTokenCount(inputTokens)} in / ${formatTokenCount(outputTokens)} out`
    : `Calculator result`;

  const scenarioSeo = useMemo(
    () => getScenarioSeo(selectedScenario?.id ?? null),
    [selectedScenario?.id],
  );
  const canonicalUrl = selectedScenario
    ? `/calculator?scenario=${selectedScenario.id}`
    : "/calculator";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <PageSeo
        title={scenarioSeo.title}
        description={scenarioSeo.metaDescription}
        schema={CALCULATOR_SCHEMA}
        canonicalUrl={canonicalUrl}
      />
      <div className="mb-5 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1.5 sm:mb-2" data-testid="calc-h1">
          {scenarioSeo.h1}
        </h1>
        <p
          className="text-sm sm:text-base text-muted-foreground max-w-prose"
          data-testid="calc-subhead"
        >
          {scenarioSeo.subhead}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Recommendations are based on use case, usage level, and cost sensitivity.
        </p>
      </div>

      <div className="mb-6 sm:mb-8 border border-border rounded-xl bg-muted/20 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Use this if…</p>
        <ul className="text-sm text-foreground space-y-1.5">
          <li>• You’re paying for GPT-4o, Claude, or a subscription and want a cheaper equivalent.</li>
          <li>• You need a fast estimate before choosing between API and subscription plans.</li>
          <li>• You want one clear next step after seeing your projected monthly spend.</li>
        </ul>
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
                fireStartOnce();
                setModelId(e.target.value);
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
                fireStartOnce();
                setInputTokens(Number(e.target.value));
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
                fireStartOnce();
                setOutputTokens(Number(e.target.value));
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

      <section
        className="space-y-6"
        data-testid="calc-result"
        aria-live="polite"
        aria-label="Calculator result"
      >
        <h2 data-testid="calc-result-heading" className="sr-only">
          {resultHeading}
        </h2>
        <p data-testid="calc-primary-recommendation" className="sr-only">
          {primaryRecommendation}
        </p>
        <ul data-testid="calc-options" className="sr-only">
          {options.map((o) => (
            <li key={o.key} data-plan={o.planType} data-cost={o.monthlyCost.toFixed(4)}>
              {o.name} — {o.provider} — {o.planType} — {formatCost(o.monthlyCost)}/month
            </li>
          ))}
        </ul>
        <p data-testid="calc-rationale" className="sr-only">
          {verdictRationale}
        </p>
        <p data-testid="calc-verdict" className="sr-only">
          Best fit: {verdict}
        </p>
      </section>

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

            {/* Visible verdict + recommendation, mirrors the testid block above so
                sighted users see the same input-driven copy that the audit reads. */}
            <div className="mt-2 mb-4 border border-border rounded-lg bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Best fit: {verdict}
              </p>
              <p className="text-sm text-foreground font-medium">
                {primaryRecommendation}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                {verdictRationale}
              </p>
              {options.length > 0 && (
                <ul className="text-xs text-muted-foreground mt-3 space-y-1">
                  {options.slice(0, 4).map((o) => (
                    <li key={"v-" + o.key}>
                      <span className="font-medium text-foreground">{o.name}</span>
                      <span className="text-muted-foreground"> — {o.provider} ({o.planType}) — </span>
                      <span className="font-medium text-foreground">{formatCost(o.monthlyCost)}/month</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {result.savingsEstimate !== null && result.savingsEstimate > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg px-4 py-3">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  You are overpaying by {formatCost(result.savingsEstimate)}/month.
                </p>
              </div>
            )}

            {bestSetup && primaryTarget && (
              <div className="mt-4 border border-primary/30 bg-primary/5 rounded-xl p-4 sm:p-5 space-y-3" data-testid="calc-result-cta-card">
                <p className="text-lg font-bold text-foreground">
                  Switch to {bestSetup.model.name} — save {formatCost(bestSetup.savings)}/month
                </p>
                <p className="text-sm text-muted-foreground">
                  {bestSetup.savingsPercent.toFixed(0)}% lower than {result.model.name} at this usage
                  ({formatCost(bestSetup.estimatedCost)} vs {formatCost(result.estimatedMonthlyCost)} per month).
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                  <AffiliateCta
                    target={{
                      ...primaryTarget,
                      label: `Switch to ${bestSetup.model.name}`,
                    }}
                    className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-lg px-5 py-2.5 font-semibold text-sm hover:bg-primary/90 transition-colors"
                    trackingContext={{
                      providerId: bestSetupProviderId,
                      ctaType: "primary",
                      pageType: "calculator",
                      sourceComponent: "Calculator/ResultsPrimaryCta",
                    }}
                    onClick={() => {
                      const payload = {
                        page_type: "calculator" as const,
                        cta_location: "result_primary",
                        cta_label: `Switch to ${bestSetup.model.name}`,
                        selected_model: result.model.id,
                        recommended_model: bestSetup.model.id,
                        savings_amount: bestSetup.savings,
                        savings_percent: bestSetup.savingsPercent,
                      };
                      track("calculator_recommendation_click", payload);
                      debugFunnelLog("calculator", "calculator_recommendation_click", payload);
                    }}
                  />
                  <AffiliateCta
                    target={{
                      href: "/best",
                      label: "Compare more options",
                      isExternal: false,
                      isAffiliate: false,
                      fallbackUsed: true,
                      status: "unavailable",
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                    trackingContext={{
                      providerId: "",
                      ctaType: "secondary",
                      pageType: "calculator",
                      sourceComponent: "Calculator/ResultsSecondaryCta",
                    }}
                    onClick={() => {
                      const payload = {
                        page_type: "calculator" as const,
                        cta_location: "result_secondary",
                        cta_label: "Compare more options",
                        selected_model: result.model.id,
                        recommended_model: bestSetup.model.id,
                      };
                      track("calculator_secondary_cta_click", payload);
                      debugFunnelLog("calculator", "calculator_secondary_cta_click", payload);
                    }}
                  />
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              {result.recommendation}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 no-print">
            <button
              onClick={() => inputsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="text-sm border border-border rounded-lg px-4 py-2 text-foreground hover:bg-muted transition-colors"
              data-testid="edit-inputs-btn"
            >
              Edit inputs
            </button>
            <button
              onClick={copyShareLink}
              className="text-sm border border-border rounded-lg px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              data-testid="share-btn"
            >
              {copied ? "Copied!" : "Copy Share Link"}
            </button>
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
