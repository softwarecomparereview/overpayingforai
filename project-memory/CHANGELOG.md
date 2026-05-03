# Changelog — OverpayingForAI

**Format:** `[YYYY-MM-DD] [commit] — Description`

---

## 2026-05-03

### [9a0ba32] Mobile navigation fix
- **Root cause:** SearchBox `mousedown` document listener called `onClose()` before nav link `click` could fire, unmounting the menu
- **Fix:** Removed `onClose` from mousedown handler in `SearchBox.tsx` (only closes results dropdown now)
- **Fix:** Added `useEffect([location])` in `Layout.tsx` to close menu on route change
- **Fix:** Mobile nav link touch targets bumped to `min-h-[44px]`
- **Files:** `src/components/search/SearchBox.tsx`, `src/components/Layout.tsx`

### [979fbd8] Manual no-update pipeline mode + admin control extensions
- Added `--mode` CLI arg to pipeline script (`full`, `dry_run`, `manual_no_update`, `reprocess`)
- `manual_no_update`: fetches + classifies → writes `out/manual-autopilot-preview.json` → appends run log → no public data changes
- Added `routeItem()` and `buildRouteReason()` routing logic
- Added `headline` field to OpenAI classification prompt
- Admin control page: "Run manual check — no updates" button with result panel
- Admin control page: proposed changes table (vendor/tool/route/confidence/freshness/source/headline/reason)
- Admin control page: 3 copy buttons (full JSON / human-readable / ChatGPT review prompt)
- Admin control page: "How the autopilot works" collapsible explainer (9 sections)
- Admin control page: run log extended with Auto/Review/Alert columns
- Created `.github/workflows/pricing-intelligence.yml` (daily schedule + `workflow_dispatch` with mode input)
- **Files:** `scripts/daily-pricing-intelligence.mjs`, `src/pages/admin/PricingIntelligenceControlPage.tsx`, `.github/workflows/pricing-intelligence.yml`

### [faae5f9] Global freshness indicators + admin intelligence pages
- Created `FreshnessIndicator.tsx` (full + compact modes; green/yellow/red; live≤3d, recent≤14d, stale>14d)
- Updated `pricingFreshness.ts` with new thresholds and `freshnessStatus()`
- Applied FreshnessIndicator to: PricingPage, ComparePage, AlternativesPage, WorthItPage, BestPage, AiPricingTrackerPage, PricingHistoryPage (column)
- Pipeline: added `freshnessTimestamp` + `freshnessStatus: "live"` to enriched items
- Pipeline: added append-only `pipeline-run-log.json` write on each run
- Created `/admin/pricing-intelligence-review` (approve/reject items, localStorage, analytics)
- Created `/admin/pricing-intelligence-control` (status cards, dry-run, reprocess, sources tab, run log)
- Added 6 new pipeline analytics events to `analytics.ts`
- Added new links to `AdminNav.tsx`
- **Files:** Many — see freshness-system-audit.md

---

## 2026-04-25 (approximate)

### [abe99f3] AI Pricing Tracker + Pricing History
- Added `/insights/ai-pricing-tracker` page
- Added `/pricing-history` page with full history table
- Pipeline script `daily-pricing-intelligence.mjs` created
- `pipeline-run-log.json` seeded
- `trusted-pricing-sources.json` added to frontend data dir

### Earlier commits
- MVP: all public pages, calculator, compare, pricing, alternatives, worth-it, best-of, guides, AI types, decision engine, models, resources, contact, about, legal pages
- i18n (EN + ZH)
- GA4 analytics
- SEO components
- Affiliate CTAs
- Sitemap preview
- Site search (SearchBox)
- Admin panel foundation
