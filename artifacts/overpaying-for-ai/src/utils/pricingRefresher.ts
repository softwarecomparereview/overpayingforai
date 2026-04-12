import type { PricingSnapshot } from "@/types/pricing";
import {
  fetchOpenAIPrices,
  fetchAnthropicPrices,
  fetchGooglePrices,
  fetchFallbackPrices,
  mergePricingSources,
} from "@/services/pricingFetcher";
import {
  getLivePricingSnapshot,
  setLivePricingSnapshot,
  setPreviousPricingSnapshot,
} from "@/data/livePricingStore";

export function shouldRefreshPricing(lastUpdated: string, maxAgeHours = 6): boolean {
  const updated = new Date(lastUpdated).getTime();
  const now = Date.now();
  const ageHours = (now - updated) / (1000 * 60 * 60);
  return ageHours >= maxAgeHours;
}

export async function refreshPricing(): Promise<PricingSnapshot> {
  try {
    const [openai, anthropic, google] = await Promise.allSettled([
      fetchOpenAIPrices(),
      fetchAnthropicPrices(),
      fetchGooglePrices(),
    ]);

    const sources = [
      openai.status === "fulfilled" ? openai.value : [],
      anthropic.status === "fulfilled" ? anthropic.value : [],
      google.status === "fulfilled" ? google.value : [],
    ];

    const fallback = await fetchFallbackPrices();
    const merged = mergePricingSources(fallback, ...sources);

    const newSnapshot: PricingSnapshot = {
      models: merged,
      lastUpdated: new Date().toISOString(),
    };

    setPreviousPricingSnapshot(getLivePricingSnapshot());
    setLivePricingSnapshot(newSnapshot);

    return newSnapshot;
  } catch {
    return getLivePricingSnapshot();
  }
}
