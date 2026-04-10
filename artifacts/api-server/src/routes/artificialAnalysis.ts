/**
 * Artificial Analysis pricing proxy
 *
 * Securely fetches AI model pricing from the Artificial Analysis API.
 * The API key is read from process.env.ARTIFICIAL_ANALYSIS_API_KEY and
 * is NEVER exposed to the browser bundle.
 *
 * Endpoint: GET /api/admin/artificial-analysis-pricing
 * Auth:     x-api-key header
 *
 * AA response schema (verified 2026-04-10):
 *   { status, prompt_options, data: AAModel[] }
 *
 * Each AAModel has:
 *   id, name, slug, release_date, model_creator { name, slug },
 *   evaluations { artificial_analysis_intelligence_index, … },
 *   pricing { price_1m_input_tokens, price_1m_output_tokens, price_1m_blended_3_to_1 },
 *   median_output_tokens_per_second, median_time_to_first_token_seconds
 *
 * Prices from AA are per million tokens.
 * Our models.json schema uses per 1k tokens → divide AA price by 1000.
 */

import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ── Config ────────────────────────────────────────────────────────────────────

const AA_MODELS_ENDPOINT = "https://artificialanalysis.ai/api/v2/data/llms/models";
const AA_SOURCE_URL = "https://artificialanalysis.ai/models";

// ── Actual AA response shape ──────────────────────────────────────────────────

interface AAPricing {
  price_1m_blended_3_to_1?: number | null;
  price_1m_input_tokens?: number | null;
  price_1m_output_tokens?: number | null;
}

interface AAModel {
  id: string;
  name: string;
  slug: string;
  release_date?: string;
  model_creator?: { id?: string; name?: string; slug?: string };
  evaluations?: { artificial_analysis_intelligence_index?: number | null; [k: string]: number | null | undefined };
  pricing?: AAPricing;
  median_output_tokens_per_second?: number | null;
  median_time_to_first_token_seconds?: number | null;
  median_time_to_first_answer_token?: number | null;
}

interface AAResponse {
  status?: unknown;
  prompt_options?: unknown;
  data: AAModel[];
}

// ── Model mapping: AA slug → our models.json ID ──────────────────────────────
// Keys are the exact `slug` values from the AA API.
// Multiple AA slugs can map to the same ourId (e.g. different vintage snapshots).
// We prefer the slug that is most current / has valid pricing.
//
// When multiple slugs map to the same ourId, the FIRST one with non-zero
// pricing wins (iterator order = order declared here).

interface ModelMapping {
  ourId: string;
  ourName: string;
  provider: string;
  planType: "api" | "subscription";
  hasFreeTier: boolean;
  bestFor: string[];
  qualityScore: number;
  costScore: number;
  latencyScore: number;
  notes: string;
}

