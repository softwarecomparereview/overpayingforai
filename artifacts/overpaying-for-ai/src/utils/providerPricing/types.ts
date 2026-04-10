import type { AIModel } from "@/engine/types";

/**
 * Status of a provider fetch attempt.
 *
 * "live"       – successfully fetched and parsed from a live source (future: serverless layer)
 * "known-good" – live fetch not available; using hardcoded reference data sourced from official URLs
 * "error"      – fetch or parse failed entirely
 */
export type FetchDataQuality = "live" | "known-good" | "error";

export interface ProviderFetchResult {
  providerId: string;
  providerName: string;
  sourceUrl: string;
  fetchedAt: string;
  status: FetchDataQuality;
  statusMessage: string;
  candidates: AIModel[];
}
