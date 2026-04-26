import { Link } from "wouter";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { trackCalculatorStart, trackInternalLinkClick } from "@/utils/analytics";

const USE_CASES = [
  {
    need: "Writing, editing, and long documents",
    pick: "Claude Pro",
    why: "Best prose quality and 200K context window for long documents",
    price: "$20/month",
    href: "/pricing/claude-pricing",
  },
  {
    need: "Coding and software development",
    pick: "Cursor Pro",
    why: "IDE-native AI with codebase context — pays for itself in hours",
    price: "$20/month",
    href: "/best/best-ai-tools-for-developers",
  },
  {
    need: "Research and sourced answers",
    pick: "Perplexity Pro",
    why: "Real-time web search with citations built into every answer",
    price: "$20/month",
    href: "/worth-it/which-ai-subscription-is-worth-paying-for",
  },
  {
    need: "General AI — writing, browsing, image generation",
    pick: "ChatGPT Plus",
    why: "Best breadth: GPT-4o, DALL-E 3, browsing, and custom GPTs",
    price: "$20/month",
    href: "/pricing/chatgpt-pricing",
  },
  {
    need: "Google Workspace (Gmail, Docs, Sheets)",
    pick: "Gemini Advanced",
    why: "Native integration across Google apps; verify current storage bundle",
    price: "$20/month",
    href: "/pricing/gemini-pricing",
  },
  {
    need: "API integration and cost control",
    pick: "DeepSeek V3 or Gemini Flash",
    why: "Near-frontier quality at $0.27–$0.0003/1M tokens respectively",
    price: "~$1–5/month typical",
    href: "/calculator",
  },
];

const BUDGET_TIERS = [
  {
    budget: "Free",
    pick: "ChatGPT Free or Gemini Free",
    detail: "Both cover casual and occasional AI use at $0. Start here — upgrade only after consistently hitting rate limits.",
    ctaHref: "/compare/chatgpt-free-vs-plus",
    ctaLabel: "ChatGPT Free vs Plus →",
  },
  {
    budget: "Around $20/month",
    pick: "One subscription matching your dominant use case",
    detail: "ChatGPT Plus (breadth), Claude Pro (writing), Cursor Pro (coding), Gemini Advanced (Google Workspace). Never pay for two unless they serve completely different workflows.",
    ctaHref: "/worth-it/which-ai-subscription-is-worth-paying-for",
    ctaLabel: "Compare all subscriptions →",
  },
  {
    budget: "Usage-based / API",
    pick: "DeepSeek V3, Gemini 1.5 Flash, or GPT-4o Mini",
    detail: "Technical users who can integrate via API can access frontier-quality AI for $1–5/month. The cheapest route to near-unlimited AI usage.",
    ctaHref: "/pricing/cheapest-ai-tools",
    ctaLabel: "See cheapest AI tools →",
  },
  {
    budget: "Team budget",
    pick: "ChatGPT Team or Anthropic for Work",
    detail: "Team plans add shared management and higher rate limits. Only worth it over individual subscriptions if you have 3+ users with regular AI needs.",
    ctaHref: "/calculator",
    ctaLabel: "Calculate team cost →",
  },
];

const MISTAKES = [
  "Paying for two AI subscriptions before exhausting one — the overlap between ChatGPT Plus, Claude Pro, and Gemini Advanced is 80%+.",
  "Upgrading to a paid plan before testing the free tier for at least two weeks.",
  "Choosing a tool based on marketing or benchmarks instead of your actual daily workflow.",
  "Paying for Gemini Advanced without checking whether you already have it via an existing Google One subscription.",
  "Subscribing to a team plan for 1–2 users — individual subscriptions are almost always cheaper.",
  "Paying for API access without understanding token costs — use the calculator to estimate before integrating.",
];

