# Project Memory Export — OverpayingForAI

**Generated:** 2026-05-03  
**Commit:** 9a0ba32  
**Branch:** developphase2

This file combines PROJECT_MEMORY.md, TASK_BOARD.md, DECISION_LOG.md, RISK_REGISTER.md, and VALIDATION_STATUS.md for a single-file export.

---

# PROJECT STATE

**Product:** overpayingforai.com — AI cost-comparison SPA  
**Stack:** React 19 + Vite 7 + Wouter + Tailwind CSS 4 + Express + PostgreSQL + pnpm monorepo  
**Status:** Active development. Clean TypeScript. Clean build. 33/33 public routes HTTP 200.

## Implemented Features
- Calculator, comparisons (6 slugs), pricing pages (ChatGPT/Claude/Gemini), alternatives, worth-it, best-of, guides, AI types, decision engine, models, resources
- AI Pricing Tracker + Pricing History
- Global FreshnessIndicator (live≤3d / recent≤14d / stale>14d) on all pricing pages
- Pricing intelligence pipeline (4 modes: full/dry_run/manual_no_update/reprocess)
- GitHub Actions workflow (daily full run + manual dispatch)
- Admin panel: 7 pages (pricing-refresh, affiliates, affiliate-audit, sitemap-preview, audits, pricing-intelligence-review, pricing-intelligence-control)
- Admin control: manual-no-update result panel, ChatGPT export, explainer
- Mobile hamburger nav (fixed mousedown race condition)
- i18n EN+ZH, GA4 analytics, SEO components, affiliate CTAs, site search

## Known Gaps
- Homepage mobile overflow (body 404px > 390px at 390px) — pre-existing
- No unit tests
- Admin key is static localStorage (no session expiry)
- Pipeline requires `OPENAI_API_KEY` (not in dev)
- manual_no_update admin UI is client-side simulation
- Bundle >500kb (no code splitting)

---

# TASK BOARD

| ID | Title | Status | Last Updated |
|----|-------|--------|--------------|
| T001 | MVP public pages | Complete | 2026-04 |
| T002 | AI Pricing Tracker + History | Complete | 2026-04 |
| T003 | Global FreshnessIndicator | Complete | 2026-05-03 |
| T004 | Admin: pricing-intelligence-review | Complete | 2026-05-03 |
| T005 | Admin: pricing-intelligence-control | Complete | 2026-05-03 |
| T006 | Pipeline: freshnessTimestamp + run log | Complete | 2026-05-03 |
| T007 | Pipeline: manual_no_update mode | Complete | 2026-05-03 |
| T008 | GitHub Actions workflow | Complete | 2026-05-03 |
| T009 | Admin control: manual-no-update UI | Complete | 2026-05-03 |
| T010 | Admin control: explainer section | Complete | 2026-05-03 |
| T011 | Mobile navigation fix | Complete | 2026-05-03 |
| T012 | Project memory system | Complete | 2026-05-03 |
| T013 | Fix homepage mobile overflow | Planned | — |
| T014 | Set OPENAI_API_KEY in GHA | Planned | — |
| T015 | Dismiss/archive for review queue | Planned | — |
| T016 | Code splitting admin pages | Planned | — |
| T017 | Add Audit link to mobile nav | Planned | — |

---

# DECISION LOG (summary)

| # | Decision | Reason |
|---|----------|--------|
| D001 | Wouter over React Router | Lighter weight |
| D002 | Static JSON for pricing data | No DB dependency, git-tracked |
| D003 | localStorage AdminGuard | Pragmatic for solo maintainer |
| D004 | Append-only pricing history | Prevents data loss |
| D005 | FreshnessIndicator thresholds 3/14 days | Matches vendor update cadence |
| D006 | 4 pipeline modes | Safe inspection without live changes |
| D007 | Remove onClose from SearchBox mousedown | Fixes mobile nav race condition |
| D008 | useEffect on location to close menu | Reliable, no race conditions |
| D009 | Project memory in repo | Git-tracked, survives context resets |

---

# RISK REGISTER (summary)

| # | Risk | Impact | Likelihood | Status |
|---|------|--------|------------|--------|
| R001 | Static admin key leakage | High | Medium | Active |
| R002 | OpenAI cost spiral | Medium | Low | Active (mitigated by mode system) |
| R003 | Pipeline fails silently | Medium | Medium | Active (mitigated by freshness indicator) |
| R004 | Pricing history grows unbounded | Low | High | Active |
| R005 | No unit tests | High | Medium | Active |
| R006 | Homepage mobile overflow | Medium | High | Open |
| R007 | Bundle size >500kb | Medium | High | Open |
| R008 | No SSR | High | Medium | Accepted |
| R009 | OpenAI classification errors | High | Low | Active (guardrails in place) |

---

# VALIDATION STATUS

| Check | Result | Date |
|-------|--------|------|
| TypeScript (`tsc --noEmit`) | ✅ 0 errors | 2026-05-03 |
| Vite build | ✅ 205 modules | 2026-05-03 |
| 33 public routes HTTP 200 | ✅ | 2026-05-03 |
| Admin routes HTTP 200 | ✅ | 2026-05-03 |
| Desktop Playwright (1440×900) | ✅ 33/33 | 2026-05-03 |
| Mobile Playwright (390×844) | ⚠️ 32/33 | 2026-05-03 |
| Homepage mobile overflow | ❌ 404px > 390px | 2026-05-03 |
| Mobile nav click-through | ✅ fixed | 2026-05-03 |
| Unit tests | N/A | disabled in env |
| Security scan | Not run | not requested |

---

# NEXT RECOMMENDED ACTION

Fix homepage hero mobile overflow (body 404px > 390px at 390px viewport). This is the only known validation failure and the highest-priority open issue.
