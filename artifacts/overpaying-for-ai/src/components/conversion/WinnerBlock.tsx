import { AffiliateTarget } from "@/utils/affiliateResolver";
import { StandardCtaGroup } from "./StandardCtaGroup";

type BadgeVariant = "cheapest" | "winner" | "best-value" | "recommended" | "budget";

interface WinnerBlockProps {
  badge: BadgeVariant | string;
  title: string;
  rationale: string;
  savingsLabel?: string | null;
  primaryCta: AffiliateTarget;
  secondaryCta?: AffiliateTarget;
  className?: string;
}

const BADGE_STYLES: Record<string, string> = {
  cheapest: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200",
  winner: "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200",
  "best-value": "bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200",
  recommended: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200",
  budget: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200",
};

const BORDER_STYLES: Record<string, string> = {
  cheapest: "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20",
  winner: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20",
  "best-value": "border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/20",
  recommended: "border-border bg-muted/30",
  budget: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20",
};

function normalizeBadge(badge: string): string {
  const map: Record<string, string> = {
    cheapest: "cheapest",
    winner: "winner",
    "best value": "best-value",
    "best-value": "best-value",
    recommended: "recommended",
    budget: "budget",
    "best budget": "budget",
  };
  return map[badge.toLowerCase()] ?? "recommended";
}

/**
 * WinnerBlock — compact, high-signal recommendation block.
 * Used on compare, best, and AI type pages to surface a clear answer.
 * All CTAs go through the affiliate resolver. Savings shown only when reliable.
 */
export function WinnerBlock({
  badge,
  title,
  rationale,
  savingsLabel,
  primaryCta,
  secondaryCta,
  className = "",
}: WinnerBlockProps) {
  const variant = normalizeBadge(badge);
  const badgeStyle = BADGE_STYLES[variant] ?? BADGE_STYLES["recommended"];
  const borderStyle = BORDER_STYLES[variant] ?? BORDER_STYLES["recommended"];

  return (
    <div className={`border rounded-xl p-5 ${borderStyle} ${className}`}>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-md ${badgeStyle}`}>
          {badge}
        </span>
        {savingsLabel && (
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
            {savingsLabel}
          </span>
        )}
      </div>
      <p className="font-bold text-foreground text-base mb-1">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{rationale}</p>
      <StandardCtaGroup
        primary={primaryCta}
        secondary={secondaryCta}
        size="sm"
      />
    </div>
  );
}
