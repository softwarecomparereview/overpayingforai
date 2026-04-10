/**
 * Anthropic pricing adapter
 *
 * Official source: https://www.anthropic.com/pricing
 *
 * CORS / live-fetch constraint
 * ─────────────────────────────────────────────────────────────────────────────
 * Anthropic's pricing page is a JavaScript-rendered SPA.  Browser fetch (even
 * via a CORS proxy) returns an HTML shell without embedded pricing data.
 *
 * To enable live fetch in the future, implement a serverless fetch layer that
 * renders or scrapes the page server-side and returns structured JSON in the
 * AIModel format, then replace `tryLiveFetch()` below with a call to that
 * endpoint.
 *
 * Reference data last verified: 2026-04-10
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { AIModel } from "@/engine/types";
import type { ProviderFetchResult } from "./types";

const SOURCE_URL = "https://www.anthropic.com/pricing";

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Known-good Anthropic model pricing.
 * All values sourced from https://www.anthropic.com/pricing — verified 2026-04-10.
 * Update this list whenever Anthropic changes pricing and redeploy.
 */
const ANTHROPIC_REFERENCE_MODELS: AIModel[] = [
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    planType: "api",
    inputCostPer1k: 0.003,
    outputCostPer1k: 0.015,
    monthlySubscriptionCostIfAny: null,
    hasFreeTier: false,
    bestFor: ["coding", "writing", "research", "automation"],
    qualityScore: 96,
    costScore: 42,
    latencyScore: 78,
    notes: "Top-tier for coding and complex reasoning. Input is cheaper than GPT-4o but output parity.",
    source: SOURCE_URL,
    last_updated: todayIso(),
  },
  {
    id: "claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    planType: "api",
    inputCostPer1k: 0.0008,
    outputCostPer1k: 0.004,
    monthlySubscriptionCostIfAny: null,
    hasFreeTier: false,
    bestFor: ["coding", "automation", "chat"],
    qualityScore: 78,
    costScore: 85,
    latencyScore: 92,
    notes: "Anthropic's fast, affordable model. Strong coding ability relative to cost.",
    source: SOURCE_URL,
    last_updated: todayIso(),
  },
  {
    id: "claude-pro",
    name: "Claude Pro",
    provider: "Anthropic",
    planType: "subscription",
    inputCostPer1k: 0,
    outputCostPer1k: 0,
    monthlySubscriptionCostIfAny: 20,
    hasFreeTier: false,
    bestFor: ["writing", "research", "coding", "chat"],
    qualityScore: 94,
    costScore: 55,
    latencyScore: 74,
    notes: "Access to Claude 3.5 Sonnet + Opus. Good deal if you use it heavily for writing and research.",
    source: SOURCE_URL,
    last_updated: todayIso(),
  },
];

async function tryLiveFetch(): Promise<AIModel[] | null> {
  return null;
}

export async function fetchAnthropicPricingCandidates(): Promise<ProviderFetchResult> {
  const fetchedAt = new Date().toISOString();
  const live = await tryLiveFetch();

  if (live) {
    return {
      providerId: "anthropic",
      providerName: "Anthropic",
      sourceUrl: SOURCE_URL,
      fetchedAt,
      status: "live",
      statusMessage: `Fetched ${live.length} Anthropic models live from ${SOURCE_URL}.`,
      candidates: live,
    };
  }

  return {
    providerId: "anthropic",
    providerName: "Anthropic",
    sourceUrl: SOURCE_URL,
    fetchedAt,
    status: "known-good",
    statusMessage:
      `Using reference data from ${SOURCE_URL} (verified 2026-04-10). ` +
      `Live fetch is not available in a browser-only context — pricing pages are JS-rendered SPAs. ` +
      `Verify prices manually before approving.`,
    candidates: ANTHROPIC_REFERENCE_MODELS,
  };
}
