import { useState } from "react";
import { Link } from "wouter";
import { track, trackCta } from "@/utils/analytics";
import aiTypesData from "@/data/aiTypes.json";
import comparisonsData from "@/data/comparisons.json";
import guidesData from "@/data/guides.json";
import bestOfData from "@/data/best-of.json";
import { getPrimaryCta, getSecondaryCta, providerNameToId } from "@/utils/affiliateResolver";
import { WinnerBlock } from "@/components/conversion/WinnerBlock";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { SeoContentBlock } from "@/components/seo/SeoContentBlock";
import { freshnessLabel, isPricingStale } from "@/utils/pricingFreshness";
import modelsData from "@/data/models.json";
import { generateTitle, generateMetaDescription, generateSchemaFAQ } from "@/utils/seo";

const latestModelDate = (modelsData as { last_updated?: string }[])
  .map((m) => m.last_updated)
  .filter(Boolean)
  .sort()
  .reverse()[0] ?? "";

interface AiTypeCategory {
  slug: string;
  title: string;
  icon: string;
  color: string;
  tagline: string;
  description: string;
  use_cases: string[];
  why_cost_matters: string;
  pricing_pattern: { headline: string; body: string; key_points: string[] };
  affiliate_picks: { label: string; badge: string; model: string; provider: string; cost: string; pitch: string; cta: string; href: string }[];
  related_comparisons: string[];
  related_best_lists: string[];
  related_guides: string[];
  faqs: { q: string; a: string }[];
}

const COLOR_ACCENT: Record<string, { hero: string; pill: string; icon: string; cta: string }> = {
  slate: { hero: "bg-slate-900", pill: "bg-slate-100 text-slate-700", icon: "bg-slate-800 text-white", cta: "bg-slate-900 hover:bg-slate-700" },
  blue: { hero: "bg-blue-950", pill: "bg-blue-50 text-blue-700", icon: "bg-blue-800 text-white", cta: "bg-blue-700 hover:bg-blue-800" },
  violet: { hero: "bg-violet-950", pill: "bg-violet-50 text-violet-700", icon: "bg-violet-800 text-white", cta: "bg-violet-700 hover:bg-violet-800" },
  amber: { hero: "bg-amber-950", pill: "bg-amber-50 text-amber-700", icon: "bg-amber-800 text-white", cta: "bg-amber-700 hover:bg-amber-800" },
  teal: { hero: "bg-teal-950", pill: "bg-teal-50 text-teal-700", icon: "bg-teal-800 text-white", cta: "bg-teal-700 hover:bg-teal-800" },
  orange: { hero: "bg-orange-950", pill: "bg-orange-50 text-orange-700", icon: "bg-orange-800 text-white", cta: "bg-orange-700 hover:bg-orange-800" },
};

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

