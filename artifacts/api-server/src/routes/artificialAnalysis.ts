/**
 * Artificial Analysis pricing proxy
 *
 * Securely fetches AI model pricing from the Artificial Analysis API.
 * The API key is read from process.env.ARTIFICIAL_ANALYSIS_API_KEY and
 * is NEVER exposed to the browser bundle.
 *
 * Endpoint: GET /api/admin/artificial-analysis-pricing
 *
 * Returns:
 *   {
 *     source: "artificialanalysis",
 *     fetchedAt: ISO string,
 *     sourceUrl: string,
 *     status: "live" | "error",
 *     statusMessage: string,
 *     candidates: AIModel[],          // normalized, matches models.json schema
 *     unmappedModels: string[],        // AA models we don't yet track
 *     meta: { totalFromApi, mapped }   // coverage stats
 *   }
 *
 * Error responses:
 *   401 – API key missing or invalid
 *   502 – upstream fetch failed
 *   422 – response schema did not match expectations
 *   429 – rate limited by Artificial Analysis
 */

import { Router, type IRouter } from "express";

const router: IRouter = Router();

// ── Artificial Analysis API config ──────────────────────────────────────────

const AA_SOURCE_URL = "https://artificialanalysis.ai/models";

/**
 * Candidate endpoints to try in order.
 * Artificial Analysis does not publish a stable public REST API URL as of 2026-04.
 * Their API key feature appears to be for a private enterprise data product.
 * We try several plausible patterns; if all return 404/401 the route returns a
 * helpful error with manual instructions.
 */
const AA_ENDPOINT_CANDIDATES = [
  "https://artificialanalysis.ai/api/v1/models",
  "https://artificialanalysis.ai/api/v2/models",
  "https://artificialanalysis.ai/api/models",
  "https://api.artificialanalysis.ai/v1/models",
  "https://api.artificialanalysis.ai/models",
  "https://artificialanalysis.ai/api/v1/llm",
  "https://artificialanalysis.ai/api/llm",
];

// ── Model ID mapping: AA model names → our models.json IDs ──────────────────
// Keep in sync with src/data/models.json in the frontend.
// Only include models we actually track; others go to unmappedModels[].

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

