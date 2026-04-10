import { useState } from "react";
import { Link } from "wouter";
import { track } from "@/utils/analytics";
import comparisonsData from "@/data/comparisons.json";
import bestOfData from "@/data/best-of.json";
import guidesData from "@/data/guides.json";
import faqsData from "@/data/faqs.json";

const comparisons = comparisonsData.slice(0, 6);
const bestOf = bestOfData.slice(0, 4);
const guides = guidesData.slice(0, 4);
const faqs = faqsData.slice(0, 6);

const SAVINGS_EXAMPLES = [
  {
    scenario: "GPT-4o → GPT-4o mini",
    usage: "2M output tokens/month",
    before: "$30.00",
    after: "$1.20",
    save: "$28.80",
    savePercent: "96%",
  },
  {
    scenario: "ChatGPT Plus → API (light use)",
    usage: "300K tokens/month",
    before: "$20.00",
    after: "$2.40",
    save: "$17.60",
    savePercent: "88%",
  },
  {
    scenario: "Claude Sonnet → DeepSeek V3",
    usage: "1M output tokens/month",
    before: "$15.00",
    after: "$1.10",
    save: "$13.90",
    savePercent: "93%",
  },
  {
    scenario: "Gemini Pro → Gemini Flash",
    usage: "5M input tokens/month",
    before: "$6.25",
    after: "$0.38",
    save: "$5.87",
    savePercent: "94%",
  },
];