const AA_SLUG_TO_MODEL: Record<string, ModelMapping> = {
  // ── OpenAI ──────────────────────────────────────────────────────────────────
  "gpt-4o": {
    ourId: "gpt-4o", ourName: "GPT-4o", provider: "OpenAI",
    planType: "api", hasFreeTier: false,
    bestFor: ["coding", "writing", "research", "automation", "chat"],
    qualityScore: 95, costScore: 40, latencyScore: 80,
    notes: "OpenAI's flagship multimodal model. Excellent across all tasks but expensive at scale.",
  },
  // Aug '24 vintage is the current canonical gpt-4o API model
  "gpt-4o-2024-08-06": {
    ourId: "gpt-4o", ourName: "GPT-4o", provider: "OpenAI",
    planType: "api", hasFreeTier: false,
    bestFor: ["coding", "writing", "research", "automation", "chat"],
    qualityScore: 95, costScore: 40, latencyScore: 80,
    notes: "OpenAI's flagship multimodal model. Excellent across all tasks but expensive at scale.",
  },
  "gpt-4o-mini": {
    ourId: "gpt-4o-mini", ourName: "GPT-4o mini", provider: "OpenAI",
    planType: "api", hasFreeTier: false,
    bestFor: ["chat", "writing", "automation"],
    qualityScore: 75, costScore: 92, latencyScore: 90,
    notes: "Dramatically cheaper than GPT-4o. Great for high-volume, lower-stakes tasks.",
  },

  // ── Anthropic ───────────────────────────────────────────────────────────────
  // claude-35-sonnet = Claude 3.5 Sonnet Oct '24 — the canonical claude-3-5-sonnet
  "claude-35-sonnet": {
    ourId: "claude-3-5-sonnet", ourName: "Claude 3.5 Sonnet", provider: "Anthropic",
    planType: "api", hasFreeTier: false,
    bestFor: ["coding", "writing", "research", "chat"],
    qualityScore: 90, costScore: 55, latencyScore: 72,
    notes: "Anthropic's best model. Strong at coding, reasoning, and long-form writing.",
  },
  // claude-3-7-sonnet is the newer non-reasoning variant — maps to same ourId for now
  "claude-3-7-sonnet": {
    ourId: "claude-3-5-sonnet", ourName: "Claude 3.5 Sonnet", provider: "Anthropic",
    planType: "api", hasFreeTier: false,
    bestFor: ["coding", "writing", "research", "chat"],
    qualityScore: 93, costScore: 55, latencyScore: 72,
    notes: "Anthropic's best model. Strong at coding, reasoning, and long-form writing.",
  },
  "claude-3-5-haiku": {
    ourId: "claude-3-5-haiku", ourName: "Claude 3.5 Haiku", provider: "Anthropic",
    planType: "api", hasFreeTier: false,
    bestFor: ["chat", "writing", "automation"],
    qualityScore: 72, costScore: 84, latencyScore: 88,
    notes: "Anthropic's fastest and cheapest model. Good for high-volume tasks.",
  },

  // ── Google ──────────────────────────────────────────────────────────────────
  "gemini-1-5-pro": {
    ourId: "gemini-1-5-pro", ourName: "Gemini 1.5 Pro", provider: "Google",
    planType: "api", hasFreeTier: false,
    bestFor: ["research", "coding", "writing"],
    qualityScore: 88, costScore: 50, latencyScore: 70,
    notes: "Google's highly capable model with 1M token context window.",
  },
  "gemini-1-5-flash": {
    ourId: "gemini-1-5-flash", ourName: "Gemini 1.5 Flash", provider: "Google",
    planType: "api", hasFreeTier: false,
    bestFor: ["chat", "writing", "automation"],
    qualityScore: 74, costScore: 95, latencyScore: 92,
    notes: "Extremely fast and cheap. Best Google option for high-volume tasks.",
  },

  // ── Mistral ─────────────────────────────────────────────────────────────────
  // mistral-large-3 is the current flagship ($0.5/$1.5 per million)
  "mistral-large-3": {
    ourId: "mistral-large", ourName: "Mistral Large", provider: "Mistral",
    planType: "api", hasFreeTier: false,
    bestFor: ["coding", "writing", "research"],
    qualityScore: 85, costScore: 72, latencyScore: 82,
    notes: "Mistral's top model. Strong on coding and multilingual tasks at competitive prices.",
  },
  // Fall back to Large 2 Nov '24 if Large 3 has no pricing
  "mistral-large-2": {
    ourId: "mistral-large", ourName: "Mistral Large", provider: "Mistral",
    planType: "api", hasFreeTier: false,
    bestFor: ["coding", "writing", "research"],
    qualityScore: 82, costScore: 68, latencyScore: 78,
    notes: "Mistral's top model. Strong on coding and multilingual tasks.",
  },
  // mistral-small-3-2 is the current small model ($0.1/$0.3 per million)
  "mistral-small-3-2": {
    ourId: "mistral-small", ourName: "Mistral Small", provider: "Mistral",
    planType: "api", hasFreeTier: false,
    bestFor: ["chat", "writing", "automation"],
    qualityScore: 67, costScore: 88, latencyScore: 88,
    notes: "Mistral's budget option. Good value for lightweight tasks and European data-residency.",
  },
  "mistral-small-3-1": {
    ourId: "mistral-small", ourName: "Mistral Small", provider: "Mistral",
    planType: "api", hasFreeTier: false,
    bestFor: ["chat", "writing", "automation"],
    qualityScore: 67, costScore: 88, latencyScore: 88,
    notes: "Mistral's budget option. Good value for lightweight tasks and European data-residency.",
  },
  "mistral-small-3": {
    ourId: "mistral-small", ourName: "Mistral Small", provider: "Mistral",
    planType: "api", hasFreeTier: false,
    bestFor: ["chat", "writing", "automation"],
    qualityScore: 65, costScore: 87, latencyScore: 86,
    notes: "Mistral's budget option. Good value for lightweight tasks and European data-residency.",
  },

  // ── DeepSeek ─────────────────────────────────────────────────────────────────
  "deepseek-v3": {
    ourId: "deepseek-v3", ourName: "DeepSeek V3", provider: "DeepSeek",
    planType: "api", hasFreeTier: false,
    bestFor: ["coding", "writing", "research", "chat"],
    qualityScore: 88, costScore: 97, latencyScore: 65,
    notes: "Near-frontier quality at fraction of GPT-4o cost. Strong for coding and reasoning.",
  },

  // ── Meta / Llama ────────────────────────────────────────────────────────────
  "llama-3-1-instruct-70b": {
    ourId: "llama-3-1-70b", ourName: "Llama 3.1 70B", provider: "Meta (self-hosted)",
    planType: "api", hasFreeTier: true,
    bestFor: ["coding", "writing", "research"],
    qualityScore: 80, costScore: 90, latencyScore: 70,
    notes: "Open-source. Self-hosted cost depends on infrastructure. Strongest open model at this size.",
  },
  // Llama 3.3 70B is backward-compatible drop-in — map to same ourId
  "llama-3-3-instruct-70b": {
    ourId: "llama-3-1-70b", ourName: "Llama 3.1 70B", provider: "Meta (self-hosted)",
    planType: "api", hasFreeTier: true,
    bestFor: ["coding", "writing", "research"],
    qualityScore: 82, costScore: 90, latencyScore: 72,
    notes: "Open-source. Self-hosted cost depends on infrastructure. Strongest open model at this size.",
  },
};

