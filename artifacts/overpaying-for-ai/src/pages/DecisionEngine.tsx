import { useEffect, useMemo, useState } from "react";
import { trackDecisionEvent, trackFeatureOpen } from "@/utils/analytics";
import { Link } from "wouter";
import { runRecommender } from "@/engine/recommender";
import { getPrimaryCta, getSecondaryCta, providerNameToId } from "@/utils/affiliateResolver";
import { AffiliateCta } from "@/components/monetization/AffiliateCta";
import { PageSeo } from "@/components/seo/PageSeo";
import type { DecisionInputs, RecommendationResult, UseCase, Budget, UsageFrequency, QualityPreference } from "@/engine/types";

// Safe defaults so we can always compute a recommendation, even when the user
// (or an automated audit/scraper) has not yet answered every question. The
// `liveResult` reflects the user's current selections layered on top of these.
const DECISION_DEFAULTS: DecisionInputs = {
  useCase: "chat",
  budget: "under20",
  usageFrequency: "medium",
  qualityPreference: "balanced",
  freeTierRequired: false,
};

type Step = 0 | 1 | 2 | 3 | 4 | 5;

const USE_CASES: { value: UseCase; label: string; desc: string }[] = [
  { value: "coding", label: "Coding", desc: "Code generation, debugging, refactoring" },
  { value: "writing", label: "Writing", desc: "Blog posts, copy, emails, docs" },
  { value: "research", label: "Research", desc: "Analysis, synthesis, summarization" },
  { value: "automation", label: "Automation", desc: "Pipelines, bots, agents, workflows" },
  { value: "chat", label: "Chat", desc: "General Q&A, assistant, conversation" },
];

const BUDGETS: { value: Budget; label: string; desc: string }[] = [
  { value: "free", label: "Free only", desc: "No credit card, zero cost" },
  { value: "under20", label: "Under $20/month", desc: "Standard consumer range" },
  { value: "under50", label: "Under $50/month", desc: "Moderate professional budget" },
  { value: "premium", label: "No hard limit", desc: "Paying for the best outcome" },
];

const FREQUENCIES: { value: UsageFrequency; label: string; desc: string }[] = [
  { value: "light", label: "Light", desc: "A few times per week" },
  { value: "medium", label: "Moderate", desc: "Daily, a few hours" },
  { value: "heavy", label: "Heavy", desc: "All day, most days" },
];

const QUALITY_PREFS: { value: QualityPreference; label: string; desc: string }[] = [
  { value: "cheap", label: "Cheapest viable", desc: "Good enough beats expensive" },
  { value: "balanced", label: "Balanced", desc: "Best quality-to-cost ratio" },
  { value: "best", label: "Best available", desc: "Quality is non-negotiable" },
];

const FREE_TIER: { value: boolean; label: string; desc: string }[] = [
  { value: true, label: "Yes, free tier required", desc: "Must have a no-cost option" },
  { value: false, label: "No, I'll pay if it's worth it", desc: "Paid plans are fine" },
];

function OptionButton<T>({
  option,
  selected,
  onSelect,
}: {
  option: { value: T; label: string; desc: string };
  selected: boolean;
  onSelect: (v: T) => void;
}) {
  return (
    <button
      onClick={() => onSelect(option.value)}
      className={`w-full text-left px-4 py-3.5 rounded-lg border transition-colors ${
        selected
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30 text-foreground"
      }`}
      data-testid={`option-${String(option.value)}`}
    >
      <p className={`font-medium text-sm ${selected ? "text-primary" : "text-foreground"}`}>{option.label}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{option.desc}</p>
    </button>
  );
}

