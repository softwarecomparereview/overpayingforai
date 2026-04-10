import { useState, useRef } from "react";
import { Link } from "wouter";
import { track } from "@/utils/analytics";
import comparisonsData from "@/data/comparisons.json";
import faqsData from "@/data/faqs.json";

const comparisons = comparisonsData.slice(0, 6);
const faqs = faqsData.slice(0, 5);

const MODEL_QUICK_ESTIMATES: Record<string, { name: string; inputPer1k: number; outputPer1k: number; sub?: number }> = {
  "chatgpt-plus": { name: "ChatGPT Plus", inputPer1k: 0, outputPer1k: 0, sub: 20 },
  "gpt-4o": { name: "GPT-4o API", inputPer1k: 0.005, outputPer1k: 0.015 },
  "gpt-4o-mini": { name: "GPT-4o mini", inputPer1k: 0.00015, outputPer1k: 0.0006 },
  "claude-sonnet": { name: "Claude Sonnet", inputPer1k: 0.003, outputPer1k: 0.015 },
  "gemini-flash": { name: "Gemini 1.5 Flash", inputPer1k: 0.000075, outputPer1k: 0.0003 },
  "deepseek-v3": { name: "DeepSeek V3", inputPer1k: 0.00027, outputPer1k: 0.0011 },
};

const QUICK_SCENARIOS = [
  { id: "light", label: "Light user", input: 50_000, output: 30_000, hint: "~30 min/day chat" },
  { id: "moderate", label: "Moderate user", input: 300_000, output: 150_000, hint: "Daily work + automation" },
  { id: "heavy", label: "Heavy API user", input: 2_000_000, output: 800_000, hint: "Production workloads" },
  { id: "enterprise", label: "Team / enterprise", input: 10_000_000, output: 4_000_000, hint: "Multiple users / bots" },
];

const AFFILIATE_PICKS = [
  { label: "Best overall", model: "Claude 3.5 Sonnet", cost: "$3/1M out", pitch: "Near-GPT-4o quality, 80% cheaper.", href: "/compare/claude-vs-gpt-cost" },
  { label: "Cheapest viable", model: "GPT-4o mini", cost: "$0.60/1M out", pitch: "33× cheaper than GPT-4o for bulk tasks.", href: "/compare/claude-vs-gpt-cost" },
  { label: "Best for startups", model: "Gemini Flash", cost: "$0.075/1M out", pitch: "Near-zero cost for high-volume bots.", href: "/compare/gemini-vs-gpt4o-cost" },
];

function fmt(n: number) {
  return n < 1 ? `<$1` : `$${n.toFixed(2)}`;
}

