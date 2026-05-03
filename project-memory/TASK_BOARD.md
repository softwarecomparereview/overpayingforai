# Task Board — OverpayingForAI

**Last updated:** 2026-05-03

---

| ID | Title | Status | Depends On | Last Updated | Output |
|----|-------|--------|------------|--------------|--------|
| T001 | MVP public pages | Complete | — | 2026-04 | 33 public routes |
| T002 | AI Pricing Tracker + History | Complete | T001 | 2026-04 | /insights/ai-pricing-tracker, /pricing-history |
| T003 | Global FreshnessIndicator | Complete | T002 | 2026-05-03 | FreshnessIndicator.tsx, pricingFreshness.ts |
| T004 | Admin: pricing-intelligence-review | Complete | T003 | 2026-05-03 | /admin/pricing-intelligence-review |
| T005 | Admin: pricing-intelligence-control | Complete | T003 | 2026-05-03 | /admin/pricing-intelligence-control |
| T006 | Pipeline: freshnessTimestamp + run log | Complete | T005 | 2026-05-03 | pipeline-run-log.json |
| T007 | Pipeline: manual_no_update mode | Complete | T006 | 2026-05-03 | out/manual-autopilot-preview.json |
| T008 | GitHub Actions workflow | Complete | T007 | 2026-05-03 | .github/workflows/pricing-intelligence.yml |
| T009 | Admin control: manual-no-update UI | Complete | T007 | 2026-05-03 | Result panel, copy buttons, ChatGPT export |
| T010 | Admin control: explainer section | Complete | T009 | 2026-05-03 | Collapsible "How autopilot works" |
| T011 | Mobile navigation fix | Complete | T001 | 2026-05-03 | SearchBox.tsx, Layout.tsx |
| T012 | Project memory system | Complete | — | 2026-05-03 | /project-memory/ (20 files) |
| T013 | Fix homepage mobile overflow | Complete | T011 | 2026-05-03 | Home.tsx (min-w-[600px] removed) |
| T014 | Set OPENAI_API_KEY in GHA | Planned | T008 | — | Live pipeline runs |
| T015 | Dismiss/archive for review queue | Planned | T004 | — | /admin/pricing-intelligence-review |
| T016 | Code splitting admin pages | Planned | — | — | Smaller initial bundle |
| T017 | Add Audit link to mobile nav | Planned | T011 | — | Layout.tsx |
