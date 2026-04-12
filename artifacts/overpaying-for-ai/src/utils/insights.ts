import type { PricingSnapshot, PriceChange, ModelCategory } from "@/types/pricing";
import { getCheapestModel } from "./pricingEngine";

export function generatePricingInsights(snapshot: PricingSnapshot): string[] {
  if (!snapshot || snapshot.models.length === 0) return [];

  const insights: string[] = [];
  const models = [...snapshot.models].sort(
    (a, b) => (a.inputCostPer1k + a.outputCostPer1k) - (b.inputCostPer1k + b.outputCostPer1k)
  );

  if (models.length < 2) return [];

  const cheapest = models[0];
  const mostExpensive = models[models.length - 1];

  if (cheapest && mostExpensive) {
    const ratio = Math.round((mostExpensive.outputCostPer1k / (cheapest.outputCostPer1k || 0.0001)));
    if (ratio > 5) {
      insights.push(
        `The cheapest capable model costs ${ratio}× less per output token than the most expensive option in our dataset.`
      );
    }
  }

  const gptMini = snapshot.models.find((m) => m.id === "gpt-4o-mini");
  const gpt4o = snapshot.models.find((m) => m.id === "gpt-4o");
  if (gptMini && gpt4o && gpt4o.outputCostPer1k > 0) {
    const xCheaper = Math.round(gpt4o.outputCostPer1k / gptMini.outputCostPer1k);
    if (xCheaper > 1) {
      insights.push(
        `GPT-4o Mini is ${xCheaper}× cheaper than GPT-4o on output tokens — the default swap for cost-sensitive general use.`
      );
    }
  }

  const deepseek = snapshot.models.find((m) => m.id === "deepseek-v3");
  if (deepseek) {
    insights.push(
      `DeepSeek V3 delivers near-frontier quality at $${(deepseek.outputCostPer1k * 1000).toFixed(3)}/1M output tokens — one of the strongest value picks in the market.`
    );
  }

  const geminiFlash = snapshot.models.find((m) => m.id === "gemini-1-5-flash");
  if (geminiFlash) {
    insights.push(
      `Gemini 1.5 Flash is among the lowest-cost options for high-volume automation at $${(geminiFlash.outputCostPer1k * 1000).toFixed(3)}/1M output tokens.`
    );
  }

  const claudeHaiku = snapshot.models.find((m) => m.id === "claude-3-5-haiku" || m.id === "claude-3-haiku");
  if (claudeHaiku) {
    insights.push(
      `Claude Haiku is currently one of the lowest-cost Anthropic options for lightweight customer support and research tasks.`
    );
  }

  const seen = new Set<string>();
  return insights.filter((s) => {
    if (seen.has(s)) return false;
    seen.add(s);
    return true;
  }).slice(0, 5);
}

export function generateChangeInsights(changes: PriceChange[]): string[] {
  if (!changes || changes.length === 0) return [];

  const insights: string[] = [];

  const drops = changes.filter((c) => c.direction === "decrease").sort(
    (a, b) => Math.abs(b.outputChangePercent) - Math.abs(a.outputChangePercent)
  );

  const increases = changes.filter((c) => c.direction === "increase").sort(
    (a, b) => Math.abs(b.outputChangePercent) - Math.abs(a.outputChangePercent)
  );

  if (drops[0]) {
    insights.push(
      `${drops[0].displayName} output pricing dropped ${Math.abs(drops[0].outputChangePercent).toFixed(0)}% since the last snapshot.`
    );
  }

  if (increases[0]) {
    insights.push(
      `${increases[0].displayName} pricing increased ${Math.abs(increases[0].outputChangePercent).toFixed(0)}% — double-check your cost projections.`
    );
  }

  if (drops.length > 1) {
    insights.push(
      `${drops.length} models saw price reductions — now is a good time to re-evaluate your AI stack cost.`
    );
  }

  return insights.slice(0, 5);
}

export function generateCategoryInsights(snapshot: PricingSnapshot): Record<string, string[]> {
  if (!snapshot || snapshot.models.length === 0) return {};

  const categories: ModelCategory[] = ["coding", "writing", "research", "general", "productivity", "customer-support"];
  const result: Record<string, string[]> = {};

  for (const cat of categories) {
    const catModels = snapshot.models
      .filter((m) => m.category.includes(cat))
      .sort((a, b) => (a.inputCostPer1k + a.outputCostPer1k) - (b.inputCostPer1k + b.outputCostPer1k));

    const insights: string[] = [];
    const cheapest = catModels[0];
    if (cheapest) {
      insights.push(
        `${cheapest.displayName} is currently one of the lowest-cost options for ${cat} tasks at $${(cheapest.outputCostPer1k * 1000).toFixed(3)}/1M output tokens.`
      );
    }
    if (catModels.length > 1) {
      const second = catModels[1];
      insights.push(
        `${second.displayName} offers a strong quality-to-cost balance for ${cat} workloads.`
      );
    }
    result[cat] = insights;
  }

  return result;
}
