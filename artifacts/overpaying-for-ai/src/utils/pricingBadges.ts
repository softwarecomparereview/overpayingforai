import type { ModelCategory, PricingSnapshot } from "@/types/pricing";
import { getCheapestModel } from "./pricingEngine";
import { isPricingStale, freshnessLabel } from "./pricingFreshness";

export { isPricingStale, freshnessLabel as getFreshnessLabel };

export function getCheapestBadge(
  category: ModelCategory,
  snapshot?: PricingSnapshot
): { modelId: string; displayName: string; cost: string } | null {
  const model = getCheapestModel({ category, snapshot });
  if (!model) return null;
  const outputCostPer1M = (model.outputCostPer1k * 1000).toFixed(3);
  return {
    modelId: model.id,
    displayName: model.displayName,
    cost: `$${outputCostPer1M}/1M tokens`,
  };
}
