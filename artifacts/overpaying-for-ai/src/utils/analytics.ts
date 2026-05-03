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
  // Calculator funnel
  "scenario_selected",
  "calculator_start",
  "calculator_complete",
  "calculator_result_view",
  "calculator_recommendation_click",
  "calculator_secondary_cta_click",
  // Decision engine funnel
  "decision_engine_complete",
  "decision_result_view",
  "decision_recommendation_click",
  "decision_restart_click",
  // CTA / affiliate
  "affiliate_clicked",
  "primary_cta_click",
  "outbound_click",
  // SEO pages
  "seo_page_viewed",
  "seo_cta_clicked",
  // Models page
  "page_view_models",
  "models_primary_cta_click",
  "models_secondary_cta_click",
  "models_quick_winner_click",
  "models_table_action_click",
  "models_category_winner_click",
  "models_final_cta_click",
  // Admin / internal
  "pricing_refresh_started",
  "pricing_diff_reviewed",
  "pricing_refresh_approved",
  // Site search
  "site_search_submit",
  "site_search_result_click",
  "site_search_no_results",
  // Commercial pages
  "internal_link_click",
  // Pricing intelligence tracker
  "pricing_tracker_view",
  "pricing_history_filter_change",
  "pricing_source_click",
  "pricing_change_detail_expand",
  // Admin — pricing intelligence pipeline
  "pipeline_review_approved",
  "pipeline_review_rejected",
  "pipeline_dry_run_triggered",
  "pipeline_reprocess_triggered",
  "pipeline_control_viewed",
  "pipeline_review_viewed",
]);

/**
 * Dev-only grouped logger for funnel events. Mirrors `track()` output but
 * bundles related events into console groups so we can quickly verify wiring
 * during local development. No-op in production.
 */
export function debugFunnelLog(group: "models" | "calculator" | "decision_engine", event: string, payload: AnalyticsPayload = {}): void {
  if (!isDev) return;
  // eslint-disable-next-line no-console
  console.groupCollapsed(`[funnel:${group}] ${event}`);
  // eslint-disable-next-line no-console
  console.log(payload);
  // eslint-disable-next-line no-console
  console.groupEnd();
}

/**
 * GA4 key events that drive decision-making dashboards and conversion review.
 * Mark these as conversions in the GA4 UI.
 */
