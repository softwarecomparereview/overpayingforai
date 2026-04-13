import type { ModelPricing, ModelCategory, PricingSnapshot } from "@/types/pricing";
import { CURRENT_MODELS } from "@/data/modelsPricing";
import { getLivePricingSnapshot } from "@/data/livePricingStore";

function getModels(snapshot?: PricingSnapshot): ModelPricing[] {
  if (snapshot) return snapshot.models;
  try {
    const live = getLivePricingSnapshot();
    return live.models.length > 0 ? live.models : CURRENT_MODELS;
  } catch {
    return CURRENT_MODELS;
  }
}

export function calculateCost(params: {
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  snapshot?: PricingSnapshot;
}): number {
  const models = getModels(params.snapshot);
  const model = models.find((m) => m.id === params.modelId);
  if (!model) return 0;
  const inputCost = (params.inputTokens / 1000) * model.inputCostPer1k;
  const outputCost = (params.outputTokens / 1000) * model.outputCostPer1k;
  return inputCost + outputCost;
}

export function estimateMonthlyCost(params: {
  modelId: string;
  monthlyInputTokens: number;
  monthlyOutputTokens: number;
  snapshot?: PricingSnapshot;
}): number {
  return calculateCost({
    modelId: params.modelId,
    inputTokens: params.monthlyInputTokens,
    outputTokens: params.monthlyOutputTokens,
    snapshot: params.snapshot,
  });
}

export function getCheapestModel(params: {
  category?: ModelCategory;
  snapshot?: PricingSnapshot;
}): ModelPricing | null {
  let models = getModels(params.snapshot);
  if (params.category) {
    models = models.filter((m) => m.category.includes(params.category!));
  }
  if (models.length === 0) return null;
  return models.reduce((cheapest, m) => {
    const avgCost = m.inputCostPer1k + m.outputCostPer1k;
    const cheapestAvg = cheapest.inputCostPer1k + cheapest.outputCostPer1k;
    return avgCost < cheapestAvg ? m : cheapest;
  });
}

export function getBestValueModel(params: {
  category?: ModelCategory;
  snapshot?: PricingSnapshot;
}): ModelPricing | null {
  let models = getModels(params.snapshot);
  if (params.category) {
    models = models.filter((m) => m.category.includes(params.category!));
  }
  if (models.length === 0) return null;
  return models.reduce((best, m) => {
    const costScore = 1 / (m.inputCostPer1k + m.outputCostPer1k + 0.00001);
    const bestCostScore = 1 / (best.inputCostPer1k + best.outputCostPer1k + 0.00001);
    return costScore > bestCostScore ? m : best;
  });
}

export function compareModels(params: {
  modelIds: string[];
  monthlyInputTokens: number;
  monthlyOutputTokens: number;
  snapshot?: PricingSnapshot;
}): { modelId: string; displayName: string; monthlyCost: number }[] {
  return params.modelIds
    .map((id) => {
      const models = getModels(params.snapshot);
      const model = models.find((m) => m.id === id);
      if (!model) return null;
      const cost = estimateMonthlyCost({
        modelId: id,
        monthlyInputTokens: params.monthlyInputTokens,
        monthlyOutputTokens: params.monthlyOutputTokens,
        snapshot: params.snapshot,
      });
      return { modelId: id, displayName: model.displayName, monthlyCost: cost };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => a.monthlyCost - b.monthlyCost);
}
