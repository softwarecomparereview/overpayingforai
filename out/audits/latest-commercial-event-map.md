# Analytics Event Map — overpayingforai.com
**Date:** 2026-04-24  
**Sources audited:** `src/utils/ga4.ts`, `src/utils/analytics.ts`, `src/pages/Calculator.tsx`, `src/pages/ComparePage.tsx`, `src/pages/DecisionEngine.tsx`, `src/App.tsx`

---

## Tracking Architecture

```
Browser event
    │
    ├── analytics.ts → trackCta()
    │       ├── track("affiliate_clicked", payload)   → window.analytics (Segment-style internal)
    │       └── trackCtaClickGa(payload)              → window.gtag "affiliate_click"
    │
    ├── analytics.ts → trackDecisionEvent()
    │       ├── trackGaEvent(eventName, payload)      → window.gtag
    │       └── track(eventName, payload)             → window.analytics (if in allowlist)
    │
    ├── analytics.ts → trackFeatureOpen()
    │       └── trackGaEvent(eventName, payload)      → window.gtag only
    │
    ├── analytics.ts → trackCompareCtaClick()
    │       └── trackGaEvent("compare_cta_click", …) → window.gtag only
    │
    └── ga4.ts → trackPageView()                     → window.gtag "page_view"
```

---

## Full Event Inventory

### GA4 Events (window.gtag)

| Event Name | Trigger Location | Page Types | Parameters |
|------------|-----------------|------------|------------|
| `page_view` | `App.tsx → PageViewTracker` on every wouter route change | All | `page_path`, `page_title`, `send_to` |
| `affiliate_click` | `ga4.ts → trackCtaClickGa()` via `analytics.ts → trackCta()` | compare, calculator, best, models, compare-index | `provider_id`, `provider_name`, `cta_label`, `cta_type` (primary/secondary/tertiary), `cta_state` (affiliate/fallback/unmapped), `page_type`, `page_path`, `source_component`, `destination_url`, `is_external` |
| `calculator_open` | `Calculator.tsx` on mount (useEffect) | calculator | `page_type`, `page_path`, `source_component` |
| `calculator_completed` | `Calculator.tsx → calculate()` on "Calculate" button click | calculator | `page_type`, `source_component`, `page_path`, `selected_model`, `selected_provider`, `recommended_model`, `savings_amount`, `savings_percent`, `calculation_index` |
| `calculator_results_viewed` | `Calculator.tsx` on unique input change (deduped per sig) | calculator | `page_type`, `source_component`, `page_path`, `selected_model`, `selected_provider`, `recommended_model`, `savings_amount`, `savings_percent`, `has_cheaper_alternative`, `calculation_index` |
| `compare_cta_click` | `ComparePage.tsx → trackCompareCtaClick()` on hero CTA and recommendation CTA clicks | compare | `page_type`, `page_path`, `source_component`, `cta_label`, `destination_path`, `comparison_slug` |
| `decision_engine_open` | `DecisionEngine.tsx` on mount (inferred from trackFeatureOpen) | decision-engine | `page_type`, `page_path`, `source_component` |
| `decision_engine_completed` | `DecisionEngine.tsx` on wizard completion | decision-engine | (payload varies) |

### Internal Events (window.analytics — Segment-style)

| Event Name | Where Fired | Notes |
|------------|-------------|-------|
| `calculator_started` | Allowlist only — **not fired anywhere in codebase** | Dead event |
| `scenario_selected` | `Calculator.tsx` — bypasses `track()`, calls `window.analytics` directly | Fix: route through `track()` |
| `calculator_completed` | `Calculator.tsx → calculate()` via `track()` | ✅ Fires correctly |
| `decision_engine_completed` | `DecisionEngine.tsx` | ✅ Fires correctly |
| `affiliate_clicked` | `analytics.ts → trackCta()` via `track()` | ✅ Fires correctly |
| `calculator_start` | `Calculator.tsx → fireStartOnce()` via `track()` | ✅ Fires on first user input |
| `calculator_complete` | `Calculator.tsx → calculate()` via `track()` | ✅ Fires on button click |
| `calculator_result_view` | `Calculator.tsx` on results display via `track()` | ✅ Fires correctly |
| `calculator_recommendation_click` | Allowlist only — **not confirmed fired** | Verify or remove |
| `calculator_secondary_cta_click` | Allowlist only — **not confirmed fired** | Verify or remove |
| `decision_engine_start` | Allowlist only — **not confirmed fired** | Verify or remove |
| `decision_result_view` | Allowlist only — **not confirmed fired** | Verify or remove |
| `decision_recommendation_click` | Allowlist only — **not confirmed fired** | Verify or remove |
| `decision_restart_click` | Allowlist only — **not confirmed fired** | Verify or remove |
| `seo_page_viewed` | Allowlist — intended for guide/SEO pages | **Not fired on any guide page** |
| `seo_cta_clicked` | Allowlist — intended for guide CTAs | **Not fired** |
| `models_primary_cta_click` | ModelsPage (inferred from allowlist) | ✅ Likely fired — not audited in detail |

---

## Coverage Matrix

