import { useEffect } from "react";
import { PageSeo } from "@/components/seo/PageSeo";
import { trackGaEvent } from "@/utils/ga4";

const MAILTO =
  "mailto:contact@overpayingforai.com?subject=AI%20Cost%20%26%20Reliability%20Audit";

const WHAT_WE_CHECK_ID = "what-we-check";

function trackAuditEvent(name: string) {
  trackGaEvent(name, { page_path: "/audit/ai-cost-reliability-audit" });
}

export function AiCostAudit() {
  useEffect(() => {
    trackAuditEvent("audit_page_view");
  }, []);

  function handlePrimaryCta() {
    trackAuditEvent("audit_primary_cta_click");
  }

  function handleSecondaryCta() {
    trackAuditEvent("audit_secondary_cta_click");
    const el = document.getElementById(WHAT_WE_CHECK_ID);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  function handleContactClick() {
    trackAuditEvent("audit_contact_click");
  }

  return (
    <>
      <PageSeo
        title="AI Cost & Reliability Audit | OverpayingForAI"
        description="Find where your team is overpaying for AI tools, subscriptions, APIs, and unreliable workflows. Get a fixed-scope AI cost and reliability audit in 1–2 weeks."
        canonicalUrl="/audit/ai-cost-reliability-audit"
      />

      {/* ── Hero ── */}
      <section className="border-b border-border bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            AI Cost &amp; Reliability Audit
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
            Stop paying for AI outputs you can't trust.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-3 max-w-2xl">
            OverpayingForAI helps teams find wasted AI spend, unreliable
            workflows, and avoidable tool overlap before it becomes expensive.
          </p>
          <p className="text-base text-muted-foreground mb-10">
            Get a fixed-scope AI Cost &amp; Reliability Audit in 1–2 weeks.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={MAILTO}
              onClick={handlePrimaryCta}
              className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Request an audit
            </a>
            <button
              onClick={handleSecondaryCta}
              className="border border-border text-foreground font-medium px-6 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm"
            >
              See what we check
            </button>
          </div>
        </div>
      </section>

      {/* ── Hidden cost ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <h2 className="text-2xl font-bold tracking-tight mb-3">
          The hidden cost of AI is not just the subscription
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">
          AI waste rarely shows up as one obvious bill. It usually shows up as
          duplicated tools, underused premium plans, expensive model defaults,
          inconsistent outputs, and manual rework.
        </p>
        <ul className="space-y-3 mb-6">
          {[
            "Too many overlapping AI subscriptions",
            "Premium plans used for basic work",
            "API usage routed to expensive models by default",
            "Prompts producing inconsistent answers",
            "Staff manually checking AI output because trust is low",
            "Workflows that look automated but still need rework",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-muted-foreground leading-relaxed">
              <span className="text-primary font-bold shrink-0 mt-0.5">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          That is how teams overpay: not just through price, but through rework,
          duplication, and poor model choices.
        </p>
      </section>

      {/* ── What the audit is ── */}
      <section className="border-t border-border bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <h2 className="text-2xl font-bold tracking-tight mb-3">
            AI Cost &amp; Reliability Audit
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            A short, practical review of your AI tools, prompts, model usage,
            and workflows.
          </p>
          <p className="font-semibold text-foreground mb-3">We identify:</p>
          <ul className="space-y-2">
            {[
              "Where you are overspending",
              "Where cheaper alternatives may fit",
              "Where API or subscription choices are mismatched",
              "Where AI outputs are inconsistent",
              "Where validation or retry logic is missing",
              "What to fix first",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-muted-foreground">
                <span className="text-primary font-bold shrink-0">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── What we review (cards) ── */}
      <section id={WHAT_WE_CHECK_ID} className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <h2 className="text-2xl font-bold tracking-tight mb-8">
          What we review
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            {
              title: "Tool and subscription overlap",
              copy: "We look for duplicate tools, unused paid plans, avoidable seat costs, and subscriptions that no longer match actual usage.",
            },
            {
              title: "API and model cost fit",
              copy: "We check whether expensive models are being used where cheaper or faster models would be enough.",
            },
            {
              title: "Output reliability",
              copy: "We test whether the same prompt produces materially different, incomplete, or risky outputs across repeated runs.",
            },
            {
              title: "Workflow risk",
              copy: "We identify places where AI output is being trusted without enough review, validation, fallback, or human approval.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="border border-border rounded-xl p-6 bg-muted/30"
            >
              <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What you receive ── */}
      <section className="border-t border-border bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            What you receive
          </h2>
          <ul className="space-y-3">
            {[
              "AI spend and tool-overlap summary",
              "Model/API cost-fit review",
              "Prompt reliability and drift findings",
              "Risk flags for inconsistent outputs",
              "Quick-win savings recommendations",
              "Practical validation and retry patterns",
              "Prioritized 30-day action plan",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-muted-foreground leading-relaxed">
                <span className="text-primary font-bold shrink-0 mt-0.5">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Who this is for ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Who this is for
        </h2>
        <ul className="space-y-3">
          {[
            "Founders and operators using several AI tools",
            "Consultants building AI-enabled delivery workflows",
            "Agencies paying for multiple AI subscriptions",
            "Engineering teams using AI APIs",
            "Small teams unsure which AI plans are actually worth paying for",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-muted-foreground leading-relaxed">
              <span className="text-primary font-bold shrink-0 mt-0.5">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Pricing ── */}
      <section className="border-t border-border bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Pricing</h2>
          <div className="border border-border rounded-xl p-6 sm:p-8 bg-background max-w-lg">
            <p className="text-2xl font-bold text-foreground mb-1">
              From $2,500 AUD
            </p>
            <p className="text-sm text-muted-foreground mb-4">Fixed-scope audit</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Typical timeline:</span>{" "}
                1–2 weeks.
              </p>
              <p>
                <span className="font-medium text-foreground">Guarantee:</span>{" "}
                If we do not find meaningful improvement opportunities, you do
                not pay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
        <h2 className="text-2xl font-bold tracking-tight mb-8">
          Common questions
        </h2>
        <div className="space-y-6">
          {[
            {
              q: "Do you need access to our systems?",
              a: "No. We can start with tool lists, billing exports, sample prompts, workflows, and example outputs.",
            },
            {
              q: "Is this only about reducing cost?",
              a: "No. Cost is part of it. The bigger issue is paying for AI workflows that still produce inconsistent or risky outputs.",
            },
            {
              q: "Do you replace our tools?",
              a: "No. The audit recommends what to keep, downgrade, switch, validate, or stop using.",
            },
            {
              q: "Is this suitable for small teams?",
              a: "Yes. Small teams often overpay because they subscribe to too many overlapping tools too quickly.",
            },
            {
              q: "Is this a SaaS product?",
              a: "No. This is a fixed-scope audit service. Productized tooling may come later only if demand is validated.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-border pb-6 last:border-0 last:pb-0">
              <p className="font-semibold text-foreground mb-2">{q}</p>
              <p className="text-muted-foreground leading-relaxed text-sm">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="border-t border-border bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
            Find out where AI spend is leaking.
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
            Send us your current AI stack, rough monthly spend, or one workflow
            you are unsure about. We will confirm whether an audit is worth
            doing.
          </p>
          <a
            href={MAILTO}
            onClick={handleContactClick}
            className="inline-block bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors text-sm"
          >
            Request an audit
          </a>
        </div>
      </section>
    </>
  );
}
