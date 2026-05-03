# Daily Pricing Intelligence — Implementation Summary

Generated: 2026-05-02

---

## Files Changed

### New files created

| File | Purpose |
|------|---------|
| `data/trusted-pricing-sources.json` | Registry of trusted pricing sources (script-only, not in frontend) |
| `artifacts/overpaying-for-ai/src/data/ai-pricing-news.json` | Daily digest — overwritten each run by the pipeline script |
| `artifacts/overpaying-for-ai/src/data/pricing-history.json` | Append-only history — never overwritten, only appended |
| `scripts/daily-pricing-intelligence.mjs` | Daily pipeline script (Node ESM, no external deps) |
| `.github/workflows/daily-pricing-intelligence.yml` | GitHub Actions workflow for scheduled + manual runs |
| `artifacts/overpaying-for-ai/src/pages/AiPricingTrackerPage.tsx` | Public tracker page — shows latest 10 changes |
| `artifacts/overpaying-for-ai/src/pages/PricingHistoryPage.tsx` | Historical pricing page — filterable full log |
| `out/audits/daily-pricing-intelligence-summary.md` | This file |

### Modified files

| File | Change |
|------|--------|
| `artifacts/overpaying-for-ai/src/App.tsx` | Added imports and routes for both new pages |
| `artifacts/overpaying-for-ai/src/utils/analytics.ts` | Added 4 new events to `ALLOWED_EVENTS` set |

---

## Routes Added

| Route | Component | Description |
|-------|-----------|-------------|
| `/insights/ai-pricing-tracker` | `AiPricingTrackerPage` | Latest 10 pricing/news changes with confidence badges |
| `/pricing-history` | `PricingHistoryPage` | Full filterable history table with trend display |

---

## Data Files Added

| File | Format | Update strategy |
|------|--------|----------------|
| `data/trusted-pricing-sources.json` | JSON array | Manual — edit to add/remove sources |
| `src/data/ai-pricing-news.json` | JSON object with `items` array | Overwritten daily by pipeline |
| `src/data/pricing-history.json` | JSON array | Append-only — never overwritten |

---

## How to Run Locally

### Prerequisites

```bash
export OPENAI_API_KEY=sk-...
```

### Run the pipeline script

```bash
node scripts/daily-pricing-intelligence.mjs
```

Outputs:
- `artifacts/overpaying-for-ai/src/data/ai-pricing-news.json` — today's digest
- `artifacts/overpaying-for-ai/src/data/pricing-history.json` — updated with new entries

### Preview the pages

```bash
pnpm --filter @workspace/overpaying-for-ai run dev
```

Then open:
- http://localhost:18972/insights/ai-pricing-tracker
- http://localhost:18972/pricing-history

---

## How to Run Manually in GitHub Actions

1. Go to **Actions** tab in the GitHub repository
2. Select **Daily AI Pricing Intelligence** workflow
3. Click **Run workflow**
4. Optionally set `dry_run = true` to fetch and classify without committing
5. Results are always uploaded as artifacts regardless of dry run setting

---

## Guardrails Respected

- **No database added** — all storage is JSON files
- **No backend added** — no Express routes, no server-side infrastructure
- **No Supabase / Firebase / Postgres / Redis** — not present
- **No auto-merge to main** — workflow commits only to the current branch, never main
- **No force push** — workflow uses `git push origin HEAD:${{ github.ref_name }}`
- **OpenAI not treated as source of truth** — used only for classification; all items carry original source URL
- **No unsourced claims** — items with no source URL are rejected
- **History never overwritten** — append-only with deduplication by `vendor+tool+changeType+sourceUrl+detectedDate`
- **Untrusted sources always require review** — `requiresReview=false` only for `high` confidence + official source + `allowedForAutoDraft: true`
- **No unrelated pages/components modified** — only `App.tsx` and `analytics.ts` touched
- **Build continues to work** — no breaking changes to existing architecture

---

## Known Limitations

1. **HTML text extraction is naive** — uses regex-based tag stripping, not a DOM parser. Some pages with heavy JavaScript rendering may yield little useful text.
2. **OpenAI rate limits** — script does not implement retry logic. If rate-limited, the affected source is skipped with an error log.
3. **No redirect chain depth limit** — `fetchUrl` follows one redirect level only.
4. **Source registry is static** — `data/trusted-pricing-sources.json` must be updated manually when vendors add/remove pricing pages.
5. **Prices are summarised, not parsed** — the script does not extract structured `{old_price, new_price}` fields; those are part of the AI summary text only.
6. **Pages show empty state until first run** — `ai-pricing-news.json` and `pricing-history.json` ship empty; real data appears after the first successful pipeline run.

---

## Next Recommended Improvements

1. **Structured price extraction** — extend the OpenAI prompt to return `{ oldValue, newValue, unit }` fields for pricing_change items, enabling numeric trend charts.
2. **Email/Slack alert on high-confidence changes** — trigger a notification when a `requiresReview=false` item is detected.
3. **Source health monitoring** — log when a fetch returns non-200 repeatedly and surface a stale-source warning on the tracker page.
4. **Richer text extraction** — use a headless browser (e.g. Playwright, already available in the repo) for JS-rendered pages to improve coverage.
5. **Admin review UI** — add an `/admin/pricing-intelligence-review` page where a human can approve/reject `requiresReview=true` items before they surface publicly.
