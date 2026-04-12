import type { PriceChange, PricingSnapshot } from "@/types/pricing";

function pctChange(prev: number, next: number): number {
  if (prev === 0) return 0;
  return ((next - prev) / prev) * 100;
}

export function detectPriceChanges(
  oldSnapshot: PricingSnapshot,
  newSnapshot: PricingSnapshot
): PriceChange[] {
  const oldMap = new Map(oldSnapshot.models.map((m) => [m.id, m]));
  const changes: PriceChange[] = [];

  for (const model of newSnapshot.models) {
    const old = oldMap.get(model.id);
    if (!old) continue;

    const inputPct = pctChange(old.inputCostPer1k, model.inputCostPer1k);
    const outputPct = pctChange(old.outputCostPer1k, model.outputCostPer1k);

    const totalOld = old.inputCostPer1k + old.outputCostPer1k;
    const totalNew = model.inputCostPer1k + model.outputCostPer1k;

    let direction: PriceChange["direction"] = "unchanged";
    if (totalNew < totalOld) direction = "decrease";
    else if (totalNew > totalOld) direction = "increase";

    if (direction !== "unchanged") {
      changes.push({
        modelId: model.id,
        displayName: model.displayName,
        previousInputCostPer1k: old.inputCostPer1k,
        previousOutputCostPer1k: old.outputCostPer1k,
        newInputCostPer1k: model.inputCostPer1k,
        newOutputCostPer1k: model.outputCostPer1k,
        inputChangePercent: inputPct,
        outputChangePercent: outputPct,
        direction,
      });
    }
  }

  return changes;
}

export function getLargestPriceDrops(changes: PriceChange[], limit = 3): PriceChange[] {
  return changes
    .filter((c) => c.direction === "decrease")
    .sort((a, b) => Math.abs(b.outputChangePercent) - Math.abs(a.outputChangePercent))
    .slice(0, limit);
}

export function getLargestPriceIncreases(changes: PriceChange[], limit = 3): PriceChange[] {
  return changes
    .filter((c) => c.direction === "increase")
    .sort((a, b) => Math.abs(b.outputChangePercent) - Math.abs(a.outputChangePercent))
    .slice(0, limit);
}