const QUICK_MATRIX = [
  { role: "Freelancer (writing/content)", pick: "Claude Pro or ChatGPT Plus", budget: "$20/mo", compare: "/best/best-ai-tools-for-freelancers" },
  { role: "Startup founder", pick: "Claude Pro + Perplexity free tier", budget: "$20/mo", compare: "/best/best-ai-tools-for-founders" },
  { role: "Developer (IDE)", pick: "Cursor Pro", budget: "$20/mo", compare: "/best/best-ai-tools-for-developers" },
  { role: "Google Workspace user", pick: "Gemini Advanced (check if included)", budget: "$20/mo", compare: "/compare/gemini-free-vs-paid" },
  { role: "Casual / occasional user", pick: "ChatGPT Free or Gemini Free", budget: "$0", compare: "/compare/chatgpt-free-vs-plus" },
  { role: "Technical / API builder", pick: "DeepSeek V3 or Gemini Flash API", budget: "~$1–5/mo", compare: "/pricing/cheapest-ai-tools" },
  { role: "Researcher / fact-checker", pick: "Perplexity Pro", budget: "$20/mo", compare: "/worth-it/which-ai-subscription-is-worth-paying-for" },
];

const PAGE_INTERNAL_LINKS = [
  { href: "/pricing/chatgpt-pricing", text: "ChatGPT Pricing" },
  { href: "/pricing/claude-pricing", text: "Claude Pricing" },
  { href: "/pricing/gemini-pricing", text: "Gemini Pricing" },
  { href: "/compare/chatgpt-vs-claude", text: "ChatGPT vs Claude" },
  { href: "/compare/chatgpt-vs-gemini", text: "ChatGPT vs Gemini" },
  { href: "/compare/claude-vs-gemini", text: "Claude vs Gemini" },
  { href: "/worth-it/is-chatgpt-plus-worth-it", text: "Is ChatGPT Plus Worth It?" },
  { href: "/worth-it/which-ai-subscription-is-worth-paying-for", text: "Which AI Subscription Is Worth It?" },
  { href: "/calculator/ai-savings-calculator", text: "AI Savings Calculator" },
  { href: "/alternatives/best-chatgpt-alternatives", text: "Best ChatGPT Alternatives" },
];

