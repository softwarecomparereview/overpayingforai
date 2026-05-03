# Project Memory — OverpayingForAI

**Last updated:** 2026-05-03  
**Commit:** 53d042d (pre-fix) → phase-006 pending commit  
**Branch:** developphase2

---

## 1. Project Overview

**Product:** overpayingforai.com  
**Purpose:** AI cost-comparison SPA — helps users find the cheapest AI setup for their usage pattern. Compares ChatGPT, Claude, Gemini, API pricing, and more.  
**Owner:** Aniruddh  
**Stage:** Live MVP with active feature development

---

## 2. Current Product State

- Full public site live with pricing, compare, alternatives, worth-it, best-of, calculator, decision engine, guides, AI types, resources, tracker, history pages
- Global freshness indicators on all pricing-related pages (live/recent/stale with color coding)
- AI Pricing Tracker and Pricing History with per-entry freshness
- Admin panel with 7 admin pages (all behind AdminGuard)
- Pricing intelligence autopilot pipeline with 4 run modes
- GitHub Actions workflow for scheduled and manual pipeline runs
- Mobile hamburger nav fixed (SearchBox mousedown race condition)
- Homepage mobile overflow fixed (min-w-[600px] on savings grid removed)
- TypeScript + Vite build clean

---

## 3. Architecture Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 7 + Wouter (routing) + Tailwind CSS 4 |
| State | React useState/useEffect (no global store) |
| Data | Static JSON files in `src/data/` (SSG-like) |
| Backend | Express API server (port 8080) + Drizzle ORM + PostgreSQL |
| Monorepo | pnpm workspaces |
| i18n | react-i18next (EN + ZH) |
| Analytics | GA4 via custom `trackGaEvent` / `trackPageView` |
| Auth (admin) | localStorage key `overpaying_admin`, value `refresh` |
| CI/CD | GitHub Actions (`.github/workflows/pricing-intelligence.yml`) |
| Deployment | Replit (dev), production via Replit publish |

**Artifact locations:**
- Web app: `artifacts/overpaying-for-ai/` (port 18972)
- API server: `artifacts/api-server/` (port 8080)
- Mockup sandbox: `artifacts/mockup-sandbox/`

**Key data files (`src/data/`):**
- `ai-pricing-news.json` — daily digest (pipeline output)
- `pricing-history.json` — append-only history
- `pipeline-run-log.json` — run log (last 50 runs)
- `trusted-pricing-sources.json` — source registry copy for frontend
- `ai-models.json` — model registry

---

## 4. Implemented Features

### Public Pages
- `/` — Homepage hero + CTA
- `/calculator` — AI cost calculator
- `/best/:slug` — Best-of lists
- `/compare/:slug` — Head-to-head comparisons (6 slugs)
- `/pricing/:slug` — Per-vendor pricing pages (ChatGPT, Claude, Gemini)
- `/worth-it/:slug` — Worth-it analysis
- `/alternatives/:slug` — Alternative recommendations
- `/ai-types`, `/ai-types/:slug` — AI type browser
- `/guides`, `/guides/:slug` — Guides
- `/decision-engine` — Interactive decision tool
- `/models` — Model explorer
- `/resources` — Resources hub
- `/contact`, `/about`, `/affiliate-disclosure`, `/privacy-policy`, `/terms`, `/media-kit`, `/changelog`
- `/insights/ai-pricing-tracker` — AI Pricing Tracker (live feed)
- `/pricing-history` — Full pricing history table

### Global Freshness System
- `FreshnessIndicator` component: full + compact modes, green/yellow/red
- Thresholds: ≤3 days = Live, ≤14 days = Recent, >14 days = Stale
- Applied to: PricingPage, ComparePage, AlternativesPage, WorthItPage, BestPage, AiPricingTrackerPage, PricingHistoryPage (column)