function calcCost(modelKey: string, inputTokens: number, outputTokens: number): number {
  const m = MODEL_QUICK_ESTIMATES[modelKey];
  if (!m) return 0;
  if (m.sub) return m.sub;
  return (inputTokens / 1000) * m.inputPer1k + (outputTokens / 1000) * m.outputPer1k;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 py-4 text-left">
        <span className="font-medium text-foreground text-sm leading-snug">{q}</span>
        <span className={`text-muted-foreground transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <p className="text-sm text-muted-foreground leading-relaxed pb-4">{a}</p>}
    </div>
  );
}

export function Design3() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o");
  const resultRef = useRef<HTMLDivElement>(null);

  const activeScenario = QUICK_SCENARIOS.find((s) => s.id === selectedScenario);
  const inputTokens = activeScenario?.input ?? 0;
  const outputTokens = activeScenario?.output ?? 0;

  const currentCost = calcCost(selectedModel, inputTokens, outputTokens);

  const alternatives = Object.entries(MODEL_QUICK_ESTIMATES)
    .filter(([k]) => k !== selectedModel)
    .map(([key, m]) => ({
      key,
      name: m.name,
      cost: calcCost(key, inputTokens, outputTokens),
      save: currentCost - calcCost(key, inputTokens, outputTokens),
    }))
    .filter((a) => a.save > 0.5)
    .sort((a, b) => b.save - a.save)
    .slice(0, 3);

  function handleScenarioClick(id: string) {
    setSelectedScenario(id);
    track("calculator_used", { sourceSurface: "design3", scenario: id });
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  return (
    <div className="bg-white">

      {/* ── HERO + INLINE CALCULATOR ──────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 to-violet-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 pb-16 sm:pt-20 sm:pb-20">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 mb-7 text-xs font-medium text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            Interactive cost calculator · 20+ models
          </div>

          <div className="grid lg:grid-cols-[1fr_420px] gap-10 items-start">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
                How much are you<br />actually paying for AI?
              </h1>
              <p className="text-white/65 text-base sm:text-lg leading-relaxed mb-6 max-w-md">
                Pick your current model and usage level. See your real monthly cost — and what you'd pay on a smarter setup.
              </p>

              {/* Section anchor nav */}
              <nav className="flex flex-wrap gap-1.5">
                {[
                  { href: "#d3-results", label: "Your estimate" },
                  { href: "#d3-savings", label: "Savings examples" },
                  { href: "#d3-comparison", label: "Compare models" },
                  { href: "#d3-affiliate", label: "Recommendations" },
                  { href: "#d3-faq", label: "FAQs" },
                ].map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => track("section_nav_clicked", { section: href.replace("#d3-", ""), sourceSurface: "design3" })}
                    className="text-xs text-white/50 hover:text-white border border-white/15 hover:border-white/30 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Inline mini-calculator */}
            <div className="bg-white rounded-2xl p-5 text-foreground shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Step 1: Current model</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {Object.entries(MODEL_QUICK_ESTIMATES).map(([key, m]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedModel(key);
                      track("calculator_used", { sourceSurface: "design3", model: key });
                    }}
                    className={`text-xs font-medium px-3 py-2 rounded-lg border text-left transition-all ${
                      selectedModel === key
                        ? "border-violet-500 bg-violet-50 text-violet-700"
                        : "border-border hover:border-violet-300 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Step 2: Usage level</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {QUICK_SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleScenarioClick(s.id)}
                    className={`text-xs px-3 py-2.5 rounded-lg border text-left transition-all ${
                      selectedScenario === s.id
                        ? "border-violet-500 bg-violet-50 text-violet-700"
                        : "border-border hover:border-violet-300 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <p className="font-semibold">{s.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.hint}</p>
                  </button>
                ))}
              </div>

              {selectedScenario ? (
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Est. monthly cost on {MODEL_QUICK_ESTIMATES[selectedModel]?.name}</p>
                  <p className="text-3xl font-bold text-violet-700 font-mono">{fmt(currentCost)}/mo</p>
                  {alternatives.length > 0 && (
                    <p className="text-xs text-emerald-700 font-semibold mt-2">
                      Save up to {fmt(alternatives[0].save)}/mo → switch to {alternatives[0].name}
                    </p>
                  )}
                  <Link
                    href="/calculator"
                    onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design3", variant: "inline_calc_deep" })}
                    className="mt-3 block w-full text-center bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2.5 rounded-lg text-xs transition-colors"
                  >
                    See full breakdown →
                  </Link>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-xl p-4 text-center text-xs text-muted-foreground border border-dashed border-border">
                  Select your usage level above to see your estimate
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── RESULTS ANCHOR ───────────────────────────────────── */}
      <div id="d3-results" />

      {/* ── ALTERNATIVES STRIP ───────────────────────────────── */}
      {selectedScenario && alternatives.length > 0 && (
        <section ref={resultRef} className="bg-emerald-50 border-b border-emerald-200 py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-5">Cheaper alternatives to {MODEL_QUICK_ESTIMATES[selectedModel]?.name}</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {alternatives.map((alt) => (
                <Link key={alt.key} href="/calculator">
                  <div
                    onClick={() => track("affiliate_clicked", { sourceSurface: "design3", model: alt.name, context: "alternatives_strip" })}
                    className="group bg-white border border-emerald-200 rounded-xl p-4 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer"
                  >
                    <p className="font-semibold text-foreground text-sm mb-1">{alt.name}</p>
                    <p className="text-2xl font-bold text-emerald-700 font-mono">{fmt(alt.cost)}/mo</p>
                    <p className="text-xs text-emerald-600 font-semibold mt-1">Save {fmt(alt.save)}/mo</p>
                    <p className="text-xs text-primary font-medium mt-3 group-hover:underline">Calculate savings →</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-5">
              <Link
                href="/calculator"
                onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design3", variant: "alternatives_cta" })}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                See full savings report →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── SAVINGS EXAMPLES ─────────────────────────────────── */}
      <section id="d3-savings" className="border-b border-border bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Savings examples</p>
            <h2 className="text-3xl font-bold text-foreground">Real-world switch scenarios</h2>
            <p className="text-sm text-muted-foreground mt-2">What happens when you move to the smarter choice.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { from: "GPT-4o", to: "GPT-4o mini", save: "$28.80/mo", pct: "96%", usage: "2M output tokens" },
              { from: "ChatGPT Plus", to: "API (light)", save: "$17.60/mo", pct: "88%", usage: "300K tokens" },
              { from: "Claude Sonnet", to: "DeepSeek V3", save: "$13.90/mo", pct: "93%", usage: "1M output tokens" },
              { from: "Gemini Pro", to: "Gemini Flash", save: "$5.87/mo", pct: "94%", usage: "5M input tokens" },
            ].map((ex) => (
              <Link key={ex.from} href="/calculator">
                <div
                  onClick={() => track("card_clicked", { sourceSurface: "design3", cardType: "savings_example", label: ex.from })}
                  className="group bg-slate-50 border border-border rounded-xl p-5 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer"
                >
                  <p className="text-xs text-muted-foreground mb-3">{ex.usage}</p>
                  <p className="text-2xl font-bold text-foreground font-mono mb-1">{ex.save}</p>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded">-{ex.pct}</span>
                  <p className="text-xs text-muted-foreground mt-3">
                    <span className="line-through">{ex.from}</span>
                    <span className="mx-1">→</span>
                    <span className="text-foreground">{ex.to}</span>
                  </p>
                  <p className="text-xs text-violet-600 font-medium mt-2 group-hover:underline">Try this →</p>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/calculator"
            onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design3", variant: "savings_cta" })}
            className="inline-flex items-center gap-2 border border-border text-foreground hover:bg-muted font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            Calculate your savings →
          </Link>
        </div>
      </section>

      {/* ── AFFILIATE RECOMMENDATIONS ─────────────────────────── */}
      <section id="d3-affiliate" className="border-b border-border bg-slate-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">Recommendations</p>
            <h2 className="text-3xl font-bold">Models worth switching to</h2>
            <p className="text-sm text-white/50 mt-2">Based on real pricing data. Not ads.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {AFFILIATE_PICKS.map((pick) => (
              <div key={pick.model} className="bg-white/8 border border-white/15 rounded-xl p-5 hover:bg-white/12 transition-colors">
                <span className="inline-block text-xs font-bold bg-violet-600 text-white px-2.5 py-1 rounded mb-3">
                  {pick.label}
                </span>
                <h3 className="font-bold text-white mb-1">{pick.model}</h3>
                <p className="text-xs text-violet-300 font-mono mb-2">{pick.cost}</p>
                <p className="text-sm text-white/60 leading-relaxed mb-4">{pick.pitch}</p>
                <Link
                  href={pick.href}
                  onClick={() => track("affiliate_clicked", { sourceSurface: "design3", model: pick.model, label: pick.label })}
                  className="text-sm text-violet-300 hover:text-white font-semibold hover:underline transition-colors"
                >
                  Try this option →
                </Link>
              </div>
            ))}
          </div>
          <Link
            href="/decision-engine"
            onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design3", variant: "decision_engine" })}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            Find my cheapest stack →
          </Link>
        </div>
      </section>

      {/* ── COMPARISONS ──────────────────────────────────────── */}
      <section id="d3-comparison" className="border-b border-border bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Comparisons</p>
              <h2 className="text-3xl font-bold text-foreground">Popular model comparisons</h2>
            </div>
            <Link href="/compare/claude-vs-gpt-cost" className="text-sm text-primary hover:underline hidden sm:block">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {comparisons.map((c) => (
              <Link key={c.slug} href={`/compare/${c.slug}`}>
                <div
                  onClick={() => track("card_clicked", { sourceSurface: "design3", cardType: "comparison", slug: c.slug })}
                  className="group border border-border rounded-xl p-5 hover:border-violet-300 hover:bg-violet-50/30 transition-all h-full cursor-pointer"
                >
                  <h3 className="font-semibold text-foreground text-sm leading-snug mb-2 group-hover:text-violet-700 transition-colors">{c.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{c.summary}</p>
                  <div className="mt-3 pt-3 border-t border-border/60 text-xs text-violet-600 font-medium flex justify-between">
                    <span>Read comparison</span><span>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/decision-engine"
            onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design3", variant: "comparison_cta" })}
            className="inline-flex items-center gap-2 border border-border text-foreground font-semibold px-6 py-3 rounded-lg text-sm hover:bg-muted transition-colors"
          >
            Compare your usage →
          </Link>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="d3-faq" className="bg-slate-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">FAQ</p>
          <h2 className="text-2xl font-bold text-foreground mb-6">Common questions</h2>
          <div className="bg-white border border-border rounded-xl divide-y divide-border px-6">
            {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/calculator"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "design3", variant: "faq_cta" })}
              className="inline-flex items-center justify-center bg-slate-900 text-white font-semibold px-6 py-3 rounded-lg text-sm hover:bg-slate-700 transition-colors"
            >
              Open full calculator →
            </Link>
            <Link
              href="/decision-engine"
              className="inline-flex items-center justify-center border border-border text-foreground font-semibold px-6 py-3 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              Find my stack
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
