import { Link } from "wouter";
import type { CalculatorResult } from "@/engine/types";
import { freshnessLabel, isPricingStale } from "@/utils/pricingFreshness";

export function SavingsReport({
  result,
  inputTokens,
  outputTokens,
  onClose,
}: {
  result: CalculatorResult;
  inputTokens: number;
  outputTokens: number;
  onClose: () => void;
}) {
  const freshnessDate = result.model.last_updated;
  const stale = freshnessDate ? isPricingStale(freshnessDate) : false;
  const cheapest = result.cheaperAlternatives[0];
  const savingsPercent = result.estimatedMonthlyCost > 0 && result.savingsEstimate !== null
    ? (result.savingsEstimate / result.estimatedMonthlyCost) * 100
    : 0;

  return (
    <section className="mt-8 border border-border rounded-2xl bg-card p-6 sm:p-8 print-report" data-testid="savings-report">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Savings report</p>
          <h2 className="text-2xl font-bold text-foreground">AI cost decision report</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Based on your current calculator inputs and the selected model.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-sm border border-border rounded-lg px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors no-print"
          data-testid="close-report-btn"
        >
          Close report
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Input summary</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Model</dt>
                <dd className="text-foreground font-medium text-right">{result.model.name} · {result.model.provider}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Monthly input tokens</dt>
                <dd className="text-foreground font-medium">{inputTokens.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Monthly output tokens</dt>
                <dd className="text-foreground font-medium">{outputTokens.toLocaleString()}</dd>
              </div>
              {result.model.planType === "api" && (
                <>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Input cost</dt>
                    <dd className="text-foreground font-medium">${result.inputCost.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Output cost</dt>
                    <dd className="text-foreground font-medium">${result.outputCost.toFixed(2)}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>

          <div className="border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Estimated cost summary</h3>
            <div className="flex items-end justify-between gap-4 mb-3">
              <div>
                <p className="text-sm text-muted-foreground">Projected monthly cost</p>
                <p className="text-3xl font-bold text-foreground">${result.estimatedMonthlyCost.toFixed(2)}</p>
              </div>
              {result.savingsEstimate !== null && result.savingsEstimate > 0 && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Estimated savings</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">-${result.savingsEstimate.toFixed(2)}</p>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.recommendation}</p>
          </div>

          <div className="border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Assumptions</h3>
            <ul className="text-sm text-muted-foreground space-y-2 leading-relaxed list-disc pl-5">
              <li>Based on current pricing data and the calculator inputs above.</li>
              <li>Actual spend may differ with usage spikes, retries, or vendor pricing changes.</li>
              <li>Review pricing directly with the provider before making purchasing decisions.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-border rounded-xl p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-1">Recommended option</h3>
                <p className="text-lg font-bold text-foreground">{result.model.name}</p>
                <p className="text-sm text-muted-foreground">{result.model.provider}</p>
              </div>
              {result.model.hasFreeTier && (
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded font-medium">Free tier</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{result.recommendation}</p>
            <div className={`flex items-center gap-2 text-xs ${stale ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${stale ? "bg-amber-500" : "bg-green-500"}`} />
              <span>{freshnessDate ? freshnessLabel(freshnessDate) : "Pricing freshness unavailable"}</span>
              {stale && <span>· Pricing may have changed. Verify with provider.</span>}
            </div>
          </div>

          <div className="border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Comparison table</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Option</span>
                <span>Monthly cost</span>
                <span>Savings</span>
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center border-t border-border pt-3 text-sm">
                <span className="font-medium text-foreground">{result.model.name}</span>
                <span className="font-mono text-foreground">${result.estimatedMonthlyCost.toFixed(2)}</span>
                <span className="text-muted-foreground">Baseline</span>
              </div>
              {result.cheaperAlternatives.slice(0, 3).map((alt) => (
                <div key={alt.model.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center border-t border-border pt-3 text-sm">
                  <span className="font-medium text-foreground">{alt.model.name}</span>
                  <span className="font-mono text-foreground">${alt.estimatedCost.toFixed(2)}</span>
                  <span className="text-green-600 dark:text-green-400">{alt.savingsPercent.toFixed(0)}%</span>
                </div>
              ))}
            </div>
            {cheapest && (
              <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                Lowest-cost alternative in the current output: {cheapest.model.name}.
              </p>
            )}
          </div>

          <div className="border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Savings summary</h3>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Estimated savings amount</p>
                <p className="text-2xl font-bold text-foreground">${result.savingsEstimate !== null ? result.savingsEstimate.toFixed(2) : "0.00"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Estimated savings percentage</p>
                <p className="text-2xl font-bold text-foreground">{savingsPercent.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">Pricing freshness</h3>
            {freshnessDate ? (
              <div className={`text-sm flex items-center gap-2 ${stale ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${stale ? "bg-amber-500" : "bg-green-500"}`} />
                <span>{freshnessLabel(freshnessDate)}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Pricing freshness unavailable.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3 no-print">
        <button onClick={() => window.print()} className="text-sm border border-border rounded-lg px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Print / Save PDF</button>
        <Link href="/calculator" className="text-sm text-primary hover:underline">Back to calculator</Link>
      </div>
    </section>
  );
}
