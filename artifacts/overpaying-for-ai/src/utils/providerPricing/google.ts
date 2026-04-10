/**
 * Google AI pricing adapter
 *
 * Official source: https://ai.google.dev/pricing
 *
 * CORS / live-fetch constraint
 * ─────────────────────────────────────────────────────────────────────────────
 * Google's AI pricing page is a JavaScript-rendered SPA (built with Angular).
 * Browser fetch (even via a CORS proxy) returns an HTML shell without embedded
 * pricing data.
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

const SOURCE_URL = "https://ai.google.dev/pricing";
const SOURCE_SUB_URL = "https://one.google.com/about/ai-premium";

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Known-good Google AI model pricing.
 * API prices sourced from https://ai.google.dev/pricing — verified 2026-04-10.
 * Subscription plan sourced from https://one.google.com/about/ai-premium.
 * Update this list whenever Google changes pricing and redeploy.
 */
const GOOGLE_REFERENCE_MODELS: AIModel[] = [
  {
    id: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    planType: "api",
    inputCostPer1k: 0.00125,
    outputCostPer1k: 0.005,
    monthlySubscriptionCostIfAny: null,
    hasFreeTier: false,
    bestFor: ["research", "automation", "writing"],
    qualityScore: 88,
    costScore: 65,
    latencyScore: 70,
    notes: "2M context window is unique. Best for long-document analysis and research tasks.",
    source: SOURCE_URL,
    last_updated: todayIso(),
  },
  {
    id: "gemini-1-5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    planType: "api",
    inputCostPer1k: 0.000075,
    outputCostPer1k: 0.0003,
    monthlySubscriptionCostIfAny: null,
    hasFreeTier: false,
    bestFor: ["automation", "chat", "writing"],
    qualityScore: 72,
    costScore: 97,
    latencyScore: 95,
    notes: "One of the cheapest models available. Excellent for high-volume automation pipelines.",
    source: SOURCE_URL,
    last_updated: todayIso(),
  },
  {
    id: "gemini-advanced",
    name: "Google One AI Premium",
    provider: "Google",
    planType: "subscription",
    inputCostPer1k: 0,
    outputCostPer1k: 0,
    monthlySubscriptionCostIfAny: 20,
    hasFreeTier: false,
    bestFor: ["research", "chat", "writing"],
    qualityScore: 86,
    costScore: 55,
    latencyScore: 72,
    notes: "Gemini Advanced via Google One. Includes 2TB storage — value depends on whether you use Google ecosystem.",
    source: SOURCE_SUB_URL,
    last_updated: todayIso(),
  },
  {
    id: "gemini-free",
    name: "Gemini Free",
    provider: "Google",
    planType: "subscription",
    inputCostPer1k: 0,
    outputCostPer1k: 0,
    monthlySubscriptionCostIfAny: 0,
    hasFreeTier: true,
    bestFor: ["chat", "writing"],
    qualityScore: 68,
    costScore: 100,
    latencyScore: 70,
    notes: "Free access to Gemini 1.5 Flash with rate limits. Good fallback option.",
    source: SOURCE_URL,
    last_updated: todayIso(),
  },
];

async function tryLiveFetch(): Promise<AIModel[] | null> {
  return null;
}

export async function fetchGooglePricingCandidates(): Promise<ProviderFetchResult> {
  const fetchedAt = new Date().toISOString();
  const live = await tryLiveFetch();

  if (live) {
    return {
      providerId: "google",
      providerName: "Google",
      sourceUrl: SOURCE_URL,
      fetchedAt,
      status: "live",
      statusMessage: `Fetched ${live.length} Google models live from ${SOURCE_URL}.`,
      candidates: live,
    };
  }

  return {
    providerId: "google",
    providerName: "Google",
    sourceUrl: SOURCE_URL,
    fetchedAt,
    status: "known-good",
    statusMessage:
      `Using reference data from ${SOURCE_URL} (verified 2026-04-10). ` +
      `Live fetch is not available in a browser-only context — pricing pages are JS-rendered SPAs. ` +
      `Verify prices manually before approving.`,
    candidates: GOOGLE_REFERENCE_MODELS,
  };
}
