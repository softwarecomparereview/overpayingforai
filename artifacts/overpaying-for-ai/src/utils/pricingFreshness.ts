export type FreshnessStatus = "live" | "recent" | "stale";

export function getDaysSinceUpdate(dateStr: string): number {
  const updated = new Date(dateStr);
  const now = new Date();
  const ms = now.getTime() - updated.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Freshness thresholds:
 *  ≤ 3 days  → live   (green)
 *  ≤ 14 days → recent (yellow)
 *  > 14 days → stale  (red)
 */
export function freshnessStatus(dateStr: string): FreshnessStatus {
  const days = getDaysSinceUpdate(dateStr);
  if (days <= 3) return "live";
  if (days <= 14) return "recent";
  return "stale";
}

export function isPricingStale(dateStr: string, thresholdDays = 14): boolean {
  return getDaysSinceUpdate(dateStr) > thresholdDays;
}

export function freshnessLabel(dateStr: string): string {
  const days = getDaysSinceUpdate(dateStr);
  if (days === 0) return "Pricing verified today";
  if (days === 1) return "Pricing verified yesterday";
  if (days <= 3) return `Pricing verified ${days} days ago`;
  if (days < 7) return `Pricing verified ${days} days ago`;
  if (days < 30) return `Pricing verified ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `Pricing verified ${months} month${months > 1 ? "s" : ""} ago`;
}
