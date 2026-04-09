import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  runCalculator,
  getAllModels,
  getModelById,
  formatCost,
  formatTokenCount,
} from "@/engine/calculator";
import type { CalculatorResult } from "@/engine/types";
import { freshnessLabel, isPricingStale } from "@/utils/pricingFreshness";

const models = getAllModels();

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
  const [location, setLocation] = useLocation();

  const params = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();

  const [modelId, setModelId] = useState(params.get("m") ?? "gpt-4o");
  const [inputTokens, setInputTokens] = useState(Number(params.get("i")) || 500_000);
  const [outputTokens, setOutputTokens] = useState(Number(params.get("o")) || 200_000);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [copied, setCopied] = useState(false);

  const calculate = useCallback(() => {
    try {
      const r = runCalculator({ modelId, monthlyInputTokens: inputTokens, monthlyOutputTokens: outputTokens, mode: "api" });
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

  const copyShareLink = () => {
    navigator.clipboard.writeText(buildShareUrl(modelId, inputTokens, outputTokens));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">AI Cost Calculator</h1>
        <p className="text-muted-foreground">Estimate your monthly AI spend and discover cheaper alternatives.</p>
      </div>

      <div className="border border-border rounded-xl bg-card p-6 mb-8">
        {/* Presets */}
        <div className="mb-6">
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

        {/* Model Selector */}
        <div className="mb-5">
          <label className="text-sm font-medium text-foreground block mb-2" htmlFor="model-select">
            AI Model
          </label>
          <select
            id="model-select"
            value={modelId}
            onChange={(e) => { setModelId(e.target.value); setResult(null); }}
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
          {/* Pricing freshness */}
          {(() => {
            const selectedModel = getModelById(modelId);
            const dateStr = selectedModel?.last_updated;
            if (!dateStr) return null;
            const stale = isPricingStale(dateStr);
            return (
              <div className={`mt-2 flex items-center gap-2 text-xs ${stale ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${stale ? "bg-amber-500" : "bg-green-500"}`} />
                <span>{freshnessLabel(dateStr)}</span>
                {stale && (
                  <span className="ml-1">· Pricing may have changed — <a href={selectedModel?.source ?? "#"} target="_blank" rel="noreferrer" className="underline hover:no-underline">verify with provider</a></span>
                )}
              </div>
            );
          })()}
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          {/* Input Tokens */}
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
              onChange={(e) => { setInputTokens(Number(e.target.value)); setResult(null); }}
              className="w-full border border-border rounded-lg px-3 py-2.5 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              data-testid="input-tokens"
            />
            <p className="text-xs text-muted-foreground mt-1">{formatTokenCount(inputTokens)} tokens · ~{Math.round(inputTokens * 0.75).toLocaleString()} words</p>
          </div>

          {/* Output Tokens */}
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
              onChange={(e) => { setOutputTokens(Number(e.target.value)); setResult(null); }}
              className="w-full border border-border rounded-lg px-3 py-2.5 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              data-testid="output-tokens"
            />
            <p className="text-xs text-muted-foreground mt-1">{formatTokenCount(outputTokens)} tokens · ~{Math.round(outputTokens * 0.75).toLocaleString()} words</p>
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

      {/* Results */}
      {result && (
        <div className="space-y-6" data-testid="results">
          {/* Cost Summary */}
          <div className="border border-border rounded-xl bg-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Cost</p>
                <p className="text-4xl font-bold text-foreground" data-testid="total-cost">{formatCost(result.estimatedMonthlyCost)}</p>
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
                  💡 Switch to a cheaper model and save up to {formatCost(result.savingsEstimate)}/month
                </p>
              </div>
            )}

            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{result.recommendation}</p>
          </div>

          {/* Cheaper Alternatives */}
          {result.cheaperAlternatives.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-4">Cheaper Alternatives</h2>
              <div className="space-y-3">
                {result.cheaperAlternatives.map((alt) => (
                  <div key={alt.model.id} className="border border-border rounded-lg p-4 flex items-center justify-between gap-4" data-testid={`alt-${alt.model.id}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-foreground text-sm">{alt.model.name}</p>
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded font-medium">
                          Save {alt.savingsPercent.toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{alt.model.provider} · {alt.tradeOff}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-foreground text-sm">{formatCost(alt.estimatedCost)}/mo</p>
                      <p className="text-xs text-green-600 dark:text-green-400">−{formatCost(alt.savings)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="flex items-center gap-3">
            <button
              onClick={copyShareLink}
              className="text-sm border border-border rounded-lg px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              data-testid="share-btn"
            >
              {copied ? "Copied!" : "Copy Share Link"}
            </button>
            <Link
              href="/decision-engine"
              className="text-sm text-primary hover:underline"
            >
              Try the Decision Engine instead →
            </Link>
          </div>
        </div>
      )}

      {/* Info section */}
      <div className="mt-10 border-t border-border pt-8">
        <h2 className="font-semibold text-foreground mb-3">How are costs calculated?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          API costs are calculated as: (input tokens / 1000 × input cost per 1K) + (output tokens / 1000 × output cost per 1K). Subscription costs are flat monthly fees regardless of usage.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          1 token ≈ 0.75 words ≈ 4 characters of English text. <Link href="/guides/token-cost-explained" className="text-primary hover:underline">Learn more about tokens →</Link>
        </p>
      </div>
    </div>
  );
}