### Admin Pages (all behind AdminGuard, key = ***REDACTED***)
- `/admin/pricing-refresh` — Manual pricing refresh
- `/admin/affiliates` — Affiliate management
- `/admin/affiliate-audit` — Affiliate audit
- `/admin/sitemap-preview` — Sitemap preview
- `/admin/audits` — Audit runner
- `/admin/pricing-intelligence-review` — Pipeline item review (approve/reject)
- `/admin/pricing-intelligence-control` — Pipeline control panel

### Pricing Intelligence Pipeline
- `scripts/daily-pricing-intelligence.mjs`
- 4 modes: `full`, `dry_run`, `manual_no_update`, `reprocess`
- `manual_no_update`: fetches + classifies + writes `out/manual-autopilot-preview.json` + appends run log — no public data changes
- GitHub Actions: `.github/workflows/pricing-intelligence.yml`
- Run log: append-only, last 50 entries

### Admin Control Page Features
- "Run manual check — no updates" button with result panel
- Proposed changes table (vendor, tool, route, confidence, freshness, source, headline, reason)
- Copy buttons: full JSON / human-readable / ChatGPT review prompt
- "How the autopilot works" collapsible explainer (9 sections)
- Run log with Auto/Review/Alert candidate counts

---

## 5. Known Gaps

- No unit tests (testing disabled in current environment)
- Admin key is a static localStorage secret — no session expiry
- Pipeline requires `OPENAI_API_KEY` secret in GitHub Actions (not set in dev)
- `manual_no_update` in admin UI is a simulation (uses existing data) — real mode runs via CLI/GHA
- No server-side rendering — fully client-side SPA
- Bundle >500kb (code splitting not yet done)

---

## 6. Roadmap

See `ROADMAP.md` for details.

**Near-term priorities:**
1. Set up `OPENAI_API_KEY` in GitHub Actions for live pipeline runs
2. Add dismiss/archive to pricing intelligence review page
3. Code splitting for admin pages (bundle >500kb)
4. Add "Audit" link to mobile nav

---

## 7. Current Active Phase

**Phase:** Post-MVP Feature Extension  
**Last completed:** Homepage mobile overflow fix (phase-006)  
**Active task:** None — ready for next task

---

## 8. Key Decisions

See `DECISION_LOG.md` for full log.

- **Wouter** chosen over React Router (lighter, adequate for SPA)
- **Static JSON data files** for pricing data — avoids DB dependency for content
- **localStorage AdminGuard** — pragmatic for solo maintainer, no auth server needed
- **Append-only history** — prevents accidental data loss from pipeline reruns
- **FreshnessIndicator** thresholds: 3 days live, 14 days recent
- **SearchBox mousedown fix**: removed `onClose` from native DOM listener
- **Homepage overflow fix**: removed `min-w-[600px]` from savings grid — `grid-cols-2` sufficient for mobile

---

## 9. Risks

See `RISK_REGISTER.md` for full register.

- Static admin key leakage risk
- OpenAI cost risk from unbounded pipeline runs
- Data staleness if pipeline fails silently

---

## 10. Validation Status

- TypeScript: ✅ 0 errors (last run: 2026-05-03)
- Vite build: ✅ clean, 205 modules
- All 33 public routes: ✅ HTTP 200
- Admin routes: ✅ HTTP 200
- Mobile nav: ✅ fixed (phase-004)
- Homepage mobile overflow: ✅ fixed (phase-006)

---

## 11. Latest Task Summary

**Homepage mobile overflow fix (phase-006):**
- Root cause: `min-w-[600px] sm:min-w-0` on savings strip grid in `Home.tsx` — at 390px viewport, `sm:` never activates, grid forces body to 600px
- Fix: removed `min-w-[600px] sm:min-w-0` from grid div; removed `overflow-x-auto` from parent section
- Desktop layout unchanged (`sm:grid-cols-4` still activates at 640px+)
- File: `src/pages/Home.tsx`

---

## 12. Next Recommended Action

1. Set `OPENAI_API_KEY` in GitHub Actions to enable live pipeline runs
2. Add dismiss/archive to pricing intelligence review queue
3. Code splitting for admin pages (reduce initial bundle)
