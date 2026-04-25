import { Fragment } from "react";
import { useParams, Link } from "wouter";
import guidesData from "@/data/guides.json";
import { WinnerBlock } from "@/components/conversion/WinnerBlock";
import { getPrimaryCta } from "@/utils/affiliateResolver";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { SeoContentBlock } from "@/components/seo/SeoContentBlock";

interface GuideWinnerBlock {
  badge: string;
  providerId: string;
  title: string;
  rationale: string;
  primaryCtaLabel?: string;
  afterSectionIndex: number;
}

type GuideEntry = (typeof guidesData)[number];
interface GuideSeoBlock {
  audience?: string;
  notFor?: string;
  pricingInsight?: string;
  alternatives?: string;
  verdict?: string;
}
type GuidePageEntry = GuideEntry & {
  earlyCallout?: string;
  winnerBlock?: GuideWinnerBlock;
  seoBlock?: GuideSeoBlock;
};

const guides = guidesData as GuidePageEntry[];

export function GuidePage() {
  const { slug } = useParams<{ slug: string }>();
  const guide = guides.find((g) => g.slug === slug);

  if (!guide) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Guide not found</h1>
        <p className="text-muted-foreground mb-6">That guide doesn't exist yet.</p>
        <Link href="/" className="text-primary hover:underline">Back to home</Link>
      </div>
    );
  }

  const winnerBlockConfig = guide.winnerBlock;

  return (
    <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <PageSeo title={`${guide.title} | OverpayingForAI`} description={guide.description} />
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span>Guides</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-muted-foreground">{guide.readTime}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">Last reviewed for accuracy</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">{guide.title}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{guide.description}</p>
        <p className="text-xs text-muted-foreground/70 mt-2">This page is periodically reviewed to reflect current pricing and plan changes.</p>
      </div>

      {/* Early callout — fastest win or key recommendation, shown immediately after intro */}
      {guide.earlyCallout && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-5 mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">Fastest win</p>
          <p className="text-sm text-foreground font-medium leading-relaxed">{guide.earlyCallout}</p>
        </div>
      )}

      {/* Content — with optional WinnerBlock injected after a specified section */}
      <div className="prose-like space-y-8 mb-10">
        {guide.sections.map((section, i) => (
          <Fragment key={i}>
            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">{section.heading}</h2>
              <div className="text-muted-foreground leading-relaxed space-y-3">
                {section.content.split("\n\n").map((para, j) => {
                  if (para.startsWith("-")) {
                    const items = para.split("\n").filter((l) => l.startsWith("-"));
                    return (
                      <ul key={j} className="list-disc list-inside space-y-1.5 ml-2">
                        {items.map((item, k) => (
                          <li key={k} className="text-muted-foreground text-sm">
                            {item.replace(/^-\s*/, "")}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={j} className="text-sm sm:text-base">{para}</p>;
                })}
              </div>
            </section>
            {winnerBlockConfig && i === winnerBlockConfig.afterSectionIndex && (() => {
              const primary = getPrimaryCta(winnerBlockConfig.providerId, "winner", "/calculator");
              const secondary = { href: "/compare", isExternal: false, isAffiliate: false, fallbackUsed: true, status: "unavailable" as const, label: "Compare alternatives" };
              return (
                <WinnerBlock
                  badge={winnerBlockConfig.badge}
                  title={winnerBlockConfig.title}
                  rationale={winnerBlockConfig.rationale}
                  primaryCta={primary.isExternal
                    ? { ...primary, label: winnerBlockConfig.primaryCtaLabel ?? `Try ${winnerBlockConfig.title}` }
                    : { ...primary, label: winnerBlockConfig.primaryCtaLabel ?? `See options` }
                  }
                  secondaryCta={secondary}
                  trackingContext={{ providerId: winnerBlockConfig.providerId, pageType: "guide", sourceComponent: "GuidePage/WinnerBlock" }}
                />
              );
            })()}
          </Fragment>
        ))}
      </div>

      {/* Key Takeaways */}
      {guide.keyTakeaways && guide.keyTakeaways.length > 0 && (
        <div className="border border-primary/20 bg-primary/5 rounded-lg p-5 mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-primary mb-3">Key Takeaways</h2>
          <ul className="space-y-2">
            {guide.keyTakeaways.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-primary mt-0.5 flex-shrink-0">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(() => {
        const seoBlock = guide.seoBlock;
        return <SeoContentBlock {...(seoBlock ?? {})} />;
      })()}
      <InternalLinks links={guide.internalLinks} />
    </article>
  );
}

const FEATURED_GUIDE_HUB_TOOLS: Array<{ providerId: string; label: string; note: string }> = [
  { providerId: "anthropic", label: "Claude", note: "Strongest default for writing & research." },
  { providerId: "openai", label: "ChatGPT / OpenAI", note: "Most-supported ecosystem; mini API is cheapest workhorse." },
  { providerId: "deepseek", label: "DeepSeek V3", note: "Cheapest serious model — ~10× less than GPT-4o." },
  { providerId: "google", label: "Gemini", note: "Best free tier right now for daily chat & long context." },
];

export function GuideIndex() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageSeo
        title="AI Cost Guides — Cut Your AI Spend | OverpayingForAI"
        description="Practical, no-fluff guides for reducing AI costs: token optimization, model routing, API vs subscription decisions, and more."
      />
      <h1 className="text-3xl font-bold mb-2">AI Cost Guides</h1>
      <p className="text-muted-foreground mb-8">Practical guides for reducing AI spend and making smarter model choices.</p>

      <section className="mb-10 rounded-2xl border border-border bg-muted/30 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Tools the guides reference most
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {FEATURED_GUIDE_HUB_TOOLS.map(({ providerId, label, note }) => {
            const cta = getPrimaryCta(providerId, "default");
            return (
              <a
                key={providerId}
                href={cta.href}
                target={cta.target}
                rel={cta.rel}
                data-testid={`guides-hub-cta-${providerId}`}
                className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <p className="font-semibold text-foreground text-sm mb-1">{label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">{note}</p>
                <span className="text-xs font-medium text-primary">{cta.label} →</span>
              </a>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">
          Some links are sponsored. We only feature tools the guides actually recommend.
        </p>
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
            className="block border border-border rounded-lg p-5 hover:border-primary/40 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">{g.readTime}</span>
            </div>
            <h2 className="font-semibold text-foreground mb-2 text-base">{g.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{g.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
