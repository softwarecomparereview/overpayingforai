interface SeoContentBlockProps {
  audience?: string;
  notFor?: string;
  pricingInsight?: string;
  alternatives?: string;
  verdict?: string;
  className?: string;
}

const DEFAULTS = {
  audience: "Developers, startups, and teams who want to reduce their AI API or subscription costs without sacrificing quality.",
  notFor: "Users who need real-time data, image generation, or proprietary enterprise integrations may need more specialised tools.",
  pricingInsight: "AI pricing varies widely — some models charge per token while others use flat subscriptions. Token-based APIs are usually cheaper for moderate usage, while subscriptions suit power users with high and consistent volume.",
  alternatives: "Consider DeepSeek V3 for cost-effective coding and writing, Gemini Flash for fast tasks, or Claude Haiku for lightweight structured work. Use the calculator to compare your specific usage.",
  verdict: "The cheapest AI tool is the one that fits your exact workload. Use the cost calculator and decision engine on this site to find your optimal stack — most users can cut AI spend by 50% or more.",
};

/**
 * SeoContentBlock — reusable content block for indexing boost.
 * Adds authoritative on-page content covering audience, caveats, pricing,
 * alternatives, and a final verdict. Inject above footer on any page.
 */
export function SeoContentBlock({
  audience,
  notFor,
  pricingInsight,
  alternatives,
  verdict,
  className = "",
}: SeoContentBlockProps) {
  return (
    <section className={`border-t border-border bg-slate-50 py-12 ${className}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Editorial context
        </p>
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-foreground mb-2">Who is this for?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {audience ?? DEFAULTS.audience}
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground mb-2">When NOT to use this</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {notFor ?? DEFAULTS.notFor}
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground mb-2">Pricing insights</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {pricingInsight ?? DEFAULTS.pricingInsight}
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground mb-2">Alternatives to consider</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {alternatives ?? DEFAULTS.alternatives}
            </p>
          </div>

          <div className="border border-border bg-white rounded-xl p-5">
            <h2 className="text-base font-bold text-foreground mb-2">Final verdict</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {verdict ?? DEFAULTS.verdict}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
