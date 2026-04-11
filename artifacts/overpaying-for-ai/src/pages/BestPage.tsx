import { useParams, Link } from "wouter";
import bestOfData from "@/data/best-of.json";
import modelsData from "@/data/models.json";
import type { AIModel } from "@/engine/types";
import { getPrimaryCta, modelIdToProviderId } from "@/utils/affiliateResolver";
import { AffiliateCta } from "@/components/monetization/AffiliateCta";
import { WinnerBlock } from "@/components/conversion/WinnerBlock";
import { StandardCtaGroup } from "@/components/conversion/StandardCtaGroup";
import { getSavingsSummary, formatSavingsLabel } from "@/utils/savingsEngine";
import { PageSeo } from "@/components/seo/PageSeo";
import { InternalLinks } from "@/components/seo/InternalLinks";
import { generateTitle, generateMetaDescription, generateSchemaProduct } from "@/utils/seo";

const bestOf = bestOfData as typeof bestOfData;
const models = modelsData as AIModel[];

export function BestPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = bestOf.find((b) => b.slug === slug);

  if (!page) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Page not found</h1>
        <p className="text-muted-foreground mb-6">That list doesn't exist yet.</p>
        <Link href="/" className="text-primary hover:underline">Back to home</Link>
      </div>
    );
  }

  const seoTitle = generateTitle(page.title, "best");
  const seoDesc = generateMetaDescription(page.title, "best");
  const rank1Model = models.find((m) => m.id === page.picks[0]?.modelId);
  const seoSchema = rank1Model
    ? generateSchemaProduct(rank1Model.name, page.description)
    : undefined;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageSeo title={seoTitle} description={seoDesc} schema={seoSchema} />
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span>Best Lists</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2.5 py-1 rounded">
            {page.category}
          </span>
          <span className="text-xs text-muted-foreground">Updated {page.updatedAt}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">{page.title}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{page.description}</p>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-5 mb-10 text-sm text-foreground leading-relaxed">
        {page.intro}
      </div>

      {/* Winner Block — rank 1 pick as best overall */}
      {(() => {
        const winner = page.picks.find((p) => p.rank === 1);
        const budgetPick = page.picks.find((p) =>
          p.badge.toLowerCase().includes("budget") || p.badge.toLowerCase().includes("free"),
        );
        if (!winner) return null;

        const winnerProviderId = modelIdToProviderId(winner.modelId);
        const winnerPrimary = getPrimaryCta(winnerProviderId, "default", "/calculator");
        const winnerSecondary = { href: "/decision-engine", isExternal: false, isAffiliate: false, fallbackUsed: true, status: "unavailable" as const, label: "Use decision engine" };

        const winnerSavings = budgetPick && budgetPick.modelId !== winner.modelId
          ? getSavingsSummary(winner.modelId, budgetPick.modelId)
          : null;
        const savingsLabel = winnerSavings ? formatSavingsLabel(winnerSavings) : null;

        return (
          <div className="mb-10">
            <WinnerBlock
              badge="Best Overall"
              title={winner.title}
              rationale={winner.why}
              savingsLabel={savingsLabel || undefined}
              primaryCta={winnerPrimary.isAffiliate
                ? { ...winnerPrimary, label: `Try ${winner.title}` }
                : { ...winnerPrimary, label: `Calculate your cost` }
              }
              secondaryCta={winnerSecondary}
              trackingContext={{ providerId: winnerProviderId, pageType: "best", sourceComponent: "BestPage/WinnerBlock" }}
            />
          </div>
        );
      })()}

      {/* Picks */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-6">Top Picks</h2>
        <div className="space-y-4">
          {page.picks.map((pick) => {
            const model = models.find((m) => m.id === pick.modelId);
            return (
              <div
                key={pick.rank}
                className={`border rounded-lg p-5 flex gap-4 ${pick.rank === 1 ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
                data-testid={`pick-${pick.rank}`}
              >
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${pick.rank === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {pick.rank}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground">{pick.title}</h3>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium">{pick.badge}</span>
                  </div>
                  {model && (
                    <p className="text-xs text-muted-foreground mb-2">{model.provider}</p>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">{pick.why}</p>
                  <p className="text-sm font-semibold text-foreground mb-3">{pick.monthlyEstimate}</p>
                  {(() => {
                    const providerId = modelIdToProviderId(pick.modelId);
                    const primary = getPrimaryCta(providerId, "default", "/calculator");
                    const label = primary.isAffiliate
                      ? `Try ${pick.title}`
                      : `Calculate your cost with ${pick.title}`;
                    return (
                      <AffiliateCta
                        target={{ ...primary, label: `${label} →` }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      />
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      {page.faqs && page.faqs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {page.faqs.map((item, i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* End-of-page CTA */}
      {(() => {
        const winner = page.picks.find((p) => p.rank === 1);
        if (!winner) return null;
        const providerId = modelIdToProviderId(winner.modelId);
        const primary = getPrimaryCta(providerId, "default", "/calculator");
        const secondary = { href: "/decision-engine", isExternal: false, isAffiliate: false, fallbackUsed: true, status: "unavailable" as const, label: "Use decision engine" };
        return (
          <section className="bg-muted/40 border border-border rounded-xl p-6 mb-8 text-center">
            <p className="font-semibold text-foreground mb-1">Not sure which is right for you?</p>
            <p className="text-sm text-muted-foreground mb-4">Use the calculator to estimate your real cost, or take the decision quiz.</p>
            <StandardCtaGroup
              primary={primary.isAffiliate ? { ...primary, label: `Try ${winner.title}` } : { ...primary, label: "Calculate your cost" }}
              secondary={secondary}
            />
          </section>
        );
      })()}

      <InternalLinks links={page.internalLinks} />
    </article>
  );
}

export function BestIndex() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageSeo
        title="Best AI Lists — Ranked by Cost Efficiency | OverpayingForAI"
        description="Curated best-of lists for every AI use case and budget. Find the cheapest AI tool for coding, writing, research, and more."
        canonicalUrl="/best"
      />
      <h1 className="text-3xl font-bold mb-2">Best AI Lists</h1>
      <p className="text-muted-foreground mb-8">Ranked picks for every use case and budget — updated regularly.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {bestOf.map((b) => (
          <Link
            key={b.slug}
            href={`/best/${b.slug}`}
            className="block border border-border rounded-lg p-5 hover:border-primary/40 hover:bg-muted/30 transition-colors"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded mb-3 inline-block">
              {b.category}
            </span>
            <h2 className="font-semibold text-foreground mb-2 text-base">{b.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
          </Link>
        ))}
      </div>
      <InternalLinks
        links={[
          { href: "/best/best-ai-under-20-per-month", text: "Best AI Under $20/month" },
          { href: "/best/best-ai-for-coding-on-a-budget", text: "Best for Coding" },
          { href: "/best/best-ai-for-writing-on-a-budget", text: "Best for Writing" },
          { href: "/calculator", text: "AI Cost Calculator" },
          { href: "/ai-types", text: "Browse AI Types" },
          { href: "/compare", text: "Compare Models" },
        ]}
        heading="Explore more"
      />
    </div>
  );
}
