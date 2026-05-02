import { useEffect } from "react";
import { Link } from "wouter";
import { PageSeo } from "@/components/seo/PageSeo";
import { trackGaEvent } from "@/utils/ga4";
import { trackOutboundClick } from "@/utils/analytics";
import newsDataRaw from "@/data/ai-pricing-news.json";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsItem {
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

interface NewsDigest {
  lastChecked: string | null;
  generatedAt: string | null;
  sourceCount: number;
  items: NewsItem[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const digest = newsDataRaw as NewsDigest;
const LATEST_ITEMS = (digest.items ?? []).slice(0, 10);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CHANGE_TYPE_LABELS: Record<string, string> = {
  pricing_change: "Pricing change",
  plan_change: "Plan change",
  model_launch: "Model launch",
  free_tier_change: "Free tier",
  enterprise_change: "Enterprise",
  general_news: "News",
};

const CHANGE_TYPE_COLORS: Record<string, string> = {
  pricing_change: "bg-red-100 text-red-700 border-red-200",
  plan_change: "bg-orange-100 text-orange-700 border-orange-200",
  model_launch: "bg-blue-100 text-blue-700 border-blue-200",
  free_tier_change: "bg-green-100 text-green-700 border-green-200",
  enterprise_change: "bg-purple-100 text-purple-700 border-purple-200",
  general_news: "bg-slate-100 text-slate-600 border-slate-200",
};

const CONFIDENCE_STYLES: Record<string, { badge: string; label: string }> = {
  high: { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "High confidence" },
  medium: { badge: "bg-amber-100 text-amber-700 border-amber-200", label: "Medium confidence" },
  low: { badge: "bg-slate-100 text-slate-500 border-slate-200", label: "Low confidence" },
};

function fmtDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AiPricingTrackerPage() {
  useEffect(() => {
    trackGaEvent("pricing_tracker_view", {
      item_count: LATEST_ITEMS.length,
      last_checked: digest.lastChecked ?? "never",
    });
  }, []);

  return (
    <div className="bg-white">
      <PageSeo
        title="AI Pricing Tracker | Daily Intelligence | OverpayingForAI"
        description="Daily AI pricing and plan change tracker. Source-backed changes from official vendor pages, confidence-rated and marked for review. See what changed today."
        canonicalUrl="/insights/ai-pricing-tracker"
      />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-slate-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
                Pricing Intelligence
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                AI Pricing Tracker
              </h1>
              <p className="text-white/60 text-sm max-w-xl leading-relaxed">
                Daily monitoring of official pricing pages and vendor documentation.
                Third-party or ambiguous reports are marked for review before being treated as verified.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm min-w-[220px]">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">
                Last checked
              </p>
              <p className="text-white font-semibold text-lg">
                {fmtDate(digest.lastChecked)}
              </p>
              {digest.generatedAt && (
                <p className="text-white/40 text-xs mt-1">
                  {new Date(digest.generatedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZoneName: "short",
                  })}
                </p>
              )}
              <p className="text-white/40 text-xs mt-3">
                {digest.sourceCount} source{digest.sourceCount !== 1 ? "s" : ""} monitored
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust language ─────────────────────────────────────────────────── */}
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

      {/* ── Changes list ───────────────────────────────────────────────────── */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              Latest changes
              {LATEST_ITEMS.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                  {LATEST_ITEMS.length} of {digest.items.length}
                </span>
              )}
            </h2>
            <Link
              href="/pricing-history"
              className="text-sm text-primary font-medium hover:underline"
            >
              View full history →
            </Link>
          </div>

          {LATEST_ITEMS.length === 0 ? (
            <EmptyState lastChecked={digest.lastChecked} />
          ) : (
            <div className="space-y-4">
              {LATEST_ITEMS.map((item, i) => (
                <TrackerCard key={i} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer CTA ─────────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-muted/20 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">
              Want to compare AI costs right now?
            </p>
            <p className="text-xs text-muted-foreground max-w-md">
              Use the calculator to see exactly what you'd pay across providers for your usage.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-foreground/80 transition-colors"
            >
              Open calculator →
            </Link>
            <Link
              href="/pricing-history"
              className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-foreground font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Pricing history
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({ lastChecked }: { lastChecked: string | null }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-6 py-12 text-center">
      <p className="text-2xl mb-3">📡</p>
      <p className="text-base font-semibold text-foreground mb-2">
        No changes detected yet
      </p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {lastChecked
          ? `The pipeline last ran on ${fmtDate(lastChecked)} and found no notable pricing or plan changes.`
          : "The daily pipeline has not run yet. Check back after the first scheduled run."}
      </p>
    </div>
  );
}

function TrackerCard({ item }: { item: NewsItem }) {
  const changeLabel = CHANGE_TYPE_LABELS[item.changeType] ?? item.changeType;
  const changeColor = CHANGE_TYPE_COLORS[item.changeType] ?? CHANGE_TYPE_COLORS.general_news;
  const conf = CONFIDENCE_STYLES[item.confidence] ?? CONFIDENCE_STYLES.low;
  const [expanded, setExpanded] = useState(false);

  function handleSourceClick() {
    trackGaEvent("pricing_source_click", {
      vendor: item.vendor,
      tool: item.tool,
      change_type: item.changeType,
      source_url: item.sourceUrl,
    });
    trackOutboundClick({
      url: item.sourceUrl,
      sourceComponent: "AiPricingTrackerPage",
      linkLabel: `${item.vendor} — ${item.tool}`,
      pageType: "pricing_tracker",
    });
  }

  function handleExpand() {
    if (!expanded) {
      trackGaEvent("pricing_change_detail_expand", {
        vendor: item.vendor,
        tool: item.tool,
        change_type: item.changeType,
      });
    }
    setExpanded((v) => !v);
  }

  return (
    <div className="rounded-xl border border-border bg-white hover:border-border/80 transition-colors">
      <div className="px-5 py-4">
        {/* Top row */}
        <div className="flex items-start gap-3 flex-wrap mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-foreground text-sm">{item.vendor}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-muted-foreground text-xs">{item.tool}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border ${changeColor}`}>
                {changeLabel}
              </span>
              <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border ${conf.badge}`}>
                {conf.label}
              </span>
              {item.requiresReview && (
                <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border bg-yellow-50 text-yellow-700 border-yellow-200">
                  Needs review
                </span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-muted-foreground">Detected</p>
            <p className="text-xs font-medium text-foreground">{fmtDate(item.detectedDate)}</p>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-foreground leading-relaxed mb-3">{item.summary}</p>

        {/* Bottom row */}
        <div className="flex items-center gap-3 flex-wrap">
          {item.sourceUrl && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              onClick={handleSourceClick}
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              View source
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 8.5l7-7M8.5 8.5V1.5H1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
          <span className="text-xs text-muted-foreground capitalize">
            {item.sourceTrustLevel === "official" ? "📋 Official source" : "🔗 Third-party source"}
          </span>
          {item.notes && (
            <button
              onClick={handleExpand}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
            >
              {expanded ? "Hide notes ↑" : "Show notes ↓"}
            </button>
          )}
        </div>

        {/* Expanded notes */}
        {expanded && item.notes && (
          <div className="mt-3 pt-3 border-t border-border/60">
            <p className="text-xs text-muted-foreground leading-relaxed">{item.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// useState is needed for the expand feature
import { useState } from "react";
