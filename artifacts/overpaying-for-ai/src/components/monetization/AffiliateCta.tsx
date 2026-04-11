import { Link } from "wouter";
import { AffiliateTarget } from "@/utils/affiliateResolver";
import { trackCta, type CtaTrackingParams } from "@/utils/analytics";

export interface CtaTrackingContext {
  providerId?: string;
  providerName?: string;
  ctaType?: "primary" | "secondary" | "tertiary";
  pageType?: string;
  sourceComponent?: string;
}

interface AffiliateCtaProps {
  target: AffiliateTarget;
  className?: string;
  onClick?: () => void;
  trackingContext?: CtaTrackingContext;
}

/**
 * Renders a single CTA link — external anchor for affiliate links,
 * internal Link for fallback/internal routes. Never produces dead buttons.
 *
 * Fires unified CTA tracking (internal + GA4) on every click via analytics.trackCta().
 * Pass trackingContext to enrich the event with provider, page type, etc.
 */
export function AffiliateCta({ target, className, onClick, trackingContext }: AffiliateCtaProps) {
  const handleClick = () => {
    // Derive cta_state from the resolved target
    const ctaState: CtaTrackingParams["ctaState"] = target.isAffiliate
      ? "affiliate"
      : target.status === "unavailable" && !target.fallbackUsed
      ? "unmapped"
      : "fallback";

    trackCta({
      providerId: trackingContext?.providerId ?? "",
      providerName: trackingContext?.providerName,
      ctaLabel: target.label,
      ctaType: trackingContext?.ctaType ?? "primary",
      ctaState,
      pageType: trackingContext?.pageType,
      sourceComponent: trackingContext?.sourceComponent,
      destinationUrl: target.href,
      isExternal: target.isExternal,
    });

    onClick?.();
  };

  const sharedProps = {
    className,
    onClick: handleClick,
  };

  if (target.isExternal) {
    return (
      <a
        href={target.href}
        rel={target.rel ?? "noopener noreferrer sponsored"}
        target={target.target ?? "_blank"}
        {...sharedProps}
      >
        {target.label}
      </a>
    );
  }

  return (
    <Link href={target.href} {...sharedProps}>
      {target.label}
    </Link>
  );
}
