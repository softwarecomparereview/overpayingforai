import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { track, trackCta } from "@/utils/analytics";
import { SearchBox } from "@/components/search/SearchBox";
import { freshnessLabel, isPricingStale } from "@/utils/pricingFreshness";
import { PageSeo } from "@/components/seo/PageSeo";
import { SeoContentBlock } from "@/components/seo/SeoContentBlock";
import { InternalLinks } from "@/components/seo/InternalLinks";
import comparisonsData from "@/data/comparisons.json";
import faqsData from "@/data/faqs.json";
import guidesData from "@/data/guides.json";
import bestOfData from "@/data/best-of.json";
import modelsData from "@/data/models.json";
import { getPrimaryCta, providerNameToId } from "@/utils/affiliateResolver";

const comparisons = comparisonsData.slice(0, 6);
const faqs = faqsData.slice(0, 6);
const guides = guidesData.slice(0, 4);
const bestOf = bestOfData.slice(0, 4);

// Derive freshness dynamically from model data
const allDates = (modelsData as { last_updated?: string }[])
  .map((m) => m.last_updated)
  .filter(Boolean) as string[];
allDates.sort();
const FRESHEST_DATE = allDates[allDates.length - 1] ?? new Date().toISOString().slice(0, 10);
const OLDEST_DATE = allDates[0] ?? new Date().toISOString().slice(0, 10);
const FRESHNESS_MSG = freshnessLabel(FRESHEST_DATE);
const IS_STALE = isPricingStale(FRESHEST_DATE, 30);

const SAVINGS = [
  { from: "GPT-4o", to: "GPT-4o mini", save: "$28.80", savePerYear: "$345", pct: "96%", usage: "2M output tokens/month", slug: "gpt-4o-vs-gpt-4o-mini-cost" },
  { from: "ChatGPT Plus", to: "API (light use)", save: "$17.60", savePerYear: "$211", pct: "88%", usage: "300K tokens/month", slug: "subscription-vs-api-ai-cost" },
  { from: "Claude Sonnet", to: "DeepSeek V3", save: "$13.90", savePerYear: "$167", pct: "93%", usage: "1M output tokens/month", slug: "deepseek-vs-gpt4o-cost" },
];

const AFFILIATE_PICKS_DATA = [
  { pickKey: "bestOverall", badge: "bg-slate-900 text-white", model: "Claude 3.5 Sonnet", provider: "Anthropic", cost: "$3 / 1M out tokens", href: "/compare/claude-vs-gpt-cost" },
  { pickKey: "cheapestViable", badge: "bg-emerald-700 text-white", model: "GPT-4o mini", provider: "OpenAI", cost: "$0.60 / 1M out tokens", href: "/compare/gpt-4o-vs-gpt-4o-mini-cost" },
  { pickKey: "startupOption", badge: "bg-violet-700 text-white", model: "Gemini 1.5 Flash", provider: "Google", cost: "$0.075 / 1M out tokens", href: "/compare/gemini-vs-gpt4o-cost" },
  { pickKey: "bestForCoding", badge: "bg-blue-700 text-white", model: "Claude 3.5 Sonnet", provider: "Anthropic", cost: "$3 / 1M out tokens", href: "/compare/claude-vs-cursor-for-coding" },
];

const OVERPAY_METRICS = [
  { label: "01", metric: "$216/yr" },
  { label: "02", metric: "80%" },
  { label: "03", metric: "60–80%" },
];

const AI_TYPE_SLUGS = [
  { slug: "general-ai", icon: "🧠" },
  { slug: "coding-ai", icon: "💻" },
  { slug: "writing-ai", icon: "✍️" },
  { slug: "research-ai", icon: "🔍" },
  { slug: "customer-support-ai", icon: "💬" },
  { slug: "productivity-ai", icon: "⚡" },
];

const JUMP_NAV_ITEMS = [
  { href: "#section-calculator", tKey: "home.jumpNav.calculator" },
  { href: "#section-comparison", tKey: "home.jumpNav.compareModels" },
  { href: "#section-savings", tKey: "home.jumpNav.savings" },
  { href: "#section-affiliate", tKey: "home.jumpNav.recommendations" },
  { href: "#section-ai-types", tKey: "home.jumpNav.aiTypes" },
  { href: "#section-guides", tKey: "home.jumpNav.guides" },
  { href: "#section-faq", tKey: "home.jumpNav.faqs" },
];