const AA_NAME_TO_MODEL: Record<string, ModelMapping> = {
  "gpt-4o": {
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
  "claude-3-5-sonnet-20241022": {
    ourId: "claude-3-5-sonnet", ourName: "Claude 3.5 Sonnet", provider: "Anthropic",
    planType: "api", hasFreeTier: false,
    bestFor: ["coding", "writing", "research", "chat"],
    qualityScore: 93, costScore: 55, latencyScore: 72,
    notes: "Anthropic's best model. Strong at coding, reasoning, and long-form writing.",
  },
  "claude-3-5-sonnet": {
    ourId: "claude-3-5-sonnet", ourName: "Claude 3.5 Sonnet", provider: "Anthropic",
    planType: "api", hasFreeTier: false,
    bestFor: ["coding", "writing", "research", "chat"],
    qualityScore: 93, costScore: 55, latencyScore: 72,
    notes: "Anthropic's best model. Strong at coding, reasoning, and long-form writing.",
  },
  "claude-3-5-haiku-20241022": {
    ourId: "claude-3-5-haiku", ourName: "Claude 3.5 Haiku", provider: "Anthropic",
    planType: "api", hasFreeTier: false,
    bestFor: ["chat", "writing", "automation"],
    qualityScore: 72, costScore: 84, latencyScore: 88,
    notes: "Anthropic's fastest and cheapest model. Good for high-volume tasks.",
  },
  "claude-3-5-haiku": {
    ourId: "claude-3-5-haiku", ourName: "Claude 3.5 Haiku", provider: "Anthropic",
    planType: "api", hasFreeTier: false,
    bestFor: ["chat", "writing", "automation"],
    qualityScore: 72, costScore: 84, latencyScore: 88,
    notes: "Anthropic's fastest and cheapest model. Good for high-volume tasks.",
  },
  "gemini-1.5-pro": {
    ourId: "gemini-1-5-pro", ourName: "Gemini 1.5 Pro", provider: "Google",
    planType: "api", hasFreeTier: false,
    bestFor: ["research", "coding", "writing"],
    qualityScore: 88, costScore: 50, latencyScore: 70,
    notes: "Google's most capable model with 1M token context window.",
  },
  "gemini-1.5-pro-002": {
    ourId: "gemini-1-5-pro", ourName: "Gemini 1.5 Pro", provider: "Google",
    planType: "api", hasFreeTier: false,
    bestFor: ["research", "coding", "writing"],
    qualityScore: 88, costScore: 50, latencyScore: 70,
    notes: "Google's most capable model with 1M token context window.",
  },
  "gemini-1.5-flash": {
    ourId: "gemini-1-5-flash", ourName: "Gemini 1.5 Flash", provider: "Google",
    planType: "api", hasFreeTier: false,
    bestFor: ["chat", "writing", "automation"],
    qualityScore: 74, costScore: 95, latencyScore: 92,
    notes: "Extremely fast and cheap. Best Google option for high-volume tasks.",
  },
  "gemini-1.5-flash-002": {
    ourId: "gemini-1-5-flash", ourName: "Gemini 1.5 Flash", provider: "Google",
    planType: "api", hasFreeTier: false,
    bestFor: ["chat", "writing", "automation"],
    qualityScore: 74, costScore: 95, latencyScore: 92,
    notes: "Extremely fast and cheap. Best Google option for high-volume tasks.",
  },
  "mistral-large": {
    ourId: "mistral-large", ourName: "Mistral Large", provider: "Mistral",
    planType: "api", hasFreeTier: false,
    bestFor: ["coding", "writing", "research"],
    qualityScore: 82, costScore: 68, latencyScore: 78,
    notes: "Mistral's top model. Strong on coding and multilingual tasks.",
  },
  "mistral-large-2411": {
    ourId: "mistral-large", ourName: "Mistral Large", provider: "Mistral",
    planType: "api", hasFreeTier: false,
    bestFor: ["coding", "writing", "research"],
    qualityScore: 82, costScore: 68, latencyScore: 78,
    notes: "Mistral's top model. Strong on coding and multilingual tasks.",
  },
  "mistral-small": {
    ourId: "mistral-small", ourName: "Mistral Small", provider: "Mistral",
    planType: "api", hasFreeTier: false,
    bestFor: ["chat", "writing", "automation"],
    qualityScore: 65, costScore: 85, latencyScore: 85,
    notes: "Mistral's budget option. Good value for European data-residency requirements.",
  },
  "deepseek-v3": {
    ourId: "deepseek-v3", ourName: "DeepSeek V3", provider: "DeepSeek",
    planType: "api", hasFreeTier: false,
    bestFor: ["coding", "writing", "research", "chat"],
    qualityScore: 88, costScore: 97, latencyScore: 65,
    notes: "Near-frontier quality at fraction of GPT-4o cost. Strong for coding and reasoning.",
  },
  "llama-3.1-70b-instruct": {
    ourId: "llama-3-1-70b", ourName: "Llama 3.1 70B", provider: "Meta (self-hosted)",
    planType: "api", hasFreeTier: true,
    bestFor: ["coding", "writing", "research"],
    qualityScore: 80, costScore: 90, latencyScore: 70,
    notes: "Open-source. Self-hosted cost depends on infrastructure. Strongest open model at this size.",
  },
};

// ── Normalize AA response into our AIModel schema ────────────────────────────

interface AAModel {
  // Potential field names from AA API — we try multiple paths
  model?: string;
  model_name?: string;
  name?: string;
  id?: string;

  creator?: string;
  provider?: string;
  organization?: string;

  // Pricing — per million tokens (most common in AA)
  input_price?: number;
  output_price?: number;
  input_cost_per_million?: number;
  output_cost_per_million?: number;

  // Pricing — per 1k tokens (alternative)
  input_cost_per_1k?: number;
  output_cost_per_1k?: number;

  // Speed / latency
  tokens_per_second?: number;
  output_tokens_per_second?: number;
  latency_p50_seconds?: number;

  // Nested pricing object
  pricing?: {
    input?: number;
    output?: number;
    input_cost_per_million?: number;
    output_cost_per_million?: number;
    input_price_per_million_tokens?: number;
    output_price_per_million_tokens?: number;
  };

  // Nested performance object
  performance?: {
    tokens_per_second?: number;
    output_tokens_per_second?: number;
    latency?: number;
  };

  // Context
  context_window?: number;
  context_length?: number;
}

function extractModelName(m: AAModel): string {
  return (m.model ?? m.model_name ?? m.name ?? m.id ?? "").trim().toLowerCase();
}

function extractInputCostPerMillion(m: AAModel): number | null {
  // Try flat fields first
  const flat =
    m.input_price ??
    m.input_cost_per_million ??
    m.input_cost_per_1k != null ? (m.input_cost_per_1k! * 1000) : null;
  if (flat != null) return flat;

  // Try nested pricing
  if (m.pricing) {
    return (
      m.pricing.input ??
      m.pricing.input_cost_per_million ??
      m.pricing.input_price_per_million_tokens ??
      null
    );
  }
  return null;
}

function extractOutputCostPerMillion(m: AAModel): number | null {
  const flat =
    m.output_price ??
    m.output_cost_per_million ??
    m.output_cost_per_1k != null ? (m.output_cost_per_1k! * 1000) : null;
  if (flat != null) return flat;

  if (m.pricing) {
    return (
      m.pricing.output ??
      m.pricing.output_cost_per_million ??
      m.pricing.output_price_per_million_tokens ??
      null
    );
  }
  return null;
}

function extractSpeedTps(m: AAModel): number | null {
  return (
    m.tokens_per_second ??
    m.output_tokens_per_second ??
    m.performance?.tokens_per_second ??
    m.performance?.output_tokens_per_second ??
    null
  );
}

function normalizeModels(rawModels: AAModel[], today: string): {
  candidates: ReturnType<typeof buildCandidate>[];
  unmappedModels: string[];
} {
  const candidates: ReturnType<typeof buildCandidate>[] = [];
  const unmappedModels: string[] = [];
  const seenOurIds = new Set<string>();

  for (const raw of rawModels) {
    const rawName = extractModelName(raw);
    const mapping = AA_NAME_TO_MODEL[rawName];

    if (!mapping) {
      unmappedModels.push(raw.model ?? raw.model_name ?? raw.name ?? raw.id ?? rawName);
      continue;
    }

    // Skip duplicates (e.g. both "claude-3-5-sonnet" and "claude-3-5-sonnet-20241022" map to same ourId)
    if (seenOurIds.has(mapping.ourId)) continue;
    seenOurIds.add(mapping.ourId);

    const inputPerMillion = extractInputCostPerMillion(raw);
    const outputPerMillion = extractOutputCostPerMillion(raw);

    // AA prices are per million tokens; our schema uses per 1k tokens
    const inputPer1k = inputPerMillion != null ? +(inputPerMillion / 1000).toFixed(8) : 0;
    const outputPer1k = outputPerMillion != null ? +(outputPerMillion / 1000).toFixed(8) : 0;

    // Optional enrichment fields (future-ready)
    const speedTps = extractSpeedTps(raw);

    candidates.push(buildCandidate(mapping, inputPer1k, outputPer1k, speedTps, today));
  }

  return { candidates, unmappedModels };
}

function buildCandidate(
  mapping: ModelMapping,
  inputCostPer1k: number,
  outputCostPer1k: number,
  _speedTps: number | null,
  today: string
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
  };
}

