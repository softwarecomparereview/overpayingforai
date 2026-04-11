/**
 * Savings Engine — calculates cost savings between AI models using live pricing data.
 * Only uses models.json (the existing pricing source). Never hardcodes prices.
 *
 * Rules:
 * - Show % savings only when both models are API-based and savings >= 20%
 * - Subscription vs API comparisons use qualitative messaging (usage-dependent)
 * - Round to nearest 5% to avoid false precision
 */

import modelsData from "@/data/models.json";
import type { AIModel } from "@/engine/types";

const models = modelsData as AIModel[];

export interface SavingsSummary {
  percent: number | null;
  label: string;
  isQualitative: boolean;
}

export function getModelById(id: string): AIModel | undefined {
  return models.find((m) => m.id === id);
}

/**
 * Compute savings % from base to cheaper using output token cost
 * (output tokens drive the majority of real-world API spend).
 * Returns null if savings are not reliable or meaningful.
 */
export function calculateSavingsPercent(
  baseOutputCostPer1k: number,
  cheaperOutputCostPer1k: number,
): number | null {
  if (!baseOutputCostPer1k || baseOutputCostPer1k <= 0) return null;
  if (cheaperOutputCostPer1k >= baseOutputCostPer1k) return null;

  const raw = ((baseOutputCostPer1k - cheaperOutputCostPer1k) / baseOutputCostPer1k) * 100;
  const rounded = Math.round(raw / 5) * 5;
  return rounded;
}

/**
 * Compute savings dollar amount per 1M output tokens.
 * Returns null if not applicable.
 */
export function calculateSavingsAmount(
  baseOutputCostPer1k: number,
  cheaperOutputCostPer1k: number,
): number | null {
  if (!baseOutputCostPer1k || baseOutputCostPer1k <= 0) return null;
  if (cheaperOutputCostPer1k >= baseOutputCostPer1k) return null;
  const diff = (baseOutputCostPer1k - cheaperOutputCostPer1k) * 1000;
  return Math.round(diff * 100) / 100;
}

/**
 * Given two model IDs, return a SavingsSummary.
 * baseModelId is the more expensive one; cheaperModelId is the recommended one.
 */
export function getSavingsSummary(
  baseModelId: string,
  cheaperModelId: string,
): SavingsSummary {
  if (!baseModelId || !cheaperModelId || baseModelId === cheaperModelId) {
    return { percent: null, label: "", isQualitative: true };
  }

  const base = getModelById(baseModelId);
  const cheaper = getModelById(cheaperModelId);

  if (!base || !cheaper) {
    return { percent: null, label: "Lower-cost option", isQualitative: true };
  }

  if (base.planType === "subscription" || cheaper.planType === "subscription") {
    return {
      percent: null,
      label: "Typically cheaper based on current pricing",
      isQualitative: true,
    };
  }

  const pct = calculateSavingsPercent(base.outputCostPer1k, cheaper.outputCostPer1k);

  if (pct === null || pct < 20) {
    return { percent: null, label: "Lower-cost option", isQualitative: true };
  }

  return {
    percent: pct,
    label: `Save up to ${pct}%`,
    isQualitative: false,
  };
}

/** Format a SavingsSummary into a display string. Returns null if label is empty. */
export function formatSavingsLabel(summary: SavingsSummary): string | null {
  return summary.label || null;
}

/**
 * Given a comparison with a defined cheapest model, derive the base model for savings.
 * Prefers the more expensive of modelA/modelB as the base.
 */
export function deriveSavingsFromComparison(
  cheaperModelId: string,
  modelAId: string,
  modelBId: string,
): SavingsSummary {
  const modelA = getModelById(modelAId);
  const modelB = getModelById(modelBId);

  const aOutput = modelA?.outputCostPer1k ?? 0;
  const bOutput = modelB?.outputCostPer1k ?? 0;
  const baseId = aOutput >= bOutput ? modelAId : modelBId;

  return getSavingsSummary(baseId, cheaperModelId);
}