| Page / Feature | `page_view` | `affiliate_click` | CTA events | Feature events | Notes |
|----------------|-------------|-------------------|------------|----------------|-------|
| `/` (home / Design2) | ✅ | Unknown | Unknown | — | Design2 not audited for CTAs |
| `/compare` (index) | ✅ | ✅ (DeepSeek CTA) | — | — | compare_cta_click fires on fast-path links |
| `/compare/:slug` | ✅ | ✅ | `compare_cta_click` | — | WinnerBlock fires affiliate_click |
| `/calculator` | ✅ | ✅ | — | ✅ Full funnel | Start/open/complete/results_viewed |
| `/decision-engine` | ✅ | — | — | ✅ | Open + completed |
| `/best` | ✅ | ❌ | ❌ | ❌ | No CTA tracking |
| `/best/:slug` | ✅ | ❌ | ❌ | ❌ | No CTA tracking |
| `/ai-types/:slug` | ✅ | ❌ | ❌ | ❌ | Full blind spot |
| `/guides/:slug` | ✅ | ❌ | ❌ | ❌ | Full blind spot — highest-priority fix |
| `/models` | ✅ | ✅ | ✅ | ✅ | Best coverage outside calculator |
| `/pricing/*` | N/A | N/A | N/A | N/A | Pages don't exist |
| `/worth-it/*` | N/A | N/A | N/A | N/A | Pages don't exist |
| `/alternatives/*` | N/A | N/A | N/A | N/A | Pages don't exist |

---

## GA4 Key Events (Conversion Actions)

These are the events flagged in `analytics.ts → GA4_DECISION_EVENT_CHECKLIST`:

| Event | Type | Description | Recommended GA4 status |
|-------|------|-------------|------------------------|
| `affiliate_click` | Key event | Any CTA click — primary affiliate or fallback | ✅ Mark as conversion |
| `calculator_completed` | Key event | User clicked "Calculate" button | ✅ Mark as conversion |
| `calculator_results_viewed` | Key event | Results rendered (auto, deduped per unique input set) | ✅ Mark as conversion |
| `decision_engine_completed` | Key event | Full wizard completed | ✅ Mark as conversion |
| `calculator_open` | Supporting | Calculator page opened | Track as engagement |
| `decision_engine_open` | Supporting | Decision engine opened | Track as engagement |
| `compare_cta_click` | Supporting | High-intent internal nav from compare page | Track as engagement |

---

## Missing Events — Recommended Additions

| Event Name (recommended) | Trigger | Where to add | Priority |
|--------------------------|---------|-------------|----------|
| `outbound_click` | Any non-affiliate `target="_blank"` link | New `OutboundLink` wrapper component | P4 |
| `guide_view` / `seo_page_viewed` | GuidePage mount | `GuidePage.tsx → useEffect` | P4 |
| `guide_cta_click` / `seo_cta_clicked` | CTA in GuidePage | GuidePage CTABlock | P4 |
| `best_page_cta_click` | BestPage affiliate click | BestPage AffiliateCta | P4 |
| `internal_link_click` | InternalLinks component | `InternalLinks.tsx → onClick` | P5 |
| `recommendation_result_view` | Align with spec | Rename `calculator_result_view` in GA4 | P4 |
| `comparison_cta_click` | Align with spec | Rename `compare_cta_click` in GA4 | P5 |
| `primary_cta_click` | Separate from `affiliate_click` | Add when `ctaType === "primary"` | P4 |

---

## Naming Inconsistencies to Resolve

| Problem | Current state | Recommended fix |
|---------|--------------|-----------------|
| Calculator completion — two names | `calculator_complete` (internal) + `calculator_completed` (GA4) | Standardize to `calculator_complete` everywhere |
| CTA click — two names | `affiliate_clicked` (internal) + `affiliate_click` (GA4) | Standardize to `affiliate_click` everywhere |
| Results view — two names | `calculator_result_view` (internal) + `calculator_results_viewed` (GA4) | Standardize to `calculator_result_view` everywhere |
| `recommendation_result_view` in allowlist but never fired | Dead event | Remove from allowlist or implement |
| `calculator_started` in allowlist but never fired | Dead event — `calculator_start` is the real event | Remove `calculator_started` from allowlist |
| Spec says `comparison_cta_click`, code fires `compare_cta_click` | Minor naming gap | Rename GA4 event to `comparison_cta_click` |

---

## Source File Reference

| File | Role |
|------|------|
| `src/utils/ga4.ts` | GA4 wrappers — `trackPageView`, `trackCtaClickGa`, `trackGaEvent`, `trackFeatureOpen` |
| `src/utils/analytics.ts` | Unified entry point — `trackCta`, `trackDecisionEvent`, `trackFeatureOpen`, `trackCompareCtaClick`, event allowlist |
| `src/App.tsx` | `PageViewTracker` — fires `page_view` on every route change |
| `src/pages/Calculator.tsx` | All calculator funnel events |
| `src/pages/ComparePage.tsx` | `compare_cta_click` on hero and recommendation CTAs |
| `src/pages/DecisionEngine.tsx` | Decision engine events |
| `src/pages/ModelsPage.tsx` | Models page CTA events |
| `src/components/monetization/AffiliateCta.tsx` | Fires `affiliate_click` via `trackCta()` |
| `src/components/conversion/WinnerBlock.tsx` | Passes trackingContext to AffiliateCta |
