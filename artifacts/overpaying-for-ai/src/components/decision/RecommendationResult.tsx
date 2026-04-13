import { Link } from "wouter";
import type { DecisionResult } from "@/types/decision";
import type { AffiliateTarget } from "@/utils/affiliateMap";

interface RecommendationResultProps {
  result: DecisionResult;
  affiliateTarget?: AffiliateTarget | null;
}

export function RecommendationResult({ result, affiliateTarget }: RecommendationResultProps) {
  const primaryHref = affiliateTarget?.url ?? affiliateTarget?.fallbackInternalUrl ?? "/calculator";
  const isExternal = !!(affiliateTarget?.url);

  const heading =
    result.monthlySavings > 0
      ? `You could be overpaying by $${result.monthlySavings.toFixed(0)}/month`
      : "Your current setup looks cost-efficient";

  return (
    <div className="border border-border rounded-xl p-6 bg-card" data-testid="decision-result">
      <h2 className="text-xl font-bold text-foreground mb-1">{heading}</h2>
      {result.monthlySavings > 0 && (
        <p className="text-sm text-muted-foreground mb-6">
          Switching to the recommended setup could save you approximately {result.savingsPercent}% per month.
        </p>
      )}

      <div className="border border-primary/20 bg-primary/5 rounded-lg p-5 mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Best setup for you</p>
        <div className="space-y-2">
          <div className="flex gap-3 text-sm">
            <span className="text-muted-foreground w-16 flex-shrink-0">Tool</span>
            <span className="font-medium text-foreground">{result.recommendedTool}</span>
          </div>
          <div className="flex gap-3 text-sm">
            <span className="text-muted-foreground w-16 flex-shrink-0">Model</span>
            <span className="font-medium text-foreground">{result.recommendedModelName}</span>
          </div>
          <div className="flex gap-3 text-sm">
            <span className="text-muted-foreground w-16 flex-shrink-0">Setup</span>
            <span className="font-medium text-foreground">{result.setupType}</span>
          </div>
          <div className="flex gap-3 text-sm">
            <span className="text-muted-foreground w-16 flex-shrink-0">Why</span>
            <span className="text-foreground leading-relaxed">{result.rationale}</span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="border border-border rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Estimated monthly cost</p>
          <p className="text-2xl font-bold text-foreground">${result.estimatedCost.toFixed(0)}</p>
        </div>
        <div className="border border-border rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Typical current spend</p>
          <p className="text-2xl font-bold text-foreground">${result.currentCost.toFixed(0)}</p>
        </div>
        <div className="border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900 rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Estimated savings</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">
            {result.monthlySavings > 0 ? `$${result.monthlySavings.toFixed(0)}/mo` : "—"}
          </p>
        </div>
      </div>

      {result.secondaryOption && (
        <p className="text-xs text-muted-foreground mb-4">
          Alternative: <span className="font-medium text-foreground">{result.secondaryOption}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        {isExternal ? (
          <a
            href={primaryHref}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Switch to the cheaper setup →
          </a>
        ) : (
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            See the lower-cost option →
          </Link>
        )}
        <Link
          href="/calculator"
          className="inline-flex items-center gap-1.5 border border-border text-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          Calculate exact cost
        </Link>
      </div>

      <div className="border-t border-border pt-4 space-y-1">
        <p className="text-xs text-muted-foreground">
          These recommendations are based on use case, usage level, and cost sensitivity.
        </p>
        <p className="text-xs text-muted-foreground">
          Savings are directional estimates, not provider quotes. Prices are based on the latest available provider data.
        </p>
      </div>
    </div>
  );
}
