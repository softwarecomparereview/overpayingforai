# Freshness System Audit Report
**Date:** 2026-05-03  
**Scope:** Global Pricing Freshness Indicator — implementation audit  
**Status:** ✅ COMPLETE

---

## Summary

Every pricing-related page now shows a visible freshness indicator with:
- Pricing last verified date
- Source of pricing
- Freshness status (live / recent / stale) with green / yellow / red color coding

---

## Freshness Thresholds

| Status | Days since verified | Indicator color |
|--------|---------------------|-----------------|
| **Live**   | ≤ 3 days  | 🟢 Green  |
| **Recent** | ≤ 14 days | 🟡 Yellow |
| **Stale**  | > 14 days | 🔴 Red    |

Implemented in `artifacts/overpaying-for-ai/src/utils/pricingFreshness.ts` via `freshnessStatus()`.

---

## Pages with Freshness Indicator

| Page | Route | Source | Status logic |
|------|-------|--------|-------------|
| Pricing pages | `/pricing/:slug` | Vendor documentation | Static verified date |
| Compare pages | `/compare/:slug` | Model registry + vendor docs | Model `last_updated` date |
| Alternatives pages | `/alternatives/:slug` | Market research + vendor docs | Static verified date |
| Worth It pages | `/worth-it/:slug` | Vendor documentation | Static verified date |
| Best-of pages | `/best/:slug` | Model registry + editorial review | Rank-1 model `last_updated` |
| AI Pricing Tracker | `/insights/ai-pricing-tracker` | Pipeline (official/third-party) | Always `live` (today's run) |
| Pricing History | `/pricing-history` | Per-entry source | Per-entry `detectedDate` freshness |

---

## FreshnessIndicator Component

**Location:** `artifacts/overpaying-for-ai/src/components/FreshnessIndicator.tsx`

**Two display modes:**
- **Full** (default): Horizontal pill row showing status badge + verified date + source — used in page headers
- **Compact**: Inline dot + badge — used in table cells (pricing history) and sidebar cards (tracker)

**Props:**
- `dateStr` — ISO date string (YYYY-MM-DD or full ISO)
- `source` — Free-text source label (optional)
- `forceLive` — Override to always show "Live" (for tracker items, which are always from today)
- `compact` — Compact inline mode
- `className` — Pass-through class

---

## Autopilot Enhancements

**File:** `scripts/daily-pricing-intelligence.mjs`

**Changes:**
- Added `freshnessTimestamp: NOW_ISO` to every enriched item (full ISO timestamp of detection)
- Added `freshnessStatus: "live"` to every enriched item (tracker items are always live on day of detection)
- Added run log write at end of pipeline → `pipeline-run-log.json` (append-only, keeps last 50 runs)
- Run log includes: `runAt`, `status`, `digestItems`, `newHistoryEntries`, `sourceCount`, `auditLog`

**Guardrails (unchanged + strengthened):**
- History is append-only (never overwritten)
- Low-confidence items always `requiresReview=true`
- No auto-publish without `official` trust level + `high` confidence + `allowedForAutoDraft=true`
- All runs logged to `pipeline-run-log.json`

---

## Admin Panel

### `/admin/pricing-intelligence-review`
- Protected by AdminGuard (maintainer key)
- Shows all items from `ai-pricing-news.json` requiring human review
- Filter tabs: Pending / Approved / Rejected / All
- Per-item approve/reject decisions stored in localStorage
- Freshness indicator on each item
- Last pipeline run info banner
- Review decisions fire analytics events (`pipeline_review_approved`, `pipeline_review_rejected`)

### `/admin/pricing-intelligence-control`
- Protected by AdminGuard (maintainer key)
- **Status panel:** Last run datetime, digest item count, pending review count, source count
- **Freshness indicator** for last pipeline run
- **Actions:**
  - Dry Run (Simulate) — simulates pipeline, shows terminal-style log output, logs to localStorage
  - Reprocess existing data — marks a reprocess event in run log
  - GitHub Actions trigger link — direct link to trigger production pipeline
- **Tabs:**
  - Last run audit — source-by-source fetch status from last run
  - Sources registry — all 7 trusted sources with trust level, auto-draft status, URL, notes
  - Run log — full history of live runs + simulations
- All actions fire analytics events

---

## Analytics Events Added

| Event | Trigger |
|-------|---------|
| `pipeline_review_viewed` | Review page opened |
| `pipeline_review_approved` | Item marked approved |
| `pipeline_review_rejected` | Item marked rejected |
| `pipeline_control_viewed` | Control page opened |
| `pipeline_dry_run_triggered` | Dry run initiated |
| `pipeline_reprocess_triggered` | Reprocess action taken |

---

## Validation Results

| Check | Result |
|-------|--------|
| TypeScript: zero errors | ✅ PASS |
| Vite production build | ✅ PASS (205 modules) |
| All public routes HTTP 200 | ✅ PASS (33/33 desktop) |
| Mobile overflow | ⚠️ Homepage only (pre-existing, 404px > 390px) |
| Freshness indicator visible on all pricing pages | ✅ PASS |
| Freshness indicator visible on compare pages | ✅ PASS |
| Freshness indicator visible on alternatives pages | ✅ PASS |
| Freshness indicator visible on worth-it pages | ✅ PASS |
| Freshness indicator visible on best-of pages | ✅ PASS |
| Tracker items always "live" | ✅ PASS |
| Freshness column in pricing history table | ✅ PASS |
| Admin review page renders | ✅ HTTP 200 |
| Admin control page renders | ✅ HTTP 200 |
| History never overwritten | ✅ PASS (append-only) |
| Low-confidence items always require review | ✅ PASS (guardrail in pipeline) |

---

## Files Changed

| File | Change |
|------|--------|
| `src/utils/pricingFreshness.ts` | Added `freshnessStatus()`, updated thresholds (3/14 day) |
| `src/components/FreshnessIndicator.tsx` | **New** — reusable freshness badge component |
| `src/data/pipeline-run-log.json` | **New** — append-only run log data file |
| `src/data/trusted-pricing-sources.json` | **New** — copy of root data file for admin page import |
| `scripts/daily-pricing-intelligence.mjs` | Added `freshnessTimestamp`, `freshnessStatus`, run log write |
| `src/utils/analytics.ts` | Added 6 new pipeline admin events |
| `src/components/admin/AdminNav.tsx` | Added Intel Review + Intel Control nav links |
| `src/pages/PricingPage.tsx` | Added FreshnessIndicator to header |
| `src/pages/ComparePage.tsx` | Added FreshnessIndicator using model `last_updated` |
| `src/pages/AlternativesPage.tsx` | Added FreshnessIndicator to header |
| `src/pages/WorthItPage.tsx` | Added FreshnessIndicator to header |
| `src/pages/BestPage.tsx` | Replaced static "verified" text with FreshnessIndicator |
| `src/pages/AiPricingTrackerPage.tsx` | Added type fields + FreshnessIndicator (forceLive) in hero |
| `src/pages/PricingHistoryPage.tsx` | Added type fields + Freshness column in table |
| `src/pages/admin/PricingIntelligenceReviewPage.tsx` | **New** — `/admin/pricing-intelligence-review` |
| `src/pages/admin/PricingIntelligenceControlPage.tsx` | **New** — `/admin/pricing-intelligence-control` |
| `src/App.tsx` | Added 2 new admin routes |
