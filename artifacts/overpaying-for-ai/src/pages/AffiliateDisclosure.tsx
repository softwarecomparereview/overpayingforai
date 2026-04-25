import { Link } from "wouter";
import { PageSeo } from "@/components/seo/PageSeo";

export function AffiliateDisclosure() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageSeo
        title="Affiliate Disclosure"
        description="Learn how affiliate links work on OverpayingForAI and how we maintain trust and unbiased recommendations."
        canonicalUrl="/affiliate-disclosure"
      />

      <h1 className="text-3xl font-bold tracking-tight mb-2">Affiliate Disclosure</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: April 2026</p>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-bold mb-3">Affiliate links on this site</h2>
          <p className="text-muted-foreground leading-relaxed">
            Some links on OverpayingForAI are affiliate links. This means that if you click a link
            and subsequently make a purchase or sign up for a service, we may receive a commission
            from the provider — at no additional cost to you. Affiliate links are used selectively
            for tools and services we already recommend on cost-efficiency grounds.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Our transparency commitment</h2>
          <p className="text-muted-foreground leading-relaxed">
            We disclose affiliate relationships clearly and do not obscure them. Where a link in a
            recommendation, comparison, or "best of" list is an affiliate link, this is noted either
            inline or in the page disclosure. We do not use dark patterns, hidden tracking links, or
            misleading calls to action.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">How affiliate status affects our content</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            It doesn't — and here's what that means in practice:
          </p>
          <ul className="space-y-3 text-muted-foreground leading-relaxed">
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              Rankings and recommendations are based on cost efficiency and task fit, not on which
              provider pays the highest affiliate commission.
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              A model with no affiliate programme can — and often does — appear as the top
              recommendation if it is the cheapest viable option for a given use case.
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              Pricing data is sourced from official provider pages and is not altered to make
              affiliated products appear cheaper than they are.
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              We do not accept payment from providers to change rankings, add positive editorial
              content, or suppress negative comparisons.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Why we use affiliate revenue</h2>
          <p className="text-muted-foreground leading-relaxed">
            OverpayingForAI is a free, no-signup tool. Affiliate revenue helps cover the cost of
            maintaining and updating pricing data, building calculators and decision tools, and
            keeping the site free for everyone. Without it, the site would require either paid
            access or advertising — both of which create worse incentives than a well-managed
            affiliate model.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Pricing accuracy disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed">
            All pricing data on this site is sourced from official provider pages and reviewed
            regularly. AI pricing changes frequently. We make no warranty that figures shown are
            real-time accurate. Always verify pricing directly with the provider before making a
            purchasing decision. If you spot an outdated price, please{" "}
            <Link href="/contact" className="text-primary hover:underline">contact us</Link> and
            we'll update it promptly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Questions</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            If you have questions about a specific link or our affiliate relationships, get in touch.
          </p>
          <a
            href="mailto:contact@overpayingforai.com"
            className="text-primary font-semibold hover:underline"
          >
            contact@overpayingforai.com
          </a>
        </section>
      </div>
    </article>
  );
}
