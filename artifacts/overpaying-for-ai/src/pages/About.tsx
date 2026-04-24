import { Link } from "wouter";
import { PageSeo } from "@/components/seo/PageSeo";

export function About() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <PageSeo
        title="About OverpayingForAI"
        description="Learn how OverpayingForAI helps you avoid overpaying for AI tools through pricing clarity, comparisons, and decision support."
        canonicalUrl="/about"
      />

      <h1 className="text-3xl font-bold tracking-tight mb-2">About OverpayingForAI</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: April 2026</p>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-bold mb-3">What this site does</h2>
          <p className="text-muted-foreground leading-relaxed">
            OverpayingForAI helps developers, founders, and teams find the cheapest AI setup that
            actually meets their needs. The site provides real token-cost data, head-to-head
            comparisons, and a cost calculator — so you can make an informed decision instead of
            defaulting to the most-marketed model.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Why it exists</h2>
          <p className="text-muted-foreground leading-relaxed">
            AI pricing is genuinely confusing. Models are priced differently per input token, per
            output token, per subscription tier, and per provider — with frequent changes that most
            "best AI tools" roundups don't track. The result is that most people pay for more
            capability than they need, or use a tool that's far more expensive than an equivalent
            alternative.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            This site exists to make that comparison easy, honest, and free.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">What we cover</h2>
          <ul className="space-y-3 text-muted-foreground leading-relaxed">
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              <span>
                <strong className="text-foreground">Pricing data</strong> — token costs and
                subscription prices for major AI models, sourced from official provider pages and
                reviewed regularly.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              <span>
                <strong className="text-foreground">Model comparisons</strong> — side-by-side cost
                breakdowns for common switching decisions, such as Claude vs GPT-4o or API vs
                subscription.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              <span>
                <strong className="text-foreground">Cheaper alternatives</strong> — category pages
                identifying the best budget options by use case: coding, writing, research,
                automation, and more.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              <span>
                <strong className="text-foreground">Cost calculator</strong> — enter your monthly
                token usage and get an immediate estimate of your AI spend across models, plus
                alternatives that could cost less.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              <span>
                <strong className="text-foreground">Decision engine</strong> — answer a few
                questions about your use case and get a specific model recommendation based on cost
                efficiency.
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">What we don't do</h2>
          <ul className="space-y-3 text-muted-foreground leading-relaxed">
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              We do not rank models by hype, press coverage, or marketing budget.
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              We do not accept payment to alter rankings, pricing data, or editorial content.
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              We do not claim that the cheapest model is always the best — only that most people
              are paying for more than they need.
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold shrink-0">·</span>
              We do not track users or require sign-up. All tools on this site are free to use.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">How recommendations work</h2>
          <p className="text-muted-foreground leading-relaxed">
            Recommendations on this site are based on a single criterion: which model delivers
            sufficient quality for your use case at the lowest verifiable price. We evaluate token
            pricing, subscription value, task fit, and free tier availability. Where affiliate
            relationships exist, they are disclosed — see our{" "}
            <Link href="/affiliate-disclosure" className="text-primary hover:underline">
              affiliate disclosure
            </Link>
            . Affiliate status does not influence rankings or recommendations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Data accuracy</h2>
          <p className="text-muted-foreground leading-relaxed">
            All pricing data is sourced from official provider pages. AI pricing changes
            frequently — if you spot an error or outdated figure, please email us and we'll
            update it promptly. We treat pricing accuracy as a core editorial standard.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-3">Get in touch</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            For pricing corrections, partnership enquiries, or general feedback, see the{" "}
            <Link href="/contact" className="text-primary hover:underline">contact page</Link>.
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