const OVERPAY_PATTERNS = [
  {
    id: "subscription",
    label: "01",
    title: "The subscription trap",
    problem: "You pay $20/month for ChatGPT Plus but use it lightly. At your actual usage, the API costs $2.",
    fix: "Switch to API + GPT-4o mini. Same quality, 90% less.",
    metric: "$216/year",
    metricLabel: "average wasted on unused subscription capacity",
    before: { label: "ChatGPT Plus", cost: "$20/mo", type: "subscription" },
    after: { label: "GPT-4o mini API", cost: "$2/mo", type: "api" },
  },
  {
    id: "model",
    label: "02",
    title: "Using GPT-4o for everything",
    problem: "GPT-4o costs 33× more per token than GPT-4o mini. Summaries, classification, and Q&A don't need it.",
    fix: "Route simple tasks to mini. Reserve GPT-4o for complex reasoning only.",
    metric: "80%",
    metricLabel: "of API spending eliminated by model routing, zero quality change",
    before: { label: "GPT-4o", cost: "$15/1M out", type: "premium" },
    after: { label: "GPT-4o mini", cost: "$0.60/1M out", type: "budget" },
  },
  {
    id: "routing",
    label: "03",
    title: "No routing strategy",
    problem: "One model for every task means paying premium prices for tasks that don't need premium intelligence.",
    fix: "Classify tasks first. Use Gemini Flash or mini for bulk, escalate to Sonnet only when needed.",
    metric: "60–80%",
    metricLabel: "cost reduction with a two-tier routing strategy, reported by production teams",
    before: { label: "Flat: Claude Sonnet", cost: "$15/1M out", type: "premium" },
    after: { label: "Routed: Flash → Sonnet", cost: "$1.50/1M avg", type: "budget" },
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0" data-testid={`faq-${q.slice(0, 20)}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className="font-medium text-foreground text-sm sm:text-base leading-snug">{q}</span>
        <span className={`flex-shrink-0 mt-0.5 text-muted-foreground transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && (
        <p className="text-sm text-muted-foreground leading-relaxed pb-5">{a}</p>
      )}
    </div>
  );
}

function NavPill({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      onClick={() => track("section_nav_clicked", { section: href.replace("#", ""), sourceSurface: "home" })}
      className="block rounded-full border border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
    >
      {label}
    </a>
  );
}

export function Home() {
  return (
    <div className="bg-background">
      <aside className="hidden xl:flex fixed left-5 top-24 z-40">
        <div className="w-52 rounded-2xl border border-border bg-background/95 backdrop-blur p-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">Explore</p>
          <div className="space-y-1">
            <NavPill href="#calculator" label="Calculator" />
            <NavPill href="#scenarios" label="Usage Scenarios" />
            <NavPill href="#comparison" label="Compare Models" />
            <NavPill href="#savings" label="Savings Examples" />
            <NavPill href="#pricing" label="Pricing Data" />
            <NavPill href="#faq" label="FAQs" />
          </div>
        </div>
      </aside>
      <div className="xl:hidden sticky top-14 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto">
          <NavPill href="#calculator" label="Calculator" />
          <NavPill href="#scenarios" label="Scenarios" />
          <NavPill href="#comparison" label="Compare" />
          <NavPill href="#savings" label="Savings" />
          <NavPill href="#faq" label="FAQs" />
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              20 models tracked · Updated April 2025
            </span>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05] mb-6">
              Stop overpaying<br />for AI.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mb-10">
              A decision engine for developers and teams who want the cheapest viable AI stack — not a roundup of the flashiest models.
            </p>

            {/* CTA Cards */}
            <div className="grid sm:grid-cols-3 gap-3">
              <Link href="/calculator" data-testid="hero-cta-calculator">
                <div className="group bg-primary text-primary-foreground rounded-xl p-5 h-full">
                  <div className="text-2xl font-bold mb-1 font-mono">$</div>
                  <p className="font-semibold text-sm mb-1">Calculate your AI cost</p>
                  <p className="text-xs text-primary-foreground/70 leading-relaxed">Enter your token usage. See exact monthly cost and cheaper alternatives.</p>
                </div>
              </Link>
              <Link href="/decision-engine" data-testid="hero-cta-engine">
                <div className="group border border-border bg-card rounded-xl p-5 h-full">
                  <div className="text-2xl font-bold mb-1 text-primary">→</div>
                  <p className="font-semibold text-sm mb-1 text-foreground">Find the cheapest stack</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">5 questions. Get three ranked recommendations matched to your budget.</p>
                </div>
              </Link>
              <Link href="/compare/claude-vs-gpt-cost" data-testid="hero-cta-compare">
                <div className="group border border-border bg-card rounded-xl p-5 h-full">
                  <div className="text-2xl font-bold mb-1 text-foreground">≈</div>
                  <p className="font-semibold text-sm mb-1 text-foreground">Compare tools and plans</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Side-by-side pricing for Claude, GPT-4o, Cursor, subscriptions vs API.</p>
                </div>
              </Link>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
              <div className="inline-flex items-center gap-2 text-muted-foreground bg-muted/60 px-3 py-2 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Pricing freshness is visible throughout the site
              </div>
              <a href="#what-youll-find" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                See real savings examples ↓
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="scenarios" className="border-b border-border bg-muted/15 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="border border-border rounded-xl bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">What you’ll find below</p>
              <p className="text-sm text-foreground leading-relaxed">Real savings examples, comparison snapshots, and guides that explain when cheaper models are enough.</p>
            </div>
            <div className="border border-border rounded-xl bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Latest pricing comparisons</p>
              <p className="text-sm text-foreground leading-relaxed">Side-by-side breakdowns for the models and subscriptions people actually use.</p>
            </div>
            <div className="border border-border rounded-xl bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Best AI by use case</p>
              <p className="text-sm text-foreground leading-relaxed">Shortlists for coding, budget planning, and lighter daily workflows.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="calculator" className="border-b border-border py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Calculator</p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Check your monthly spend</h2>
            </div>
            <Link href="/calculator" className="text-sm text-primary font-medium hover:underline">
              Calculate your savings →
            </Link>
          </div>
          <div className="border border-border rounded-xl bg-background p-4 text-sm text-muted-foreground leading-relaxed">
            Enter token usage to see the cheapest viable model for your workload.
          </div>
        </div>
      </section>

      {/* ── SAVINGS STRIP ────────────────────────────────────── */}
      <section id="savings" className="border-b border-border bg-muted/20 py-8 overflow-x-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-5">Real savings examples</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 min-w-[600px] sm:min-w-0">
            {SAVINGS_EXAMPLES.map((ex) => (
              <button
                key={ex.scenario}
                type="button"
                onClick={() => track("card_clicked", { sourceSurface: "home", cardType: "savings_example", label: ex.scenario })}
                className="text-left bg-background border border-border rounded-lg p-4 hover:border-primary/30 hover:bg-muted/20 transition-colors"
              >
                <p className="text-xs text-muted-foreground mb-1 leading-tight">{ex.scenario}</p>
                <p className="text-xs text-muted-foreground/60 mb-3">{ex.usage}</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl font-bold text-foreground font-mono">{ex.save}</span>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">/mo</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="line-through text-muted-foreground/60 font-mono">{ex.before}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-mono text-foreground">{ex.after}</span>
                  <span className="ml-auto bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded font-semibold text-xs">
                    -{ex.savePercent}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Link href="/calculator" className="text-sm text-primary font-medium hover:underline">
              Calculate your savings →
            </Link>
          </div>
        </div>
      </section>

      {/* ── THREE OVERPAYING PATTERNS ────────────────────────── */}
      <section id="pricing" className="border-b border-border py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Where the waste happens</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              Three ways teams<br />overpay for AI.
            </h2>
          </div>

          <div className="space-y-4">
            {OVERPAY_PATTERNS.map((p) => (
              <button key={p.id} type="button" onClick={() => track("card_clicked", { sourceSurface: "home", cardType: "pricing_pattern", patternId: p.id })} className="w-full text-left border border-border rounded-xl p-6 sm:p-8 bg-card hover:border-primary/30 hover:bg-muted/20 transition-colors" data-testid={`pattern-${p.id}`}>
                <div className="grid sm:grid-cols-[1fr_auto] gap-6 sm:gap-10 items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-mono font-bold text-muted-foreground/50">{p.label}</span>
                      <h3 className="text-lg font-bold text-foreground">{p.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed max-w-lg">
                      <span className="text-foreground font-medium">The problem: </span>{p.problem}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                      <span className="text-primary font-medium">The fix: </span>{p.fix}
                    </p>
                  </div>

                  <div className="flex-shrink-0 sm:min-w-[220px]">
                    {/* Before / After */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between gap-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40 rounded-lg px-3 py-2.5">
                        <div>
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-0.5">Before</p>
                          <p className="text-xs text-muted-foreground">{p.before.label}</p>
                        </div>
                        <p className="font-mono font-bold text-red-600 dark:text-red-400 text-sm">{p.before.cost}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 rounded-lg px-3 py-2.5">
                        <div>
                          <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-0.5">After</p>
                          <p className="text-xs text-muted-foreground">{p.after.label}</p>
                        </div>
                        <p className="font-mono font-bold text-green-700 dark:text-green-400 text-sm">{p.after.cost}</p>
                      </div>
                    </div>
                    {/* Stat */}
                    <div className="bg-muted/50 rounded-lg px-3 py-3 text-center">
                      <p className="text-2xl font-bold text-foreground font-mono">{p.metric}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-tight">{p.metricLabel}</p>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR COMPARISONS ──────────────────────────────── */}
      <section id="comparison" className="border-b border-border py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Comparisons</p>
              <h2 className="text-3xl font-bold text-foreground">Popular comparisons</h2>
            </div>
            <Link href="/compare/claude-vs-gpt-cost" className="text-sm text-primary hover:underline hidden sm:block">
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {comparisons.map((c) => (
              <Link key={c.slug} href={`/compare/${c.slug}`}>
                <div
                  className="group border border-border rounded-xl p-5 hover:border-primary/30 hover:bg-muted/20 transition-all h-full"
                  data-testid={`compare-card-${c.slug}`}
                >
                  <h3 className="font-semibold text-foreground text-sm leading-snug mb-2 group-hover:text-primary transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {c.summary}
                  </p>
                  <div className="mt-3 pt-3 border-t border-border/60 flex items-center text-xs text-primary font-medium">
                    Read comparison <span className="ml-auto">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/decision-engine" className="text-sm text-primary font-medium hover:underline">
              Compare your usage →
            </Link>
          </div>
        </div>
      </section>

      {/* ── BEST UNDER BUDGET ────────────────────────────────── */}
      <section className="border-b border-border py-20 bg-muted/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Best lists</p>
              <h2 className="text-3xl font-bold text-foreground">Best AI under budget</h2>
            </div>
            <Link href="/best/best-ai-under-20-per-month" className="text-sm text-primary hover:underline hidden sm:block">
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {bestOf.map((b) => (
              <Link key={b.slug} href={`/best/${b.slug}`}>
                <div
                  className="group border border-border bg-background rounded-xl p-6 hover:border-primary/30 hover:bg-muted/20 transition-all h-full cursor-pointer"
                  data-testid={`best-card-${b.slug}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary bg-primary/8 px-2.5 py-1 rounded-md">
                      {b.category}
                    </span>
                    <span className="text-muted-foreground text-sm opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2 leading-snug">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST GUIDES ────────────────────────────────────── */}
      <section className="border-b border-border py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Guides</p>
              <h2 className="text-3xl font-bold text-foreground">Learn to spend less</h2>
            </div>
            <Link href="/guides/how-to-reduce-ai-cost" className="text-sm text-primary hover:underline hidden sm:block">
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {guides.map((g, i) => (
              <Link key={g.slug} href={`/guides/${g.slug}`}>
                <div
                  className={`group border border-border rounded-xl p-6 hover:border-primary/30 hover:bg-muted/20 transition-all h-full cursor-pointer ${i === 0 ? "sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-6" : ""}`}
                  data-testid={`guide-card-${g.slug}`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded">{g.readTime}</span>
                    </div>
                    <h3 className="font-bold text-foreground mb-2 leading-snug text-base group-hover:text-primary transition-colors">
                      {g.title}
                    </h3>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{g.description}</p>
                    <p className="mt-4 text-sm text-primary font-medium">Read guide →</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────── */}
      <section className="border-b border-border py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-foreground rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-background mb-4 leading-tight">
              Find out what you're actually paying.
            </h2>
            <p className="text-background/60 mb-8 max-w-lg mx-auto leading-relaxed">
              Enter your monthly token usage and see the real cost — and exactly how much you'd save by switching models.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/calculator"
                className="bg-background text-foreground px-7 py-3 rounded-lg font-semibold text-sm hover:bg-background/90 transition-colors"
                data-testid="bottom-cta-calculator"
              >
                Open Calculator →
              </Link>
              <Link
                href="/decision-engine"
                className="border border-background/20 text-background px-7 py-3 rounded-lg font-semibold text-sm hover:bg-background/10 transition-colors"
                data-testid="bottom-cta-engine"
              >
                Find My Stack
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">FAQ</p>
            <h2 className="text-3xl font-bold text-foreground">Common questions</h2>
          </div>
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <div className="divide-y divide-border px-6">
              {faqs.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
