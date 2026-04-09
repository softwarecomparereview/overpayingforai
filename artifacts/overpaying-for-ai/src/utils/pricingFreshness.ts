export function getDaysSinceUpdate(dateStr: string): number {
  const updated = new Date(dateStr);
  const now = new Date();
  const ms = now.getTime() - updated.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function isPricingStale(dateStr: string, thresholdDays = 30): boolean {
  return getDaysSinceUpdate(dateStr) > thresholdDays;
}

export function freshnessLabel(dateStr: string): string {
  const days = getDaysSinceUpdate(dateStr);
  if (days === 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  if (days < 7) return `Updated ${days} days ago`;
  if (days < 30) return `Updated ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `Updated ${months} month${months > 1 ? "s" : ""} ago`;
}
