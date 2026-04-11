import { useState } from "react";
import { Link } from "wouter";
import { track } from "@/utils/analytics";
import { freshnessLabel, isPricingStale } from "@/utils/pricingFreshness";
import comparisonsData from "@/data/comparisons.json";
import faqsData from "@/data/faqs.json";
import guidesData from "@/data/guides.json";
import bestOfData from "@/data/best-of.json";
import modelsData from "@/data/models.json";

const comparisons = comparisonsData.slice(0, 6);
const faqs = faqsData.slice(0, 6);
const guides = guidesData.slice(0, 4);
const bestOf = bestOfData.slice(0, 4);

// Derive freshness dynamically from model data
const allDates = (modelsData as { last_updated?: string }[])
  .map((m) => m.last_updated)
  .filter(Boolean) as string[];
allDates.sort();
const FRESHEST_DATE = allDates[allDates.length - 1] ?? "2025-04-01";
const OLDEST_DATE = allDates[0] ?? "2025-04-01";
const FRESHNESS_MSG = freshnessLabel(FRESHEST_DATE);
const IS_STALE = isPricingStale(FRESHEST_DATE, 30);

const SAVINGS = [
  { from: "GPT-4o", to: "GPT-4o mini", save: "$28.80", savePerYear: "$345", pct: "96%", usage: "2M output tokens/month", slug: "gpt-4o-vs-gpt-4o-mini-cost" },
  { from: "ChatGPT Plus", to: "API (light use)", save: "$17.60", savePerYear: "$211", pct: "88%", usage: "300K tokens/month", slug: "subscription-vs-api-ai-cost" },
  { from: "Claude Sonnet", to: "DeepSeek V3", save: "$13.90", savePerYear: "$167", pct: "93%", usage: "1M output tokens/month", slug: "deepseek-vs-gpt4o-cost" },
];

const AFFILIATE_PICKS = [
  {
    label: "Best overall",
    badge: "bg-slate-900 text-white",
    model: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    cost: "$3 / 1M out tokens",
    pitch: "Near-GPT-4o quality at a fraction of the cost. The safest default upgrade path for most teams.",
    cta: "Start with this option",
    href: "/compare/claude-vs-gpt-cost",
  },
  {
    label: "Cheapest viable",
    badge: "bg-emerald-700 text-white",
    model: "GPT-4o mini",
    provider: "OpenAI",
    cost: "$0.60 / 1M out tokens",
    pitch: "33× cheaper than GPT-4o. Handles classification, Q&A, and summaries without compromise.",
    cta: "Save with this option",
    href: "/compare/gpt-4o-vs-gpt-4o-mini-cost",
  },
  {
    label: "Startup option",
    badge: "bg-violet-700 text-white",
    model: "Gemini 1.5 Flash",
    provider: "Google",
    cost: "$0.075 / 1M out tokens",
    pitch: "Near-zero cost for high-volume pipelines. Good enough for lean teams early on.",
    cta: "Use this for lean teams",
    href: "/compare/gemini-vs-gpt4o-cost",
  },
  {
    label: "Best for coding",
    badge: "bg-blue-700 text-white",
    model: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    cost: "$3 / 1M out tokens",
    pitch: "Strong code generation and reasoning. Handles complex refactors better than cheaper models.",
    cta: "Try for coding",
    href: "/compare/claude-vs-cursor-for-coding",
  },
];

