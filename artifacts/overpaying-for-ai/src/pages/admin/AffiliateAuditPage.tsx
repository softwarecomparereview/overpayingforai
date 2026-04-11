import { useMemo, useState } from "react";
import { buildAffiliateAuditReport, getFallbackResolutions, getAffiliateResolutions } from "@/utils/affiliateAudit";
import type { CtaResolution } from "@/utils/affiliateAudit";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminNav } from "@/components/admin/AdminNav";

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  variant = "neutral",
}: {
  label: string;
  value: string | number;
  sub?: string;
  variant?: "neutral" | "good" | "warn" | "bad";
}) {
  const valueStyle = {
    neutral: "text-foreground",
    good: "text-emerald-600 dark:text-emerald-400",
    warn: "text-amber-600 dark:text-amber-400",
    bad: "text-red-600 dark:text-red-400",
  }[variant];

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <p className={`text-2xl font-bold ${valueStyle}`}>{value}</p>
      <p className="text-xs font-medium text-foreground mt-0.5">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, count, description }: { title: string; count?: number; description?: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        {count !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${count === 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"}`}>
            {count === 0 ? "✓ Clear" : count}
          </span>
        )}
      </div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}

function GapRow({ providerId, providerName, reason, usedInPages }: {
  providerId: string;
  providerName: string;
  reason: string;
  usedInPages?: string[];
}) {
  return (
    <div className="border border-border rounded-lg px-4 py-3 bg-card">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className="font-medium text-sm text-foreground">{providerName}</span>
        <span className="font-mono text-xs text-muted-foreground bg-muted px-1 rounded">{providerId}</span>
      </div>
      <p className="text-xs text-muted-foreground">{reason}</p>
      {usedInPages && usedInPages.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          Pages: {usedInPages.slice(0, 5).join(" · ")}{usedInPages.length > 5 ? ` +${usedInPages.length - 5} more` : ""}
        </p>
      )}
    </div>
  );
}

function CtaStateChip({ state }: { state: CtaResolution["ctaState"] }) {
  if (state === "affiliate") return <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded">Affiliate</span>;
  if (state === "fallback") return <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">Fallback</span>;
  return <span className="text-xs font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">Unmapped</span>;
}

function PageTypeBadge({ type }: { type: CtaResolution["pageType"] }) {
  const map = {
    "compare": "Compare",
    "best": "Best",
    "ai-type": "AI Type",
  };
  return <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{map[type]}</span>;
}

// ─── Fallback Report Table ───────────────────────────────────────────────────

type SortKey = "page" | "provider" | "state";

