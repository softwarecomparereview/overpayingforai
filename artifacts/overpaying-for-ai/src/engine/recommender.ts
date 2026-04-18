import modelsData from "@/data/models.json";
import type {
  AIModel,
  DecisionInputs,
  RecommendationResult,
  ModelRecommendation,
  Budget,
  UsageFrequency,
  UseCase,
  QualityPreference,
} from "./types";

const models = modelsData as AIModel[];

const BUDGET_MAX: Record<Budget, number> = {
  free: 0,
  under20: 20,
  under50: 50,
  premium: Infinity,
};

const USAGE_TOKEN_MULTIPLIER: Record<UsageFrequency, number> = {
  light: 0.3,
  medium: 1,
  heavy: 4,
};

/**
 * Maps a top-level use case to the bestFor tags considered a match.
 * Models tagged with any of these are scored as a fit; multi-tag overlap
 * earns a small bonus so specialists outrank generalists.
 */
const USE_CASE_TAGS: Record<UseCase, string[]> = {
  coding: ["coding"],
  writing: ["writing", "content"],
  research: ["research", "long-context", "rag", "reasoning"],
  automation: ["automation", "high-volume"],
  chat: ["chat", "support"],
};

function estimateMonthlySpend(model: AIModel, frequency: UsageFrequency): number {
  if (model.planType === "subscription") {
    return model.monthlySubscriptionCostIfAny ?? 0;
  }
  const baseMonthlyTokens = 1_000_000;
  const multiplier = USAGE_TOKEN_MULTIPLIER[frequency];
  const tokens = baseMonthlyTokens * multiplier;
  const input = (tokens * 0.6) / 1000;
  const output = (tokens * 0.4) / 1000;
  return input * model.inputCostPer1k + output * model.outputCostPer1k;
}

function formatSpendEstimate(model: AIModel, frequency: UsageFrequency): string {
  const spend = estimateMonthlySpend(model, frequency);
  if (model.planType === "subscription") {
    return spend === 0 ? "Free" : `$${spend}/month flat`;
  }
  if (spend < 0.5) return "< $0.50/month";
  if (spend < 1) return `$${spend.toFixed(2)}/month`;
  return `~$${spend.toFixed(0)}/month`;
}

// ---------------------------------------------------------------------------
// Scoring helpers
// ---------------------------------------------------------------------------

function useCaseFitScore(model: AIModel, useCase: UseCase): number {
  const tags = USE_CASE_TAGS[useCase];
  const matches = tags.filter((t) => model.bestFor.includes(t)).length;
  if (matches > 0) return 30 + (matches - 1) * 6;
  // 'general' is a soft fit for chat/writing only
  if (model.bestFor.includes("general") && (useCase === "chat" || useCase === "writing")) return 8;
  return -15;
}

function budgetFitScore(model: AIModel, budget: Budget, frequency: UsageFrequency): number {
  const spend = estimateMonthlySpend(model, frequency);
  const cap = BUDGET_MAX[budget];
  if (spend > cap) {
    if (budget === "free") return -120;
    // Soft penalty: scales with how far over budget we are
    const overRatio = (spend - cap) / Math.max(cap, 1);
    return -40 - Math.min(overRatio * 30, 60);
  }
  if (cap === Infinity) return 8;
  const headroom = (cap - spend) / cap; // 0..1
  return 12 + headroom * 14;
}

function qualityCostScore(model: AIModel, qual: QualityPreference): number {
  // qualityScore range ~58-94, costScore range ~23-100
  if (qual === "cheap") return model.costScore * 0.55 - model.qualityScore * 0.05;
  if (qual === "best") return model.qualityScore * 0.65 - model.costScore * 0.10;
  return model.qualityScore * 0.30 + model.costScore * 0.30;
}

function planFitScore(model: AIModel, frequency: UsageFrequency): number {
  const isFreeSub =
    model.planType === "subscription" && (model.monthlySubscriptionCostIfAny ?? 0) === 0;
  if (frequency === "heavy") {
    // Heavy users hit free-tier rate limits hard; paid subs OK; API best
    if (isFreeSub) return -28;
    if (model.planType === "subscription") return -4;
    return 10;
  }
  if (frequency === "light") {
    // Subs amortise badly at light usage unless free
    if (isFreeSub) return 8;
    if (model.planType === "subscription") return 2;
    return 6;
  }
  // medium
  if (isFreeSub) return -2;
  return 4;
}

function freeTierScore(model: AIModel, required: boolean): number {
  if (required && !model.hasFreeTier) return -200; // hard exclude via score
  if (required && model.hasFreeTier) return 10;
  return 0;
}

function scoreModel(model: AIModel, inputs: DecisionInputs): number {
  return (
    useCaseFitScore(model, inputs.useCase) +
    budgetFitScore(model, inputs.budget, inputs.usageFrequency) +
    qualityCostScore(model, inputs.qualityPreference) +
    planFitScore(model, inputs.usageFrequency) +
    freeTierScore(model, inputs.freeTierRequired)
  );
}

