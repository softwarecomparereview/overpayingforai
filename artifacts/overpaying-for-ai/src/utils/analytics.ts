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
  "decision_engine_completed",
  "section_nav_clicked",
  "card_clicked",
  "overpaying_cta_clicked",
  "calculator_used",
  "report_generated",
  "lead_capture_clicked",
  "lead_capture_submitted",
  "affiliate_clicked",
  "seo_page_viewed",
  "seo_cta_clicked",
  "pricing_refresh_started",
  "pricing_diff_reviewed",
  "pricing_refresh_approved",
  "page_view_models",
  "models_primary_cta_click",
  "models_secondary_cta_click",
  "models_quick_winner_click",
  "models_table_action_click",
  "models_category_winner_click",
  "models_final_cta_click",
]);

/**
 * GA4 events that should drive decision-making dashboards and conversion review.
 * Key events are the ones to mark as conversions in GA4 UI.
 */
export const GA4_DECISION_EVENT_CHECKLIST = {
  keyEvents: [
    "affiliate_click",
    "calculator_completed",
    "calculator_results_viewed",
    "decision_engine_completed",
  ] as const,
  supportingEvents: [
    "calculator_open",
    "decision_engine_open",
    "compare_cta_click",
  ] as const,
} as const;

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

export interface FeatureOpenTrackingContext {
  pageType?: string;
  pagePath?: string;
  sourceComponent?: string;
}

/**
 * Track a feature-open event (calculator, decision engine, etc.)
 * Fires GA4 only — lightweight, but includes enough context for reporting.
 */
export function trackFeatureOpen(
  feature: "calculator" | "decision_engine" | "pricing_changelog",
  context: FeatureOpenTrackingContext = {},
): void {
  const eventMap = {
    calculator: "calculator_open",
    decision_engine: "decision_engine_open",
    pricing_changelog: "pricing_changelog_open",
  } as const;
  trackGaEvent(eventMap[feature], {
    page_type: context.pageType ?? feature,
    page_path: context.pagePath ?? (typeof window !== "undefined" ? window.location.pathname : ""),
    source_component: context.sourceComponent ?? "unknown",
  });
  if (isDev) console.log("analytics", eventMap[feature], context);
}

/**
 * Track calculator/decision flow completion and result visibility.
 * Uses GA4-only event names that map to key conversion actions.
 */
export function trackDecisionEvent(
  eventName:
    | "calculator_completed"
    | "calculator_results_viewed"
    | "decision_engine_completed",
  params: AnalyticsPayload = {},
): void {
  trackGaEvent(eventName, params);
  if (eventName === "calculator_completed" || eventName === "decision_engine_completed") {
    track(eventName, params);
  }
  if (isDev) console.log("analytics", eventName, params);
}

/**
 * Track high-intent comparison internal CTA clicks (e.g. calculator links).
 * Keeps a stable GA4 event for compare-page funnel analysis.
 */
export function trackCompareCtaClick(params: {
  sourceComponent: string;
  ctaLabel: string;
  destinationPath: string;
  comparisonSlug?: string;
}): void {
  const pagePath = typeof window !== "undefined" ? window.location.pathname : "";
  trackGaEvent("compare_cta_click", {
    page_type: "compare",
    page_path: pagePath,
    source_component: params.sourceComponent,
    cta_label: params.ctaLabel,
    destination_path: params.destinationPath,
    comparison_slug: params.comparisonSlug,
  });
  if (isDev) console.log("analytics", "compare_cta_click", params);
}
