import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminNav } from "@/components/admin/AdminNav";
import { FreshnessIndicator } from "@/components/FreshnessIndicator";
import { trackGaEvent } from "@/utils/ga4";
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
  freshnessTimestamp?: string;
  notes?: string;
}

interface NewsDigest {
  lastChecked: string | null;
  generatedAt: string | null;
  sourceCount: number;
  items: NewsItem[];
}

type ReviewDecision = "approved" | "rejected";

const REVIEW_STORAGE_KEY = "pricing_intel_reviews";
const digest = newsDataRaw as NewsDigest;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadReviews(): Record<string, ReviewDecision> {
  try {
    return JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveReviews(r: Record<string, ReviewDecision>) {
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(r));
}

function itemKey(item: NewsItem) {
  return [item.vendor, item.tool, item.changeType, item.detectedDate, item.sourceUrl].join("|");
}

function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const CONF_STYLES: Record<string, string> = {
  high:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low:    "bg-slate-100 text-slate-500 border-slate-200",
};

const CHANGE_TYPE_LABELS: Record<string, string> = {
  pricing_change:   "Pricing change",
  plan_change:      "Plan change",
  model_launch:     "Model launch",
  free_tier_change: "Free tier",
  enterprise_change:"Enterprise",
  general_news:     "News",
};

const TRUST_LABELS: Record<string, string> = {
  official:          "Official",
  trusted_third_party: "Trusted 3rd party",
  third_party:       "3rd party",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function PricingIntelligenceReviewPage() {
  return (
    <AdminGuard title="Pricing Intelligence Review">
      <ReviewPageInner />
    </AdminGuard>
  );
}

function ReviewPageInner() {
  const [reviews, setReviews] = useState<Record<string, ReviewDecision>>(loadReviews);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    trackGaEvent("pipeline_review_viewed", { item_count: digest.items.length });
  }, []);

  const allItems = digest.items ?? [];
  const pendingCount = allItems.filter((i) => i.requiresReview && !reviews[itemKey(i)]).length;
  const approvedCount = Object.values(reviews).filter((v) => v === "approved").length;
  const rejectedCount = Object.values(reviews).filter((v) => v === "rejected").length;

  const filtered = allItems.filter((item) => {
    const key = itemKey(item);
    const decision = reviews[key];
    if (filter === "pending") return item.requiresReview && !decision;
    if (filter === "approved") return decision === "approved";
    if (filter === "rejected") return decision === "rejected";
    return true;
  });

  function decide(item: NewsItem, decision: ReviewDecision) {
    const key = itemKey(item);
    const updated = { ...reviews, [key]: decision };
    setReviews(updated);
    saveReviews(updated);
    trackGaEvent(decision === "approved" ? "pipeline_review_approved" : "pipeline_review_rejected", {
      vendor: item.vendor,
      tool: item.tool,
      change_type: item.changeType,
      confidence: item.confidence,
    });
  }

  function undecide(item: NewsItem) {
    const key = itemKey(item);
    const updated = { ...reviews };
    delete updated[key];
    setReviews(updated);
    saveReviews(updated);
  }

  function clearAll() {
    setReviews({});
    saveReviews({});
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav title="Pricing Intelligence Review" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Status bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total items", value: allItems.length, color: "text-foreground" },
            { label: "Pending review", value: pendingCount, color: pendingCount > 0 ? "text-amber-600" : "text-emerald-600" },
            { label: "Approved", value: approvedCount, color: "text-emerald-600" },
            { label: "Rejected", value: rejectedCount, color: "text-red-500" },
          ].map((s) => (
            <div key={s.label} className="border border-border rounded-xl p-4 bg-card">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Last run info */}
        <div className="border border-border rounded-xl p-4 bg-blue-50 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-blue-800">
            <span className="font-semibold">Last pipeline run: </span>
            {fmtDate(digest.lastChecked)} · {digest.sourceCount} source{digest.sourceCount !== 1 ? "s" : ""}
          </div>
          <FreshnessIndicator
            forceLive={!!digest.lastChecked}
            dateStr={digest.lastChecked}
            compact
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
          {([
            { key: "pending",  label: `Pending (${pendingCount})` },
            { key: "approved", label: `Approved (${approvedCount})` },
            { key: "rejected", label: `Rejected (${rejectedCount})` },
            { key: "all",      label: `All (${allItems.length})` },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors font-medium ${
                filter === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
          {Object.keys(reviews).length > 0 && (
            <button
              onClick={clearAll}
              className="ml-auto text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-md"
            >
              Clear all decisions
            </button>
          )}
        </div>

        {/* Items */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/30 px-6 py-16 text-center">
            <p className="text-2xl mb-3">✓</p>
            <p className="text-base font-semibold text-foreground mb-1">
              {filter === "pending" ? "No items pending review" : "No items in this category"}
            </p>
            <p className="text-sm text-muted-foreground">
              {allItems.length === 0
                ? "The pipeline has not run yet. Run it to populate this list."
                : filter === "pending"
                  ? "All items requiring review have been processed."
                  : "Switch filters to see other items."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item, i) => {
              const key = itemKey(item);
              const decision = reviews[key];
              return (
                <ReviewCard
                  key={i}
                  item={item}
                  decision={decision}
                  onApprove={() => decide(item, "approved")}
                  onReject={() => decide(item, "rejected")}
                  onUndo={() => undecide(item)}
                />
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-8">
          Review decisions are stored in your browser's local storage and do not modify source data files.
          Use the Intel Control page to reprocess or trigger a new run.
        </p>
      </div>
    </div>
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────

function ReviewCard({
  item,
  decision,
  onApprove,
  onReject,
  onUndo,
}: {
  item: NewsItem;
  decision: ReviewDecision | undefined;
  onApprove: () => void;
  onReject: () => void;
  onUndo: () => void;
}) {
  const confStyle = CONF_STYLES[item.confidence] ?? CONF_STYLES.low;
  const changeLabel = CHANGE_TYPE_LABELS[item.changeType] ?? item.changeType;
  const trustLabel = TRUST_LABELS[item.sourceTrustLevel] ?? item.sourceTrustLevel;

  const cardBorder = decision === "approved"
    ? "border-emerald-300 bg-emerald-50/40"
    : decision === "rejected"
      ? "border-red-200 bg-red-50/30"
      : "border-border bg-white";

  return (
    <div className={`rounded-xl border ${cardBorder} transition-colors`}>
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-semibold text-sm text-foreground">{item.vendor}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs text-muted-foreground">{item.tool}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${confStyle}`}>
                {item.confidence} confidence
              </span>
              <span className="text-xs px-2 py-0.5 rounded border bg-slate-100 text-slate-600 border-slate-200">
                {changeLabel}
              </span>
              <span className="text-xs px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200">
                {trustLabel}
              </span>
              {item.requiresReview && !decision && (
                <span className="text-xs px-2 py-0.5 rounded border bg-yellow-50 text-yellow-700 border-yellow-200">
                  Needs review
                </span>
              )}
            </div>
            <p className="text-sm text-foreground leading-relaxed">{item.summary}</p>
            {item.notes && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.notes}</p>
            )}
          </div>
          <div className="text-right text-xs text-muted-foreground shrink-0">
            <p>Detected: {fmtDate(item.detectedDate)}</p>
            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline inline-block mt-1"
              >
                View source →
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-border/60">
          {decision ? (
            <>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded ${
                decision === "approved"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-600"
              }`}>
                {decision === "approved" ? "✓ Approved" : "✕ Rejected"}
              </span>
              <button
                onClick={onUndo}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Undo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onApprove}
                className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={onReject}
                className="text-xs font-semibold bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors"
              >
                Reject
              </button>
              <span className="text-xs text-muted-foreground ml-auto">
                Not yet reviewed
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
