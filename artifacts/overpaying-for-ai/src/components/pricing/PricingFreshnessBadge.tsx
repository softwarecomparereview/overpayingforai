import { isPricingStale, freshnessLabel } from "@/utils/pricingFreshness";

interface PricingFreshnessBadgeProps {
  lastUpdated: string;
}

export function PricingFreshnessBadge({ lastUpdated }: PricingFreshnessBadgeProps) {
  const stale = isPricingStale(lastUpdated, 30);
  const label = freshnessLabel(lastUpdated);

  return (
    <p
      className={`inline-flex items-center gap-1.5 text-xs ${
        stale ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
      }`}
    >
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          stale ? "bg-amber-500" : "bg-green-500"
        }`}
      />
      {label}
      {stale && " · Pricing may have changed — verify with provider before committing."}
    </p>
  );
}
