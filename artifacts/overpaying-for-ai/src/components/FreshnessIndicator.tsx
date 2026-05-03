import { freshnessStatus } from "@/utils/pricingFreshness";
import type { FreshnessStatus } from "@/utils/pricingFreshness";

export interface FreshnessIndicatorProps {
  dateStr?: string | null;
  source?: string;
  forceLive?: boolean;
  compact?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<FreshnessStatus, { dot: string; badge: string; label: string }> = {
  live:   { dot: "bg-green-500",  badge: "bg-green-50 text-green-700 border-green-200",   label: "Live"   },
  recent: { dot: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Recent" },
  stale:  { dot: "bg-red-400",    badge: "bg-red-50 text-red-700 border-red-200",          label: "Stale"  },
};

function fmtShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

/**
 * Reusable pricing freshness indicator.
 *
 * compact=false (default): horizontal pill row showing status, verified date, and source.
 * compact=true:            inline dot + badge only — for use inside table cells or badges.
 *
 * forceLive=true: always shows "Live" regardless of date — use for tracker items
 *   that were just fetched today.
 */
export function FreshnessIndicator({
  dateStr,
  source,
  forceLive = false,
  compact = false,
  className = "",
}: FreshnessIndicatorProps) {
  const status: FreshnessStatus = forceLive ? "live" : (dateStr ? freshnessStatus(dateStr) : "stale");
  const cfg = STATUS_CONFIG[status];

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className={`font-medium px-1.5 py-0.5 rounded border ${cfg.badge}`}>
          {cfg.label}
        </span>
        {dateStr && (
          <span className="text-muted-foreground hidden sm:inline">
            · {fmtShortDate(dateStr)}
          </span>
        )}
      </span>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 text-xs text-muted-foreground ${className}`}>
      <span className={`inline-flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-md border ${cfg.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        {cfg.label}
      </span>
      {dateStr && (
        <span>
          Pricing last verified:{" "}
          <span className="font-medium text-foreground">{fmtShortDate(dateStr)}</span>
        </span>
      )}
      {source && (
        <span>
          Source:{" "}
          <span className="font-medium text-foreground">{source}</span>
        </span>
      )}
    </div>
  );
}