export function DecisionBuyPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <PageSeo
        title="Which AI Tool Should I Buy? — 2026 Decision Guide | OverpayingForAI"
        description="Not sure which AI tool to buy? This guide helps you pick the right AI subscription or plan based on your use case, budget, and workflow — without overpaying."
        canonicalUrl="/decision/which-ai-tool-should-i-buy"
      />

      <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Which AI Should I Buy?</span>
      </nav>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
          Decision Guide
        </span>
        <span className="text-xs text-muted-foreground">Last updated: April 2026</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold mb-4">Which AI Tool Should I Buy?</h1>
      <p className="text-lg text-muted-foreground mb-2">
        Most people overpay for AI by subscribing to the wrong tool, subscribing to two tools when one would do, or upgrading before they've confirmed they actually need to.
      </p>
      <p className="text-base text-muted-foreground mb-8">
        This guide skips the hype and gives you a direct answer based on your use case and budget.
      </p>

      <div className="rounded-lg bg-primary/5 border border-primary/20 p-5 mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Before you buy anything</p>
        <p className="text-sm text-foreground leading-relaxed mb-3">
          Try the free tier of your top candidate for two full weeks. All major AI tools (ChatGPT, Claude, Gemini) have free tiers that cover casual use. Only subscribe after you've hit the rate limits at least twice in a week during normal work.
        </p>
        <Link
          href="/calculator"
          onClick={() => trackCalculatorStart({ pageSlug: "which-ai-tool-should-i-buy", pageType: "decision", sourceComponent: "DecisionBuyPage/HeroCta" })}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Calculate your actual AI cost →
        </Link>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-1">Choose by use case</h2>
        <p className="text-sm text-muted-foreground mb-5">Find your primary daily task. The right tool is the one that serves your dominant use case — not every possible use case.</p>
        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
          {USE_CASES.map((uc) => (
            <div key={uc.need} className="grid sm:grid-cols-[1fr_auto] gap-3 px-5 py-4 bg-card hover:bg-muted/20 transition-colors">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{uc.need}</p>
                <p className="font-semibold text-foreground text-sm">{uc.pick}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{uc.why}</p>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                <span className="text-sm font-medium text-primary whitespace-nowrap">{uc.price}</span>
                <Link
                  href={uc.href}
                  onClick={() => trackInternalLinkClick({ pageSlug: "which-ai-tool-should-i-buy", pageType: "decision", ctaLabel: uc.pick, destinationSlug: uc.href })}
                  className="text-xs text-primary hover:underline whitespace-nowrap"
                >
                  See details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-1">Choose by budget</h2>
        <p className="text-sm text-muted-foreground mb-5">Every budget has a right answer. The goal is to avoid paying for more than you use.</p>
        <div className="space-y-4">
          {BUDGET_TIERS.map((tier) => (
            <div key={tier.budget} className="border border-border rounded-xl p-5 bg-card">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">{tier.budget}</span>
                <span className="font-semibold text-sm text-foreground">{tier.pick}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{tier.detail}</p>
              <Link
                href={tier.ctaHref}
                onClick={() => trackInternalLinkClick({ pageSlug: "which-ai-tool-should-i-buy", pageType: "decision", ctaLabel: tier.ctaLabel, destinationSlug: tier.ctaHref })}
                className="text-xs font-medium text-primary hover:underline"
              >
                {tier.ctaLabel}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-1">Quick recommendation matrix</h2>
        <p className="text-sm text-muted-foreground mb-5">One-line answers by role.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your role</th>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Best pick</th>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Budget</th>
                <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {QUICK_MATRIX.map((row) => (
                <tr key={row.role} className="hover:bg-muted/20">
                  <td className="py-3 pr-4 text-foreground font-medium">{row.role}</td>
                  <td className="py-3 pr-4 text-foreground">{row.pick}</td>
                  <td className="py-3 pr-4 text-primary font-medium whitespace-nowrap">{row.budget}</td>
                  <td className="py-3">
                    <Link
                      href={row.compare}
                      onClick={() => trackInternalLinkClick({ pageSlug: "which-ai-tool-should-i-buy", pageType: "decision", ctaLabel: row.role, destinationSlug: row.compare })}
                      className="text-xs text-primary hover:underline"
                    >
                      Compare →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Common overpaying mistakes</h2>
        <ul className="space-y-3">
          {MISTAKES.map((m, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-destructive shrink-0 mt-0.5 font-bold">✕</span>
              <span className="text-muted-foreground">{m}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="rounded-lg bg-muted/30 border border-border p-6 mb-10">
        <h2 className="text-base font-semibold mb-2">Still not sure? Use the calculator.</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your token usage or subscription spend and see whether you're getting good value — or overpaying. Free, no signup.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/calculator/ai-savings-calculator"
            onClick={() => trackCalculatorStart({ pageSlug: "which-ai-tool-should-i-buy", pageType: "decision", sourceComponent: "DecisionBuyPage/BottomCta" })}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded font-medium text-sm hover:opacity-90 transition-opacity"
          >
            AI Savings Calculator →
          </Link>
          <Link
            href="/calculator"
            onClick={() => trackInternalLinkClick({ pageSlug: "which-ai-tool-should-i-buy", pageType: "decision", ctaLabel: "AI Cost Calculator", destinationSlug: "/calculator" })}
            className="inline-flex items-center gap-2 border border-border px-5 py-2.5 rounded font-medium text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            AI Cost Calculator
          </Link>
        </div>
      </div>

      <InternalLinks
        links={PAGE_INTERNAL_LINKS}
        heading="Detailed pricing and comparisons"
        trackingContext={{ pageSlug: "which-ai-tool-should-i-buy", pageType: "decision" }}
      />

      <p className="text-xs text-muted-foreground mt-8 pt-6 border-t border-border">
        Pricing based on publicly available rates as of April 2026. Verify current pricing with each provider before subscribing. Some links may be affiliate links —{" "}
        <Link href="/affiliate-disclosure" className="underline hover:text-foreground">see our disclosure</Link>.
      </p>
    </article>
  );
}
