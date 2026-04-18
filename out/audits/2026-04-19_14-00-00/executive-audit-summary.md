# Executive Audit Summary — `2026-04-19_14-00-00`

**Branch:** `feature/sitewide-interaction-hardening` @ `6f6de1e`
**Pages crawled:** 56 · **Decision-engine scenarios:** 20 · **Calculator presets:** 4
**Compared against:** `2026-04-18_19-07-13` (baseline)

## Headline

The previous audit's six P0/P1 blockers have been **substantially addressed**: the calculator now produces dynamic numeric output, every comparison/best/calculator/decision-engine page carries a sponsored CTA, every page emits exactly one canonical, and the five duplicate-title hub pages now have unique SEO titles.

Two structural blockers remain, plus one fixed-this-cycle and two polish items.

## Top-5 prioritized issues

| # | ID    | Sev | Where                                          | Issue                                                                  |
|---|-------|-----|-------------------------------------------------|------------------------------------------------------------------------|
| 1 | P0-A  | P0  | `/decision-engine`                              | Only 2 unique recommendations across 20 scenarios (`Copilot Free`, `Gemini Free`) — scorer ignores budget, frequency, quality |
| 2 | P0-B  | P0  | 13 commercial pages (all `/guides/*`, `/ai-types`, `/resources`) | Zero outbound sponsored CTAs; the entire long-form content corpus is non-monetized |
| 3 | P1-A  | P1  | `/calculator`                                   | Verdict copy identical for $0.02/mo and $850/mo (uniqueVerdicts = 1/4) |
| 4 | P1-B  | P1  | `/guides`                                       | Hub had no SEO meta — **FIXED in this run** (PageSeo added) |
| 5 | P2-A  | P2  | audit harness                                   | Browser exhaustion at ~37 routes — **FIXED in this run** (chunked + dev-banner filter) |

Full schema in `top-5-issues.json`.

## Delta vs baseline

| Issue Type                              | Prior | Now | Δ |
|-----------------------------------------|------:|----:|---|
| `calculator_static_output`              | 1     | 0   | ✅ resolved |
| `decision_engine_low_diversity` (recs)  | 2 of 30 | 2 of 20 | ⚠️ structural fix shipped, scorer still flat |
| `no_outbound_cta_on_commercial_page`    | ~30   | 13  | 🟡 −57%; remainder concentrated in `/guides/*` |
| `duplicate_title`                       | ~7    | 0   | ✅ resolved |
| `missing_canonical`                     | ~6    | 0   | ✅ resolved |
| `missing_meta_description`              | ~6    | 0   | ✅ resolved |
| `duplicate_h1`                          | ~5    | 0   | ✅ resolved |

## Recommended next sprint (in order)

1. **P0-A — Fix the decision-engine scorer.** Without this, the headline product is broken. Estimate: 1–2 hrs in `DecisionEngine.tsx` to make the `budget`/`frequency`/`quality` axes actually move the picked model.
2. **P0-B — Add `WinnerBlock` + sponsored CTA to all 11 `/guides/*` articles, `/ai-types`, `/resources`.** Highest revenue per LOC on the entire site. Estimate: 2–3 hrs (mostly data wiring, the component + resolver already exist).
3. **P1-A — Tier the calculator verdict copy by monthly cost.** 30-min change in `Calculator.tsx`.

## Files in this run

```
out/audits/2026-04-19_14-00-00/
├── run-meta.json
├── top-5-issues.json            ← prioritized JSON for downstream tooling
├── fix-priority.md              ← detailed fix sheet
├── executive-audit-summary.md   ← this file
├── site/reports/issues.json     ← 13 site issues + decision/calc roll-ups
├── site/reports/pages.json      ← raw per-page SEO harvest (56 pages)
├── decision/results.json        ← 20-scenario decision-engine matrix
└── decision/calc.json           ← 4-preset calculator matrix
```
