/**
 * Artificial Analysis pricing adapter — frontend side
 *
 * This module calls the API server's secure proxy endpoint.
 * The Artificial Analysis API key is held ONLY on the API server
 * and is never present in this bundle.
 *
 * API server endpoint: GET /api/admin/artificial-analysis-pricing
 * API server base:     VITE_API_SERVER_ORIGIN (defaults to http://localhost:8080)
 *
 * Data flow:
 *   Admin clicks "Fetch Artificial Analysis"
 *   → this module calls the proxy endpoint
 *   → API server fetches from artificialanalysis.ai with the secret key
 *   → API server normalises and returns candidates in AIModel schema
 *   → this module wraps the result in ProviderFetchResult
 *   → PricingRefreshPage loads candidates into the diff review flow
 */

import type { AIModel } from "@/engine/types";
import type { ProviderFetchResult } from "./types";

// ── Configuration ─────────────────────────────────────────────────────────────

/**
 * Calls the Vite dev-server proxy at /admin-api, which forwards to the API
 * server at localhost:8080 server-side. This avoids CORS issues and means the
 * browser never has to reach localhost:8080 directly (which would fail in the
 * Replit preview environment).
 *
 * Proxy config: vite.config.ts → server.proxy["/admin-api"]
 */
const PROXY_ENDPOINT = "/admin-api/api/admin/artificial-analysis-pricing";
const AA_SOURCE_URL = "https://artificialanalysis.ai/models";

// ── Fetch ──────────────────────────────────────────────────────────────────────

interface AAProxySuccess {
  source: "artificialanalysis";
  fetchedAt: string;
  sourceUrl: string;
  status: "live";
  statusMessage: string;
  candidates: AIModel[];
  unmappedModels: string[];
  meta: { totalFromApi: number; mapped: number; unmapped: number };
}

interface AAProxyError {
  error: string;
  message: string;
  retryAfter?: string;
  rawSample?: string;
}

export async function fetchArtificialAnalysisCandidates(): Promise<ProviderFetchResult> {
  const fetchedAt = new Date().toISOString();

  let response: Response;
  try {
    response = await fetch(PROXY_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(20000), // 20s — slightly longer than server-side timeout
    });
  } catch (err: unknown) {
    const isTimeout =
      err instanceof Error &&
      (err.name === "TimeoutError" || err.name === "AbortError");

    const isConnRefused =
      err instanceof TypeError &&
      (err.message.includes("Failed to fetch") ||
        err.message.includes("NetworkError") ||
        err.message.includes("ECONNREFUSED"));

    let msg = "Failed to reach the API server.";
    if (isTimeout) {
      msg = "Request to the API server timed out after 20 seconds.";
    } else if (isConnRefused) {
      msg =
        "Could not connect to the API server. " +
        "Make sure the 'API Server' workflow is running in Replit.";
    } else if (err instanceof Error) {
      msg = `API server fetch error: ${err.message}`;
    }

    return {
      providerId: "artificialanalysis",
      providerName: "Artificial Analysis",
      sourceUrl: AA_SOURCE_URL,
      fetchedAt,
      status: "error",
      statusMessage: msg,
      candidates: [],
    };
  }

  // Parse response
  let body: AAProxySuccess | AAProxyError;
  try {
    body = (await response.json()) as AAProxySuccess | AAProxyError;
  } catch {
    return {
      providerId: "artificialanalysis",
      providerName: "Artificial Analysis",
      sourceUrl: AA_SOURCE_URL,
      fetchedAt,
      status: "error",
      statusMessage: `API server returned invalid JSON (HTTP ${response.status}).`,
      candidates: [],
    };
  }

  // Handle server-side errors
  if (!response.ok) {
    const errBody = body as AAProxyError;
    let msg = errBody.message ?? `API server error HTTP ${response.status}.`;

    if (response.status === 401) {
      msg = errBody.message ?? "API key missing or invalid. See the admin setup guide.";
    } else if (response.status === 429) {
      msg = `Rate limited. ${errBody.message ?? ""}${errBody.retryAfter ? ` Retry in ${errBody.retryAfter}s.` : ""}`;
    } else if (response.status === 422) {
      msg = `Schema mismatch — the Artificial Analysis API response format may have changed. ${errBody.message ?? ""}`;
    } else if (response.status === 502) {
      msg = `Upstream fetch failed: ${errBody.message ?? ""}`;
    }

    return {
      providerId: "artificialanalysis",
      providerName: "Artificial Analysis",
      sourceUrl: AA_SOURCE_URL,
      fetchedAt,
      status: "error",
      statusMessage: msg,
      candidates: [],
    };
  }

  // Success path
  const successBody = body as AAProxySuccess;
  const unmappedNote =
    successBody.unmappedModels?.length > 0
      ? ` (${successBody.unmappedModels.length} AA models not in site schema: ${successBody.unmappedModels.slice(0, 5).join(", ")}${successBody.unmappedModels.length > 5 ? "…" : ""})`
      : "";

  return {
    providerId: "artificialanalysis",
    providerName: "Artificial Analysis",
    sourceUrl: successBody.sourceUrl ?? AA_SOURCE_URL,
    fetchedAt: successBody.fetchedAt ?? fetchedAt,
    status: "live",
    statusMessage:
      `Live fetch from Artificial Analysis — ` +
      `${successBody.candidates.length} models loaded into diff review.` +
      unmappedNote,
    candidates: successBody.candidates,
  };
}
