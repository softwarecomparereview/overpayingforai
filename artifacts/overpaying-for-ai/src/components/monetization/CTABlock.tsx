import { getPrimaryCta } from "@/utils/affiliateResolver";
import { AffiliateCta } from "./AffiliateCta";

interface CTABlockProps {
  toolId: string;
  toolName: string;
  headline?: string;
  savingsText?: string;
  variant?: "primary" | "secondary";
  trackingContext?: { pageType?: string; sourceComponent?: string };
}

/**
 * CTABlock — a lightweight CTA card using the affiliate resolver.
 * Falls back gracefully when no affiliate link is configured.
 * variant="primary" uses a tinted background; variant="secondary" is subtle/muted.
 */
export function CTABlock({
  toolId,
  toolName,
  headline,
  savingsText,
  variant = "secondary",
  trackingContext,
}: CTABlockProps) {
  const cta = getPrimaryCta(toolId, "default");

  const borderClass =
    variant === "primary"
      ? "border-primary/20 bg-primary/5"
      : "border-border bg-muted/30";

  return (
    <div className={`rounded-xl border p-5 ${borderClass}`}>
      <p className="font-semibold text-foreground mb-1">
        {headline ?? `Save money with ${toolName}`}
      </p>
      {savingsText && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400 mb-3">{savingsText}</p>
      )}
      <AffiliateCta
        target={{ ...cta, label: `Try ${toolName} →` }}
        className="inline-flex items-center bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors mt-2"
        trackingContext={{
          providerId: toolId,
          ctaType: "primary",
          sourceComponent: "CTABlock",
          ...trackingContext,
        }}
      />
    </div>
  );
}
