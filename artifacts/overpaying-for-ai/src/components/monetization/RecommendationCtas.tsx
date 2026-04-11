import { AffiliateTarget } from "@/utils/affiliateResolver";
import { AffiliateCta } from "./AffiliateCta";

interface RecommendationCtasProps {
  primary: AffiliateTarget;
  secondary?: AffiliateTarget;
  primaryClassName?: string;
  secondaryClassName?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

/**
 * Renders a row of up to two CTAs for recommendation sections.
 * Primary is always shown. Secondary is optional.
 */
export function RecommendationCtas({
  primary,
  secondary,
  primaryClassName = "inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline",
  secondaryClassName = "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline",
  onPrimaryClick,
  onSecondaryClick,
}: RecommendationCtasProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <AffiliateCta
        target={{ ...primary, label: `${primary.label} →` }}
        className={primaryClassName}
        onClick={onPrimaryClick}
      />
      {secondary && (
        <AffiliateCta
          target={{ ...secondary, label: `${secondary.label} →` }}
          className={secondaryClassName}
          onClick={onSecondaryClick}
        />
      )}
    </div>
  );
}
