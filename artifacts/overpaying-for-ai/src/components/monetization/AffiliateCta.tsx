import { Link } from "wouter";
import { AffiliateTarget } from "@/utils/affiliateResolver";

interface AffiliateCtaProps {
  target: AffiliateTarget;
  className?: string;
  onClick?: () => void;
}

/**
 * Renders a single CTA link — external anchor for affiliate links,
 * internal Link for fallback/internal routes. Never produces dead buttons.
 */
export function AffiliateCta({ target, className, onClick }: AffiliateCtaProps) {
  const sharedProps = {
    className,
    onClick,
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