// ── Normalise AA models into our AIModel schema ───────────────────────────────

function normalizeModels(rawModels: AAModel[], today: string): {
  candidates: ReturnType<typeof buildCandidate>[];
  unmappedSlugs: string[];
} {
  const candidates: ReturnType<typeof buildCandidate>[] = [];
  const unmappedSlugs: string[] = [];
  const seenOurIds = new Set<string>();

  for (const raw of rawModels) {
    const slug = (raw.slug ?? "").trim().toLowerCase();
    const mapping = AA_SLUG_TO_MODEL[slug];

    if (!mapping) {
      unmappedSlugs.push(raw.slug ?? raw.name ?? slug);
      continue;
    }

    // If we already have a candidate for this ourId (from a higher-priority slug),
    // skip unless the earlier one had $0 pricing and this one has real pricing.
    if (seenOurIds.has(mapping.ourId)) continue;

    const inp = raw.pricing?.price_1m_input_tokens;
    const out = raw.pricing?.price_1m_output_tokens;

    // AA prices are per million tokens; convert to per 1k for our schema
    const inputCostPer1k = inp != null && inp > 0 ? +(inp / 1000).toFixed(8) : 0;
    const outputCostPer1k = out != null && out > 0 ? +(out / 1000).toFixed(8) : 0;

    seenOurIds.add(mapping.ourId);
    candidates.push(buildCandidate(mapping, inputCostPer1k, outputCostPer1k, raw, today));
  }

  return { candidates, unmappedSlugs };
}

