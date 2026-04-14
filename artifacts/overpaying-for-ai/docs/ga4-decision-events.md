# GA4 decision-event checklist

This repo uses a small set of GA4 events for conversion and funnel decisions.

## Events to rely on

### Mark as Key events in GA4
- `affiliate_click`
- `calculator_completed`
- `calculator_results_viewed`
- `decision_engine_completed`

### Supporting events
- `calculator_open`
- `decision_engine_open`
- `compare_cta_click`

## Where they fire in code
- `affiliate_click` → shared CTA path via `src/components/monetization/AffiliateCta.tsx` and `src/utils/analytics.ts`
- `calculator_open` → `src/pages/Calculator.tsx`
- `calculator_completed` → `src/pages/Calculator.tsx`
- `calculator_results_viewed` → `src/pages/Calculator.tsx`
- `decision_engine_open` → `src/pages/DecisionEngine.tsx`
- `decision_engine_completed` → `src/pages/DecisionEngine.tsx`
- `compare_cta_click` → `src/pages/ComparePage.tsx`

## Required payload fields for decision review
For decision-quality reporting, prefer events that include:
- `page_type`
- `page_path`
- `source_component`

When available, also include:
- `selected_model`
- `selected_provider`
- `comparison_slug`
- `calculation_index`
- `use_case`
- `budget`
- `usage_frequency`
- `quality_preference`
- `free_tier_required`

## What not to use for conversion decisions
These are useful for UX/navigation analysis, but should not drive revenue conclusions:
- homepage micro-events like `section_nav_clicked`
- generic card clicks like `card_clicked`
- broad CTA discovery clicks like `overpaying_cta_clicked`

## GA4 admin follow-up
After deployment, in GA4 mark these as Key events:
1. `affiliate_click`
2. `calculator_completed`
3. `calculator_results_viewed`
4. `decision_engine_completed`

Then review funnels primarily through:
- homepage → calculator
- calculator_open → calculator_completed → affiliate_click
- decision_engine_open → decision_engine_completed
- compare_cta_click → calculator_open
