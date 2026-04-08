import modelsData from "@/data/models.json";
import type { AIModel, CalculatorInputs, CalculatorResult, AlternativeModel } from "./types";

const models = modelsData as AIModel[];

export function getModelById(id: string): AIModel | undefined {
  return models.find((m) => m.id === id);
}

export function getAllModels(): AIModel[] {
  return models;
}

export function getApiModels(): AIModel[] {
  return models.filter((m) => m.planType === "api");
}

export function calculateCost(
  model: AIModel,
  monthlyInputTokens: number,
  monthlyOutputTokens: number
): { total: number; inputCost: number; outputCost: number } {
  if (model.planType === "subscription") {
    return {
      total: model.monthlySubscriptionCostIfAny ?? 0,
      inputCost: 0,
      outputCost: 0,
    };
  }

  const inputCost = (monthlyInputTokens / 1000) * model.inputCostPer1k;
  const outputCost = (monthlyOutputTokens / 1000) * model.outputCostPer1k;
  return { total: inputCost + outputCost, inputCost, outputCost };
}

function getTradeOff(current: AIModel, alternative: AIModel): string {
  const qualityDiff = current.qualityScore - alternative.qualityScore;
  if (qualityDiff <= 5) return "Minimal quality trade-off";
  if (qualityDiff <= 15) return `~${qualityDiff} point quality drop`;
  return `Significant quality reduction — best for simple tasks`;
}

function getRecommendationText(
  model: AIModel,
  cheaperAlts: AlternativeModel[]
): string {
  if (cheaperAlts.length === 0) {
    return `${model.name} is already one of the cheapest options for your use case.`;
  }
  const top = cheaperAlts[0];
  return `Consider routing to ${top.model.name} to save ${top.savingsPercent.toFixed(0)}% — ${top.tradeOff.toLowerCase()}.`;
}

export function runCalculator(inputs: CalculatorInputs): CalculatorResult {
  const model = getModelById(inputs.modelId);
  if (!model) throw new Error(`Model not found: ${inputs.modelId}`);

  const { total, inputCost, outputCost } = calculateCost(
    model,
    inputs.monthlyInputTokens,
    inputs.monthlyOutputTokens
  );

  const apiModels = getApiModels().filter(
    (m) => m.id !== model.id && m.costScore > model.costScore
  );

  const cheaperAlternatives: AlternativeModel[] = apiModels
    .map((alt) => {
      const altCost = calculateCost(alt, inputs.monthlyInputTokens, inputs.monthlyOutputTokens);
      const savings = total - altCost.total;
      const savingsPercent = total > 0 ? (savings / total) * 100 : 0;
      return {
        model: alt,
        estimatedCost: altCost.total,
        savings,
        savingsPercent,
        tradeOff: getTradeOff(model, alt),
      };
    })
    .filter((a) => a.savings > 0)
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 3);

  return {
    model,
    estimatedMonthlyCost: total,
    inputCost,
    outputCost,
    cheaperAlternatives,
    savingsEstimate:
      cheaperAlternatives.length > 0 ? cheaperAlternatives[0].savings : null,
    recommendation: getRecommendationText(model, cheaperAlternatives),
  };
}

export function formatCost(amount: number): string {
  if (amount < 0.01) return "< $0.01";
  if (amount < 1) return `$${amount.toFixed(3)}`;
  return `$${amount.toFixed(2)}`;
}

export function formatTokenCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}