const OVERPAY_PATTERNS = [
  {
    label: "01",
    title: "The subscription trap",
    problem: "You pay $20/month for ChatGPT Plus but use it lightly. At your actual usage, the API costs $2.",
    fix: "Switch to GPT-4o mini via API. Same quality, 90% less cost.",
    metric: "$216/yr",
    metricLabel: "average wasted on unused subscription capacity",
  },
  {
    label: "02",
    title: "Using GPT-4o for everything",
    problem: "GPT-4o costs 33× more per token than GPT-4o mini. Most tasks don't need that power.",
    fix: "Route simple tasks to mini. Reserve GPT-4o for complex reasoning only.",
    metric: "80%",
    metricLabel: "of API spend eliminated by model routing with no quality change",
  },
  {
    label: "03",
    title: "No routing strategy",
    problem: "One model for every task means paying premium prices across the board.",
    fix: "Classify tasks first. Use Flash or mini for bulk, escalate to Sonnet only when needed.",
    metric: "60–80%",
    metricLabel: "cost reduction with a two-tier routing strategy",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 py-4 text-left group">
        <span className="font-medium text-foreground text-sm leading-snug group-hover:text-primary transition-colors">{q}</span>
        <span className={`flex-shrink-0 text-muted-foreground transition-transform mt-0.5 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <p className="text-sm text-muted-foreground leading-relaxed pb-4">{a}</p>}
    </div>
  );
}

const AI_TYPE_CARDS = [
  { slug: "general-ai", icon: "🧠", title: "General AI", tagline: "Best all-purpose assistants by cost", bestFor: "Everyday tasks & writing" },
  { slug: "coding-ai", icon: "💻", title: "Coding AI", tagline: "IDE tools and APIs for developers", bestFor: "Code generation & debugging" },
  { slug: "writing-ai", icon: "✍️", title: "Writing AI", tagline: "Cheapest models for content work", bestFor: "Blogs, copy & emails" },
  { slug: "research-ai", icon: "🔍", title: "Research AI", tagline: "Search & document analysis tools", bestFor: "Analysis & synthesis" },
  { slug: "customer-support-ai", icon: "💬", title: "Customer Support AI", tagline: "High-volume, low-cost chat models", bestFor: "Chat, tickets & bots" },
  { slug: "productivity-ai", icon: "⚡", title: "Productivity AI", tagline: "AI for docs, meetings & workflows", bestFor: "Teams & solopreneurs" },
];

const NAV_ITEMS = [
  { href: "#section-ai-types", label: "AI Types" },
  { href: "#section-calculator", label: "Calculator" },
  { href: "#section-savings", label: "Savings" },
  { href: "#section-affiliate", label: "Recommendations" },
  { href: "#section-comparison", label: "Compare Models" },
  { href: "#section-guides", label: "Guides" },
  { href: "#section-faq", label: "FAQs" },
];

export function Design2() {
  return (
    <div className="bg-white">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="border-b border-border bg-white py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 mb-6 text-xs font-semibold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Free · No sign-up · 20+ AI models tracked
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08] mb-5">
                Find the cheapest<br />AI model for your<br />workload.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mb-5">
                Compare token pricing across ChatGPT, Claude, Gemini, and more. Calculate your real monthly spend. Find cheaper alternatives — before you commit.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mb-8 border-l-2 border-emerald-400 pl-3 italic">
                "Most teams overpay by 60–90% by using premium models for tasks that cheaper ones handle just as well."
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/calculator"
                  data-testid="hp-cta-calc"
                  onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "primary" })}
                  className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
                >
                  Calculate your AI cost →
                </Link>
                <Link
                  href="/compare/claude-vs-gpt-cost"
                  data-testid="hp-cta-compare"
                  onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "secondary" })}
                  className="inline-flex items-center justify-center border border-border hover:bg-muted text-foreground font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
                >
                  Compare models
                </Link>
              </div>
            </div>

            {/* Right trust panel */}
            <div className="space-y-3 hidden lg:block">
              <div className="rounded-2xl bg-slate-900 text-white p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">What you'll find here</p>
                <ul className="space-y-2.5 text-sm text-white/80">
                  {[
                    "Real token-based cost calculator",
                    "Side-by-side model comparisons",
                    "Real savings switch scenarios",
                    "Best model picks by use case",
                    "Guides on reducing AI spend",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`rounded-2xl border p-4 ${IS_STALE ? "bg-orange-50 border-orange-200" : "bg-amber-50 border-amber-200"}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${IS_STALE ? "bg-orange-500" : "bg-amber-500"}`} />
                  <p className={`text-xs font-semibold ${IS_STALE ? "text-orange-800" : "text-amber-800"}`}>Pricing freshness</p>
                </div>
                <p className={`text-xs leading-relaxed ${IS_STALE ? "text-orange-700" : "text-amber-700"}`}>
                  {FRESHNESS_MSG}. All prices sourced from official provider pages.
                </p>
              </div>

              <div className="rounded-2xl border border-border p-4 bg-white">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">No affiliate bias:</strong> recommendations are ranked by cost efficiency, not commissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STICKY JUMP NAV — sits exactly below the h-14 main header ── */}
      <div className="sticky top-14 z-40 bg-white border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className="text-xs font-semibold text-muted-foreground mr-2 shrink-0 hidden sm:block">Jump to:</span>
          {NAV_ITEMS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => track("section_nav_clicked", { section: href.replace("#section-", ""), sourceSurface: "homepage" })}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-border hover:bg-muted hover:text-foreground text-muted-foreground transition-colors shrink-0"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* ── TRUST / FRESHNESS STRIP ──────────────────────────── */}
      <section className="border-b border-border bg-slate-50 py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
            <div>
              <p className="text-2xl font-bold text-foreground font-mono">20+</p>
              <p className="text-xs text-muted-foreground mt-0.5">AI models tracked</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-mono">96%</p>
              <p className="text-xs text-muted-foreground mt-0.5">max savings found</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-mono">$216</p>
              <p className="text-xs text-muted-foreground mt-0.5">avg annual overspend</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700">{FRESHNESS_MSG}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <Link href="/changelog" className="hover:underline">View pricing changelog →</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPLORE BY AI TYPE ───────────────────────────────── */}
      <section id="section-ai-types" className="border-b border-border bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Browse by AI type</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Find the cheapest model for your use case</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                Pricing strategy varies by category. Pick your use case to see relevant model options, cost benchmarks, and recommendations.
              </p>
            </div>
            <Link
              href="/ai-types"
              onClick={() => track("section_nav_clicked", { section: "ai_types", sourceSurface: "homepage" })}
              className="text-sm text-primary hover:underline hidden sm:block font-medium shrink-0"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {AI_TYPE_CARDS.map((cat) => (
              <Link
                key={cat.slug}
                href={`/ai-types/${cat.slug}`}
                onClick={() => track("card_clicked", { sourceSurface: "homepage", cardType: "ai_type", slug: cat.slug })}
                className="group block border border-border rounded-xl p-4 sm:p-5 bg-white hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3 mb-2.5">
                  <span className="text-xl leading-none mt-0.5">{cat.icon}</span>
                  <h3 className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">{cat.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">{cat.tagline}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0">{cat.bestFor}</span>
                </div>
                <p className="text-xs text-primary font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">Explore →</p>
              </Link>
            ))}
          </div>
          <Link
            href="/ai-types"
            onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "ai_types_all" })}
            className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-foreground hover:border-slate-400 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            View all AI type categories →
          </Link>
        </div>
      </section>

      {/* ── WHAT THIS TOOL DOES ───────────────────────────────── */}
      <section className="border-b border-border bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">What this tool does</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-tight">
                Stop guessing. Start calculating.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                OverpayingForAI compares AI model pricing across providers, calculates your real monthly token cost, and recommends cheaper alternatives — without the marketing noise.
              </p>
              <ul className="space-y-2.5 text-sm text-foreground">
                {[
                  "Calculate real token-based costs across any model",
                  "Compare ChatGPT, Claude, Gemini, DeepSeek side-by-side",
                  "Get 3 ranked cheaper alternatives for your workload",
                  "Use the decision engine to find the right plan in 5 questions",
                  "Browse guides on model routing, API vs subscription, and more",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5 items-start">
                    <span className="text-emerald-600 mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link
                  href="/calculator"
                  onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "what_tool_does" })}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Calculate your cost →
                </Link>
              </div>
            </div>

            {/* Why people overpay */}
            <div className="bg-slate-50 rounded-2xl border border-border p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Why people overpay</p>
              <h3 className="text-xl font-bold text-foreground mb-5 leading-tight">Three patterns that add up fast</h3>
              <div className="space-y-5">
                {OVERPAY_PATTERNS.map((p) => (
                  <div key={p.label} className="flex gap-3">
                    <span className="text-xs font-mono font-bold text-muted-foreground/40 mt-0.5 shrink-0 w-5">{p.label}</span>
                    <div>
                      <p className="font-semibold text-sm text-foreground mb-1">{p.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-1">{p.problem}</p>
                      <p className="text-xs text-emerald-700 font-medium">Fix: {p.fix}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-white border border-border rounded-md px-2 py-1">
                        <span className="text-sm font-bold font-mono text-foreground">{p.metric}</span>
                        <span className="text-xs text-muted-foreground">{p.metricLabel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-border">
                <Link
                  href="/calculator"
                  onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "fix_this_now" })}
                  className="text-sm text-emerald-700 font-semibold hover:underline"
                >
                  Fix this now →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALCULATOR ENTRY ─────────────────────────────────── */}
      <section id="section-calculator" className="border-b border-border bg-blue-50/50 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Calculator</p>
              <h2 className="text-3xl font-bold text-foreground mb-3">Check your monthly spend</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Enter your monthly token usage — or pick a scenario — to see your real cost and what you'd save with a smarter model.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> Compares input + output token costs separately</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> Factors in subscription vs pay-per-token plans</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> Shows top 3 cheaper alternatives ranked by savings</li>
              </ul>
            </div>
            <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground mb-3">Start with a usage scenario:</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: "ChatGPT Plus user", href: "/calculator?scenario=chatgpt-plus-user" },
                  { label: "API developer", href: "/calculator?scenario=developer-coding-workflow" },
                  { label: "Startup bot", href: "/calculator?scenario=startup-support-bot" },
                  { label: "Content team", href: "/calculator?scenario=content-team" },
                  { label: "Solo founder", href: "/calculator?scenario=solo-founder" },
                  { label: "Enterprise team", href: "/calculator" },
                ].map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => track("calculator_used", { sourceSurface: "homepage", scenario: label })}
                    className="border border-border rounded-lg px-3 py-2.5 text-xs text-foreground font-medium hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-center cursor-pointer"
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <Link
                href="/calculator"
                data-testid="hp-open-calc"
                onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "calculator_open" })}
                className="block w-full text-center bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
              >
                Open full calculator →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SAVINGS EXAMPLES ─────────────────────────────────── */}
      <section id="section-savings" className="border-b border-border bg-gradient-to-b from-emerald-50 to-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">Real savings</p>
              <h2 className="text-3xl font-bold text-foreground">What teams actually save</h2>
              <p className="text-muted-foreground text-sm mt-2">Real switch scenarios with current market pricing.</p>
            </div>
          </div>
          <div className="space-y-3 mb-6">
            {SAVINGS.map((ex) => (
              <Link
                key={ex.from}
                href={`/compare/${ex.slug}`}
                onClick={() => track("card_clicked", { sourceSurface: "homepage", cardType: "savings_example", label: ex.from })}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-200 bg-white rounded-xl px-5 py-4 hover:border-emerald-400 hover:shadow-sm transition-all"
              >
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">{ex.usage}</p>
                  <p className="text-sm font-semibold text-foreground">
                    <span className="line-through text-muted-foreground/60">{ex.from}</span>
                    <span className="mx-2 text-muted-foreground">→</span>
                    <span className="text-emerald-700">{ex.to}</span>
                  </p>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-700 font-mono">{ex.save}/mo</p>
                    <p className="text-xs text-muted-foreground">{ex.savePerYear}/yr saved</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1.5 rounded-lg">-{ex.pct}</span>
                  <span className="text-xs text-emerald-700 font-medium group-hover:underline hidden sm:block">See comparison →</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/calculator"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "savings_cta" })}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              See your savings →
            </Link>
            <Link
              href="/decision-engine"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "decision_engine_savings" })}
              className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-foreground font-medium px-6 py-3 rounded-lg text-sm transition-colors"
            >
              Find my cheapest stack
            </Link>
          </div>
        </div>
      </section>

      {/* ── AFFILIATE RECOMMENDATIONS ─────────────────────────── */}
      <section id="section-affiliate" className="border-b border-border bg-slate-50 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Recommendations</p>
            <h2 className="text-3xl font-bold text-foreground">Find the right model for you</h2>
            <p className="text-sm text-muted-foreground mt-2">Decision support, not ads. Ranked by cost efficiency from real pricing data.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {AFFILIATE_PICKS.map((pick) => (
              <Link
                key={pick.label}
                href={pick.href}
                onClick={() => track("affiliate_clicked", { sourceSurface: "homepage", model: pick.model, label: pick.label })}
                className="group flex flex-col bg-white border border-border rounded-xl p-5 hover:border-slate-400 hover:shadow-sm transition-all"
              >
                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md mb-3 ${pick.badge}`}>
                  {pick.label}
                </span>
                <h3 className="font-bold text-foreground mb-0.5 text-sm">{pick.model}</h3>
                <p className="text-xs text-muted-foreground mb-1">
                  {pick.provider} ·{" "}
                  <span className="text-emerald-700 font-mono font-semibold">{pick.cost}</span>
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{pick.pitch}</p>
                <span className="block w-full text-center text-xs font-semibold text-white bg-slate-800 group-hover:bg-slate-700 py-2 rounded-lg transition-colors">
                  {pick.cta}
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/decision-engine"
            onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "quiz_affiliate" })}
            className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 hover:bg-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            Take the 5-question quiz →
          </Link>
        </div>
      </section>

      {/* ── POPULAR COMPARISONS ──────────────────────────────── */}
      <section id="section-comparison" className="border-b border-border bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Compare models</p>
              <h2 className="text-3xl font-bold text-foreground">Popular comparisons</h2>
            </div>
            <Link href="/compare/claude-vs-gpt-cost" className="text-sm text-primary hover:underline hidden sm:block font-medium">
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {comparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                onClick={() => track("card_clicked", { sourceSurface: "homepage", cardType: "comparison", slug: c.slug })}
                className="group block border border-border rounded-xl p-5 hover:border-primary/40 hover:bg-muted/10 transition-all"
              >
                <h3 className="font-semibold text-foreground text-sm leading-snug mb-2 group-hover:text-primary transition-colors">{c.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{c.summary}</p>
                <div className="mt-3 pt-3 border-t border-border/60 text-xs text-primary font-medium flex justify-between items-center">
                  <span>Read comparison</span><span>→</span>
                </div>
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Can't find your use case?{" "}
            <Link href="/decision-engine" className="text-primary font-medium hover:underline">
              Use the decision engine →
            </Link>
            {" · "}
            <Link href="/resources" className="text-primary font-medium hover:underline">
              Browse all resources →
            </Link>
          </p>
        </div>
      </section>

      {/* ── PRICING DATA + CHANGELOG TEASER ──────────────────── */}
      <section className="border-b border-border bg-blue-50/40 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Pricing data</p>
              <h2 className="text-3xl font-bold text-foreground mb-3">Pricing you can trust</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                All pricing data is sourced from official provider pages and reviewed regularly. When prices change, we log the diff so you can see what changed and when.
              </p>
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${IS_STALE ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
                <span className={`w-2 h-2 rounded-full ${IS_STALE ? "bg-orange-500" : "bg-emerald-500"}`} />
                {FRESHNESS_MSG}
              </div>
            </div>
            <div className="bg-white border border-border rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Pricing coverage</p>
              <div className="space-y-2.5 text-sm">
                {[
                  { provider: "OpenAI", models: "GPT-4o, GPT-4o mini, ChatGPT Plus", updated: FRESHEST_DATE },
                  { provider: "Anthropic", models: "Claude 3.5 Sonnet, Claude Haiku", updated: FRESHEST_DATE },
                  { provider: "Google", models: "Gemini 1.5 Pro, Gemini Flash", updated: FRESHEST_DATE },
                  { provider: "Others", models: "DeepSeek V3, Perplexity, Mistral", updated: OLDEST_DATE },
                ].map(({ provider, models, updated }) => (
                  <div key={provider} className="flex items-start justify-between gap-3 py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="font-semibold text-foreground text-xs">{provider}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{models}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 font-mono">{updated}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4">
                <Link
                  href="/changelog"
                  onClick={() => track("card_clicked", { sourceSurface: "homepage", cardType: "changelog_link" })}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  View all pricing data →
                </Link>
                <Link
                  href="/pricing-changelog"
                  onClick={() => track("card_clicked", { sourceSurface: "homepage", cardType: "pricing_changelog_link" })}
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  What changed in our last review →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GUIDES + BEST LISTS ───────────────────────────────── */}
      <section id="section-guides" className="border-b border-border bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Guides & resources</p>
              <h2 className="text-3xl font-bold text-foreground">Learn to spend less</h2>
            </div>
            <Link href="/resources" className="text-sm text-primary hover:underline hidden sm:block font-medium">
              Browse all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                onClick={() => track("card_clicked", { sourceSurface: "homepage", cardType: "guide", slug: g.slug })}
                className="group block border border-border rounded-xl p-5 bg-white hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{g.readTime}</span>
                <h3 className="font-semibold text-foreground text-sm mt-3 mb-2 group-hover:text-primary transition-colors leading-snug">{g.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{g.description}</p>
                <p className="text-xs text-primary font-medium mt-3">Read guide →</p>
              </Link>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {bestOf.map((b) => (
              <Link
                key={b.slug}
                href={`/best/${b.slug}`}
                onClick={() => track("card_clicked", { sourceSurface: "homepage", cardType: "best_of", slug: b.slug })}
                className="group block border border-border rounded-xl p-4 bg-slate-50 hover:border-primary/40 hover:bg-muted/10 transition-all"
              >
                <span className="text-xs font-semibold text-primary bg-primary/8 px-2 py-1 rounded">{b.category}</span>
                <h3 className="font-semibold text-foreground text-xs mt-3 leading-snug group-hover:text-primary transition-colors">{b.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="section-faq" className="bg-slate-50 border-b border-border py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">FAQ</p>
          <h2 className="text-2xl font-bold text-foreground mb-6">Common questions</h2>
          <div className="border border-border rounded-xl overflow-hidden bg-white divide-y divide-border px-6">
            {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/calculator"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "faq_cta" })}
              className="inline-flex items-center justify-center bg-foreground text-background font-semibold px-6 py-3 rounded-lg text-sm hover:bg-foreground/80 transition-colors"
            >
              Check your spend now →
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center justify-center border border-border text-muted-foreground hover:text-foreground font-medium px-6 py-3 rounded-lg text-sm transition-colors"
            >
              Browse all resources
            </Link>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────── */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Find out what you're actually paying.</h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto leading-relaxed text-sm">
            Enter your monthly token usage and see the real cost — and exactly how much you'd save by switching models.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/calculator"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "bottom_cta" })}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              Open Calculator →
            </Link>
            <Link
              href="/decision-engine"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "bottom_engine" })}
              className="border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              Find my cheapest stack
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
