import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { PageSeo } from "@/components/seo/PageSeo";
import { trackGaEvent } from "@/utils/ga4";
import { trackOutboundClick } from "@/utils/analytics";
import historyDataRaw from "@/data/pricing-history.json";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HistoryEntry {
  vendor: string;
  tool: string;
  changeType: string;
  summary: string;
  confidence: "high" | "medium" | "low";
  requiresReview: boolean;
  sourceUrl: string;
  sourceTrustLevel: string;
  detectedDate: string;
  notes?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const allEntries = (historyDataRaw as HistoryEntry[]).slice().reverse();

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CHANGE_TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "pricing_change", label: "Pricing change" },
  { value: "plan_change", label: "Plan change" },
  { value: "model_launch", label: "Model launch" },
  { value: "free_tier_change", label: "Free tier" },
  { value: "enterprise_change", label: "Enterprise" },
  { value: "general_news", label: "News" },
];

const CHANGE_TYPE_LABELS: Record<string, string> = {
  pricing_change: "Pricing change",
  plan_change: "Plan change",
  model_launch: "Model launch",
  free_tier_change: "Free tier",
  enterprise_change: "Enterprise",
  general_news: "News",
};

const CHANGE_TYPE_COLORS: Record<string, string> = {
  pricing_change: "bg-red-100 text-red-700",
  plan_change: "bg-orange-100 text-orange-700",
  model_launch: "bg-blue-100 text-blue-700",
  free_tier_change: "bg-green-100 text-green-700",
  enterprise_change: "bg-purple-100 text-purple-700",
  general_news: "bg-slate-100 text-slate-600",
};

const CONFIDENCE_STYLES: Record<string, string> = {
  high: "text-emerald-700",
  medium: "text-amber-600",
  low: "text-slate-500",
};

function fmtDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getUniqueVendors(entries: HistoryEntry[]) {
  const vendors = new Set(entries.map((e) => e.vendor));
  return ["", ...Array.from(vendors).sort()];
}

