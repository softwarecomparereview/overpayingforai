import { AffiliateTarget } from "@/utils/affiliateResolver";
import { AffiliateCta } from "@/components/monetization/AffiliateCta";

interface StandardCtaGroupProps {
  primary: AffiliateTarget;
  secondary?: AffiliateTarget;
  tertiary?: AffiliateTarget;
  size?: "sm" | "md";
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

const SIZE_PRIMARY = {
  sm: "inline-flex items-center gap-1.5 text-xs font-semibold bg-foreground text-background px-4 py-2 rounded-lg hover:bg-foreground/85 transition-colors",
  md: "inline-flex items-center gap-1.5 text-sm font-semibold bg-foreground text-background px-5 py-2.5 rounded-lg hover:bg-foreground/85 transition-colors",
};

const SIZE_SECONDARY = {
  sm: "inline-flex items-center gap-1.5 text-xs font-medium border border-border px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors",
  md: "inline-flex items-center gap-1.5 text-sm font-medium border border-border px-5 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors",
};

/**
 * Standardized CTA group used across comparison, best, and AI type pages.
 * Primary uses affiliate resolver; secondary is always an internal route.
 * Falls back gracefully — never renders empty or broken buttons.
 */
export function StandardCtaGroup({
  primary,
  secondary,
  tertiary,
  size = "md",
  onPrimaryClick,
  onSecondaryClick,
}: StandardCtaGroupProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <AffiliateCta
        target={{ ...primary, label: `${primary.label} →` }}
        className={SIZE_PRIMARY[size]}
        onClick={onPrimaryClick}
      />
      {secondary && (
        <AffiliateCta
          target={{ ...secondary, label: `${secondary.label} →` }}
          className={SIZE_SECONDARY[size]}
          onClick={onSecondaryClick}
        />
      )}
      {tertiary && (
        <AffiliateCta
          target={{ ...tertiary, label: tertiary.label }}
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
        />
      )}
    </div>
  );
}
