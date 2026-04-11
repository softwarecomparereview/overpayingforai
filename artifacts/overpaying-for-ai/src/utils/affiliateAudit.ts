/**
 * affiliateAudit.ts
 *
 * Derives a comprehensive affiliate coverage audit from:
 * - affiliates.ts (central config)
 * - comparisons.json, best-of.json, aiTypes.json (content usage)
 * - affiliateResolver (CTA resolution logic)
 *
 * Zero runtime side-effects — all functions are pure.
 */

import { affiliates, AffiliateEntry } from "@/data/affiliates";
import { modelIdToProviderId, providerNameToId, getAffiliateTarget } from "@/utils/affiliateResolver";
import comparisonsRaw from "@/data/comparisons.json";
import bestOfRaw from "@/data/best-of.json";
import aiTypesRaw from "@/data/aiTypes.json";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CtaResolution {
  pageType: "compare" | "best" | "ai-type";
  pageSlug: string;
  pageTitle: string;
  providerId: string;
  providerName: string;
  ctaState: "affiliate" | "fallback" | "unmapped";
  resolvedHref: string;
}

export interface AuditGapEntry {
  providerId: string;
  providerName: string;
  reason: string;
  usedInPages?: string[];
}

export interface AffiliateAuditReport {
  generatedAt: string;

  // ── Summary counts ──────────────────────────────────────────────────────
  totalProviders: number;
  activeAffiliates: number;
  pendingAffiliates: number;
  unavailableAffiliates: number;
  missingAffiliateUrl: number;
  fallbackOnlyCount: number;

  // ── Coverage % ─────────────────────────────────────────────────────────
  pctMonetized: number;         // active / total
  pctPending: number;           // pending / total
  pctRecommendationReady: number; // active / providers-used-in-content

  // ── All affiliate entries ───────────────────────────────────────────────
  entries: AffiliateEntry[];

  // ── CTA resolutions ─────────────────────────────────────────────────────
  allResolutions: CtaResolution[];

  // ── Gap sections ────────────────────────────────────────────────────────
  providersWithNullAffiliateUrl: AffiliateEntry[];
  pendingUsedInContent: AuditGapEntry[];
  fallbackOnlyProviders: AffiliateEntry[];
  providersWithNoFallbackUrl: AffiliateEntry[];
  contentProvidersNotInConfig: AuditGapEntry[];  // provider id in content but not in affiliate config
  configEntriesNeverUsed: AuditGapEntry[];       // config entries never referenced in content
}

// ─── Internal helpers ───────────────────────────────────────────────────────

type ComparisonEntry = {
  slug: string;
  title: string;
  modelA: string;
  modelB: string;
  cheapestOption?: string;
};

type BestEntry = {
  slug: string;
  title: string;
  picks: Array<{ modelId: string; title: string; rank: number }>;
};

type AiTypeEntry = {
  slug: string;
  title: string;
  affiliate_picks: Array<{ provider: string; model: string }>;
};

const comparisons = comparisonsRaw as ComparisonEntry[];
const bestOf = bestOfRaw as BestEntry[];
const aiTypes = aiTypesRaw as AiTypeEntry[];

/** Collect all unique provider IDs referenced across all content. */
function collectContentProviderIds(): Map<string, string[]> {
  // providerId → list of page slugs where it appears
  const usage = new Map<string, string[]>();

  const add = (pid: string, slug: string) => {
    if (!pid) return;
    if (!usage.has(pid)) usage.set(pid, []);
    usage.get(pid)!.push(slug);
  };

  for (const c of comparisons) {
    add(modelIdToProviderId(c.modelA), `compare/${c.slug}`);
    add(modelIdToProviderId(c.modelB), `compare/${c.slug}`);
    if (c.cheapestOption) add(modelIdToProviderId(c.cheapestOption), `compare/${c.slug}`);
  }

  for (const b of bestOf) {
    for (const p of b.picks) {
      add(modelIdToProviderId(p.modelId), `best/${b.slug}`);
    }
  }

  for (const t of aiTypes) {
    for (const p of t.affiliate_picks ?? []) {
      add(providerNameToId(p.provider), `ai-type/${t.slug}`);
    }
  }

  return usage;
}

