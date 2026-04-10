import { useState } from "react";
import { Link } from "wouter";
import { track } from "@/utils/analytics";
import comparisonsData from "@/data/comparisons.json";
import faqsData from "@/data/faqs.json";
import guidesData from "@/data/guides.json";
import bestOfData from "@/data/best-of.json";

const comparisons = comparisonsData.slice(0, 6);
const faqs = faqsData.slice(0, 5);
const guides = guidesData.slice(0, 4);
const bestOf = bestOfData.slice(0, 4);

const SAVINGS = [
  { from: "GPT-4o", to: "GPT-4o mini", save: "$28.80", savePerYear: "$345", pct: "96%", usage: "2M output tokens/month" },
  { from: "ChatGPT Plus", to: "API light use", save: "$17.60", savePerYear: "$211", pct: "88%", usage: "300K tokens/month" },
  { from: "Claude Sonnet", to: "DeepSeek V3", save: "$13.90", savePerYear: "$167", pct: "93%", usage: "1M output tokens/month" },
];

const AFFILIATE_PICKS = [
  {
    label: "Best overall",
    model: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    cost: "$3 / 1M out tokens",
    pitch: "Near-GPT-4o quality at a fraction of the cost. The default upgrade path for most teams.",
    href: "/compare/claude-vs-gpt-cost",
  },
  {
    label: "Cheapest viable",
    model: "GPT-4o mini",
    provider: "OpenAI",
    cost: "$0.60 / 1M out tokens",
    pitch: "33× cheaper than GPT-4o. Excellent for classification, Q&A, and summaries at scale.",
    href: "/compare/claude-vs-gpt-cost",
  },
  {
    label: "Best for coding",
    model: "Gemini 1.5 Flash",
    provider: "Google",
    cost: "$0.075 / 1M out tokens",
    pitch: "Low-cost, high-speed model ideal for automation pipelines and coding assistance.",
    href: "/compare/gemini-vs-gpt4o-cost",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 py-4 text-left">
        <span className="font-medium text-foreground text-sm leading-snug">{q}</span>
        <span className={`flex-shrink-0 text-muted-foreground transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <p className="text-sm text-muted-foreground leading-relaxed pb-4">{a}</p>}
    </div>
  );
}

export function Design2() {
  return (
    <div className="bg-white">

      {/* ── STICKY SUBNAV ─────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
          <span className="text-xs font-semibold text-muted-foreground mr-2 shrink-0">Jump to:</span>
          {[
            { href: "#d2-calculator", label: "Calculator" },
            { href: "#d2-savings", label: "Savings Examples" },
            { href: "#d2-comparison", label: "Compare Models" },
            { href: "#d2-recommendations", label: "Recommendations" },
            { href: "#d2-guides", label: "Guides" },
            { href: "#d2-faq", label: "FAQs" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => track("section_nav_clicked", { section: href.replace("#d2-", ""), sourceSurface: "design2" })}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-border hover:bg-muted hover:text-foreground text-muted-foreground transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="border-b border-border bg-white py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 mb-6 text-xs font-semibold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Free · No sign-up · 20+ models tracked
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08] mb-5">
                Find the cheapest<br />AI model for your<br />workload.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mb-6">
                Compare token pricing across ChatGPT, Claude, Gemini, and more. Calculate your real monthly spend. Find cheaper alternatives before you commit.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mb-8 border-l-2 border-emerald-400 pl-3">
                Most teams overpay by 60–90% by using premium models for tasks that cheaper ones handle just as well.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/calculator"
                  data-testid="d2-cta-calc"
                  onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design2", variant: "primary" })}
                  className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
                >
                  Calculate your AI cost →
                </Link>
                <Link
                  href="/decision-engine"
                  data-testid="d2-cta-engine"
                  onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design2", variant: "secondary" })}
                  className="inline-flex items-center justify-center border border-border hover:bg-muted text-foreground font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
                >
                  5-question quiz →
                </Link>
              </div>
            </div>

            {/* Right: trust + preview panel */}
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-900 text-white p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">What you'll find here</p>
                <ul className="space-y-2.5 text-sm text-white/80">
                  {[
                    "Real token-based cost calculator",
                    "Side-by-side model comparisons",
                    "Savings examples from real switch scenarios",
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
              <div className="rounded-2xl border border-border p-4 bg-amber-50">
                <p className="text-xs font-semibold text-amber-800 mb-1">Pricing freshness</p>
                <p className="text-xs text-amber-700 leading-relaxed">All prices sourced from official provider pages. Last verified: April 2025. Dates shown per model.</p>
              </div>
              <div className="rounded-2xl border border-border p-4 bg-white">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">No affiliate bias:</strong> recommendations are based on cost efficiency, not commissions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SAVINGS ──────────────────────────────────────────── */}
      <section id="d2-savings" className="border-b border-border bg-gradient-to-b from-emerald-50 to-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">Savings examples</p>
            <h2 className="text-3xl font-bold text-foreground">What teams actually save</h2>
            <p className="text-muted-foreground text-sm mt-2">These are real switch scenarios with current market pricing.</p>
          </div>

          <div className="space-y-3 mb-6">
            {SAVINGS.map((ex) => (
              <Link key={ex.from} href="/calculator">
                <div
                  onClick={() => track("card_clicked", { sourceSurface: "design2", cardType: "savings_example", label: ex.from })}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-200 bg-white rounded-xl px-5 py-4 hover:border-emerald-400 hover:shadow-sm transition-all cursor-pointer"
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
                    <span className="text-xs text-emerald-700 font-medium group-hover:underline hidden sm:block">Calculate yours →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/calculator"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design2", variant: "savings_cta" })}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              See your savings →
            </Link>
            <Link
              href="/decision-engine"
              className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-foreground font-medium px-6 py-3 rounded-lg text-sm transition-colors"
            >
              Find my cheapest stack
            </Link>
          </div>
        </div>
      </section>

      {/* ── CALCULATOR ENTRY ─────────────────────────────────── */}
      <section id="d2-calculator" className="border-b border-border bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Calculator</p>
              <h2 className="text-3xl font-bold text-foreground mb-3">Check your monthly spend</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Enter your monthly token usage — or pick a scenario below — to see what you're paying and what you could pay with a smarter model choice.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex gap-2"><span className="text-emerald-600">✓</span> Compares input + output token costs</p>
                <p className="flex gap-2"><span className="text-emerald-600">✓</span> Factors in subscription vs API plans</p>
                <p className="flex gap-2"><span className="text-emerald-600">✓</span> Shows top 3 cheaper alternatives</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-border rounded-2xl p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Start with a usage scenario:</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label: "ChatGPT Plus user", href: "/calculator?scenario=chatgpt-plus-user" },
                  { label: "API developer", href: "/calculator?scenario=developer-coding-workflow" },
                  { label: "Startup bot", href: "/calculator?scenario=startup-support-bot" },
                  { label: "Content team", href: "/calculator?scenario=content-team" },
                ].map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    onClick={() => track("calculator_used", { sourceSurface: "design2", scenario: label })}
                    className="border border-border rounded-lg px-3 py-2.5 text-xs text-foreground font-medium hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-center"
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <Link
                href="/calculator"
                data-testid="d2-open-calc"
                onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design2", variant: "calculator_open" })}
                className="block w-full text-center bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
              >
                Open full calculator →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── RECOMMENDATIONS ───────────────────────────────────── */}
      <section id="d2-recommendations" className="border-b border-border bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Recommendations</p>
            <h2 className="text-3xl font-bold text-foreground">Find the right model</h2>
            <p className="text-sm text-muted-foreground mt-2">Decision support — not ads. Based on real pricing data.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {AFFILIATE_PICKS.map((pick) => (
              <div key={pick.model} className="bg-white border border-border rounded-xl p-5 hover:border-slate-400 hover:shadow-sm transition-all">
                <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900 text-white mb-3">
                  {pick.label}
                </span>
                <h3 className="font-bold text-foreground mb-0.5">{pick.model}</h3>
                <p className="text-xs text-muted-foreground mb-1">{pick.provider} · <span className="text-emerald-700 font-mono">{pick.cost}</span></p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{pick.pitch}</p>
                <Link
                  href={pick.href}
                  onClick={() => track("affiliate_clicked", { sourceSurface: "design2", model: pick.model, label: pick.label })}
                  className="text-sm text-slate-700 font-semibold hover:underline"
                >
                  Compare this option →
                </Link>
              </div>
            ))}
          </div>
          <Link
            href="/decision-engine"
            onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design2", variant: "decision_engine" })}
            className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 hover:bg-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            Take the 5-question quiz →
          </Link>
        </div>
      </section>

      {/* ── COMPARISONS ──────────────────────────────────────── */}
      <section id="d2-comparison" className="border-b border-border bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Compare models</p>
              <h2 className="text-3xl font-bold text-foreground">Popular comparisons</h2>
            </div>
            <Link href="/compare/claude-vs-gpt-cost" className="text-sm text-primary hover:underline hidden sm:block">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {comparisons.map((c) => (
              <Link key={c.slug} href={`/compare/${c.slug}`}>
                <div
                  onClick={() => track("card_clicked", { sourceSurface: "design2", cardType: "comparison", slug: c.slug })}
                  className="group border border-border rounded-xl p-5 hover:border-primary/40 hover:bg-muted/10 transition-all h-full cursor-pointer"
                >
                  <h3 className="font-semibold text-foreground text-sm leading-snug mb-2 group-hover:text-primary transition-colors">{c.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{c.summary}</p>
                  <div className="mt-3 pt-3 border-t border-border/60 text-xs text-primary font-medium flex justify-between">
                    <span>Read comparison</span><span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Looking for your specific use case?{" "}
            <Link href="/decision-engine" className="text-primary font-medium hover:underline">
              Use the decision engine →
            </Link>
          </p>
        </div>
      </section>

      {/* ── GUIDES ───────────────────────────────────────────── */}
      <section id="d2-guides" className="border-b border-border bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Guides</p>
              <h2 className="text-3xl font-bold text-foreground">Learn to spend less</h2>
            </div>
            <Link href="/guides/how-to-reduce-ai-cost" className="text-sm text-primary hover:underline hidden sm:block">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {guides.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`}>
                <div
                  onClick={() => track("card_clicked", { sourceSurface: "design2", cardType: "guide", slug: g.slug })}
                  className="group border border-border rounded-xl p-5 bg-white hover:border-primary/40 hover:shadow-sm transition-all h-full cursor-pointer"
                >
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{g.readTime}</span>
                  <h3 className="font-semibold text-foreground text-sm mt-3 mb-2 group-hover:text-primary transition-colors leading-snug">{g.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{g.description}</p>
                  <p className="text-xs text-primary font-medium mt-3">Read guide →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="d2-faq" className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">FAQ</p>
          <h2 className="text-2xl font-bold text-foreground mb-6">Common questions</h2>
          <div className="border border-border rounded-xl overflow-hidden bg-white divide-y divide-border px-6">
            {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/calculator"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design2", variant: "faq_cta" })}
              className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-6 py-3 rounded-lg text-sm hover:bg-foreground/80 transition-colors"
            >
              Check your spend now →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
