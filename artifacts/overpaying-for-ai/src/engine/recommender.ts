import modelsData from "@/data/models.json";
import type {
  AIModel,
  DecisionInputs,
  RecommendationResult,
  ModelRecommendation,
  Budget,
  UsageFrequency,
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

function scoreModel(model: AIModel, inputs: DecisionInputs): number {
  let score = 0;

  // Use-case fit
  if (model.bestFor.includes(inputs.useCase)) score += 30;
  else score -= 10;

  // Budget fit
  const spend = estimateMonthlySpend(model, inputs.usageFrequency);
  const maxBudget = BUDGET_MAX[inputs.budget];
  if (spend <= maxBudget) score += 20;
  else score -= 50;

  // Free tier requirement
  if (inputs.freeTierRequired && !model.hasFreeTier) score -= 40;
  if (inputs.freeTierRequired && model.hasFreeTier) score += 10;

  // Quality preference
  if (inputs.qualityPreference === "cheap") {
    score += model.costScore * 0.4;
    score -= model.qualityScore * 0.1;
  } else if (inputs.qualityPreference === "balanced") {
    score += model.qualityScore * 0.2;
    score += model.costScore * 0.2;
  } else {
    score += model.qualityScore * 0.4;
    score -= model.costScore * 0.05;
  }

  // Heavy usage: prefer API (subscription costs are fixed but API usage might exceed)
  if (inputs.usageFrequency === "heavy" && model.planType === "api") score += 5;
  if (inputs.usageFrequency === "light" && model.planType === "subscription") score += 5;

  return score;
}

function buildReasoning(
  model: AIModel,
  inputs: DecisionInputs,
  tier: "cheapest" | "balanced" | "premium"
): string {
  const parts: string[] = [];

  if (tier === "cheapest") {
    parts.push(`Lowest cost for ${inputs.useCase} at ${inputs.usageFrequency} usage.`);
    if (model.hasFreeTier) parts.push("Free tier available — no credit card required.");
  } else if (tier === "balanced") {
    parts.push(`Best quality-to-cost ratio for ${inputs.useCase}.`);
  } else {
    parts.push(`Highest quality option for ${inputs.useCase}.`);
  }

  if (model.bestFor.includes(inputs.useCase)) {
    parts.push(`Purpose-matched to ${inputs.useCase} tasks.`);
  }

  parts.push(model.notes);

  return parts.join(" ");
}

export function runRecommender(inputs: DecisionInputs): RecommendationResult {
  const eligible = models.filter((m) => {
    if (inputs.freeTierRequired && !m.hasFreeTier) return false;
    const spend = estimateMonthlySpend(m, inputs.usageFrequency);
    if (spend > BUDGET_MAX[inputs.budget] + 5) return false;
    return true;
  });

  const fallback = [...models].sort(
    (a, b) => b.costScore - a.costScore
  );

  const pool = eligible.length >= 3 ? eligible : fallback;

  const scored = pool
    .map((m) => ({ model: m, score: scoreModel(m, inputs) }))
    .sort((a, b) => b.score - a.score);

  const cheapestCandidate = pool
    .filter((m) => {
      if (inputs.freeTierRequired && !m.hasFreeTier) return false;
      return true;
    })
    .sort(
      (a, b) =>
        estimateMonthlySpend(a, inputs.usageFrequency) -
        estimateMonthlySpend(b, inputs.usageFrequency)
    )[0];

  const premiumCandidate = pool
    .filter((m) => m.bestFor.includes(inputs.useCase))
    .sort((a, b) => b.qualityScore - a.qualityScore)[0] ?? scored[0].model;

  const cheapestModel = cheapestCandidate ?? scored[scored.length - 1].model;
  const premiumModel = premiumCandidate;

  const usedIds = new Set([cheapestModel.id, premiumModel.id]);
  const balancedModel =
    scored.find(
      (s) => !usedIds.has(s.model.id) && s.model.bestFor.includes(inputs.useCase)
    )?.model ??
    scored.find((s) => !usedIds.has(s.model.id))?.model ??
    scored[1]?.model ??
    cheapestModel;

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
  inputs: DecisionInputs
): string {
  if (inputs.budget === "free") {
    return `Start with ${cheapest.model.name}. It's free and covers most ${inputs.useCase} tasks. If you hit limits, ${balanced.model.name} is the next step.`;
  }
  if (inputs.qualityPreference === "cheap") {
    return `Route all ${inputs.useCase} tasks to ${cheapest.model.name}. Only escalate to ${balanced.model.name} when the output quality isn't sufficient.`;
  }
  return `Use ${balanced.model.name} as your default for ${inputs.useCase}. Reserve ${premium.model.name} for complex, high-stakes tasks where quality is non-negotiable.`;
}