function FallbackReportTable({ resolutions }: { resolutions: CtaResolution[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("state");
  const [filterState, setFilterState] = useState<"all" | "fallback" | "affiliate" | "unmapped">("all");
  const [filterType, setFilterType] = useState<"all" | CtaResolution["pageType"]>("all");

  const filtered = useMemo(() => {
    return resolutions
      .filter((r) => filterState === "all" || r.ctaState === filterState)
      .filter((r) => filterType === "all" || r.pageType === filterType)
      .sort((a, b) => {
        if (sortKey === "page") return a.pageSlug.localeCompare(b.pageSlug);
        if (sortKey === "provider") return a.providerId.localeCompare(b.providerId);
        // Sort by state: unmapped first, then fallback, then affiliate
        const order = { unmapped: 0, fallback: 1, affiliate: 2 };
        return order[a.ctaState] - order[b.ctaState];
      });
  }, [resolutions, sortKey, filterState, filterType]);

  const [copiedJson, setCopiedJson] = useState(false);

  const handleExportJson = () => {
    const data = filtered.map((r) => ({
      pageType: r.pageType,
      pageSlug: r.pageSlug,
      providerId: r.providerId,
      ctaState: r.ctaState,
      resolvedHref: r.resolvedHref,
    }));
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1">
          {(["all", "fallback", "affiliate", "unmapped"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterState(s)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                filterState === s ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["all", "compare", "best", "ai-type"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                filterType === t ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "All types" : t}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto items-center">
          <span className="text-xs text-muted-foreground">Sort:</span>
          {(["state", "page", "provider"] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={`text-xs px-2 py-1 rounded border transition-colors ${
                sortKey === k ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {k}
            </button>
          ))}
          <button
            onClick={handleExportJson}
            className="text-xs px-2.5 py-1 border border-border rounded-lg text-muted-foreground hover:text-foreground ml-2"
          >
            {copiedJson ? "✓ Copied JSON" : "Export JSON"}
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{filtered.length} rows</p>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/60">
            <tr>
              <th className="text-left px-3 py-2 font-semibold text-foreground">Page</th>
              <th className="text-left px-3 py-2 font-semibold text-foreground">Type</th>
              <th className="text-left px-3 py-2 font-semibold text-foreground">Provider</th>
              <th className="text-left px-3 py-2 font-semibold text-foreground">CTA State</th>
              <th className="text-left px-3 py-2 font-semibold text-foreground hidden sm:table-cell">Resolved URL</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">No rows match.</td></tr>
            )}
            {filtered.map((r, i) => (
              <tr key={`${r.pageSlug}-${r.providerId}-${i}`} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2 font-medium text-foreground max-w-[200px] truncate" title={r.pageSlug}>{r.pageSlug}</td>
                <td className="px-3 py-2"><PageTypeBadge type={r.pageType} /></td>
                <td className="px-3 py-2 text-muted-foreground">{r.providerName}</td>
                <td className="px-3 py-2"><CtaStateChip state={r.ctaState} /></td>
                <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate hidden sm:table-cell" title={r.resolvedHref}>{r.resolvedHref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function AffiliateAuditContent() {
  const report = useMemo(() => buildAffiliateAuditReport(), []);

  const fallbackResolutions = getFallbackResolutions(report);
  const affiliateResolutions = getAffiliateResolutions(report);

  const totalResolutions = report.allResolutions.length;
  const pctAffiliate = totalResolutions > 0 ? Math.round((affiliateResolutions.length / totalResolutions) * 100) : 0;
  const pctFallback = totalResolutions > 0 ? Math.round((fallbackResolutions.length / totalResolutions) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNav title="Affiliate Audit Dashboard" />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">

        {/* Summary metrics */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Provider Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="Total providers" value={report.totalProviders} />
            <MetricCard label="Active affiliates" value={report.activeAffiliates} variant={report.activeAffiliates > 0 ? "good" : "warn"} />
            <MetricCard label="Pending" value={report.pendingAffiliates} variant={report.pendingAffiliates > 0 ? "warn" : "good"} />
            <MetricCard label="Unavailable" value={report.unavailableAffiliates} variant={report.unavailableAffiliates > 0 ? "bad" : "good"} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <MetricCard label="Missing affiliate URL" value={report.missingAffiliateUrl} variant={report.missingAffiliateUrl > 0 ? "warn" : "good"} />
            <MetricCard label="Fallback-only providers" value={report.fallbackOnlyCount} variant={report.fallbackOnlyCount > 0 ? "warn" : "good"} />
            <MetricCard label="Missing fallback URL" value={report.providersWithNoFallbackUrl.length} variant={report.providersWithNoFallbackUrl.length > 0 ? "bad" : "good"} />
            <MetricCard label="Config entries unused" value={report.configEntriesNeverUsed.length} variant={report.configEntriesNeverUsed.length > 0 ? "neutral" : "good"} />
          </div>
        </section>

        {/* Coverage % */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Coverage Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MetricCard
              label="Providers monetized"
              value={`${report.pctMonetized}%`}
              sub={`${report.activeAffiliates} / ${report.totalProviders} active`}
              variant={report.pctMonetized >= 50 ? "good" : report.pctMonetized > 0 ? "warn" : "bad"}
            />
            <MetricCard
              label="Recommendation-ready"
              value={`${report.pctRecommendationReady}%`}
              sub="Content providers with active affiliate"
              variant={report.pctRecommendationReady >= 50 ? "good" : "warn"}
            />
            <MetricCard
              label="CTA resolutions: affiliate"
              value={`${pctAffiliate}%`}
              sub={`${affiliateResolutions.length} affiliate, ${fallbackResolutions.length} fallback across ${totalResolutions} CTAs`}
              variant={pctAffiliate >= 50 ? "good" : "warn"}
            />
          </div>

          {/* Progress bars */}
          <div className="mt-4 space-y-2">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Affiliate CTAs</span><span>{pctAffiliate}%</span>
              </div>
              <div className="h-2 rounded bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500 rounded transition-all" style={{ width: `${pctAffiliate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Fallback CTAs</span><span>{pctFallback}%</span>
              </div>
              <div className="h-2 rounded bg-muted overflow-hidden">
                <div className="h-full bg-amber-400 rounded transition-all" style={{ width: `${pctFallback}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* Gap: null affiliateUrl */}
        <section>
          <SectionHeader
            title="Providers Missing Affiliate URL"
            count={report.providersWithNullAffiliateUrl.length}
            description="These providers have no affiliate URL — all CTAs resolve to the internal fallback."
          />
          <div className="space-y-2">
            {report.providersWithNullAffiliateUrl.length === 0 && (
              <p className="text-sm text-emerald-600">All providers have affiliate URLs set.</p>
            )}
            {report.providersWithNullAffiliateUrl.map((e) => (
              <GapRow
                key={e.id}
                providerId={e.id}
                providerName={e.name}
                reason={e.notes ?? `Status: ${e.status}. Affiliate URL is null.`}
              />
            ))}
          </div>
        </section>

        {/* Gap: pending used in content */}
        <section>
          <SectionHeader
            title="Pending Providers Used in Content"
            count={report.pendingUsedInContent.length}
            description="High priority: activating these would immediately monetise existing CTAs."
          />
          <div className="space-y-2">
            {report.pendingUsedInContent.length === 0 && (
              <p className="text-sm text-emerald-600">No pending providers are currently referenced in content.</p>
            )}
            {report.pendingUsedInContent.map((gap) => (
              <GapRow key={gap.providerId} {...gap} />
            ))}
          </div>
        </section>

        {/* Gap: missing fallback */}
        <section>
          <SectionHeader
            title="Providers Missing Fallback URL"
            count={report.providersWithNoFallbackUrl.length}
            description="These providers have no fallback — if activated as affiliate later, secondary CTAs have nowhere to point."
          />
          <div className="space-y-2">
            {report.providersWithNoFallbackUrl.length === 0 && (
              <p className="text-sm text-emerald-600">All providers have a fallback URL.</p>
            )}
            {report.providersWithNoFallbackUrl.map((e) => (
              <GapRow key={e.id} providerId={e.id} providerName={e.name} reason="No fallbackUrl set in affiliate config." />
            ))}
          </div>
        </section>

        {/* Gap: content providers not in config */}
        <section>
          <SectionHeader
            title="Content References Without Affiliate Mapping"
            count={report.contentProvidersNotInConfig.length}
            description="Provider IDs found in comparison/best/AI type data but not registered in the affiliate config. These are untraceable — no CTA can be monetised."
          />
          <div className="space-y-2">
            {report.contentProvidersNotInConfig.length === 0 && (
              <p className="text-sm text-emerald-600">All content provider references are mapped in the affiliate config.</p>
            )}
            {report.contentProvidersNotInConfig.map((gap) => (
              <GapRow key={gap.providerId} {...gap} />
            ))}
          </div>
        </section>

        {/* Gap: config entries never used */}
        <section>
          <SectionHeader
            title="Affiliate Config Entries Never Referenced in Content"
            count={report.configEntriesNeverUsed.length}
            description="These providers are registered but never appear in any compare, best, or AI type data. Low priority unless content is planned."
          />
          <div className="space-y-2">
            {report.configEntriesNeverUsed.length === 0 && (
              <p className="text-sm text-emerald-600">All config entries are referenced in content.</p>
            )}
            {report.configEntriesNeverUsed.map((gap) => (
              <GapRow key={gap.providerId} {...gap} />
            ))}
          </div>
        </section>

        {/* Fallback CTA usage report */}
        <section>
          <SectionHeader
            title="CTA Resolution Report — All Pages"
            description="Full table of all CTA resolutions across every compare, best, and AI type page. Filter by state or page type to focus on gaps."
          />
          <FallbackReportTable resolutions={report.allResolutions} />
        </section>

      </div>
    </div>
  );
}

export function AffiliateAuditPage() {
  return (
    <AdminGuard title="Affiliate Audit Dashboard">
      <AffiliateAuditContent />
    </AdminGuard>
  );
}
