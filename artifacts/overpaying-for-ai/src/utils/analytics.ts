/**
 * analytics.ts — Centralized internal event tracking + GA4 bridge.
 *
 * Internal events go to window.analytics (Segment-compatible).
 * GA4 events are fired alongside internal events via ga4.ts.
 *
 * trackCta() is the single unified entry point for all CTA/affiliate clicks.
 * Components should NOT call ga4.ts directly — go through trackCta() here.
 */

import { trackCtaClickGa, trackGaEvent, type Ga4CtaParams } from "@/utils/ga4";

type AnalyticsPayload = Record<string, unknown>;

const ALLOWED_EVENTS = new Set([
  "calculator_started",
  "scenario_selected",
  "calculator_completed",
  "report_generated",
  "lead_capture_clicked",
  "lead_capture_submitted",
  "affiliate_clicked",
  "seo_page_viewed",
  "seo_cta_clicked",
  "pricing_refresh_started",
  "pricing_diff_reviewed",
  "pricing_refresh_approved",
]);

const isDev = import.meta.env.DEV;

/** Internal Segment-style event tracker. Preserves existing behavior. */
export function track(eventName: string, payload: AnalyticsPayload = {}): void {
  if (!ALLOWED_EVENTS.has(eventName)) return;
  if (typeof window !== "undefined") {
    const provider = (window as typeof window & { analytics?: { track?: (event: string, props?: AnalyticsPayload) => void } }).analytics;
    provider?.track?.(eventName, payload);
  }
  if (isDev) console.log("analytics", eventName, payload);
}

// ─── CTA tracking ─────────────────────────────────────────────────────────────

export interface CtaTrackingParams {
  /** Provider ID from affiliates.ts (e.g. "anthropic"). Empty string for internal-only CTAs. */
  providerId: string;
  providerName?: string;
  ctaLabel: string;
  ctaType: "primary" | "secondary" | "tertiary";
  /** affiliate = active affiliate link; fallback = resolved to internal fallback; unmapped = no config entry */
  ctaState: "affiliate" | "fallback" | "unmapped";
  pageType?: string;
  sourceComponent?: string;
  destinationUrl: string;
  isExternal: boolean;
}

/**
 * Unified CTA/affiliate click tracker.
 *
 * Fires:
 * 1. Internal "affiliate_clicked" event (existing Segment-style tracking)
 * 2. GA4 "affiliate_click" event via ga4.ts
 *
 * Call this once per CTA click. Do NOT also call track() or trackCtaClickGa() separately.
 */
export function trackCta(params: CtaTrackingParams): void {
  const pagePath = typeof window !== "undefined" ? window.location.pathname : "";

  // 1. Internal event (existing allowlist)
  track("affiliate_clicked", {
    providerId: params.providerId,
    providerName: params.providerName,
    ctaLabel: params.ctaLabel,
    ctaType: params.ctaType,
    ctaState: params.ctaState,
    pageType: params.pageType,
    sourceComponent: params.sourceComponent,
    destinationUrl: params.destinationUrl,
    isExternal: params.isExternal,
    pagePath,
  });

  // 2. GA4 event
  const ga4Params: Ga4CtaParams = {
    providerId: params.providerId,
    providerName: params.providerName,
    ctaLabel: params.ctaLabel,
    ctaType: params.ctaType,
    ctaState: params.ctaState,
    pageType: params.pageType,
    pagePath,
    sourceComponent: params.sourceComponent,
    destinationUrl: params.destinationUrl,
    isExternal: params.isExternal,
  };
  trackCtaClickGa(ga4Params);
}

/**
 * Track a feature-open event (calculator, decision engine, etc.)
 * Fires GA4 only — lightweight, no internal event needed.
 */
export function trackFeatureOpen(
  feature: "calculator" | "decision_engine" | "pricing_changelog",
): void {
  const eventMap = {
    calculator: "calculator_open",
    decision_engine: "decision_engine_open",
    pricing_changelog: "pricing_changelog_open",
  } as const;
  trackGaEvent(eventMap[feature]);
  if (isDev) console.log("analytics", eventMap[feature]);
}
