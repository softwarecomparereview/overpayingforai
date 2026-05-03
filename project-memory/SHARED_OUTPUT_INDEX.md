# Shared Output Index — OverpayingForAI

**Last updated:** 2026-05-03

This file indexes all significant output files produced during development.

---

## Audit Reports (`out/audits/`)

| File | Date | Description |
|------|------|-------------|
| `freshness-system-audit.md` | 2026-05-03 | Full freshness indicator system audit — all pages, validation results |
| `manual-no-update-autopilot-run.md` | 2026-05-03 | Manual no-update mode audit — how it works, what it changes, validation |
| `mobile-navigation-fix.md` | 2026-05-03 | Mobile nav fix — root cause, files changed, before/after, validation |
| `daily-pricing-intelligence-summary.md` | 2026-04-25 | Initial pipeline summary |
| `latest/` | ongoing | Playwright audit screenshots and reports |

---

## Pipeline Outputs (`out/`)

| File | Written by | Description |
|------|-----------|-------------|
| `out/manual-autopilot-preview.json` | `scripts/daily-pricing-intelligence.mjs --mode manual_no_update` | Full classification preview — no public data changes |

---

## Data Files (`artifacts/overpaying-for-ai/src/data/`)

| File | Written by | Description |
|------|-----------|-------------|
| `ai-pricing-news.json` | Pipeline `full` mode | Daily digest of classified pricing items |
| `pricing-history.json` | Pipeline `full` mode | Append-only history of all detected changes |
| `pipeline-run-log.json` | All pipeline modes | Run log, last 50 entries |
| `trusted-pricing-sources.json` | Manual / copied from `data/` | Source registry for frontend display |
| `ai-models.json` | Manual | Model registry for comparisons |

---

## GitHub Actions

| Workflow | File | Trigger | Modes |
|----------|------|---------|-------|
| Pricing Intelligence Pipeline | `.github/workflows/pricing-intelligence.yml` | Daily `0 8 * * *` + `workflow_dispatch` | full / dry_run / manual_no_update / reprocess |

---

## Project Memory (`project-memory/`)

| File | Purpose |
|------|---------|
| `PROJECT_MEMORY.md` | Full project state, architecture, features, gaps |
| `PROJECT_MEMORY.json` | Structured JSON for programmatic use |
| `ROADMAP.md` | Completed + planned features |
| `TASK_BOARD.md` | Task status board |
| `DECISION_LOG.md` | Architecture decisions with rationale |
| `RISK_REGISTER.md` | Identified risks with mitigations |
| `ARCHITECTURE_SNAPSHOT.md` | Directory structure, data flow, component map |
| `CHANGELOG.md` | Chronological change log by commit |
| `OPEN_QUESTIONS.md` | Unresolved questions and decisions |
| `PROMPT_HISTORY.md` | Major implementation prompts (redacted) |
| `VALIDATION_STATUS.md` | Latest check results |
| `SHARED_OUTPUT_INDEX.md` | This file |
| `shared-export/LATEST_STATUS_FOR_CHATGPT.md` | Concise status for external AI reviewer |
| `shared-export/PROJECT_MEMORY_EXPORT.md` | Full combined export |
| `shared-export/LATEST_PHASE_SUMMARY.md` | Latest phase/task summary |
| `phase-reports/phase-001-mvp.md` | MVP phase report |
| `phase-reports/phase-002-freshness-admin.md` | Freshness + admin phase report |
| `phase-reports/phase-003-manual-no-update.md` | Manual no-update mode phase report |
| `phase-reports/phase-004-mobile-nav-fix.md` | Mobile nav fix phase report |
| `phase-reports/phase-005-project-memory.md` | Project memory setup phase report |