const CALC_SCENARIOS = [
  { tKey: "home.calcEntry.scenarios.chatgptPlus", href: "/calculator?scenario=chatgpt-plus-user" },
  { tKey: "home.calcEntry.scenarios.apiDev", href: "/calculator?scenario=developer-coding-workflow" },
  { tKey: "home.calcEntry.scenarios.startupBot", href: "/calculator?scenario=startup-support-bot" },
  { tKey: "home.calcEntry.scenarios.contentTeam", href: "/calculator?scenario=content-team" },
  { tKey: "home.calcEntry.scenarios.soloFounder", href: "/calculator?scenario=solo-founder" },
  { tKey: "home.calcEntry.scenarios.enterprise", href: "/calculator" },
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

function trackHomepageCtaClick(ctaLabel: string, destinationUrl: string, ctaType: "primary" | "secondary" = "primary") {
  trackCta({
    providerId: "",
    ctaLabel,
    ctaType,
    ctaState: "fallback",
    pageType: "home",
    sourceComponent: "Design2/Hero",
    destinationUrl,
    isExternal: false,
  });
}

export function Design2() {
  const { t } = useTranslation();

  return (
    <div className="bg-white">
      <PageSeo
        title="Overpaying for AI Tools? Compare Pricing and Cut Your Monthly Cost"
        description="Compare AI pricing, estimate monthly savings, and find the best-value AI setup without harming quality."
        canonicalUrl="/"
      />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="border-b border-border bg-white py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 mb-6 text-xs font-semibold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t("home.badge")}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.08] mb-5">
                {t("home.hero.h1Line1")}
                <br />
                {t("home.hero.h1Line2")}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mb-5">
                {t("home.hero.subtitle1")}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl mb-8">
                {t("home.hero.subtitle2")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/calculator"
                  data-testid="hp-cta-calc"
                  onClick={() => {
                    trackHomepageCtaClick("Homepage Hero - Open Calculator", "/calculator", "primary");
                  }}
                  className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
                >
                  {t("home.hero.ctaPrimary")}
                </Link>
                <Link
                  href="/compare/claude-vs-gpt-cost"
                  data-testid="hp-cta-compare"
                  onClick={() => {
                    trackHomepageCtaClick("Homepage Hero - Claude vs GPT Comparison", "/compare/claude-vs-gpt-cost", "secondary");
                  }}
                  className="inline-flex items-center justify-center border border-border hover:bg-muted text-foreground font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
                >
                  {t("home.hero.ctaSecondary")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH ────────────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
          <p className="text-xs font-medium text-muted-foreground text-center mb-3 uppercase tracking-wide">
            {t("home.search.label")}
          </p>
          <SearchBox placeholder={t("home.search.placeholder")} />
        </div>
      </section>

      {/* ── STICKY JUMP NAV — sits exactly below the h-14 main header ── */}
      <div className="sticky top-14 z-40 bg-white border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className="text-xs font-semibold text-muted-foreground mr-2 shrink-0 hidden sm:block">{t("home.jumpNav.jumpTo")}</span>
          {JUMP_NAV_ITEMS.map(({ href, tKey }) => (
            <a
              key={href}
              href={href}
              onClick={() => track("section_nav_clicked", { section: href.replace("#section-", ""), sourceSurface: "homepage" })}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-border hover:bg-muted hover:text-foreground text-muted-foreground transition-colors shrink-0"
            >
              {t(tKey)}
            </a>
          ))}
        </div>
      </div>

      {/* ── TRUST / FRESHNESS STRIP ──────────────────────────── */}
      <section className="border-b border-border bg-slate-50 py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-border bg-white px-4 py-3">
              <p className="font-semibold text-foreground">{t("home.trust.step1Title")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("home.trust.step1Desc")}</p>
            </div>
            <div className="rounded-lg border border-border bg-white px-4 py-3">
              <p className="font-semibold text-foreground">{t("home.trust.step2Title")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("home.trust.step2Desc")}</p>
            </div>
            <div className="rounded-lg border border-border bg-white px-4 py-3">
              <p className="font-semibold text-foreground">{t("home.trust.step3Title")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("home.trust.step3Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">{t("home.steps.title")}</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {([
              t("home.steps.step1"),
              t("home.steps.step2"),
              t("home.steps.step3"),
            ] as string[]).map((step, idx) => (
              <div key={idx} className="border border-border rounded-xl p-5 bg-white">
                <p className="text-xs font-semibold text-primary mb-2">{t("home.steps.step")} {idx + 1}</p>
                <p className="text-sm font-medium text-foreground">{step}</p>
              </div>
            ))}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-5">{t("home.steps.nextTitle")}</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { href: "/calculator", titleKey: "home.steps.card1Title", descKey: "home.steps.card1Desc" },
              { href: "/compare/claude-vs-gpt-cost", titleKey: "home.steps.card2Title", descKey: "home.steps.card2Desc" },
              { href: "/compare", titleKey: "home.steps.card3Title", descKey: "home.steps.card3Desc" },
            ].map((card) => (
              <Link key={card.href} href={card.href} className="border border-border rounded-xl p-5 bg-slate-50 hover:border-primary/40 transition-colors">
                <h3 className="font-semibold text-foreground mb-2">{t(card.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(card.descKey)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPLORE BY AI TYPE ───────────────────────────────── */}
      <section id="section-ai-types" className="border-b border-border bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t("home.aiTypes.label")}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{t("home.aiTypes.title")}</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                {t("home.aiTypes.desc")}
              </p>
            </div>
            <Link
              href="/ai-types"
              onClick={() => track("section_nav_clicked", { section: "ai_types", sourceSurface: "homepage" })}
              className="text-sm text-primary hover:underline hidden sm:block font-medium shrink-0"
            >
              {t("home.aiTypes.viewAll")}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {AI_TYPE_SLUGS.map((cat) => (
              <Link
                key={cat.slug}
                href={`/ai-types/${cat.slug}`}
                onClick={() => track("card_clicked", { sourceSurface: "homepage", cardType: "ai_type", slug: cat.slug })}
                className="group block border border-border rounded-xl p-4 sm:p-5 bg-white hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3 mb-2.5">
                  <span className="text-xl leading-none mt-0.5">{cat.icon}</span>
                  <h3 className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                    {t(`home.aiTypes.${cat.slug}.title`)}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">
                  {t(`home.aiTypes.${cat.slug}.tagline`)}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0">
                    {t(`home.aiTypes.${cat.slug}.bestFor`)}
                  </span>
                </div>
                <p className="text-xs text-primary font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {t("home.aiTypes.explore")}
                </p>
              </Link>
            ))}
          </div>
          <Link
            href="/ai-types"
            onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "ai_types_all" })}
            className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-foreground hover:border-slate-400 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            {t("home.aiTypes.viewAllBtn")}
          </Link>
        </div>
      </section>

      {/* ── WHAT THIS TOOL DOES ───────────────────────────────── */}
      <section className="border-b border-border bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{t("home.whatItDoes.label")}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-tight">
                {t("home.whatItDoes.title")}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {t("home.whatItDoes.desc")}
              </p>
              <ul className="space-y-2.5 text-sm text-foreground">
                {([
                  t("home.whatItDoes.bullet1"),
                  t("home.whatItDoes.bullet2"),
                  t("home.whatItDoes.bullet3"),
                  t("home.whatItDoes.bullet4"),
                  t("home.whatItDoes.bullet5"),
                ] as string[]).map((item) => (
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
                  {t("home.whatItDoes.cta")}
                </Link>
              </div>
            </div>

            {/* Why people overpay */}
            <div className="bg-slate-50 rounded-2xl border border-border p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{t("home.overpay.label")}</p>
              <h3 className="text-xl font-bold text-foreground mb-5 leading-tight">{t("home.overpay.title")}</h3>
              <div className="space-y-5">
                {OVERPAY_METRICS.map((p, idx) => (
                  <div key={p.label} className="flex gap-3">
                    <span className="text-xs font-mono font-bold text-muted-foreground/40 mt-0.5 shrink-0 w-5">{p.label}</span>
                    <div>
                      <p className="font-semibold text-sm text-foreground mb-1">{t(`home.overpay.patterns.${idx}.title`)}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-1">{t(`home.overpay.patterns.${idx}.problem`)}</p>
                      <p className="text-xs text-emerald-700 font-medium">{t("home.overpay.fixLabel")} {t(`home.overpay.patterns.${idx}.fix`)}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-white border border-border rounded-md px-2 py-1">
                        <span className="text-sm font-bold font-mono text-foreground">{p.metric}</span>
                        <span className="text-xs text-muted-foreground">{t(`home.overpay.patterns.${idx}.metricLabel`)}</span>
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
                  {t("home.overpay.fixCta")}
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
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{t("home.calcEntry.label")}</p>
              <h2 className="text-3xl font-bold text-foreground mb-3">{t("home.calcEntry.title")}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {t("home.calcEntry.desc")}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> {t("home.calcEntry.bullet1")}</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> {t("home.calcEntry.bullet2")}</li>
                <li className="flex gap-2"><span className="text-emerald-600">✓</span> {t("home.calcEntry.bullet3")}</li>
              </ul>
            </div>
            <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground mb-3">{t("home.calcEntry.scenarioLabel")}</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {CALC_SCENARIOS.map(({ tKey, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => track("calculator_used", { sourceSurface: "homepage", scenario: tKey })}
                    className="border border-border rounded-lg px-3 py-2.5 text-xs text-foreground font-medium hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-center cursor-pointer"
                  >
                    {t(tKey)}
                  </Link>
                ))}
              </div>
              <Link
                href="/calculator"
                data-testid="hp-open-calc"
                onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "calculator_open" })}
                className="block w-full text-center bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors"
              >
                {t("home.calcEntry.openFull")}
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
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">{t("home.savings.label")}</p>
              <h2 className="text-3xl font-bold text-foreground">{t("home.savings.title")}</h2>
              <p className="text-muted-foreground text-sm mt-2">{t("home.savings.desc")}</p>
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
                    <p className="text-2xl font-bold text-emerald-700 font-mono">{ex.save}{t("home.savings.perMonth")}</p>
                    <p className="text-xs text-muted-foreground">{ex.savePerYear}{t("home.savings.perYear")}</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1.5 rounded-lg">-{ex.pct}</span>
                  <span className="text-xs text-emerald-700 font-medium group-hover:underline hidden sm:block">{t("home.savings.seeComparison")}</span>
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
              {t("home.savings.seeYourSavings")}
            </Link>
            <Link
              href="/decision-engine"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "decision_engine_savings" })}
              className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-foreground font-medium px-6 py-3 rounded-lg text-sm transition-colors"
            >
              {t("home.savings.findCheapest")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── AFFILIATE RECOMMENDATIONS ─────────────────────────── */}
      <section id="section-affiliate" className="border-b border-border bg-slate-50 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t("home.affiliate.label")}</p>
            <h2 className="text-3xl font-bold text-foreground">{t("home.affiliate.title")}</h2>
            <p className="text-sm text-muted-foreground mt-2">{t("home.affiliate.desc")}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {AFFILIATE_PICKS_DATA.map((pick) => {
              const target = getPrimaryCta(providerNameToId(pick.provider), "default", pick.href);
              const label = t(`home.affiliate.picks.${pick.pickKey}.label`);
              const pitch = t(`home.affiliate.picks.${pick.pickKey}.pitch`);
              const cta = t(`home.affiliate.picks.${pick.pickKey}.cta`);
              const cardClass = "group flex flex-col bg-white border border-border rounded-xl p-5 hover:border-slate-400 hover:shadow-sm transition-all";
              const cardInner = (
                <>
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md mb-3 ${pick.badge}`}>
                    {label}
                  </span>
                  <h3 className="font-bold text-foreground mb-0.5 text-sm">{pick.model}</h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    {pick.provider} ·{" "}
                    <span className="text-emerald-700 font-mono font-semibold">{pick.cost}</span>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{pitch}</p>
                  <span className="block w-full text-center text-xs font-semibold text-white bg-slate-800 group-hover:bg-slate-700 py-2 rounded-lg transition-colors">
                    {target.isAffiliate ? target.label : cta}
                  </span>
                </>
              );
              return target.isExternal ? (
                <a
                  key={pick.pickKey}
                  href={target.href}
                  rel={target.rel ?? "noopener noreferrer sponsored"}
                  target="_blank"
                  onClick={() => track("affiliate_clicked", { sourceSurface: "homepage", model: pick.model, label })}
                  className={cardClass}
                >
                  {cardInner}
                </a>
              ) : (
                <Link
                  key={pick.pickKey}
                  href={target.href}
                  onClick={() => track("affiliate_clicked", { sourceSurface: "homepage", model: pick.model, label })}
                  className={cardClass}
                >
                  {cardInner}
                </Link>
              );
            })}
          </div>
          <Link
            href="/decision-engine"
            onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "quiz_affiliate" })}
            className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 hover:bg-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
          >
            {t("home.affiliate.quiz")}
          </Link>
        </div>
      </section>

      {/* ── POPULAR COMPARISONS ──────────────────────────────── */}
      <section id="section-comparison" className="border-b border-border bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t("home.comparisons.label")}</p>
              <h2 className="text-3xl font-bold text-foreground">{t("home.comparisons.title")}</h2>
            </div>
            <Link href="/compare" className="text-sm text-primary hover:underline hidden sm:block font-medium">
              {t("home.comparisons.viewAll")}
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
                  <span>{t("home.comparisons.readComparison")}</span><span>→</span>
                </div>
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {t("home.comparisons.cantFind")}{" "}
            <Link href="/decision-engine" className="text-primary font-medium hover:underline">
              {t("home.comparisons.useDecision")}
            </Link>
            {" · "}
            <Link href="/resources" className="text-primary font-medium hover:underline">
              {t("home.comparisons.browseAll")}
            </Link>
          </p>
        </div>
      </section>

      {/* ── PRICING DATA + CHANGELOG TEASER ──────────────────── */}
      <section className="border-b border-border bg-blue-50/40 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{t("home.pricingData.label")}</p>
              <h2 className="text-3xl font-bold text-foreground mb-3">{t("home.pricingData.title")}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                {t("home.pricingData.desc")}
              </p>
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${IS_STALE ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
                <span className={`w-2 h-2 rounded-full ${IS_STALE ? "bg-orange-500" : "bg-emerald-500"}`} />
                {FRESHNESS_MSG}
              </div>
            </div>
            <div className="bg-white border border-border rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{t("home.pricingData.coverageLabel")}</p>
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
                  {t("home.pricingData.viewAll")}
                </Link>
                <Link
                  href="/pricing-changelog"
                  onClick={() => track("card_clicked", { sourceSurface: "homepage", cardType: "pricing_changelog_link" })}
                  className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                >
                  {t("home.pricingData.changelog")}
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
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t("home.guides.label")}</p>
              <h2 className="text-3xl font-bold text-foreground">{t("home.guides.title")}</h2>
            </div>
            <Link href="/resources" className="text-sm text-primary hover:underline hidden sm:block font-medium">
              {t("home.guides.browseAll")}
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
                <p className="text-xs text-primary font-medium mt-3">{t("home.guides.readGuide")}</p>
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
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">{t("home.faq.label")}</p>
          <h2 className="text-2xl font-bold text-foreground mb-6">{t("home.faq.title")}</h2>
          <div className="border border-border rounded-xl overflow-hidden bg-white divide-y divide-border px-6">
            {faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/calculator"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "faq_cta" })}
              className="inline-flex items-center justify-center bg-foreground text-background font-semibold px-6 py-3 rounded-lg text-sm hover:bg-foreground/80 transition-colors"
            >
              {t("home.faq.checkSpend")}
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center justify-center border border-border text-muted-foreground hover:text-foreground font-medium px-6 py-3 rounded-lg text-sm transition-colors"
            >
              {t("home.faq.browseAll")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────── */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t("home.bottomCta.title")}</h2>
          <p className="text-white/60 mb-8 max-w-lg mx-auto leading-relaxed text-sm">
            {t("home.bottomCta.desc")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/calculator"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "bottom_cta" })}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              {t("home.bottomCta.openCalc")}
            </Link>
            <Link
              href="/decision-engine"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "homepage", variant: "bottom_engine" })}
              className="border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              {t("home.bottomCta.findCheapest")}
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <SeoContentBlock />
        <InternalLinks heading="Funnel pages" links={[
          { href: "/calculator", text: "AI Cost Calculator" },
          { href: "/best", text: "Best AI Tools by Value" },
          { href: "/ai-types", text: "Browse AI Types" },
          { href: "/compare", text: "Compare Major Tools" },
        ]} />
      </div>

    </div>
  );
}
