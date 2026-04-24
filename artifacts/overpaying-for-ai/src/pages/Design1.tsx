import { useState } from "react";
import { Link } from "wouter";
import { track } from "@/utils/analytics";
import comparisonsData from "@/data/comparisons.json";
import faqsData from "@/data/faqs.json";

const comparisons = comparisonsData.slice(0, 6);
const faqs = faqsData.slice(0, 5);

const SAVINGS = [
  { from: "GPT-4o", to: "GPT-4o mini", save: "$28.80/mo", pct: "96%", usage: "2M output tokens" },
  { from: "ChatGPT Plus", to: "API (light)", save: "$17.60/mo", pct: "88%", usage: "300K tokens" },
  { from: "Claude Sonnet", to: "DeepSeek V3", save: "$13.90/mo", pct: "93%", usage: "1M output tokens" },
  { from: "Gemini Pro", to: "Gemini Flash", save: "$5.87/mo", pct: "94%", usage: "5M input tokens" },
];

const AFFILIATE_PICKS = [
  {
    label: "Best overall",
    model: "Claude 3.5 Sonnet",
    pitch: "Strong performance across coding, writing, and reasoning at a fraction of GPT-4o's cost.",
    href: "/compare/claude-vs-gpt-cost",
    accent: "bg-indigo-600",
  },
  {
    label: "Cheapest viable",
    model: "GPT-4o mini",
    pitch: "33× cheaper than GPT-4o. Handles summaries, Q&A, and classification without compromise.",
    href: "/compare/claude-vs-gpt-cost",
    accent: "bg-emerald-600",
  },
  {
    label: "Best for startups",
    model: "Gemini 1.5 Flash",
    pitch: "High-volume tasks at near-zero cost. Built for automation and scale from day one.",
    href: "/compare/gemini-vs-gpt4o-cost",
    accent: "bg-violet-600",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
      >
        <span className="font-medium text-white text-sm leading-snug">{q}</span>
        <span className={`flex-shrink-0 mt-0.5 text-white/50 transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <p className="text-sm text-white/60 leading-relaxed pb-5">{a}</p>}
    </div>
  );
}

export function Design1() {
  return (
    <div className="bg-white">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-14 sm:pt-24 sm:pb-20">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 mb-8 text-xs font-medium text-white/80">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            20 models tracked · Regularly updated
          </div>

          <div className="max-w-3xl mb-10">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-5">
              Stop overpaying<br />for AI.
            </h1>
            <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-xl">
              Calculate your real AI costs. Find cheaper alternatives. Stop wasting money on models you don't need.
            </p>
          </div>

          {/* CTA pair */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <Link
              href="/calculator"
              data-testid="d1-cta-calc"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design1", variant: "primary" })}
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              Calculate your AI cost →
            </Link>
            <Link
              href="/compare/claude-vs-gpt-cost"
              data-testid="d1-cta-compare"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design1", variant: "secondary" })}
              className="inline-flex items-center justify-center gap-2 border border-white/25 hover:bg-white/10 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              Compare models
            </Link>
          </div>

          {/* Anchor nav — immediately below hero CTAs */}
          <nav className="flex items-center gap-1.5 flex-wrap" aria-label="Page sections">
            {[
              { href: "#d1-calculator", label: "Calculator" },
              { href: "#d1-savings", label: "Savings Examples" },
              { href: "#d1-comparison", label: "Compare Models" },
              { href: "#d1-affiliate", label: "Recommendations" },
              { href: "#d1-faq", label: "FAQs" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => track("section_nav_clicked", { section: href.replace("#d1-", ""), sourceSurface: "design1" })}
                className="text-xs font-medium text-white/60 hover:text-white border border-white/15 hover:border-white/30 px-3 py-1.5 rounded-full transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* ── STAT BAR ─────────────────────────────────────────── */}
      <section className="bg-emerald-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { val: "96%", label: "max savings found" },
              { val: "20+", label: "models compared" },
              { val: "$216", label: "avg annual waste" },
              { val: "Free", label: "no sign-up needed" },
            ].map(({ val, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold font-mono">{val}</p>
                <p className="text-xs text-white/70 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALCULATOR ENTRY ─────────────────────────────────── */}
      <section id="d1-calculator" className="bg-slate-50 border-b border-border py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3">Calculator</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Check your monthly spend</h2>
            <p className="text-muted-foreground">Enter your token usage and see exactly what you're paying — and what you could pay instead.</p>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8">
            <p className="text-sm font-semibold text-foreground mb-4">What's your primary AI use?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              {[
                { label: "ChatGPT Plus user", href: "/calculator?scenario=chatgpt-plus-user" },
                { label: "API developer", href: "/calculator?scenario=developer-coding-workflow" },
                { label: "Startup automation", href: "/calculator?scenario=startup-support-bot" },
                { label: "Content team", href: "/calculator?scenario=content-team" },
                { label: "Solo founder", href: "/calculator?scenario=solo-founder" },
                { label: "Custom usage", href: "/calculator" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => track("calculator_used", { sourceSurface: "design1", scenario: label })}
                  className="border border-border rounded-lg px-3 py-2.5 text-sm text-foreground font-medium hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-center cursor-pointer"
                >
                  {label}
                </Link>
              ))}
            </div>
            <Link
              href="/calculator"
              data-testid="d1-open-calc"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design1", variant: "calculator_open" })}
              className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Open full calculator →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SAVINGS ──────────────────────────────────────────── */}
      <section id="d1-savings" className="bg-white border-b border-border py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-2">Real savings</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">What teams actually save</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {SAVINGS.map((ex) => (
              <Link
                key={ex.from}
                href="/calculator"
                onClick={() => track("card_clicked", { sourceSurface: "design1", cardType: "savings_example", label: ex.from })}
                className="group block bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-5 hover:border-emerald-400 hover:shadow-md transition-all"
              >
                <p className="text-xs text-muted-foreground mb-1">{ex.usage}</p>
                <p className="text-3xl font-bold text-emerald-700 font-mono mb-1">{ex.save}</p>
                <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded mb-3">-{ex.pct}</span>
                <p className="text-xs text-muted-foreground">
                  <span className="line-through">{ex.from}</span>
                  <span className="mx-1 text-muted-foreground/50">→</span>
                  <span className="text-foreground font-medium">{ex.to}</span>
                </p>
                <p className="text-xs text-indigo-600 font-medium mt-3 group-hover:underline">Calculate yours →</p>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/calculator"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design1", variant: "savings_cta" })}
              className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-6 py-3 rounded-xl text-sm hover:bg-foreground/80 transition-colors"
            >
              See your savings →
            </Link>
          </div>
        </div>
      </section>

      {/* ── AFFILIATE RECOMMENDATIONS ─────────────────────────── */}
      <section id="d1-affiliate" className="bg-indigo-600 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200 mb-2">Recommendations</p>
            <h2 className="text-3xl font-bold">Find the right model for you</h2>
            <p className="text-indigo-200 mt-2 text-sm">Based on how thousands of teams optimise their AI spend.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {AFFILIATE_PICKS.map((pick) => (
              <div key={pick.model} className="bg-white/10 border border-white/20 rounded-xl p-5 hover:bg-white/15 transition-colors">
                <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md text-white mb-3 ${pick.accent}`}>
                  {pick.label}
                </span>
                <h3 className="font-bold text-white mb-2">{pick.model}</h3>
                <p className="text-sm text-indigo-200 leading-relaxed mb-4">{pick.pitch}</p>
                <Link
                  href={pick.href}
                  onClick={() => track("affiliate_clicked", { sourceSurface: "design1", model: pick.model, label: pick.label })}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-white hover:underline"
                >
                  Try this option →
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/decision-engine"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design1", variant: "decision_engine" })}
              className="inline-flex items-center gap-2 bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-indigo-50 transition-colors"
            >
              Take the 5-question quiz →
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMPARISONS ──────────────────────────────────────── */}
      <section id="d1-comparison" className="bg-slate-50 border-b border-border py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Comparisons</p>
              <h2 className="text-3xl font-bold text-foreground">Popular comparisons</h2>
            </div>
            <Link href="/compare/claude-vs-gpt-cost" className="text-sm text-indigo-600 font-medium hover:underline hidden sm:block">
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {comparisons.map((c) => (
              <Link key={c.slug} href={`/compare/${c.slug}`}>
                <div
                  onClick={() => track("card_clicked", { sourceSurface: "design1", cardType: "comparison", slug: c.slug })}
                  className="group border border-border rounded-xl p-5 bg-white hover:border-indigo-300 hover:shadow-sm transition-all h-full cursor-pointer"
                >
                  <h3 className="font-semibold text-foreground text-sm leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{c.summary}</p>
                  <div className="mt-3 pt-3 border-t border-border/60 flex items-center text-xs text-indigo-600 font-medium">
                    Read comparison <span className="ml-auto">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link
              href="/decision-engine"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design1", variant: "compare_cta" })}
              className="inline-flex items-center gap-2 border border-indigo-300 text-indigo-700 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-indigo-50 transition-colors"
            >
              Compare your usage →
            </Link>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────── */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Find out what you're actually paying.</h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto leading-relaxed">
            Enter token usage, see the real cost, and discover exactly how much you'd save by switching models.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/calculator"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design1", variant: "bottom_cta" })}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              Open Calculator →
            </Link>
            <Link
              href="/decision-engine"
              className="border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              Find my stack
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="d1-faq" className="bg-slate-900 text-white border-t border-white/10 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">FAQ</p>
          <h2 className="text-2xl font-bold mb-8">Common questions</h2>
          <div className="divide-y divide-white/10">
            {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
