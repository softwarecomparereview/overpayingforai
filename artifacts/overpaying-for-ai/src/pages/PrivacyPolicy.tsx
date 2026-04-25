import { PageSeo } from "@/components/seo/PageSeo";
import { Link } from "wouter";

export function PrivacyPolicy() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageSeo
        title="Privacy Policy | OverpayingForAI"
        description="Read the OverpayingForAI Privacy Policy, including how we handle analytics, contact emails, affiliate links, and website usage data."
        canonicalUrl="/privacy-policy"
      />

      <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: April 2026</p>

      <p className="text-muted-foreground leading-relaxed mb-10">
        OverpayingForAI helps users avoid overpaying for AI tools through pricing clarity,
        comparisons, calculators, and decision support. This policy explains what information we
        collect when you use the site and how we use it.
      </p>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-bold mb-3">1. Information we collect</h2>
          <ul className="space-y-3 text-muted-foreground leading-relaxed">
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              <span>
                <strong className="text-foreground">Website analytics</strong> — we collect basic,
                aggregated usage data such as pages visited, session duration, and referral source.
                This data is not linked to individually identifiable users.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              <span>
                <strong className="text-foreground">Contact enquiries</strong> — if you email us
                directly, we receive the information you include in that email (your address,
                name if provided, and message content).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              <span>
                <strong className="text-foreground">Affiliate click data</strong> — where
                applicable, affiliate platforms may record that a click originated from this site.
                We do not receive personally identifying information about individual visitors
                from these platforms.
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">2. How we use information</h2>
          <ul className="space-y-3 text-muted-foreground leading-relaxed">
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              To improve site content, tools, and pricing data based on which pages and features
              are most used.
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              To understand which comparisons, calculators, and guides are most useful to
              visitors.
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              To respond to enquiries sent via email.
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              To track aggregate affiliate or outbound click performance for revenue reporting
              purposes.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">3. Analytics</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use analytics tools that may collect aggregated usage data, including page views,
            session counts, and event interactions. This data is collected in a way that does not
            allow us to identify individual visitors. We do not use this data for advertising
            profiling or sell it to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">4. Affiliate links</h2>
          <p className="text-muted-foreground leading-relaxed">
            Some links on this site are affiliate or referral links. When you click these links
            and subsequently make a purchase, we may earn a commission at no additional cost to
            you. Affiliate platforms may set their own cookies or tracking to attribute
            conversions. For more detail on how affiliate links are used editorially, see our{" "}
            <Link href="/affiliate-disclosure" className="text-primary hover:underline">
              affiliate disclosure
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">5. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            This site may use cookies or similar browser technologies for analytics and site
            improvement purposes. These are typically session or persistent cookies set by
            analytics or affiliate services. You can disable cookies in your browser settings,
            though this may affect some site functionality.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">6. Data sharing</h2>
          <p className="text-muted-foreground leading-relaxed">
            We do not sell personal information. We do not share personally identifying
            information with third parties for marketing purposes. Aggregated, non-identifying
            usage data may be shared with or processed by service providers such as analytics
            platforms and affiliate networks that help us operate the site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">7. Contact</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            If you have questions about this policy or how your information is handled, please
            get in touch.
          </p>
          <a
            href="mailto:contact@overpayingforai.com"
            className="text-primary font-semibold hover:underline"
          >
            contact@overpayingforai.com
          </a>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">8. Updates to this policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            This privacy policy may be updated as the site evolves, new tools are added, or
            applicable requirements change. The "Last updated" date at the top of this page
            reflects when the policy was last revised. Continued use of the site after any
            update constitutes acceptance of the revised policy.
          </p>
        </section>
      </div>
    </article>
  );
}
