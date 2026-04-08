import { Link } from "wouter";
import comparisonsData from "@/data/comparisons.json";
import bestOfData from "@/data/best-of.json";
import guidesData from "@/data/guides.json";
import faqsData from "@/data/faqs.json";
import modelsData from "@/data/models.json";
import type { AIModel } from "@/engine/types";

const models = modelsData as AIModel[];
const comparisons = comparisonsData.slice(0, 6);
const bestOf = bestOfData.slice(0, 4);
const guides = guidesData.slice(0, 4);
const faqs = faqsData.slice(0, 6);

const topModels = models
  .filter((m) => m.planType === "api")
  .sort((a, b) => b.costScore - a.costScore)
  .slice(0, 5);

export function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-muted text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
            Updated April 2025 · 20 models tracked
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            Stop Overpaying for AI.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Find the cheapest viable AI stack for coding, writing, research, and automation. No hype, just numbers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/calculator"
              className="w-full sm:w-auto bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
              data-testid="hero-calculator-cta"
            >
              Calculate My Cost
            </Link>
            <Link
              href="/decision-engine"
              className="w-full sm:w-auto border border-border bg-background text-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:bg-muted transition-colors"
              data-testid="hero-engine-cta"
            >
              Find My AI Stack
            </Link>
          </div>
        </div>
      </section>

      {/* Why Most People Overpay */}
      <section className="bg-muted/30 border-b border-border py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-center mb-10">Why Most People Overpay for AI</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: "Default to expensive models",
                desc: "GPT-4o costs 33× more than GPT-4o mini per token. Most tasks don't need the difference.",
              },
              {
                title: "Wrong plan type",
                desc: "A $20 subscription covers ~1.3M tokens. Above that, the API is often cheaper with a budget model.",
              },
              {
                title: "No routing strategy",
                desc: "Routing simple tasks to cheap models, complex ones to premium, cuts costs 60-80% with no quality loss.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-background border border-border rounded-lg p-5">
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Under Budget */}
      <section className="py-16 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Cheapest Capable Models</h2>
            <Link href="/calculator" className="text-sm text-primary hover:underline">Compare all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="models-table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 font-medium text-muted-foreground">Model</th>
                  <th className="text-left py-3 pr-4 font-medium text-muted-foreground">Provider</th>
                  <th className="text-right py-3 pr-4 font-medium text-muted-foreground">Input /1M</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">Output /1M</th>
                </tr>
              </thead>
              <tbody>
                {topModels.map((m) => (
                  <tr key={m.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors" data-testid={`model-row-${m.id}`}>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-foreground">{m.name}</p>
                      {m.hasFreeTier && <span className="text-xs text-green-600 dark:text-green-400">free tier</span>}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{m.provider}</td>
                    <td className="py-3 pr-4 text-right text-foreground font-mono">
                      ${(m.inputCostPer1k * 1000).toFixed(3)}
                    </td>
                    <td className="py-3 text-right text-foreground font-mono">
                      ${(m.outputCostPer1k * 1000).toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Popular Comparisons */}
      <section className="py-16 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Popular Comparisons</h2>
            <Link href="/compare/claude-vs-gpt-cost" className="text-sm text-primary hover:underline">See all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisons.map((c) => (
              <Link key={c.slug} href={`/compare/${c.slug}`}>
                <div className="border border-border rounded-lg p-4 hover:border-primary/40 hover:bg-muted/30 transition-colors h-full" data-testid={`compare-card-${c.slug}`}>
                  <h3 className="font-semibold text-foreground text-sm mb-2 leading-snug">{c.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.summary.slice(0, 80)}…</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Lists */}
      <section className="py-16 border-b border-border bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Best AI Lists</h2>
            <Link href="/best/best-ai-under-20-per-month" className="text-sm text-primary hover:underline">See all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {bestOf.map((b) => (
              <Link key={b.slug} href={`/best/${b.slug}`}>
                <div className="border border-border bg-background rounded-lg p-5 hover:border-primary/40 hover:bg-muted/30 transition-colors h-full" data-testid={`best-card-${b.slug}`}>
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded mb-3 inline-block">
                    {b.category}
                  </span>
                  <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Guides */}
      <section className="py-16 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Latest Guides</h2>
            <Link href="/guides/how-to-reduce-ai-cost" className="text-sm text-primary hover:underline">See all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {guides.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`}>
                <div className="border border-border rounded-lg p-5 hover:border-primary/40 hover:bg-muted/30 transition-colors h-full" data-testid={`guide-card-${g.slug}`}>
                  <p className="text-xs text-muted-foreground mb-2">{g.readTime}</p>
                  <h3 className="font-semibold text-foreground mb-2">{g.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{g.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tools CTA */}
      <section className="py-16 border-b border-border bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-background border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-2">Cost Calculator</h2>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Enter your token usage and model. See the exact monthly cost and cheaper alternatives side by side.
              </p>
              <Link
                href="/calculator"
                className="inline-block bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                data-testid="calculator-cta"
              >
                Calculate Now →
              </Link>
            </div>
            <div className="bg-background border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold mb-2">Decision Engine</h2>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Answer 5 questions about your use case, budget, and quality needs. Get three ranked recommendations.
              </p>
              <Link
                href="/decision-engine"
                className="inline-block border border-border text-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
                data-testid="engine-cta"
              >
                Find My Stack →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((item, i) => (
              <div key={i} className="border border-border rounded-lg p-5" data-testid={`faq-${i}`}>
                <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