export function AiTypePage({ params }: { params: { slug: string } }) {
  const category = (aiTypesData as AiTypeCategory[]).find((c) => c.slug === params.slug);

  if (!category) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-5xl mb-4">🤔</p>
          <h1 className="text-2xl font-bold text-foreground mb-2">Category not found</h1>
          <p className="text-muted-foreground mb-6">This AI type page doesn't exist yet.</p>
          <Link href="/ai-types" className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-foreground/80 transition-colors">
            Browse all AI types →
          </Link>
        </div>
      </div>
    );
  }

  const colors = COLOR_ACCENT[category.color] ?? COLOR_ACCENT["slate"];

  const relatedComparisons = comparisonsData.filter((c) => category.related_comparisons.includes(c.slug));
  const relatedGuides = guidesData.filter((g) => category.related_guides.includes(g.slug));
  const relatedBestLists = bestOfData.filter((b) => category.related_best_lists.includes(b.slug));

  const seoTitle = generateTitle(category.title, "ai-type");
  const seoDesc = generateMetaDescription(category.title, "ai-type");
  const seoSchema = category.faqs?.length ? generateSchemaFAQ(category.faqs.map((f) => ({ q: f.q, a: f.a }))) : undefined;

  return (
    <div className="bg-white">
      <PageSeo title={seoTitle} description={seoDesc} schema={seoSchema} />
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className={`border-b border-border ${colors.hero} text-white py-14 sm:py-18`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-4 mb-5">
            <span className={`text-2xl w-12 h-12 flex items-center justify-center rounded-xl ${colors.icon} shrink-0`}>
              {category.icon}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">
                <Link href="/ai-types" className="hover:text-white/70 transition-colors">AI Types</Link>
                {" → "}
                {category.title}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">{category.title}</h1>
            </div>
          </div>
          <p className="text-white/70 text-base max-w-2xl leading-relaxed mb-6">{category.description}</p>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">Common use cases</p>
              <ul className="space-y-1.5">
                {category.use_cases.map((u) => (
                  <li key={u} className="text-sm text-white/75 flex gap-2">
                    <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                    {u}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/8 rounded-2xl p-5 border border-white/10">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">Why cost matters here</p>
              <p className="text-sm text-white/75 leading-relaxed">{category.why_cost_matters}</p>
            </div>
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              href="/calculator"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "ai_type_page", category: category.slug, variant: "hero_calculator" })}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              Calculate your {category.title.toLowerCase()} cost →
            </Link>
            <Link
              href="/decision-engine"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "ai_type_page", category: category.slug, variant: "hero_engine" })}
              className="inline-flex items-center gap-2 border border-white/20 text-white font-semibold px-6 py-3 rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              Find my cheapest stack
            </Link>
          </div>
        </div>
      </section>

      {/* ── AFFILIATE PICKS ──────────────────────────────────── */}
      <section className="border-b border-border bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Recommendations</p>
            <h2 className="text-2xl font-bold text-foreground">Best options for {category.title.toLowerCase()}</h2>
            <p className="text-sm text-muted-foreground mt-2">Ranked by cost-efficiency. Not affiliate-driven — just the data.</p>
          </div>

          {/* Best starting option — derived from first affiliate pick */}
          {category.affiliate_picks[0] && (() => {
            const top = category.affiliate_picks[0];
            const providerId = providerNameToId(top.provider);
            const primary = getPrimaryCta(providerId, "default", top.href);
            const secondary = getSecondaryCta(providerId);
            const secondarySafe = secondary.fallbackUsed
              ? { ...secondary, href: "/decision-engine", label: "Use decision engine" }
              : secondary;
            return (
              <WinnerBlock
                badge="Recommended"
                title={`Best starting option: ${top.model}`}
                rationale={top.pitch}
                primaryCta={primary.isAffiliate
                  ? { ...primary, label: `Start with ${top.model}` }
                  : { ...primary, label: `Compare ${top.model}` }
                }
                secondaryCta={secondarySafe}
                className="mb-8"
                trackingContext={{ providerId, pageType: "ai-type", sourceComponent: "AiTypePage/WinnerBlock" }}
              />
            );
          })()}

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {category.affiliate_picks.map((pick) => {
              const target = getPrimaryCta(providerNameToId(pick.provider), "default", pick.href);
              const cardClass = "group flex flex-col bg-white border border-border rounded-xl p-5 hover:border-slate-400 hover:shadow-sm transition-all";
              const cardInner = (
                <>
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md mb-3 ${pick.badge}`}>
                    {pick.label}
                  </span>
                  <h3 className="font-bold text-foreground text-sm mb-0.5">{pick.model}</h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    {pick.provider} · <span className="text-emerald-700 font-mono font-semibold">{pick.cost}</span>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{pick.pitch}</p>
                  <span className="block w-full text-center text-xs font-semibold text-white bg-slate-800 group-hover:bg-slate-700 py-2 rounded-lg transition-colors">
                    {target.isAffiliate ? target.label : pick.cta}
                  </span>
                </>
              );
              const handlePickClick = () => {
                trackCta({
                  providerId: providerNameToId(pick.provider),
                  providerName: pick.provider,
                  ctaLabel: pick.cta,
                  ctaType: "primary",
                  ctaState: target.isAffiliate ? "affiliate" : target.status === "unavailable" ? "unmapped" : "fallback",
                  pageType: "ai-type",
                  sourceComponent: "AiTypePage/PickCard",
                  destinationUrl: target.href,
                  isExternal: target.isExternal,
                });
              };
              return target.isExternal ? (
                <a
                  key={pick.label}
                  href={target.href}
                  rel={target.rel ?? "noopener noreferrer sponsored"}
                  target="_blank"
                  onClick={handlePickClick}
                  className={cardClass}
                >
                  {cardInner}
                </a>
              ) : (
                <Link
                  key={pick.label}
                  href={target.href}
                  onClick={handlePickClick}
                  className={cardClass}
                >
                  {cardInner}
                </Link>
              );
            })}
          </div>
          <Link
            href="/decision-engine"
            onClick={() => trackCta({
              providerId: "",
              ctaLabel: "Take the 5-question quiz",
              ctaType: "secondary",
              ctaState: "fallback",
              pageType: "ai-type",
              sourceComponent: "AiTypePage/AfterPicks",
              destinationUrl: "/decision-engine",
              isExternal: false,
            })}
            className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-foreground font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            Take the 5-question quiz to get a personalised recommendation →
          </Link>
        </div>
      </section>

      {/* ── PRICING PATTERN ──────────────────────────────────── */}
      <section className="border-b border-border bg-slate-50 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Pricing pattern</p>
              <h2 className="text-2xl font-bold text-foreground mb-4">{category.pricing_pattern.headline}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{category.pricing_pattern.body}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/calculator"
                  onClick={() => track("overpaying_cta_clicked", { sourceSurface: "ai_type_page", category: category.slug, variant: "pricing_cta" })}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                >
                  Check your cost →
                </Link>
                {latestModelDate && (
                  <span className={`text-xs px-2.5 py-1.5 rounded-lg border ${isPricingStale(latestModelDate) ? "border-amber-300 bg-amber-50 text-amber-800" : "border-border bg-muted/30 text-muted-foreground"}`}>
                    {isPricingStale(latestModelDate) ? "⚠️ Pricing may be outdated" : freshnessLabel(latestModelDate)}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Key pricing considerations</p>
              {category.pricing_pattern.key_points.map((point, i) => (
                <div key={i} className="flex gap-3 bg-white border border-border rounded-xl px-4 py-3.5">
                  <span className="text-emerald-600 shrink-0 mt-0.5">✓</span>
                  <p className="text-sm text-foreground leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED COMPARISONS ───────────────────────────────── */}
      {relatedComparisons.length > 0 && (
        <section className="border-b border-border bg-white py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Related comparisons</p>
                <h2 className="text-2xl font-bold text-foreground">{category.title} pricing comparisons</h2>
              </div>
              <Link href="/resources#comparisons" className="text-sm text-primary hover:underline hidden sm:block font-medium">All comparisons →</Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedComparisons.map((c) => (
                <Link
                  key={c.slug}
                  href={`/compare/${c.slug}`}
                  onClick={() => track("card_clicked", { sourceSurface: "ai_type_page", category: category.slug, cardType: "comparison", slug: c.slug })}
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
          </div>
        </section>
      )}

      {/* ── GUIDES + BEST LISTS ───────────────────────────────── */}
      {(relatedGuides.length > 0 || relatedBestLists.length > 0) && (
        <section className="border-b border-border bg-slate-50 py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {relatedGuides.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Guides</p>
                  <div className="space-y-3">
                    {relatedGuides.map((g) => (
                      <Link
                        key={g.slug}
                        href={`/guides/${g.slug}`}
                        onClick={() => track("card_clicked", { sourceSurface: "ai_type_page", category: category.slug, cardType: "guide", slug: g.slug })}
                        className="group block border border-border rounded-xl p-4 bg-white hover:border-primary/40 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors flex-1">{g.title}</h3>
                          <span className="text-xs text-muted-foreground shrink-0">{g.readTime}</span>
                        </div>
                        <p className="text-xs text-primary font-medium mt-2">Read guide →</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {relatedBestLists.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Best lists</p>
                  <div className="space-y-3">
                    {relatedBestLists.map((b) => (
                      <Link
                        key={b.slug}
                        href={`/best/${b.slug}`}
                        onClick={() => track("card_clicked", { sourceSurface: "ai_type_page", category: category.slug, cardType: "best_of", slug: b.slug })}
                        className="group block border border-border rounded-xl p-4 bg-white hover:border-primary/40 hover:shadow-sm transition-all"
                      >
                        <span className="text-xs font-semibold text-primary bg-primary/8 px-2 py-1 rounded">{b.category}</span>
                        <h3 className="font-semibold text-foreground text-sm mt-2 leading-snug group-hover:text-primary transition-colors">{b.title}</h3>
                        <p className="text-xs text-primary font-medium mt-2">See list →</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="border-b border-border bg-white py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">FAQ</p>
          <h2 className="text-2xl font-bold text-foreground mb-6">Common questions about {category.title.toLowerCase()}</h2>
          <div className="border border-border rounded-xl overflow-hidden bg-white divide-y divide-border px-6">
            {category.faqs.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── CALCULATOR CTA ───────────────────────────────────── */}
      <section className="bg-slate-900 text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-3xl block mb-3">{category.icon}</span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Find the cheapest {category.title.toLowerCase()} model for your workload</h2>
          <p className="text-white/60 mb-7 max-w-md mx-auto text-sm leading-relaxed">
            Enter your monthly usage and see exactly what you're spending — and how much you'd save with a smarter model choice.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/calculator"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "ai_type_page", category: category.slug, variant: "bottom_cta" })}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-colors"
            >
              Open Calculator →
            </Link>
            <Link
              href="/decision-engine"
              onClick={() => track("overpaying_cta_clicked", { sourceSurface: "ai_type_page", category: category.slug, variant: "bottom_engine" })}
              className="border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              Find my cheapest stack
            </Link>
            <Link
              href="/ai-types"
              className="text-white/50 hover:text-white text-sm font-medium transition-colors"
            >
              ← All AI types
            </Link>
          </div>
        </div>
      </section>

      <SeoContentBlock />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <InternalLinks
          links={[
            { href: "/best", text: "Best AI Tools" },
            { href: "/calculator", text: "AI Cost Calculator" },
            { href: "/ai-types", text: "Browse All AI Types" },
            { href: "/decision-engine", text: "Decision Engine" },
            { href: "/compare", text: "Compare Models" },
            { href: "/guides", text: "Cost Reduction Guides" },
          ]}
          heading="Explore more"
        />
      </section>
    </div>
  );
}
