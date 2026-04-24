import { Link } from "wouter";
import { PageSeo } from "@/components/seo/PageSeo";

export function Contact() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageSeo
        title="Contact OverpayingForAI"
        description="Contact OverpayingForAI for pricing corrections, partnerships, affiliate enquiries, vendor updates, and feedback."
        canonicalUrl="/contact"
      />

      <h1 className="text-3xl font-bold tracking-tight mb-2">Contact OverpayingForAI</h1>
      <p className="text-sm text-muted-foreground mb-10">
        OverpayingForAI helps developers, teams, and founders find the cheapest viable AI setup —
        backed by real token-cost data, not marketing claims.
      </p>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-bold mb-4">What you can contact us about</h2>
          <ul className="space-y-3 text-muted-foreground leading-relaxed">
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              <span>
                <strong className="text-foreground">Pricing corrections</strong> — if a price on this site is wrong or has changed, let us know and we'll update it promptly.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              <span>
                <strong className="text-foreground">Vendor and provider updates</strong> — AI providers can submit updated pricing information or model specs for inclusion in our data.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              <span>
                <strong className="text-foreground">Affiliate and partnership enquiries</strong> — if you represent an AI product and want to explore an affiliate or partnership arrangement.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              <span>
                <strong className="text-foreground">Media and press</strong> — for interview requests, data citations, or editorial collaboration, see the{" "}
                <Link href="/media-kit" className="text-primary hover:underline">media kit</Link>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              <span>
                <strong className="text-foreground">General feedback</strong> — suggestions for new comparisons, tools, or content areas we should cover.
              </span>
            </li>
          </ul>
        </section>

        <section className="border border-border rounded-xl p-6 bg-muted/30">
          <h2 className="text-xl font-bold mb-3">Get in touch</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Email is the best way to reach us. We aim to respond within 2–3 business days.
          </p>
          <a
            href="mailto:contact@overpayingforai.com"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline text-base"
          >
            contact@overpayingforai.com
          </a>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Editorial note on pricing corrections</h2>
          <p className="text-muted-foreground leading-relaxed">
            AI pricing changes frequently. We review and update model pricing regularly, but if you
            spot a discrepancy between what's shown here and what a provider currently charges,
            please email us with a link to the provider's official pricing page. We treat pricing
            accuracy as a core editorial standard and will prioritise corrections.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            All pricing data on this site is sourced from official provider pages. We do not accept
            payment to alter pricing data or rankings.
          </p>
        </section>
      </div>
    </article>
  );
}
