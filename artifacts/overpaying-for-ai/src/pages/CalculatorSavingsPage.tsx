import { useEffect } from "react";
import { Link } from "wouter";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { trackCalculatorStart, trackInternalLinkClick } from "@/utils/analytics";

const EXAMPLE_SCENARIOS = [
  {
    label: "Solo subscriber",
    description:
      "Paying $20/month for ChatGPT Plus or Claude Pro but using it only a few times per week.",
    insight: "The free tier may cover your needs — potential $20/month saved with no capability loss.",
  },
  {
    label: "Freelancer paying for multiple tools",
    description:
      "Paying for ChatGPT Plus + Claude Pro + Perplexity Pro = $60+/month across three subscriptions.",
    insight:
      "Consolidating to one subscription plus occasional API access often cuts costs 50–70%.",
  },
  {
    label: "Small team with individual seats",
    description:
      "Three to five team members each paying $20–25/month for separate AI subscriptions.",
    insight: "A shared API setup frequently costs less per month than a single team subscription.",
  },
  {
    label: "Developer running premium models by default",
    description:
      "Routing all requests through GPT-4o or Claude Sonnet regardless of task complexity.",
    insight:
      "Routing routine tasks to GPT-4o mini or Gemini 1.5 Flash cuts token costs 70–95% with minimal quality loss.",
  },
];

const PAGE_INTERNAL_LINKS = [
  { href: "/calculator", text: "AI Cost Calculator" },
  { href: "/pricing/chatgpt-pricing", text: "ChatGPT Pricing" },
  { href: "/pricing/claude-pricing", text: "Claude Pricing" },
  { href: "/pricing/gemini-pricing", text: "Gemini Pricing" },
  { href: "/compare/chatgpt-vs-claude", text: "ChatGPT vs Claude" },
  { href: "/compare/chatgpt-vs-gemini", text: "ChatGPT vs Gemini" },
  { href: "/compare/claude-vs-gemini", text: "Claude vs Gemini" },
  { href: "/worth-it/which-ai-subscription-is-worth-paying-for", text: "Which AI Subscription Is Worth It?" },
];

export function CalculatorSavingsPage() {
  useEffect(() => {
    trackCalculatorStart({
      pageSlug: "ai-savings-calculator",
      pageType: "calculator",
      sourceComponent: "CalculatorSavingsPage",
    });
  }, []);

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <PageSeo
        title="AI Savings Calculator — Estimate What You're Overpaying | OverpayingForAI"
        description="Use the AI Savings Calculator to estimate what you could save by switching AI tools, consolidating subscriptions, or routing tasks to cheaper models. Free and instant."
        canonicalUrl="/calculator/ai-savings-calculator"
      />

      <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link href="/calculator" className="hover:text-foreground transition-colors">Calculator</Link>
        <span>/</span>
        <span className="text-foreground">AI Savings Calculator</span>
      </nav>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
          Calculator
        </span>
        <span className="text-xs text-muted-foreground">Last updated: April 2026</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-4">AI Savings Calculator</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Estimate how much you're spending on AI tools — and what you could save by switching,
        consolidating subscriptions, or routing tasks to cheaper models.
      </p>

      <div className="rounded-lg bg-primary/5 border border-primary/20 p-6 mb-10">
        <h2 className="text-xl font-semibold mb-2">Calculate your actual AI cost</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select your model, enter your monthly token usage (or choose a preset), and see your
          estimated spend — plus cheaper alternatives if any exist.
        </p>
        <Link
          href="/calculator"
          onClick={() =>
            trackInternalLinkClick({
              pageSlug: "ai-savings-calculator",
              pageType: "calculator",
              ctaLabel: "Open AI Cost Calculator",
              destinationSlug: "/calculator",
            })
          }
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded font-medium hover:opacity-90 transition-opacity"
        >
          Open AI Cost Calculator →
        </Link>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">What the calculator estimates</h2>
        <ul className="space-y-3">
          {[
            "Your monthly AI spend based on actual token usage — input and output separately",
            "Whether a flat $20/month subscription or pay-per-token API access is cheaper for your pattern",
            "Cheaper model alternatives that match your quality bar at a lower cost",
            "The break-even point between subscription and API access for common AI models",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-sm">
              <span className="text-primary shrink-0 mt-0.5">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-1">Common overpaying scenarios</h2>
        <p className="text-sm text-muted-foreground mb-4">
          These are the most common patterns where users pay more than necessary. Use the
          calculator to check which applies to you.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EXAMPLE_SCENARIOS.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-muted/20 p-4">
              <h3 className="font-semibold text-sm mb-1">{s.label}</h3>
              <p className="text-xs text-muted-foreground mb-2">{s.description}</p>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {s.insight}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10 bg-muted/20 rounded-lg p-5 border border-border">
        <h2 className="text-base font-semibold mb-3">Assumptions and limitations</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            • Estimates use publicly available token pricing as of April 2026. Prices change — verify
            with each provider before making financial decisions.
          </li>
          <li>
            • Actual costs depend on prompt length, conversation structure, and model version.
            Use the calculator as a directional estimate, not a guarantee.
          </li>
          <li>
            • Flat-rate subscriptions have "fair use" rate limits. The calculator does not model
            rate-limit behavior.
          </li>
          <li>
            • Cheaper models may require more prompting or produce lower-quality output on complex
            tasks. Quality differences are not quantified here.
          </li>
          <li>
            • API cost estimates assume direct integration without third-party markup or middleware
            costs.
          </li>
        </ul>
      </section>

      <InternalLinks
        links={PAGE_INTERNAL_LINKS}
        heading="Related pricing and comparisons"
        trackingContext={{ pageSlug: "ai-savings-calculator", pageType: "calculator" }}
      />

      <p className="text-xs text-muted-foreground mt-8 pt-6 border-t border-border">
        Pricing estimates based on publicly available rates as of April 2026. This page is for
        informational purposes only and does not guarantee specific savings. Some links may be
        affiliate links —{" "}
        <Link href="/affiliate-disclosure" className="underline hover:text-foreground">
          see our disclosure
        </Link>
        .
      </p>
    </article>
  );
}