export const GA4_DECISION_EVENT_CHECKLIST = {
  keyEvents: [
    "affiliate_click",
    "calculator_complete",
    "recommendation_result_view",
    "decision_engine_complete",
  ] as const,
  supportingEvents: [
    "calculator_open",
    "decision_engine_open",
    "comparison_cta_click",
    "primary_cta_click",
    "outbound_click",
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
 * 1. Internal "affiliate_clicked" event (Segment-style tracking)
 * 2. GA4 "affiliate_click" event via ga4.ts
 * 3. When ctaType is "primary", also fires internal "primary_cta_click"
 *    and GA4 "primary_cta_click" for dashboard isolation.
 *
 * Call this once per CTA click. Do NOT also call track() or trackCtaClickGa() separately.
 */
export function trackCta(params: CtaTrackingParams): void {
  const pagePath = typeof window !== "undefined" ? window.location.pathname : "";

  const payload = {
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
  };

  // 1. Internal event
  track("affiliate_clicked", payload);

  // 2. GA4 affiliate_click event
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

  // 3. Separate primary_cta_click event for isolated funnel analysis
  if (params.ctaType === "primary") {
    track("primary_cta_click", payload);
    trackGaEvent("primary_cta_click", {
      provider_id: params.providerId,
      cta_label: params.ctaLabel,
      page_type: params.pageType ?? "unknown",
      page_path: pagePath,
      source_component: params.sourceComponent ?? "unknown",
      destination_url: params.destinationUrl,
    });
  }
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
    | "calculator_complete"
    | "recommendation_result_view"
    | "decision_engine_complete",
  params: AnalyticsPayload = {},
): void {
  trackGaEvent(eventName, params);
  if (eventName === "calculator_complete" || eventName === "decision_engine_complete") {
    track(eventName, params);
  }
  if (isDev) console.log("analytics", eventName, params);
}

/**
 * Track high-intent comparison internal CTA clicks (e.g. calculator links on compare pages).
 * Fires GA4 event "comparison_cta_click" for funnel analysis.
 */
export function trackCompareCtaClick(params: {
  sourceComponent: string;
  ctaLabel: string;
  destinationPath: string;
  comparisonSlug?: string;
}): void {
  const pagePath = typeof window !== "undefined" ? window.location.pathname : "";
  trackGaEvent("comparison_cta_click", {
    page_type: "compare",
    page_path: pagePath,
    source_component: params.sourceComponent,
    cta_label: params.ctaLabel,
    destination_path: params.destinationPath,
    comparison_slug: params.comparisonSlug,
  });
  if (isDev) console.log("analytics", "comparison_cta_click", params);
}

/**
 * Track outbound clicks to non-affiliate external links.
 * Use this for "Verify with provider", external source links, etc.
 */
export function trackOutboundClick(params: {
  url: string;
  sourceComponent: string;
  linkLabel?: string;
  pageType?: string;
}): void {
  const pagePath = typeof window !== "undefined" ? window.location.pathname : "";
  track("outbound_click", {
    url: params.url,
    sourceComponent: params.sourceComponent,
    linkLabel: params.linkLabel,
    pageType: params.pageType,
    pagePath,
  });
  trackGaEvent("outbound_click", {
    url: params.url,
    source_component: params.sourceComponent,
    link_label: params.linkLabel ?? "",
    page_type: params.pageType ?? "unknown",
    page_path: pagePath,
  });
  if (isDev) console.log("analytics", "outbound_click", params);
}

// ─── Commercial page tracking ─────────────────────────────────────────────────

export interface CommercialPageEventParams {
  pageSlug: string;
  pageType: string;
  ctaLabel?: string;
  destinationSlug?: string;
  outboundUrl?: string;
  toolName?: string;
}

/**
 * Track internal link clicks on commercial pages (pricing, worth-it, alternatives, compare).
 */
export function trackInternalLinkClick(params: CommercialPageEventParams): void {
  const pagePath = typeof window !== "undefined" ? window.location.pathname : "";
  track("internal_link_click", { ...params, pagePath });
  trackGaEvent("internal_link_click", {
    page_slug: params.pageSlug,
    page_type: params.pageType,
    cta_label: params.ctaLabel ?? "",
    destination_slug: params.destinationSlug ?? "",
    tool_name: params.toolName ?? "",
    page_path: pagePath,
  });
  if (isDev) console.log("analytics", "internal_link_click", params);
}

/**
 * Track calculator start events from commercial pages.
 */
export function trackCalculatorStart(params: {
  pageSlug: string;
  pageType: string;
  sourceComponent: string;
}): void {
  const pagePath = typeof window !== "undefined" ? window.location.pathname : "";
  track("calculator_start", { ...params, pagePath });
  trackGaEvent("calculator_start", {
    page_slug: params.pageSlug,
    page_type: params.pageType,
    source_component: params.sourceComponent,
    page_path: pagePath,
  });
  if (isDev) console.log("analytics", "calculator_start", params);
}

// ─── Site search tracking ─────────────────────────────────────────────────────

export interface SearchTrackingParams {
  query: string;
  result_count: number;
  clicked_slug?: string;
  page_location?: string;
}

/**
 * Track site search interactions.
 * @param action  "submit" | "result_click" | "no_results"
 * @param params  Query, result count, and optional clicked slug / page location
 */
export function trackSearch(
  action: "submit" | "result_click" | "no_results",
  params: SearchTrackingParams,
): void {
  const eventName =
    action === "submit"
      ? "site_search_submit"
      : action === "result_click"
        ? "site_search_result_click"
        : "site_search_no_results";

  track(eventName, { ...params });
  trackGaEvent(eventName, {
    query: params.query,
    result_count: String(params.result_count),
    clicked_slug: params.clicked_slug ?? "",
    page_location: params.page_location ?? "",
  });
  if (isDev) console.log("analytics", eventName, params);
}
