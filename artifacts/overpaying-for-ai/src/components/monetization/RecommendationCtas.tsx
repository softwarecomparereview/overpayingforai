import { AffiliateTarget } from "@/utils/affiliateResolver";
import { AffiliateCta, type CtaTrackingContext } from "./AffiliateCta";

interface RecommendationCtasProps {
  primary: AffiliateTarget;
  secondary?: AffiliateTarget;
  primaryClassName?: string;
  secondaryClassName?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  /** Optional tracking context forwarded to each CTA. Enriches GA4 events. */
  trackingContext?: Omit<CtaTrackingContext, "ctaType">;
}

/**
 * Renders a row of up to two CTAs for recommendation sections.
 * Primary is always shown. Secondary is optional.
 * trackingContext is forwarded to AffiliateCta for unified GA4 + internal tracking.
 */
export function RecommendationCtas({
  primary,
  secondary,
  primaryClassName = "inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline",
  secondaryClassName = "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline",
  onPrimaryClick,
  onSecondaryClick,
  trackingContext,
}: RecommendationCtasProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <AffiliateCta
        target={{ ...primary, label: `${primary.label} →` }}
        className={primaryClassName}
        onClick={onPrimaryClick}
        trackingContext={{ ...trackingContext, ctaType: "primary" }}
      />
      {secondary && (
        <AffiliateCta
          target={{ ...secondary, label: `${secondary.label} →` }}
          className={secondaryClassName}
          onClick={onSecondaryClick}
          trackingContext={{ ...trackingContext, ctaType: "secondary" }}
        />
      )}
    </div>
  );
}
