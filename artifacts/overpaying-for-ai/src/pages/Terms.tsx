import { PageSeo } from "@/components/seo/PageSeo";

export function Terms() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageSeo
        title="Terms of Service | OverpayingForAI"
        description="Terms of service and affiliate disclosure for OverpayingForAI — how the site uses pricing data, makes recommendations, and discloses sponsored links."
      />

      <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: April 2026</p>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            By using OverpayingForAI.com, you agree that all information is provided for educational
            and informational purposes only. We do not guarantee accuracy of pricing, tool
            performance, or outcomes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. Disclaimer</h2>
          <p className="text-muted-foreground leading-relaxed">
            All pricing data, comparisons, and recommendations on this site are provided as-is and
            may not reflect real-time changes made by AI providers. We make no warranties — express
            or implied — regarding the accuracy, completeness, or reliability of any content on this
            site. You should verify all pricing directly with the relevant provider before making any
            purchasing decision.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. Affiliate Disclosure</h2>
          <p className="text-muted-foreground leading-relaxed">
            Some links on this site are affiliate links. We may earn a commission at no additional
            cost to you. Affiliate relationships do not influence our rankings, recommendations, or
            editorial content — all picks are based on pricing data and cost efficiency.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            Users are responsible for their own decisions when selecting AI tools. OverpayingForAI
            and Aniruddh Consultancy Pty Ltd shall not be liable for any direct, indirect,
            incidental, or consequential damages arising from your use of this site or reliance on
            any information provided herein.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions regarding these terms, please contact us at{" "}
            <a
              href="mailto:partners@overpayingforai.com"
              className="text-primary hover:underline"
            >
              partners@overpayingforai.com
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  );
}
