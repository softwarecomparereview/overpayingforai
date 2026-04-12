import type { DecisionUseCase, UsageLevel, BudgetMode, DecisionResult } from "@/types/decision";
import type { PricingSnapshot } from "@/types/pricing";
import { findDecisionRule } from "./decisionRules";
import { getModelById } from "@/data/modelsPricing";
import { getLivePricingSnapshot } from "@/data/livePricingStore";

export function estimateCurrentCost(
  usageLevel: UsageLevel,
  explicitCurrentSpend?: number
): number {
  if (explicitCurrentSpend !== undefined && explicitCurrentSpend > 0) {
    return explicitCurrentSpend;
  }
  if (usageLevel === "low") return 20;
  if (usageLevel === "medium") return 50;
  return 120;
}

export function getDecisionRule(
  useCase: DecisionUseCase,
  usageLevel: UsageLevel,
  budgetMode: BudgetMode
) {
  return findDecisionRule(useCase, usageLevel, budgetMode);
}

export function computeDecisionResult(params: {
  useCase: DecisionUseCase;
  usageLevel: UsageLevel;
  budgetMode: BudgetMode;
  explicitCurrentSpend?: number;
  snapshot?: PricingSnapshot;
}): DecisionResult {
  const rule = findDecisionRule(params.useCase, params.usageLevel, params.budgetMode);
  const currentCost = estimateCurrentCost(params.usageLevel, params.explicitCurrentSpend);

  let estimatedCost = rule.estimatedCost;

  const snapshot = params.snapshot ?? (() => {
    try { return getLivePricingSnapshot(); } catch { return null; }
  })();

  if (snapshot) {
    const liveModel = snapshot.models.find((m) => m.id === rule.recommendedModelId);
    if (liveModel) {
      const lowTokenInput = 500_000;
      const lowTokenOutput = 200_000;
      const medTokenInput = 2_000_000;
      const medTokenOutput = 800_000;
      const highTokenInput = 6_000_000;
      const highTokenOutput = 2_000_000;

      const [inputTokens, outputTokens] =
        params.usageLevel === "low"
          ? [lowTokenInput, lowTokenOutput]
          : params.usageLevel === "medium"
          ? [medTokenInput, medTokenOutput]
          : [highTokenInput, highTokenOutput];

      const liveCost =
        (inputTokens / 1000) * liveModel.inputCostPer1k +
        (outputTokens / 1000) * liveModel.outputCostPer1k;

      if (liveCost > 0 && liveCost < 200) {
        estimatedCost = Math.round(liveCost * 10) / 10;
      }
    }
  }

  const staticModel = getModelById(rule.recommendedModelId);
  const modelName = staticModel?.displayName ?? rule.recommendedTool;

  const monthlySavings = Math.max(currentCost - estimatedCost, 0);
  const savingsPercent = currentCost > 0
    ? Math.round((monthlySavings / currentCost) * 100)
    : 0;

  return {
    recommendedTool: rule.recommendedTool,
    recommendedModelId: rule.recommendedModelId,
    recommendedModelName: modelName,
    setupType: rule.setupType,
    rationale: rule.rationale,
    estimatedCost,
    currentCost,
    monthlySavings,
    savingsPercent,
    secondaryOption: rule.secondaryOption,
    affiliateKey: rule.affiliateKey,
  };
}