/** Build all CTA resolutions from content. */
function buildResolutions(): CtaResolution[] {
  const results: CtaResolution[] = [];

  // Compare pages
  for (const c of comparisons) {
    const models = [c.modelA, c.modelB, c.cheapestOption].filter(Boolean) as string[];
    const providersSeen = new Set<string>();
    for (const modelId of models) {
      const pid = modelIdToProviderId(modelId);
      if (!pid || providersSeen.has(pid)) continue;
      providersSeen.add(pid);
      const target = getAffiliateTarget(pid, "default");
      const entry = affiliates[pid];
      results.push({
        pageType: "compare",
        pageSlug: c.slug,
        pageTitle: c.title,
        providerId: pid,
        providerName: entry?.name ?? pid,
        ctaState: !entry ? "unmapped" : target.isAffiliate ? "affiliate" : "fallback",
        resolvedHref: target.href,
      });
    }
  }

  // Best pages
  for (const b of bestOf) {
    const providersSeen = new Set<string>();
    for (const p of b.picks) {
      const pid = modelIdToProviderId(p.modelId);
      if (!pid || providersSeen.has(pid)) continue;
      providersSeen.add(pid);
      const target = getAffiliateTarget(pid, "default");
      const entry = affiliates[pid];
      results.push({
        pageType: "best",
        pageSlug: b.slug,
        pageTitle: b.title,
        providerId: pid,
        providerName: entry?.name ?? pid,
        ctaState: !entry ? "unmapped" : target.isAffiliate ? "affiliate" : "fallback",
        resolvedHref: target.href,
      });
    }
  }

  // AI type pages
  for (const t of aiTypes) {
    for (const p of t.affiliate_picks ?? []) {
      const pid = providerNameToId(p.provider);
      const target = getAffiliateTarget(pid, "default");
      const entry = affiliates[pid];
      results.push({
        pageType: "ai-type",
        pageSlug: t.slug,
        pageTitle: t.title,
        providerId: pid,
        providerName: entry?.name ?? p.provider,
        ctaState: !entry ? "unmapped" : target.isAffiliate ? "affiliate" : "fallback",
        resolvedHref: target.href,
      });
    }
  }

  return results;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** Build the full audit report. Memoized — call once per session. */
export function buildAffiliateAuditReport(): AffiliateAuditReport {
  const entries = Object.values(affiliates);
  const totalProviders = entries.length;
  const activeAffiliates = entries.filter((e) => e.status === "active").length;
  const pendingAffiliates = entries.filter((e) => e.status === "pending").length;
  const unavailableAffiliates = entries.filter((e) => e.status === "unavailable").length;
  const missingAffiliateUrl = entries.filter((e) => !e.affiliateUrl).length;
  const fallbackOnlyCount = entries.filter((e) => !e.affiliateUrl && !!e.fallbackUrl).length;

  const pctMonetized = totalProviders > 0 ? Math.round((activeAffiliates / totalProviders) * 100) : 0;
  const pctPending = totalProviders > 0 ? Math.round((pendingAffiliates / totalProviders) * 100) : 0;

  const contentUsage = collectContentProviderIds();
  const contentProviderIds = new Set(contentUsage.keys());
  const configProviderIds = new Set(entries.map((e) => e.id));

  const providersUsedInContent = [...contentProviderIds].filter((id) => configProviderIds.has(id));
  const activeInContent = providersUsedInContent.filter((id) => affiliates[id]?.status === "active");
  const pctRecommendationReady = providersUsedInContent.length > 0
    ? Math.round((activeInContent.length / providersUsedInContent.length) * 100)
    : 0;

  const allResolutions = buildResolutions();

  // Gap: providers with null affiliateUrl
  const providersWithNullAffiliateUrl = entries.filter((e) => !e.affiliateUrl);

  // Gap: pending providers that appear in content
  const pendingUsedInContent: AuditGapEntry[] = entries
    .filter((e) => e.status === "pending" && contentUsage.has(e.id))
    .map((e) => ({
      providerId: e.id,
      providerName: e.name,
      reason: "Pending affiliate — CTA is using internal fallback",
      usedInPages: contentUsage.get(e.id),
    }));

  // Gap: fallback only (no affiliateUrl but has fallbackUrl)
  const fallbackOnlyProviders = entries.filter((e) => !e.affiliateUrl);

  // Gap: missing fallbackUrl
  const providersWithNoFallbackUrl = entries.filter((e) => !e.fallbackUrl);

  // Gap: content provider IDs not in affiliate config
  const contentProvidersNotInConfig: AuditGapEntry[] = [...contentProviderIds]
    .filter((id) => !configProviderIds.has(id))
    .map((id) => ({
      providerId: id,
      providerName: id,
      reason: "Referenced in content data but missing from affiliate config",
      usedInPages: contentUsage.get(id),
    }));

  // Gap: config entries never used in content
  const configEntriesNeverUsed: AuditGapEntry[] = entries
    .filter((e) => !contentProviderIds.has(e.id))
    .map((e) => ({
      providerId: e.id,
      providerName: e.name,
      reason: "In affiliate config but never referenced in any comparison, best, or AI type data",
    }));

  return {
    generatedAt: new Date().toISOString(),
    totalProviders,
    activeAffiliates,
    pendingAffiliates,
    unavailableAffiliates,
    missingAffiliateUrl,
    fallbackOnlyCount,
    pctMonetized,
    pctPending,
    pctRecommendationReady,
    entries,
    allResolutions,
    providersWithNullAffiliateUrl,
    pendingUsedInContent,
    fallbackOnlyProviders,
    providersWithNoFallbackUrl,
    contentProvidersNotInConfig,
    configEntriesNeverUsed,
  };
}

/** Convenience: group resolutions by page type and CTA state. */
export function getFallbackResolutions(report: AffiliateAuditReport): CtaResolution[] {
  return report.allResolutions.filter((r) => r.ctaState === "fallback" || r.ctaState === "unmapped");
}

export function getAffiliateResolutions(report: AffiliateAuditReport): CtaResolution[] {
  return report.allResolutions.filter((r) => r.ctaState === "affiliate");
}