function buildReasoning(
  model: AIModel,
  inputs: DecisionInputs,
  tier: "cheapest" | "balanced" | "premium",
): string {
  const parts: string[] = [];
  const useTags = USE_CASE_TAGS[inputs.useCase];
  const matchedTag = useTags.find((t) => model.bestFor.includes(t));

  if (tier === "cheapest") {
    parts.push(
      `Lowest cost option for ${inputs.useCase} at ${inputs.usageFrequency} usage on a ${
        inputs.budget === "free" ? "free-only" : inputs.budget
      } budget.`,
    );
    if (model.hasFreeTier && inputs.freeTierRequired) {
      parts.push("Satisfies the free-tier requirement — no credit card needed.");
    }
  } else if (tier === "balanced") {
    parts.push(
      `Best quality-to-cost ratio for ${inputs.useCase} given a ${inputs.qualityPreference}-quality preference and ${inputs.usageFrequency} usage.`,
    );
  } else {
    parts.push(
      `Highest-quality option for ${inputs.useCase} when budget is ${
        inputs.budget === "premium" ? "open" : inputs.budget
      } and you prioritise quality.`,
    );
  }

  if (matchedTag) {
    parts.push(`Purpose-matched to ${inputs.useCase} workloads (tagged: ${matchedTag}).`);
  }

  if (inputs.usageFrequency === "heavy" && model.planType === "api") {
    parts.push("API pricing scales linearly — no rate-limit walls at heavy volume.");
  } else if (inputs.usageFrequency === "light" && model.planType === "subscription") {
    parts.push("Flat subscription price is predictable for light, daily use.");
  }

  parts.push(model.notes);
  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

interface ScoredModel {
  model: AIModel;
  score: number;
  spend: number;
}

export function runRecommender(inputs: DecisionInputs): RecommendationResult {
  const all: ScoredModel[] = models.map((m) => ({
    model: m,
    score: scoreModel(m, inputs),
    spend: estimateMonthlySpend(m, inputs.usageFrequency),
  }));

  // Eligibility: free-tier requirement is hard; budget is soft (with headroom)
  let pool = all.filter((s) => {
    if (inputs.freeTierRequired && !s.model.hasFreeTier) return false;
    return s.spend <= BUDGET_MAX[inputs.budget] + 5;
  });

  // If too few survived, relax budget but keep the free-tier hard gate
  if (pool.length < 3) {
    pool = all.filter((s) => !inputs.freeTierRequired || s.model.hasFreeTier);
  }
  if (pool.length < 3) pool = all;

  const scored = [...pool].sort((a, b) => b.score - a.score);
  const useTags = USE_CASE_TAGS[inputs.useCase];
  const fitPool = pool.filter((s) => useTags.some((t) => s.model.bestFor.includes(t)));

  // Premium: highest quality model that actually fits the use case (within pool)
  const premiumSourcePool = fitPool.length ? fitPool : pool;
  const premiumModel = [...premiumSourcePool].sort(
    (a, b) => b.model.qualityScore - a.model.qualityScore,
  )[0].model;

  // Cheapest: lowest spend in pool (must fit use case if possible)
  const cheapestSourcePool = fitPool.length ? fitPool : pool;
  const cheapestModel = [...cheapestSourcePool].sort((a, b) => a.spend - b.spend)[0].model;

  // Balanced: highest score that's not the cheapest or premium model and fits use case
  const usedIds = new Set([cheapestModel.id, premiumModel.id]);
  let balancedModel =
    scored.find(
      (s) =>
        !usedIds.has(s.model.id) && useTags.some((t) => s.model.bestFor.includes(t)),
    )?.model ??
    scored.find((s) => !usedIds.has(s.model.id))?.model ??
    scored[0].model;

  // If quality preference is "best", make sure balanced isn't strictly worse than premium on quality
  if (
    inputs.qualityPreference === "best" &&
    balancedModel.qualityScore < premiumModel.qualityScore - 15 &&
    fitPool.length >= 3
  ) {
    const upgrade = [...fitPool]
      .filter((s) => !usedIds.has(s.model.id))
      .sort((a, b) => b.model.qualityScore - a.model.qualityScore)[0];
    if (upgrade) balancedModel = upgrade.model;
  }

  const cheapest: ModelRecommendation = {
    model: cheapestModel,
    reasoning: buildReasoning(cheapestModel, inputs, "cheapest"),
    estimatedMonthlySpend: formatSpendEstimate(cheapestModel, inputs.usageFrequency),
    score: scoreModel(cheapestModel, inputs),
  };

  const balanced: ModelRecommendation = {
    model: balancedModel,
    reasoning: buildReasoning(balancedModel, inputs, "balanced"),
    estimatedMonthlySpend: formatSpendEstimate(balancedModel, inputs.usageFrequency),
    score: scoreModel(balancedModel, inputs),
  };

  const premium: ModelRecommendation = {
    model: premiumModel,
    reasoning: buildReasoning(premiumModel, inputs, "premium"),
    estimatedMonthlySpend: formatSpendEstimate(premiumModel, inputs.usageFrequency),
    score: scoreModel(premiumModel, inputs),
  };

  const routingStrategy = buildRoutingStrategy(cheapest, balanced, premium, inputs);

  return { cheapest, balanced, premium, routingStrategy };
}

function buildRoutingStrategy(
  cheapest: ModelRecommendation,
  balanced: ModelRecommendation,
  premium: ModelRecommendation,
  inputs: DecisionInputs,
): string {
  if (inputs.budget === "free" || inputs.freeTierRequired) {
    return `Start with ${cheapest.model.name}. It satisfies your free-tier requirement and covers most ${inputs.useCase} tasks. Escalate to ${balanced.model.name} once you outgrow the free limits.`;
  }
  if (inputs.qualityPreference === "cheap") {
    return `Route ${inputs.useCase} traffic to ${cheapest.model.name} by default. Only escalate to ${balanced.model.name} when output quality isn't sufficient.`;
  }
  if (inputs.qualityPreference === "best" && inputs.budget === "premium") {
    return `Use ${premium.model.name} as your default for ${inputs.useCase}. Keep ${balanced.model.name} as the cheaper fallback for routine prompts.`;
  }
  return `Use ${balanced.model.name} as your default for ${inputs.useCase}. Reserve ${premium.model.name} for complex, high-stakes tasks where quality is non-negotiable.`;
}
