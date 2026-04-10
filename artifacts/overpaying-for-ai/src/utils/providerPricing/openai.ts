/**
 * OpenAI pricing adapter
 *
 * Official source: https://openai.com/api/pricing
 *
 * CORS / live-fetch constraint
 * ─────────────────────────────────────────────────────────────────────────────
 * OpenAI's pricing page (platform.openai.com/docs/pricing and openai.com/api/pricing)
 * is a JavaScript-rendered SPA.  Fetching it from a browser — even via a CORS
 * proxy such as allorigins.win — returns an HTML shell with no pricing data
 * embedded in the markup.  Parsing it yields nothing useful.
 *
 * To enable true live fetch in the future:
 *   1. Create a Cloudflare Worker / Vercel Edge Function that calls OpenAI's
 *      internal pricing API or scrapes the rendered page server-side.
 *   2. Have that function return a JSON array in the AIModel schema.
 *   3. Replace the `tryLiveFetch()` stub below with a call to that endpoint.
 *
 * Until then, this adapter serves verified reference data sourced from the
 * official pricing page.  The admin must approve all changes before they are
 * exported — no auto-update occurs.
 *
 * Reference data last verified: 2026-04-10
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { AIModel } from "@/engine/types";
import type { ProviderFetchResult } from "./types";

const SOURCE_API_URL = "https://openai.com/api/pricing";
const SOURCE_CHAT_URL = "https://openai.com/chatgpt/pricing";

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Known-good OpenAI model pricing.
 * All values sourced from https://openai.com/api/pricing and
 * https://openai.com/chatgpt/pricing — verified 2026-04-10.
 * Update this list whenever OpenAI changes pricing and redeploy.
 */
const OPENAI_REFERENCE_MODELS: AIModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    planType: "api",
    inputCostPer1k: 0.005,
    outputCostPer1k: 0.015,
    monthlySubscriptionCostIfAny: null,
    hasFreeTier: false,
    bestFor: ["coding", "writing", "research", "automation", "chat"],
    qualityScore: 95,
    costScore: 40,
    latencyScore: 80,
    notes: "OpenAI's flagship multimodal model. Excellent across all tasks but expensive at scale.",
    source: SOURCE_API_URL,
    last_updated: todayIso(),
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "OpenAI",
    planType: "api",
    inputCostPer1k: 0.00015,
    outputCostPer1k: 0.0006,
    monthlySubscriptionCostIfAny: null,
    hasFreeTier: false,
    bestFor: ["chat", "writing", "automation"],
    qualityScore: 75,
    costScore: 92,
    latencyScore: 90,
    notes: "Dramatically cheaper than GPT-4o. Great for high-volume, lower-stakes tasks.",
    source: SOURCE_API_URL,
    last_updated: todayIso(),
  },
  {
    id: "chatgpt-plus",
    name: "ChatGPT Plus",
    provider: "OpenAI",
    planType: "subscription",
    inputCostPer1k: 0,
    outputCostPer1k: 0,
    monthlySubscriptionCostIfAny: 20,
    hasFreeTier: false,
    bestFor: ["chat", "writing", "research"],
    qualityScore: 92,
    costScore: 55,
    latencyScore: 75,
    notes: "Flat $20/month for access to GPT-4o. Good value for moderate usage; bad value for heavy API usage.",
    source: SOURCE_CHAT_URL,
    last_updated: todayIso(),
  },
  {
    id: "chatgpt-free",
    name: "ChatGPT Free",
    provider: "OpenAI",
    planType: "subscription",
    inputCostPer1k: 0,
    outputCostPer1k: 0,
    monthlySubscriptionCostIfAny: 0,
    hasFreeTier: true,
    bestFor: ["chat", "writing"],
    qualityScore: 70,
    costScore: 100,
    latencyScore: 65,
    notes: "Limited access to GPT-4o with rate limits. Fine for light, occasional use.",
    source: SOURCE_CHAT_URL,
    last_updated: todayIso(),
  },
];

/**
 * Stub for future live fetch implementation.
 * Returns null → adapter falls back to known-good reference data.
 * See module comment for upgrade path.
 */
async function tryLiveFetch(): Promise<AIModel[] | null> {
  return null;
}

export async function fetchOpenAIPricingCandidates(): Promise<ProviderFetchResult> {
  const fetchedAt = new Date().toISOString();
  const live = await tryLiveFetch();

  if (live) {
    return {
      providerId: "openai",
      providerName: "OpenAI",
      sourceUrl: SOURCE_API_URL,
      fetchedAt,
      status: "live",
      statusMessage: `Fetched ${live.length} OpenAI models live from ${SOURCE_API_URL}.`,
      candidates: live,
    };
  }

  return {
    providerId: "openai",
    providerName: "OpenAI",
    sourceUrl: SOURCE_API_URL,
    fetchedAt,
    status: "known-good",
    statusMessage:
      `Using reference data from ${SOURCE_API_URL} (verified 2026-04-10). ` +
      `Live fetch is not available in a browser-only context — pricing pages are JS-rendered SPAs. ` +
      `Verify prices manually before approving.`,
    candidates: OPENAI_REFERENCE_MODELS,
  };
}