function getDateRange(entries: HistoryEntry[]) {
  if (entries.length === 0) return { min: "", max: "" };
  const dates = entries.map((e) => e.detectedDate).filter(Boolean).sort();
  return { min: dates[0], max: dates[dates.length - 1] };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PricingHistoryPage() {
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { min: minDate, max: maxDate } = getDateRange(allEntries);
  const vendors = getUniqueVendors(allEntries);

  useEffect(() => {
    trackGaEvent("pricing_tracker_view", {
      page: "pricing_history",
      total_entries: allEntries.length,
    });
  }, []);

  function handleFilterChange(newValues: {
    vendor?: string;
    type?: string;
    from?: string;
    to?: string;
  }) {
    trackGaEvent("pricing_history_filter_change", {
      vendor: newValues.vendor ?? selectedVendor,
      change_type: newValues.type ?? selectedType,
      date_from: newValues.from ?? dateFrom,
      date_to: newValues.to ?? dateTo,
    });
    if (newValues.vendor !== undefined) setSelectedVendor(newValues.vendor);
    if (newValues.type !== undefined) setSelectedType(newValues.type);
    if (newValues.from !== undefined) setDateFrom(newValues.from);
    if (newValues.to !== undefined) setDateTo(newValues.to);
  }

  const filtered = useMemo(() => {
    return allEntries.filter((e) => {
      if (selectedVendor && e.vendor !== selectedVendor) return false;
      if (selectedType && e.changeType !== selectedType) return false;
      if (dateFrom && e.detectedDate < dateFrom) return false;
      if (dateTo && e.detectedDate > dateTo) return false;
      return true;
    });
  }, [selectedVendor, selectedType, dateFrom, dateTo]);

  // Simple trend: count by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of filtered) {
      counts[e.changeType] = (counts[e.changeType] ?? 0) + 1;
    }
    return counts;
  }, [filtered]);

  const maxCount = Math.max(...Object.values(typeCounts), 1);

  return (
    <div className="bg-white">
      <PageSeo
        title="AI Pricing History | Source-Backed Change Log | OverpayingForAI"
        description="Full historical log of AI pricing, plan, and model changes. Every entry is source-backed with a confidence rating and original source URL."
        canonicalUrl="/pricing-history"
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-slate-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
            Pricing Intelligence
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            AI Pricing History
          </h1>
          <p className="text-white/60 text-sm max-w-xl leading-relaxed">
            A complete, append-only log of detected AI pricing and plan changes.
            Every entry includes its original source URL and a confidence rating.
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-white/50">
            <span>{allEntries.length} total entries</span>
            {minDate && <span>From {fmtDate(minDate)}</span>}
            {maxDate && <span>to {fmtDate(maxDate)}</span>}
          </div>
        </div>
      </section>

      {/* ── Trust note ───────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-blue-50 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-start gap-3 text-sm text-blue-800">
            <span className="mt-0.5 flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-blue-500">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <p className="leading-relaxed">
              <span className="font-semibold">Source transparency: </span>
              Official pricing pages and vendor documentation are prioritised. Third-party or
              ambiguous reports are marked for review before being treated as verified.
            </p>
          </div>
        </div>
      </section>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-muted/20 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-1">
              Filter:
            </span>

            {/* Vendor */}
            <select
              value={selectedVendor}
              onChange={(e) => handleFilterChange({ vendor: e.target.value })}
              className="text-sm border border-border rounded px-3 py-1.5 bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {vendors.map((v) => (
                <option key={v} value={v}>{v || "All vendors"}</option>
              ))}
            </select>

            {/* Change type */}
            <select
              value={selectedType}
              onChange={(e) => handleFilterChange({ type: e.target.value })}
              className="text-sm border border-border rounded px-3 py-1.5 bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {CHANGE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Date from */}
            <input
              type="date"
              value={dateFrom}
              min={minDate}
              max={dateTo || maxDate}
              onChange={(e) => handleFilterChange({ from: e.target.value })}
              className="text-sm border border-border rounded px-3 py-1.5 bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || minDate}
              max={maxDate}
              onChange={(e) => handleFilterChange({ to: e.target.value })}
              className="text-sm border border-border rounded px-3 py-1.5 bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />

            {/* Clear */}
            {(selectedVendor || selectedType || dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setSelectedVendor("");
                  setSelectedType("");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Clear filters
              </button>
            )}

            <span className="ml-auto text-xs text-muted-foreground">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* ── Trend bars ───────────────────────────────────────────────────── */}
      {filtered.length > 0 && Object.keys(typeCounts).length > 0 && (
        <section className="border-b border-border bg-white py-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Change type distribution
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {CHANGE_TYPE_OPTIONS.filter((o) => o.value).map((opt) => {
                const count = typeCounts[opt.value] ?? 0;
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={opt.value} className="flex flex-col gap-1">
                    <div className="flex items-end gap-1 h-12">
                      <div
                        className={`w-full rounded-t transition-all ${CHANGE_TYPE_COLORS[opt.value] ?? "bg-slate-100"}`}
                        style={{ height: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground leading-tight">{opt.label}</p>
                    <p className="text-sm font-semibold text-foreground">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/30 px-6 py-12 text-center">
              <p className="text-2xl mb-3">📭</p>
              <p className="text-base font-semibold text-foreground mb-2">No entries match your filters</p>
              <p className="text-sm text-muted-foreground">
                {allEntries.length === 0
                  ? "The history log is empty. Data will appear after the first pipeline run."
                  : "Try adjusting your filters to see more results."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Vendor / Tool</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Summary</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Confidence</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Review</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Detected</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filtered.map((entry, i) => (
                    <HistoryRow key={i} entry={entry} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-muted/20 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              See the latest detected changes
            </p>
            <p className="text-xs text-muted-foreground">
              The tracker shows the 10 most recent items from today's pipeline run.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/insights/ai-pricing-tracker"
              className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-foreground/80 transition-colors"
            >
              Today's tracker →
            </Link>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-foreground font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Open calculator
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Row sub-component ────────────────────────────────────────────────────────

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const changeLabel = CHANGE_TYPE_LABELS[entry.changeType] ?? entry.changeType;
  const changeColor = CHANGE_TYPE_COLORS[entry.changeType] ?? "bg-slate-100 text-slate-600";
  const confColor = CONFIDENCE_STYLES[entry.confidence] ?? "text-slate-500";

  function handleSourceClick() {
    trackGaEvent("pricing_source_click", {
      vendor: entry.vendor,
      tool: entry.tool,
      change_type: entry.changeType,
      source_url: entry.sourceUrl,
      page: "pricing_history",
    });
    trackOutboundClick({
      url: entry.sourceUrl,
      sourceComponent: "PricingHistoryPage",
      linkLabel: `${entry.vendor} — ${entry.tool}`,
      pageType: "pricing_history",
    });
  }

  return (
    <tr className="hover:bg-muted/20 transition-colors align-top">
      <td className="px-4 py-3">
        <p className="font-semibold text-foreground text-xs whitespace-nowrap">{entry.vendor}</p>
        <p className="text-xs text-muted-foreground">{entry.tool}</p>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap ${changeColor}`}>
          {changeLabel}
        </span>
      </td>
      <td className="px-4 py-3 max-w-xs">
        <p className="text-xs text-foreground leading-relaxed">{entry.summary}</p>
        {entry.notes && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{entry.notes}</p>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`text-xs font-medium capitalize ${confColor}`}>
          {entry.confidence}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        {entry.requiresReview ? (
          <span className="text-xs text-amber-600 font-medium">Yes</span>
        ) : (
          <span className="text-xs text-emerald-600 font-medium">No</span>
        )}
      </td>
      <td className="px-4 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">
        {fmtDate(entry.detectedDate)}
      </td>
      <td className="px-4 py-3 text-right">
        {entry.sourceUrl ? (
          <a
            href={entry.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={handleSourceClick}
            className="text-xs text-primary font-medium hover:underline whitespace-nowrap"
          >
            Source →
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}