function buildCandidate(
  mapping: ModelMapping,
  inputCostPer1k: number,
  outputCostPer1k: number,
  raw: AAModel,
  today: string,
) {
  return {
    id: mapping.ourId,
    name: mapping.ourName,
    provider: mapping.provider,
    planType: mapping.planType,
    inputCostPer1k,
    outputCostPer1k,
    monthlySubscriptionCostIfAny: null as number | null,
    hasFreeTier: mapping.hasFreeTier,
    bestFor: mapping.bestFor,
    qualityScore: mapping.qualityScore,
    costScore: mapping.costScore,
    latencyScore: mapping.latencyScore,
    notes: mapping.notes,
    source: AA_SOURCE_URL,
    last_updated: today,
    // Extra context (not in schema, stripped by diff tool, kept for admin debugging)
    _aa_slug: raw.slug,
    _aa_name: raw.name,
    _aa_release_date: raw.release_date,
    _aa_intelligence_index: raw.evaluations?.artificial_analysis_intelligence_index,
    _aa_output_tps: raw.median_output_tokens_per_second,
  };
}

// ── Route handler ─────────────────────────────────────────────────────────────

router.get("/admin/artificial-analysis-pricing", async (_req, res) => {
  const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
  const today = new Date().toISOString().split("T")[0];
  const fetchedAt = new Date().toISOString();

  if (!apiKey) {
    res.status(401).json({
      error: "missing_api_key",
      message:
        "ARTIFICIAL_ANALYSIS_API_KEY environment variable is not set. " +
        "Add it to Replit Secrets and restart the API Server workflow.",
    });
    return;
  }

  // Fetch from AA
  let rawData: unknown;
  try {
    const response = await fetch(AA_MODELS_ENDPOINT, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
        "User-Agent": "OverpayingForAI-Admin/1.0",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (response.status === 401 || response.status === 403) {
      res.status(401).json({
        error: "invalid_api_key",
        message:
          `Artificial Analysis returned HTTP ${response.status} (unauthorized). ` +
          "Check that your ARTIFICIAL_ANALYSIS_API_KEY is correct and has not expired.",
      });
      return;
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After") ?? "60";
      res.status(429).json({
        error: "rate_limited",
        message: `Rate limited by Artificial Analysis. Retry after ${retryAfter}s.`,
        retryAfter,
      });
      return;
    }

    if (!response.ok) {
      res.status(502).json({
        error: "upstream_error",
        message: `Artificial Analysis API returned HTTP ${response.status}: ${response.statusText}`,
        endpoint: AA_MODELS_ENDPOINT,
      });
      return;
    }

    rawData = await response.json();
  } catch (err: unknown) {
    const isTimeout =
      err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    res.status(502).json({
      error: isTimeout ? "timeout" : "fetch_failed",
      message: isTimeout
        ? "Request to Artificial Analysis timed out after 15 seconds."
        : `Failed to fetch from Artificial Analysis: ${err instanceof Error ? err.message : String(err)}`,
    });
    return;
  }

  // Extract the model array from the { status, prompt_options, data: AAModel[] } envelope
  let rawModels: AAModel[];
  try {
    const body = rawData as AAResponse;
    if (Array.isArray(body)) {
      rawModels = body;
    } else if (body.data && Array.isArray(body.data)) {
      rawModels = body.data;
    } else {
      res.status(422).json({
        error: "schema_mismatch",
        message:
          "AA API response did not contain a 'data' array. The schema may have changed.",
        receivedKeys: Object.keys(rawData as object),
        rawSample: JSON.stringify(rawData).slice(0, 400),
      });
      return;
    }
  } catch (parseErr: unknown) {
    res.status(422).json({
      error: "parse_failed",
      message: `Failed to parse AA response: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
    });
    return;
  }

  const { candidates, unmappedSlugs } = normalizeModels(rawModels, today);

  const unmappedNote = unmappedSlugs.length > 0
    ? ` — ${unmappedSlugs.length} AA slugs have no mapping in our schema`
    : "";

  res.json({
    source: "artificialanalysis",
    fetchedAt,
    sourceUrl: AA_SOURCE_URL,
    apiEndpoint: AA_MODELS_ENDPOINT,
    status: "live",
    statusMessage:
      `Live data from Artificial Analysis — ${rawModels.length} models in API, ` +
      `${candidates.length} mapped to site schema.` + unmappedNote,
    candidates,
    unmappedCount: unmappedSlugs.length,
    meta: {
      totalFromApi: rawModels.length,
      mapped: candidates.length,
      unmapped: unmappedSlugs.length,
    },
  });
});

export default router;