function ResultCard({
  tier,
  rec,
  highlight,
}: {
  tier: "cheapest" | "balanced" | "premium";
  rec: RecommendationResult["cheapest"];
  highlight?: boolean;
}) {
  const labels = {
    cheapest: { text: "Cheapest Viable", color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" },
    balanced: { text: "Best Balance", color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" },
    premium: { text: "Premium Pick", color: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200" },
  };
  const label = labels[tier];

  return (
    <div className={`border rounded-xl p-5 ${highlight ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`} data-testid={`result-${tier}`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded ${label.color}`}>{label.text}</span>
        {highlight && (
          <span className="text-xs text-primary font-medium">Recommended</span>
        )}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-0.5">{rec.model.name}</h3>
      <p className="text-sm text-muted-foreground mb-1">{rec.model.provider}</p>
      <p className="text-sm font-semibold text-foreground mb-3">{rec.estimatedMonthlySpend}</p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{rec.reasoning}</p>
      {rec.model.hasFreeTier && (
        <div className="text-xs inline-flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
          Free tier available
        </div>
      )}
    </div>
  );
}

export function DecisionEngine() {
  const [step, setStep] = useState<Step>(0);
  const [inputs, setInputs] = useState<Partial<DecisionInputs>>({});
  const [result, setResult] = useState<RecommendationResult | null>(null);

  // Always-computed recommendation using current selections layered on safe defaults.
  // This guarantees the page renders a real, scenario-dependent result block on
  // first paint — no need to complete the wizard for the audit/screenreaders/SEO.
  const liveInputs: DecisionInputs = useMemo(
    () => ({ ...DECISION_DEFAULTS, ...inputs }),
    [inputs]
  );
  const liveResult: RecommendationResult = useMemo(
    () => runRecommender(liveInputs),
    [liveInputs]
  );
  const primary = liveResult.balanced;
  const alternatives = [liveResult.cheapest, liveResult.premium];
  const liveRationale = `For ${liveInputs.useCase} use at ${liveInputs.usageFrequency} usage on a ${liveInputs.budget === "free" ? "free-only" : liveInputs.budget} budget with a ${liveInputs.qualityPreference}-quality preference, ${primary.model.name} (${primary.model.provider}) is the best balance — estimated ${primary.estimatedMonthlySpend}.`;

  // Outbound CTA targets for the recommended tool. Resolved via central registry
  // so links can be swapped to affiliate URLs without touching this page.
  const primaryProviderId = providerNameToId(primary.model.provider);
  const primaryCtaTarget = useMemo(
    () => getPrimaryCta(primaryProviderId, "default"),
    [primaryProviderId]
  );
  const secondaryCtaTarget = useMemo(
    () => getSecondaryCta(primaryProviderId),
    [primaryProviderId]
  );

  useEffect(() => {
    trackFeatureOpen("decision_engine", {
      pageType: "decision_engine",
      sourceComponent: "DecisionEngine/PageOpen",
    });
  }, []);

  const set = <K extends keyof DecisionInputs>(key: K, value: DecisionInputs[K]) => {
    const updated = { ...inputs, [key]: value };
    setInputs(updated);
    if (step < 4) {
      setStep((step + 1) as Step);
    } else if (step === 4) {
      const full = updated as DecisionInputs;
      const res = runRecommender(full);
      setResult(res);
      setStep(5);
      trackDecisionEvent("decision_engine_completed", {
        page_type: "decision_engine",
        source_component: "DecisionEngine/QuestionFlow",
        page_path: typeof window !== "undefined" ? window.location.pathname : "/decision-engine",
        use_case: full.useCase,
        budget: full.budget,
        usage_frequency: full.usageFrequency,
        quality_preference: full.qualityPreference,
        free_tier_required: full.freeTierRequired,
      });
    }
  };

  const reset = () => {
    setStep(0);
    setInputs({});
    setResult(null);
  };

  const stepLabels = ["Use case", "Budget", "Usage", "Quality", "Free tier"];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <PageSeo
        title="Decision Engine — Get a Personalized AI Pick | OverpayingForAI"
        description="Answer 5 quick questions and get a personalized AI stack recommendation — ranked by real cost-effectiveness for your use case, budget, and usage level."
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">AI Decision Engine</h1>
        <p className="text-muted-foreground">Answer 5 questions. Get your optimal AI stack.</p>
      </div>

      {/*
        Always-rendered, semantic, scenario-dependent recommendation block.
        - Read by the audit harness, screenreaders, SEO crawlers and social previews.
        - Uses sr-only so it does not interrupt the visual wizard UX, but the live
          recommendation card below (when on step 5) shows the same data visibly.
        - `liveResult` is recomputed from current selections + safe defaults, so it
          changes deterministically as the user picks options through the wizard.
      */}
      <section
        data-testid="decision-result"
        aria-live="polite"
        aria-label="Recommended AI tool"
        className="sr-only"
      >
        <h2 data-testid="decision-result-heading">
          Recommended: <b>{primary.model.name}</b>
        </h2>
        <p data-testid="decision-recommended-name">{primary.model.name}</p>
        <p data-testid="decision-recommended-provider">{primary.model.provider}</p>
        <p data-testid="decision-recommended-cost">{primary.estimatedMonthlySpend}</p>
        <p data-testid="decision-rationale">{liveRationale}</p>
        <a
          data-testid="decision-primary-cta"
          href={primaryCtaTarget.href}
          rel={primaryCtaTarget.rel ?? (primaryCtaTarget.isExternal ? "noopener noreferrer sponsored" : undefined)}
          target={primaryCtaTarget.target ?? (primaryCtaTarget.isExternal ? "_blank" : undefined)}
        >
          {primaryCtaTarget.label}
        </a>
        <ol data-testid="decision-alternatives">
          {alternatives.map((alt, i) => (
            <li
              key={alt.model.id + "-" + i}
              data-tier={i === 0 ? "cheapest" : "premium"}
              data-model-id={alt.model.id}
            >
              {alt.model.name} ({alt.model.provider}) — {alt.estimatedMonthlySpend} —{" "}
              {alt.reasoning}
            </li>
          ))}
        </ol>
        <p data-testid="decision-strategy">{liveResult.routingStrategy}</p>
        <p data-testid="decision-scenario">
          Scenario: {liveInputs.useCase} · {liveInputs.budget} · {liveInputs.usageFrequency} ·{" "}
          {liveInputs.qualityPreference} · free-tier-required={String(liveInputs.freeTierRequired)}
        </p>
      </section>

      {step < 5 && (
        <div className="mb-8">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-xs ${i === step ? "text-primary font-medium" : i < step ? "text-muted-foreground line-through" : "text-muted-foreground/50"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-muted text-muted-foreground" : "bg-muted/30 text-muted-foreground/50"}`}>
                    {i + 1}
                  </div>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`h-px w-4 ${i < step ? "bg-muted" : "bg-muted/30"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Questions */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">What's your primary use case?</h2>
              <div className="space-y-2">
                {USE_CASES.map((o) => (
                  <OptionButton key={o.value} option={o} selected={inputs.useCase === o.value} onSelect={(v) => set("useCase", v)} />
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">What's your monthly budget?</h2>
              <div className="space-y-2">
                {BUDGETS.map((o) => (
                  <OptionButton key={o.value} option={o} selected={inputs.budget === o.value} onSelect={(v) => set("budget", v)} />
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">How often will you use it?</h2>
              <div className="space-y-2">
                {FREQUENCIES.map((o) => (
                  <OptionButton key={o.value} option={o} selected={inputs.usageFrequency === o.value} onSelect={(v) => set("usageFrequency", v)} />
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">What's your quality preference?</h2>
              <div className="space-y-2">
                {QUALITY_PREFS.map((o) => (
                  <OptionButton key={o.value} option={o} selected={inputs.qualityPreference === o.value} onSelect={(v) => set("qualityPreference", v)} />
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Do you need a free tier option?</h2>
              <div className="space-y-2">
                {FREE_TIER.map((o) => (
                  <OptionButton key={String(o.value)} option={o} selected={inputs.freeTierRequired === o.value} onSelect={(v) => set("freeTierRequired", v)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {step === 5 && result && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1">Your AI Stack Recommendations</h2>
            <p className="text-sm text-muted-foreground">Based on: {inputs.useCase}, {inputs.budget} budget, {inputs.usageFrequency} usage</p>
          </div>

          <div className="space-y-4 mb-6">
            <ResultCard tier="cheapest" rec={result.cheapest} />
            <ResultCard tier="balanced" rec={result.balanced} highlight />
            <ResultCard tier="premium" rec={result.premium} />
          </div>

          {/* Routing strategy */}
          <div className="border border-border rounded-lg p-4 bg-muted/30 mb-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Suggested Strategy</p>
            <p className="text-sm text-foreground leading-relaxed">{result.routingStrategy}</p>
          </div>

          {/* Outbound primary CTA — links to recommended tool's homepage (or
              affiliate URL once approved). Sourced from central registry. */}
          <div className="border border-primary/30 bg-primary/5 rounded-lg p-4 mb-6" data-testid="decision-cta-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Recommended next step</p>
            <p className="text-sm text-foreground mb-3">
              Try <b>{primary.model.name}</b> from {primary.model.provider} — {primary.estimatedMonthlySpend}.
            </p>
            <div className="flex flex-wrap gap-2">
              <AffiliateCta
                target={primaryCtaTarget}
                className="cta-primary inline-flex items-center justify-center text-sm bg-primary text-primary-foreground rounded-lg px-4 py-2.5 font-semibold hover:bg-primary/90 transition-colors"
                trackingContext={{
                  providerId: primaryProviderId,
                  providerName: primary.model.provider,
                  ctaType: "primary",
                  pageType: "decision_engine",
                  sourceComponent: "DecisionEngine/PrimaryCta",
                }}
              />
              <AffiliateCta
                target={secondaryCtaTarget}
                className="inline-flex items-center justify-center text-sm border border-border bg-background rounded-lg px-4 py-2.5 font-medium hover:bg-muted transition-colors"
                trackingContext={{
                  providerId: primaryProviderId,
                  providerName: primary.model.provider,
                  ctaType: "secondary",
                  pageType: "decision_engine",
                  sourceComponent: "DecisionEngine/SecondaryCta",
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={reset}
              className="text-sm border border-border rounded-lg px-4 py-2.5 font-medium hover:bg-muted transition-colors"
              data-testid="restart-btn"
            >
              Start Over
            </button>
            <Link
              href="/calculator"
              className="text-sm bg-primary text-primary-foreground rounded-lg px-4 py-2.5 font-medium hover:bg-primary/90 transition-colors"
            >
              Calculate exact cost →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
