import type { ModelPricing, PricingSnapshot } from "@/types/pricing";
import { getCheapestModel } from "@/utils/pricingEngine";

interface ModelsPricingTableProps {
  snapshot: PricingSnapshot;
}

export function ModelsPricingTable({ snapshot }: ModelsPricingTableProps) {
  const cheapestByCategory = new Map<string, string>();
  const categories = ["general", "coding", "writing", "research", "productivity", "customer-support"] as const;
  for (const cat of categories) {
    const cheapest = getCheapestModel({ category: cat, snapshot });
    if (cheapest) cheapestByCategory.set(cheapest.id, cat);
  }

  const apiModels = snapshot.models.filter(
    (m) => m.inputCostPer1k > 0 || m.outputCostPer1k > 0
  ).sort((a, b) => (a.inputCostPer1k + a.outputCostPer1k) - (b.inputCostPer1k + b.outputCostPer1k));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="py-3 pr-4 font-semibold text-foreground">Provider</th>
            <th className="py-3 pr-4 font-semibold text-foreground">Model</th>
            <th className="py-3 pr-4 font-semibold text-foreground whitespace-nowrap">Input / 1M tokens</th>
            <th className="py-3 pr-4 font-semibold text-foreground whitespace-nowrap">Output / 1M tokens</th>
            <th className="py-3 pr-4 font-semibold text-foreground">Category</th>
            <th className="py-3 font-semibold text-foreground">Updated</th>
          </tr>
        </thead>
        <tbody>
          {apiModels.map((model) => {
            const isCheapest = cheapestByCategory.has(model.id);
            const cheapestCat = cheapestByCategory.get(model.id);
            return (
              <tr
                key={model.id}
                className={`border-b border-border/50 ${isCheapest ? "bg-green-50/50 dark:bg-green-950/10" : ""}`}
              >
                <td className="py-3 pr-4 text-muted-foreground">{model.provider}</td>
                <td className="py-3 pr-4 font-medium text-foreground">
                  {model.displayName}
                  {isCheapest && (
                    <span className="ml-2 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900 px-1.5 py-0.5 rounded">
                      Cheapest {cheapestCat}
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4 tabular-nums text-foreground">
                  ${(model.inputCostPer1k * 1000).toFixed(4)}
                </td>
                <td className="py-3 pr-4 tabular-nums text-foreground">
                  ${(model.outputCostPer1k * 1000).toFixed(4)}
                </td>
                <td className="py-3 pr-4 text-muted-foreground capitalize">
                  {model.category.slice(0, 2).join(", ")}
                </td>
                <td className="py-3 text-muted-foreground">{model.lastUpdated}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
