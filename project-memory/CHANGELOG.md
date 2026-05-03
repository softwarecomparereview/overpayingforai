# Changelog — OverpayingForAI

**Format:** `[YYYY-MM-DD] [commit] — Description`

---

## 2026-05-03

### [pending] Homepage mobile overflow fix
- **Root cause:** `min-w-[600px] sm:min-w-0` on savings strip grid in `Home.tsx` — at 390px viewport, `sm:` (640px) never activates → grid forces body to 600px wide → horizontal scroll
- **Fix:** Removed `min-w-[600px] sm:min-w-0` from grid div; removed now-redundant `overflow-x-auto` from parent section
- **Desktop:** Unchanged — `sm:grid-cols-4` still activates at 640px+
- **Files:** `src/pages/Home.tsx`

### [53d042d] Project memory system created
- Created `/project-memory/` with 20 files: PROJECT_MEMORY.md, PROJECT_MEMORY.json, ROADMAP.md, TASK_BOARD.md, DECISION_LOG.md, RISK_REGISTER.md, ARCHITECTURE_SNAPSHOT.md, CHANGELOG.md, OPEN_QUESTIONS.md, PROMPT_HISTORY.md, VALIDATION_STATUS.md, SHARED_OUTPUT_INDEX.md, 5 phase reports, 3 shared exports

### [9a0ba32] Mobile navigation fix
- **Root cause:** SearchBox `mousedown` document listener called `onClose()` before nav link `click` could fire, unmounting the menu
- **Fix:** Removed `onClose()` from mousedown handler in `SearchBox.tsx`; added `useEffect([location])` in `Layout.tsx`
- **Fix:** Mobile nav link touch targets bumped to `min-h-[44px]`
- **Files:** `src/components/search/SearchBox.tsx`, `src/components/Layout.tsx`

### [979fbd8] Manual no-update pipeline mode + admin control extensions
- Added `--mode` CLI arg to pipeline script (`full`, `dry_run`, `manual_no_update`, `reprocess`)
- `manual_no_update`: fetches + classifies → writes `out/manual-autopilot-preview.json` + run log entry → NO public data changes
- Route decisions: AUTO_CANDIDATE / REVIEW_CANDIDATE / ALERT_CANDIDATE / REJECTED_LOW_CONFIDENCE
- Admin control page: "Run manual check — no updates" button with result panel, proposed changes table, 3 copy buttons (JSON / readable / ChatGPT prompt)
- Admin control page: "How the autopilot works" collapsible explainer (9 sections)
- GitHub Actions: `.github/workflows/pricing-intelligence.yml`
- **Files:** `scripts/daily-pricing-intelligence.mjs`, `src/pages/admin/PricingIntelligenceControlPage.tsx`, `.github/workflows/pricing-intelligence.yml`

### [faae5f9] Global freshness indicators + admin intelligence pages
- Created `FreshnessIndicator.tsx` (full + compact modes; green/yellow/red; live≤3d, recent≤14d, stale>14d)
- Updated `pricingFreshness.ts` with new thresholds and `freshnessStatus()`
- Applied to: PricingPage, ComparePage, AlternativesPage, WorthItPage, BestPage, AiPricingTrackerPage, PricingHistoryPage
- Pipeline: `freshnessTimestamp` + `freshnessStatus: "live"` per item + append-only run log
- Created `/admin/pricing-intelligence-review` and `/admin/pricing-intelligence-control`
- 6 new GA4 analytics events

---

## 2026-04-25 (approximate)

### [abe99f3] AI Pricing Tracker + Pricing History
- `/insights/ai-pricing-tracker` and `/pricing-history`
- Pipeline script `daily-pricing-intelligence.mjs` created
- `pipeline-run-log.json` seeded

### Earlier
- MVP: all 33 public routes, calculator, comparisons, pricing, alternatives, worth-it, best-of, guides, AI types, decision engine, models, resources, legal
- i18n EN + ZH, GA4 analytics, SEO components, affiliate CTAs, admin panel foundation
