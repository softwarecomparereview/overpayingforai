import { Link } from "wouter";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { SeoContentBlock } from "@/components/seo/SeoContentBlock";
import { ModelsPricingTable } from "@/components/pricing/ModelsPricingTable";
import { PricingFreshnessBadge } from "@/components/pricing/PricingFreshnessBadge";
import { LatestCostInsights } from "@/components/pricing/LatestCostInsights";
import { getLivePricingSnapshot } from "@/data/livePricingStore";
import { generatePricingInsights, generateCategoryInsights } from "@/utils/insights";
import { getCheapestModel } from "@/utils/pricingEngine";
import type { ModelCategory } from "@/types/pricing";

const CATEGORIES: { key: ModelCategory; label: string }[] = [
  { key: "general", label: "General AI" },
  { key: "coding", label: "Coding" },
  { key: "writing", label: "Writing" },
  { key: "research", label: "Research" },
  { key: "productivity", label: "Productivity" },
  { key: "customer-support", label: "Customer Support" },
];

const INTERNAL_LINKS = [
  { href: "/best", text: "Best AI tools by use case" },
  { href: "/calculator", text: "AI cost calculator" },
  { href: "/ai-types", text: "AI types explained" },
  { href: "/compare/gpt-4o-vs-gpt-4o-mini-cost", text: "GPT-4o vs GPT-4o Mini cost comparison" },
  { href: "/compare/deepseek-vs-gpt4o-cost", text: "DeepSeek V3 vs GPT-4o" },
  { href: "/compare/claude-vs-gpt-cost", text: "Claude vs GPT cost comparison" },
  { href: "/decision-engine", text: "AI decision engine" },
];

export function ModelsPage() {
  const snapshot = getLivePricingSnapshot();
  const insights = generatePricingInsights(snapshot);
  const categoryInsights = generateCategoryInsights(snapshot);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <PageSeo
        title="AI Model Pricing — Full Cost Comparison Table | OverpayingForAI"
        description="Complete pricing table for all major AI models including GPT-4o, Claude, Gemini, DeepSeek and more. Find the cheapest model for your use case and see cost-per-token for every option."
      />

      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span>AI Model Pricing</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">AI Model Pricing — Complete Cost Reference</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          A comprehensive, regularly reviewed pricing table for every major AI model and provider.
          Use this page to find the cheapest model for your specific use case, compare token costs across
          providers, and identify where you're likely overpaying.
        </p>
        <PricingFreshnessBadge lastUpdated={snapshot.lastUpdated} />
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-5 mb-10 text-sm text-foreground leading-relaxed">
        <p>
          Most AI cost problems come from a single bad default: using GPT-4o or Claude Sonnet for every task,
          regardless of what the task actually needs. The models below span a {">"}100× price range — meaning
          the same workflow can cost $1 or $100 per month depending on which model handles it.
          This page gives you the data to make that call correctly.
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          Prices are estimates based on the latest available provider data. Recommendations depend on use case,
          usage level, and budget sensitivity. Verify with provider before committing.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2">Pricing by Model</h2>
        <p className="text-sm text-muted-foreground mb-5">
          All API-priced models sorted from cheapest to most expensive by combined token cost.
          Subscription-only models (flat monthly fee) are excluded from this table.
        </p>
        <ModelsPricingTable snapshot={snapshot} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">Cheapest Models by Category</h2>
        <p className="text-sm text-muted-foreground mb-5">
          The lowest-cost option currently available for each major use case category, based on combined input + output token pricing.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {CATEGORIES.map(({ key, label }) => {
            const cheapest = getCheapestModel({ category: key, snapshot });
            const catInsights = categoryInsights[key] ?? [];
            if (!cheapest) return null;
            return (
              <div key={key} className="border border-border rounded-lg p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
                <p className="font-semibold text-foreground mb-1">{cheapest.displayName}</p>
                <p className="text-sm text-muted-foreground mb-2">{cheapest.provider}</p>
                <div className="text-sm space-y-1">
                  <p className="text-foreground">
                    Output: <strong>${(cheapest.outputCostPer1k * 1000).toFixed(4)}/1M tokens</strong>
                  </p>
                  <p className="text-foreground">
                    Input: <strong>${(cheapest.inputCostPer1k * 1000).toFixed(4)}/1M tokens</strong>
                  </p>
                </div>
                {catInsights[0] && (
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{catInsights[0]}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <LatestCostInsights insights={insights} />

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-4">How to use this data to reduce AI spend</h2>
        <div className="prose prose-sm max-w-none text-foreground space-y-4">
          <p>
            The single highest-impact action most teams can take is <strong>routing tasks to smaller models</strong>.
            GPT-4o and Claude Sonnet are excellent, but they're built for complex reasoning tasks — not for
            classification, summarization, or simple chat. Running lightweight tasks on a model like GPT-4o Mini
            or Gemini 1.5 Flash can reduce per-task costs by 90% or more without measurable quality impact.
          </p>
          <p>
            The second most impactful change is <strong>switching from subscription to API pricing</strong> if
            you're a developer or power user. A $20/month ChatGPT Plus subscription is good value for moderate
            conversational use, but if you're building or automating, you're almost always better off on the API —
            where you pay only for what you use.
          </p>
          <p>
            The third lever is <strong>provider diversification</strong>. DeepSeek V3 and Gemini Flash deliver
            near-frontier quality at prices that are 10–20× lower than the flagship models. For non-critical
            workflows, the performance gap doesn't justify the cost premium.
          </p>
          <p>
            Use the calculator below to model your specific usage, or run the decision engine to get a
            personalized recommendation based on your use case and usage level.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            href="/calculator"
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Calculate your exact cost →
          </Link>
          <Link
            href="/decision-engine"
            className="inline-flex items-center gap-1.5 border border-border text-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            Use the decision engine
          </Link>
        </div>
      </section>

      <SeoContentBlock />
      <InternalLinks links={INTERNAL_LINKS} />
    </article>
  );
}
