import { useState, useMemo } from "react";
import { affiliates } from "@/data/affiliates";
import type { AffiliateEntry } from "@/data/affiliates";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminNav } from "@/components/admin/AdminNav";
import { buildAffiliateAuditReport } from "@/utils/affiliateAudit";

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AffiliateEntry["status"] }) {
  const styles = {
    active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    unavailable: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
}

function UsedBadge({ used }: { used: boolean }) {
  if (used) return <span className="text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">Used in content</span>;
  return <span className="text-xs text-muted-foreground px-2 py-0.5 rounded border border-border">Unused</span>;
}

function AffiliateBadge({ has }: { has: boolean }) {
  if (has) return <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">✓ Link set</span>;
  return <span className="text-xs font-medium text-amber-600 dark:text-amber-400">⚠ Missing URL</span>;
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{children}</span>;
}

function UrlLink({ url, label }: { url: string | null | undefined; label?: string }) {
  if (!url) return <span className="text-muted-foreground text-xs">—</span>;
  const isExternal = url.startsWith("http");
  if (isExternal) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-xs block">
        {label ?? url}
      </a>
    );
  }
  return <span className="text-xs text-muted-foreground truncate max-w-xs block">{label ?? url}</span>;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

type StatusFilter = "all" | "active" | "pending" | "unavailable";

function AffiliatesAdminContent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [missingOnly, setMissingOnly] = useState(false);
  const [copiedList, setCopiedList] = useState(false);

  const report = useMemo(() => buildAffiliateAuditReport(), []);

  const entries = useMemo(() => {
    return Object.values(affiliates).filter((e) => {
      const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      const matchesMissing = !missingOnly || !e.affiliateUrl;
      return matchesSearch && matchesStatus && matchesMissing;
    });
  }, [search, statusFilter, missingOnly]);

  const usedProviderIds = useMemo(() => {
    return new Set(report.allResolutions.map((r) => r.providerId));
  }, [report]);

  const handleCopyMissingList = () => {
    const missing = Object.values(affiliates)
      .filter((e) => !e.affiliateUrl)
      .map((e) => `${e.name} (${e.id}): ${e.directUrl ?? "no direct URL"}`)
      .join("\n");
    navigator.clipboard.writeText(missing);
    setCopiedList(true);
    setTimeout(() => setCopiedList(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminNav title="Affiliate Management" />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total providers", value: report.totalProviders },
            { label: "Active affiliates", value: report.activeAffiliates, green: report.activeAffiliates > 0 },
            { label: "Pending", value: report.pendingAffiliates, warn: report.pendingAffiliates > 0 },
            { label: "Missing affiliate URL", value: report.missingAffiliateUrl, warn: report.missingAffiliateUrl > 0 },
          ].map((s) => (
            <div key={s.label} className="border border-border rounded-lg p-3 bg-card">
              <p className={`text-2xl font-bold ${s.green ? "text-emerald-600" : s.warn ? "text-amber-600" : "text-foreground"}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Read-only notice */}
        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 rounded-lg px-4 py-3 text-xs text-blue-800 dark:text-blue-200 mb-6">
          <strong>Read-only view.</strong> To update an affiliate URL or status, edit{" "}
          <Mono>src/data/affiliates.ts</Mono> — set{" "}
          <Mono>affiliateUrl</Mono> to the tracking URL and change{" "}
          <Mono>status</Mono> to <Mono>"active"</Mono>. All pages update automatically.
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search provider…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-44"
          />
          <div className="flex gap-1">
            {(["all", "active", "pending", "unavailable"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  statusFilter === s
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={missingOnly}
              onChange={(e) => setMissingOnly(e.target.checked)}
              className="rounded"
            />
            Missing affiliate URL only
          </label>
          <button
            onClick={handleCopyMissingList}
            className="ml-auto text-xs px-3 py-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            {copiedList ? "✓ Copied!" : "Copy missing-provider list"}
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">Showing {entries.length} of {Object.keys(affiliates).length} providers</p>

        {/* Provider table */}
        <div className="space-y-3">
          {entries.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No providers match your filters.</p>
          )}
          {entries.map((entry) => {
            const isUsedInContent = usedProviderIds.has(entry.id);
            return (
              <div
                key={entry.id}
                className={`border rounded-xl p-4 bg-card transition-colors ${
                  !entry.affiliateUrl
                    ? "border-amber-200 dark:border-amber-800"
                    : "border-border"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-foreground text-sm">{entry.name}</span>
                      <Mono>{entry.id}</Mono>
                      <StatusBadge status={entry.status} />
                      <UsedBadge used={isUsedInContent} />
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground">{entry.notes}</p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.updatedAt ? `Updated ${entry.updatedAt}` : "No update date"}
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-0.5 font-medium">Affiliate URL</p>
                    <AffiliateBadge has={!!entry.affiliateUrl} />
                    {entry.affiliateUrl && <UrlLink url={entry.affiliateUrl} />}
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5 font-medium">Fallback URL</p>
                    <UrlLink url={entry.fallbackUrl} />
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5 font-medium">Direct URL</p>
                    <UrlLink url={entry.directUrl} />
                  </div>
                </div>

                {(entry.ctaLabelPrimary || entry.ctaLabelSecondary) && (
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    {entry.ctaLabelPrimary && <span>Primary CTA: <em>"{entry.ctaLabelPrimary}"</em></span>}
                    {entry.ctaLabelSecondary && <span>Secondary CTA: <em>"{entry.ctaLabelSecondary}"</em></span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Priority pending table */}
        {report.pendingUsedInContent.length > 0 && (
          <div className="mt-10">
            <h2 className="text-base font-bold mb-3">Priority Pending Providers</h2>
            <p className="text-xs text-muted-foreground mb-4">These providers are pending but actively referenced in content — activating them would improve monetisation coverage immediately.</p>
            <div className="space-y-2">
              {report.pendingUsedInContent.map((gap) => (
                <div key={gap.providerId} className="border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-medium text-sm text-foreground">{gap.providerName}</span>
                    <span className="text-xs text-muted-foreground ml-2">({gap.providerId})</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Used on: {gap.usedInPages?.slice(0, 4).join(", ")}{(gap.usedInPages?.length ?? 0) > 4 ? ` +${gap.usedInPages!.length - 4} more` : ""}
                    </p>
                  </div>
                  <StatusBadge status="pending" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AffiliatesAdminPage() {
  return (
    <AdminGuard title="Affiliate Management">
      <AffiliatesAdminContent />
    </AdminGuard>
  );
}
