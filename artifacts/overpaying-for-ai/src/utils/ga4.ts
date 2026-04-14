/**
 * ga4.ts — Centralized Google Analytics 4 wrapper for OverpayingForAI.
 *
 * Architecture notes:
 * - send_page_view is disabled in index.html (intentional — this is a SPA).
 *   All page views are manually tracked via trackPageView() on route changes.
 * - All functions safely no-op if window.gtag is unavailable (local dev, blocked).
 * - DO NOT call these functions from multiple places for the same click —
 *   use trackCta() in analytics.ts as the single unified entry point.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? "G-4C87X50KDZ";

const isDev = import.meta.env.DEV;

function safeGtag(...args: unknown[]): void {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  } else if (isDev) {
    console.debug("[ga4 no-op]", ...args);
  }
}

/**
 * Track a page view manually.
 * Called on every wouter route change to simulate native page tracking in the SPA.
 */
export function trackPageView(path: string, title?: string): void {
  safeGtag("event", "page_view", {
    page_path: path,
    page_title: title ?? document.title,
    send_to: GA_ID,
  });
}

/**
 * Fire a generic GA4 event.
 * Safely no-ops if gtag is unavailable.
 */
export function trackGaEvent(
  eventName: string,
  params: Record<string, unknown> = {},
): void {
  safeGtag("event", eventName, { ...params, send_to: GA_ID });
}

/**
 * Track an affiliate/CTA click as a GA4 event.
 * Mirrors the shape of the internal trackCta() payload so both systems stay aligned.
 */
export interface Ga4CtaParams {
  providerId: string;
  providerName?: string;
  ctaLabel: string;
  ctaType: "primary" | "secondary" | "tertiary";
  ctaState: "affiliate" | "fallback" | "unmapped";
  pageType?: string;
  pagePath?: string;
  sourceComponent?: string;
  destinationUrl: string;
  isExternal: boolean;
}

export function trackCtaClickGa(params: Ga4CtaParams): void {
  safeGtag("event", "affiliate_click", {
    provider_id: params.providerId,
    provider_name: params.providerName ?? params.providerId,
    cta_label: params.ctaLabel,
    cta_type: params.ctaType,
    cta_state: params.ctaState,
    page_type: params.pageType ?? "unknown",
    page_path: params.pagePath ?? (typeof window !== "undefined" ? window.location.pathname : ""),
    source_component: params.sourceComponent ?? "unknown",
    destination_url: params.destinationUrl,
    is_external: params.isExternal,
    send_to: GA_ID,
  });
}

export interface Ga4FeatureOpenContext {
  pageType?: string;
  pagePath?: string;
  sourceComponent?: string;
}

/**
 * Track a feature-open event (calculator, decision engine, etc.)
 * Low-noise, but includes page context so reports are actionable.
 */
export function trackFeatureOpen(
  feature: "calculator" | "decision_engine" | "pricing_changelog",
  context: Ga4FeatureOpenContext = {},
): void {
  const eventMap = {
    calculator: "calculator_open",
    decision_engine: "decision_engine_open",
    pricing_changelog: "pricing_changelog_open",
  } as const;
  safeGtag("event", eventMap[feature], {
    page_type: context.pageType ?? feature,
    page_path: context.pagePath ?? (typeof window !== "undefined" ? window.location.pathname : ""),
    source_component: context.sourceComponent ?? "unknown",
    send_to: GA_ID,
  });
}
