import { useState, useEffect } from "react";
import { trackDecisionEvent, trackFeatureOpen } from "@/utils/analytics";
import { Link } from "wouter";
import { runRecommender } from "@/engine/recommender";
import type { DecisionInputs, RecommendationResult, UseCase, Budget, UsageFrequency, QualityPreference } from "@/engine/types";

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
      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-colors ${
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
    <div className={`border rounded-2xl p-5 ${highlight ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`} data-testid={`result-${tier}`}>
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
    <div className="bg-white">
      <section className="border-b border-border bg-slate-900 text-white py-14 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Decision engine</p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">AI Decision Engine</h1>
              <p className="text-white/70 text-base max-w-2xl leading-relaxed mb-5">
                Answer 5 questions and get a practical AI stack recommendation. This is for people who need the cheapest viable setup, not just a single price comparison.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 text-white/70">5-question flow</span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 text-white/70">Cheapest, balanced, premium picks</span>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/15 text-white/70">Built for practical decisions</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">What you get</p>
              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-sm font-semibold text-white">A ranked stack recommendation</p>
                  <p className="text-xs text-white/60 mt-1">Not just one tool — cheapest viable, balanced, and premium options.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-sm font-semibold text-white">Routing guidance</p>
                  <p className="text-xs text-white/60 mt-1">A simple strategy for how to use those tools together.</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-sm font-semibold text-white">A next step</p>
                  <p className="text-xs text-white/60 mt-1">Move into the calculator when you want exact monthly cost based on usage.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-slate-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Best for</p>
              <p className="text-sm text-muted-foreground leading-relaxed">People who are not sure which AI tool or plan should be their default choice.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">How it works</p>
              <p className="text-sm text-muted-foreground leading-relaxed">We narrow the recommendation using use case, budget, usage frequency, quality preference, and free-tier requirements.</p>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Next step</p>
              <p className="text-sm text-muted-foreground leading-relaxed">After the recommendation, use the calculator to validate the exact cost with your own usage assumptions.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {step < 5 && (
            <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
              <div className="border border-border rounded-2xl bg-white p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Answer 5 questions. Get your optimal AI stack.</h2>
                  <p className="text-muted-foreground text-sm">Use this when choosing between multiple tools is harder than calculating one model’s cost.</p>
                </div>

                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
                  {stepLabels.map((label, i) => (
                    <div key={i} className="flex items-center gap-2 shrink-0">
                      <div className={`flex items-center gap-1.5 text-xs ${i === step ? "text-primary font-medium" : i < step ? "text-muted-foreground line-through" : "text-muted-foreground/50"}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-muted text-muted-foreground" : "bg-muted/30 text-muted-foreground/50"}`}>
                          {i + 1}
                        </div>
                        <span>{label}</span>
                      </div>
                      {i < stepLabels.length - 1 && (
                        <div className={`h-px w-4 ${i < step ? "bg-muted" : "bg-muted/30"}`} />
                      )}
                    </div>
                  ))}
                </div>

                {step === 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">What’s your primary use case?</h3>
                    <div className="space-y-2">
                      {USE_CASES.map((o) => (
                        <OptionButton key={o.value} option={o} selected={inputs.useCase === o.value} onSelect={(v) => set("useCase", v)} />
                      ))}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">What’s your monthly budget?</h3>
                    <div className="space-y-2">
                      {BUDGETS.map((o) => (
                        <OptionButton key={o.value} option={o} selected={inputs.budget === o.value} onSelect={(v) => set("budget", v)} />
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">How often will you use it?</h3>
                    <div className="space-y-2">
                      {FREQUENCIES.map((o) => (
                        <OptionButton key={o.value} option={o} selected={inputs.usageFrequency === o.value} onSelect={(v) => set("usageFrequency", v)} />
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">What’s your quality preference?</h3>
                    <div className="space-y-2">
                      {QUALITY_PREFS.map((o) => (
                        <OptionButton key={o.value} option={o} selected={inputs.qualityPreference === o.value} onSelect={(v) => set("qualityPreference", v)} />
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Do you need a free tier option?</h3>
                    <div className="space-y-2">
                      {FREE_TIER.map((o) => (
                        <OptionButton key={String(o.value)} option={o} selected={inputs.freeTierRequired === o.value} onSelect={(v) => set("freeTierRequired", v)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 lg:sticky lg:top-24">
                <div className="rounded-2xl border border-border bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Why use this instead of browsing?</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• It narrows the field faster than browsing many categories or comparisons.</li>
                    <li>• It balances budget, quality, and usage rather than over-optimising for one factor.</li>
                    <li>• It gives you an actionable next step when the answer is not obvious.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Good follow-ups</p>
                  <div className="space-y-3">
                    <Link href="/calculator" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Validate with the calculator →
                    </Link>
                    <Link href="/compare/claude-vs-gpt-cost" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Compare Claude vs GPT-4o →
                    </Link>
                    <Link href="/resources" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                      Browse all resources →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && result && (
            <div>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Your recommendation</p>
                <h2 className="text-2xl font-bold text-foreground mb-1">Your AI stack recommendations</h2>
                <p className="text-sm text-muted-foreground">Based on: {inputs.useCase}, {inputs.budget} budget, {inputs.usageFrequency} usage</p>
              </div>

              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
                <div className="space-y-4 mb-6 lg:mb-0">
                  <ResultCard tier="cheapest" rec={result.cheapest} />
                  <ResultCard tier="balanced" rec={result.balanced} highlight />
                  <ResultCard tier="premium" rec={result.premium} />
                </div>

                <div className="space-y-4">
                  <div className="border border-border rounded-2xl p-5 bg-muted/30">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Suggested strategy</p>
                    <p className="text-sm text-foreground leading-relaxed">{result.routingStrategy}</p>
                  </div>

                  <div className="border border-primary/15 rounded-2xl p-5 bg-primary/5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Recommended next action</p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">Now validate the exact monthly cost of your likely default tool before you switch or commit.</p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/calculator"
                        className="text-sm bg-primary text-primary-foreground rounded-lg px-4 py-2.5 font-medium hover:bg-primary/90 transition-colors"
                      >
                        Calculate exact cost →
                      </Link>
                      <button
                        onClick={reset}
                        className="text-sm border border-border rounded-lg px-4 py-2.5 font-medium hover:bg-muted transition-colors"
                        data-testid="restart-btn"
                      >
                        Start Over
                      </button>
                    </div>
                  </div>

                  <div className="border border-border rounded-2xl p-5 bg-white">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Good follow-ups</p>
                    <div className="space-y-3">
                      <Link href="/compare/claude-vs-gpt-cost" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                        Compare Claude vs GPT-4o →
                      </Link>
                      <Link href="/resources" className="block text-sm font-medium text-foreground hover:text-primary transition-colors">
                        Browse all resources →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