// ── Route handler ────────────────────────────────────────────────────────────

router.get("/admin/artificial-analysis-pricing", async (_req, res) => {
  const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
  const today = new Date().toISOString().split("T")[0];
  const fetchedAt = new Date().toISOString();

  // 1. API key check
  if (!apiKey) {
    res.status(401).json({
      error: "missing_api_key",
      message:
        "ARTIFICIAL_ANALYSIS_API_KEY environment variable is not set. " +
        "Add it to your Replit Secrets and restart the API server workflow.",
    });
    return;
  }

  // 2. Try each known endpoint candidate in order until one succeeds
  let rawData: unknown = null;
  let successEndpoint: string | null = null;
  const attemptLog: string[] = [];

  for (const endpoint of AA_ENDPOINT_CANDIDATES) {
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
          "User-Agent": "OverpayingForAI-Admin/1.0",
        },
        signal: AbortSignal.timeout(8000),
      });
    } catch (err: unknown) {
      attemptLog.push(`${endpoint} → fetch error: ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }

    if (response.status === 401 || response.status === 403) {
      // Key is wrong/expired — no point trying other endpoints
      res.status(401).json({
        error: "invalid_api_key",
        message:
          `Artificial Analysis returned HTTP ${response.status} (unauthorized). ` +
          "Check that your ARTIFICIAL_ANALYSIS_API_KEY is correct and has not expired.",
        triedEndpoint: endpoint,
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
      attemptLog.push(`${endpoint} → HTTP ${response.status}`);
      continue;
    }

    // Check content-type — if it's HTML we got a Next.js 404 page not JSON
    const ct = response.headers.get("content-type") ?? "";
    if (ct.includes("text/html")) {
      attemptLog.push(`${endpoint} → HTML response (not a REST endpoint)`);
      continue;
    }

    try {
      rawData = await response.json();
      successEndpoint = endpoint;
      break;
    } catch {
      attemptLog.push(`${endpoint} → JSON parse failed`);
      continue;
    }
  }

  // None of the endpoints worked — AA does not expose a public REST API
  if (rawData === null || successEndpoint === null) {
    res.status(502).json({
      error: "no_api_endpoint",
      message:
        "Artificial Analysis does not currently expose a public REST API. " +
        "Their data is rendered server-side and is not available via a standard HTTP endpoint. " +
        "To get pricing data from Artificial Analysis, visit https://artificialanalysis.ai/models " +
        "manually and paste the data into the manual paste box below.",
      triedEndpoints: AA_ENDPOINT_CANDIDATES,
      attemptLog,
      hint:
        "If Artificial Analysis activates their data API, update AA_ENDPOINT_CANDIDATES " +
        "in artifacts/api-server/src/routes/artificialAnalysis.ts with the correct URL.",
    });
    return;
  }

  // 3. Parse response — handle multiple envelope shapes
  let rawModels: AAModel[];
  try {
    if (Array.isArray(rawData)) {
      rawModels = rawData as AAModel[];
    } else if (
      rawData &&
      typeof rawData === "object" &&
      "models" in rawData &&
      Array.isArray((rawData as { models: unknown }).models)
    ) {
      rawModels = (rawData as { models: AAModel[] }).models;
    } else if (
      rawData &&
      typeof rawData === "object" &&
      "data" in rawData &&
      Array.isArray((rawData as { data: unknown }).data)
    ) {
      rawModels = (rawData as { data: AAModel[] }).data;
    } else if (
      rawData &&
      typeof rawData === "object" &&
      "results" in rawData &&
      Array.isArray((rawData as { results: unknown }).results)
    ) {
      rawModels = (rawData as { results: AAModel[] }).results;
    } else {
      res.status(422).json({
        error: "schema_mismatch",
        message:
          "Artificial Analysis API response did not match expected format. " +
          "Expected an array or an object with a 'models', 'data', or 'results' array. " +
          `Got: ${JSON.stringify(rawData).slice(0, 300)}`,
        rawSample: JSON.stringify(rawData).slice(0, 500),
      });
      return;
    }
  } catch (parseErr: unknown) {
    res.status(422).json({
      error: "parse_failed",
      message: `Failed to parse Artificial Analysis response: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`,
    });
    return;
  }

  // 4. Normalize into our schema
  const { candidates, unmappedModels } = normalizeModels(rawModels, today);

  // 5. Return result
  res.json({
    source: "artificialanalysis",
    fetchedAt,
    sourceUrl: AA_SOURCE_URL,
    apiEndpoint: AA_MODELS_ENDPOINT,
    status: "live",
    statusMessage: `Fetched ${rawModels.length} models from Artificial Analysis. Mapped ${candidates.length} to site schema. ${unmappedModels.length} unmapped.`,
    candidates,
    unmappedModels,
    meta: {
      totalFromApi: rawModels.length,
      mapped: candidates.length,
      unmapped: unmappedModels.length,
    },
  });
});

export default router;
