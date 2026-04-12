import type { ModelPricing } from "@/types/pricing";
import { CURRENT_MODELS } from "@/data/modelsPricing";

function mapCategory(bestFor: string[]): import("@/types/pricing").ModelCategory[] {
  const map: Record<string, import("@/types/pricing").ModelCategory> = {
    coding: "coding",
    writing: "writing",
    research: "research",
    general: "general",
    productivity: "productivity",
    "customer-support": "customer-support",
    support: "customer-support",
    automation: "productivity",
    chat: "general",
  };
  const cats = new Set<import("@/types/pricing").ModelCategory>();
  for (const tag of bestFor) {
    if (map[tag]) cats.add(map[tag]);
  }
  return cats.size > 0 ? Array.from(cats) : ["general"];
}

export function normalizePricingModels(
  raw: { id: string; name: string; provider: string; inputCostPer1k: number; outputCostPer1k: number; bestFor?: string[]; notes?: string; last_updated?: string }[]
): ModelPricing[] {
  return raw.map((m) => ({
    id: m.id,
    provider: m.provider,
    model: m.name,
    displayName: m.name,
    category: mapCategory(m.bestFor ?? []),
    inputCostPer1k: m.inputCostPer1k,
    outputCostPer1k: m.outputCostPer1k,
    notes: m.notes,
    lastUpdated: m.last_updated ?? new Date().toISOString().split("T")[0],
    sourceType: "static" as const,
  }));
}

export function mergePricingSources(...sources: ModelPricing[][]): ModelPricing[] {
  const merged = new Map<string, ModelPricing>();
  for (const source of sources) {
    for (const m of source) {
      merged.set(m.id, m);
    }
  }
  return Array.from(merged.values());
}

export async function fetchOpenAIPrices(): Promise<ModelPricing[]> {
  return CURRENT_MODELS.filter((m) => m.provider === "OpenAI");
}

export async function fetchAnthropicPrices(): Promise<ModelPricing[]> {
  return CURRENT_MODELS.filter((m) => m.provider === "Anthropic");
}

export async function fetchGooglePrices(): Promise<ModelPricing[]> {
  return CURRENT_MODELS.filter((m) => m.provider === "Google");
}

export async function fetchFallbackPrices(): Promise<ModelPricing[]> {
  return CURRENT_MODELS;
}
