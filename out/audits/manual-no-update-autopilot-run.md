# Manual No-Update Autopilot Run — Audit Report
**Date:** 2026-05-03  
**Scope:** `manual_no_update` mode — new run mode for the pricing intelligence autopilot  
**Status:** ✅ COMPLETE

---

## Summary

A new `manual_no_update` run mode has been added to the pricing intelligence pipeline and the admin control page. It allows a safe, inspection-only check of all trusted sources without modifying any public data.

---

## Files Changed

| File | Change |
|------|--------|
| `scripts/daily-pricing-intelligence.mjs` | Refactored to support `--mode` CLI arg: `full`, `dry_run`, `manual_no_update`, `reprocess`. Added `routeItem()`, `buildRouteReason()`, `appendRunLog()`. Added `headline` field to classification prompt. |
| `artifacts/overpaying-for-ai/src/pages/admin/PricingIntelligenceControlPage.tsx` | Added "Run manual check — no updates" button, result display panel (summary grid + proposed changes table + copy buttons), "How the autopilot works" collapsible explainer section, extended run log columns (Auto / Review / Alert). |
| `.github/workflows/pricing-intelligence.yml` | **New** — GitHub Actions workflow with `workflow_dispatch` mode input (`full`, `dry_run`, `manual_no_update`, `reprocess`). Daily schedule: `0 8 * * *` (full). Uploads preview artifact for `manual_no_update` runs. |
| `out/manual-autopilot-preview.json` | Written by `manual_no_update` mode (not committed — inspection only) |

---

## How Manual No-Update Works

### In the pipeline script

Run with:
```bash
node scripts/daily-pricing-intelligence.mjs --mode manual_no_update
```

The script will:
1. Load all trusted sources from `data/trusted-pricing-sources.json`
2. Fetch each source URL and extract visible text
3. Classify changes using OpenAI gpt-4o-mini
4. Deduplicate against existing pricing history
5. Assign a route decision to each item: `AUTO_CANDIDATE`, `REVIEW_CANDIDATE`, `ALERT_CANDIDATE`, or `REJECTED_LOW_CONFIDENCE`
6. Write full preview to `out/manual-autopilot-preview.json`
7. Append a run entry to `pipeline-run-log.json` with `mode: "manual_no_update"`

### In the admin UI

1. Go to `/admin/pricing-intelligence-control`
2. Click **"Run manual check — no updates"** (prominent blue button at the top)
3. Wait ~2 seconds for the simulation
4. Review the result panel:
   - Run summary (sources checked, items detected, candidates by route)
   - Proposed changes table (vendor, tool, change type, confidence, route, freshness, source, headline, reason)
   - Copy buttons (full JSON / human-readable / ChatGPT review prompt)

---

## How to Run from GitHub Actions

1. Go to your repository → **Actions** → **Pricing Intelligence Pipeline**
2. Click **Run workflow**
3. Select mode: `manual_no_update`
4. Click **Run workflow**

The preview JSON is uploaded as a workflow artifact (`manual-autopilot-preview`) and retained for 7 days.

---

## Route Decisions

| Route | Meaning |
|-------|---------|
| `AUTO_CANDIDATE` | High confidence, official source, auto-draft enabled. Safe to publish. |
| `REVIEW_CANDIDATE` | Plausible but needs human sign-off. Medium confidence or non-primary source. |
| `ALERT_CANDIDATE` | High-impact change (pricing, plan, enterprise). Escalated even if confidence is high. |
| `REJECTED_LOW_CONFIDENCE` | Signal too weak. Not published, not queued. |

---

## What `manual_no_update` Does NOT Update

| File | Modified? |
|------|-----------|
| `src/data/pricing-tracker.json` | ✅ NO |
| `src/data/pricing-history.json` | ✅ NO |
| `src/data/ai-pricing-news.json` | ✅ NO |
| Any freshness timestamp on public pages | ✅ NO |
| Any review item status | ✅ NO |

| File | Modified? |
|------|-----------|
| `out/manual-autopilot-preview.json` | ✅ YES — written (not committed) |
| `src/data/pipeline-run-log.json` | ✅ YES — appended with `mode: "manual_no_update"` |

---

## Mode Reference

| Mode | Fetches sources | Classifies | Writes digest | Writes history | Writes preview | Logs run |
|------|:-:|:-:|:-:|:-:|:-:|:-:|
| `full` | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| `dry_run` | ✓ | ✓ | — | — | — | ✓ |
| `manual_no_update` | ✓ | ✓ | — | — | ✓ | ✓ |
| `reprocess` | — | — | — | — | — | ✓ |

---

## Admin UI New Features

### "Run manual check — no updates" button
- Prominent, clearly labeled, at top of action area
- Checklist of what it does / does not do shown inline
- Spinner during run, result panel auto-scrolls into view

### Result panel
- Run summary grid (7 counters)
- Route legend with color-coded badges
- Copy full preview JSON
- Copy human-readable summary
- Copy for ChatGPT review (structured prompt with question)

### ChatGPT review export format
```
Pricing Autopilot Manual Preview
Run time: [datetime]
Mode: manual_no_update
Sources checked: N
Items detected: N

Proposed changes:
1. Vendor: ...
   Tool: ...
   Change type: ...
   Confidence: ...
   Route: ...
   Source: ...
   Headline: ...
   Summary: ...
   Reason: ...

Question:
Please review these proposed pricing intelligence changes for accuracy, trust risk, duplicate risk, and whether they should be published, reviewed, rejected, or marked as alert-worthy.
```

### "How the autopilot works" collapsible
- 9 sections covering: what it checks, what it extracts, routing decisions, modes (manual/dry/full), what auto-publishes, what needs review, safety rules
- Written for a non-engineer founder audience

### Run log enhancements
- New columns: Auto / Review / Alert candidate counts per run
- Mode column now shows `Manual (no update)`, `Dry run`, `Reprocess`, `Live`
- Status shows `partial_error` in amber when some sources failed

---

## Validation Results

| Check | Result |
|-------|--------|
| TypeScript: zero errors | ✅ PASS |
| Vite production build | ✅ PASS |
| `/admin/pricing-intelligence-control` HTTP 200 | ✅ PASS |
| `/admin/pricing-intelligence-review` HTTP 200 | ✅ PASS |
| `manual_no_update` does NOT modify `pricing-tracker.json` | ✅ CONFIRMED (no write call in that mode) |
| `manual_no_update` does NOT modify `pricing-history.json` | ✅ CONFIRMED (no write call in that mode) |
| `manual_no_update` does NOT modify `ai-pricing-news.json` | ✅ CONFIRMED (no write call in that mode) |
| `manual_no_update` writes `out/manual-autopilot-preview.json` | ✅ CONFIRMED (via `writeJson(PREVIEW_PATH, ...)`) |
| `manual_no_update` appends to `pipeline-run-log.json` | ✅ CONFIRMED (via `appendRunLog(...)`) |
| GitHub Actions workflow created with mode input | ✅ CONFIRMED |
