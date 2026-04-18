# Site & Decision-Engine Audit

Two production-grade Playwright audits for **overpayingforai.com**:

1. **`scripts/site-audit.js`** — crawls the public site, takes screenshots, and grades every page for SEO basics, CTAs, monetization signals, and visual completeness.
2. **`scripts/decision-engine-audit.js`** — drives the live calculator and decision-engine pages with a configurable scenario matrix, captures every input/output pair, and reports on consistency and trust risk.

Both scripts run independently, write structured artifacts under `out/`, and continue on per-page / per-scenario failures.

---

## Folder layout

```
scripts/
  site-audit.js
  decision-engine-audit.js
  lib/
    crawler.js       # BFS crawler with retry, dedup, networkidle wait
    extractors.js    # Page snapshot + heuristics (CTA / pricing / recommendation / bare)
    screenshots.js   # Full-page + above-the-fold captures
    utils.js         # URL normalization, slugify, CSV writer, dedup helpers

out/
  reports/                       (site audit)
    pages.json
    pages.csv
    issues.json
    summary.md
  screenshots/
    full/<slug>.png
    hero/<slug>.png
  decision-audit/                (decision-engine audit)
    results.json
    results.csv
    summary.md
    screenshots/<scenarioId>.png

README-audit.md
```

---

## Install

The scripts reuse the Playwright install already vendored at
`qa/node_modules/playwright`. If you are starting from a clean checkout you
only need to install Playwright's browsers once:

```bash
# one-time, downloads Chromium/Firefox/WebKit
npx playwright install
```

If `playwright` is not yet installed at all, install it inside `qa/`:

```bash
cd qa && npm install playwright && npx playwright install && cd ..
```

No other dependencies are required — the scripts use Node 18+ built-ins
(`fs`, `path`, `node:module`) plus Playwright.

---

## Run — site audit

```bash
# Full default crawl (up to 100 pages, headless, with screenshots)
node scripts/site-audit.js

# Smaller smoke run
node scripts/site-audit.js --maxPages=20

# Different seeds
node scripts/site-audit.js --seeds=https://overpayingforai.com/best,https://overpayingforai.com/compare

# Skip screenshots for speed
node scripts/site-audit.js --noScreenshots

# Headed (watch the browser)
node scripts/site-audit.js --headless=false
```

### CLI flags

| flag              | default | meaning                                                         |
|-------------------|---------|-----------------------------------------------------------------|
| `--maxPages`      | `100`   | hard cap on pages crawled                                       |
| `--seeds`         | 4 seeds | comma-separated starting URLs                                   |
| `--headless`      | `true`  | `false` to watch the browser                                    |
| `--timeout`       | `30000` | per-navigation timeout in ms                                    |
| `--width`/`--height` | `1366`/`900` | desktop viewport                                       |
| `--noScreenshots` | off     | disables screenshot capture (much faster)                       |

### What gets recorded per page

`title`, `metaDescription`, `h1`, all `h2`s, `canonical`, `robots`,
internal/outbound link counts, outbound domain set, visible CTA text,
detection flags (`hasPricingText`, `hasRecommendationBlock`,
`hasLikelyAffiliateLink`, `isCommercial`, `visuallyBare`), section count,
table count, JSON-LD count, navigation timing, and screenshot paths.

### Issues detected

`missing_title`, `missing_meta_description`, `missing_h1`,
`missing_canonical`, `duplicate_title`, `duplicate_h1`, `no_cta`,
`no_outbound_cta_on_commercial_page`, `low_internal_link_count`,
`bare_page`, `possible_broken_link`,
`missing_recommendation_block_on_commercial_page`,
`missing_pricing_context_on_commercial_page`, `navigation_error`.

`out/reports/summary.md` rolls these up with prioritized actions.

---

## Run — decision-engine audit

```bash
# Default: ~60 scenarios across the cross-product of dimensions
node scripts/decision-engine-audit.js

# Bigger run
node scripts/decision-engine-audit.js --maxScenarios=120

# Headed
node scripts/decision-engine-audit.js --headless=false

# Hit a different environment (e.g. preview deploy)
node scripts/decision-engine-audit.js --base=https://preview.overpayingforai.com
```

### CLI flags

| flag             | default                              | meaning                       |
|------------------|--------------------------------------|-------------------------------|
| `--base`         | `https://overpayingforai.com`        | target site                   |
| `--maxScenarios` | `60`                                 | cap on decision-engine runs   |
| `--headless`     | `true`                               |                               |
| `--timeout`      | `30000`                              | navigation timeout            |

### Scenario matrix

Defined at the top of `scripts/decision-engine-audit.js` in the `DIMENSIONS`
object:

```js
const DIMENSIONS = {
  useCase:  ["writing", "coding", "research", "summarization", "chatbot",
             "image generation", "data analysis", "translation"],
  budget:   ["under $20", "$20-$50", "$50-$200", "no budget cap"],
  priority: ["cheapest", "best quality", "fastest", "balanced"],
  volume:   ["light (a few/day)", "medium (hourly)", "heavy (continuous)"],
  team:     ["solo", "startup", "team"],
};
```

Edit those arrays to broaden / narrow coverage. The runner builds the
cross-product, dedupes, and caps to `--maxScenarios`.

The calculator phase additionally runs four token-volume presets (`tiny`,
`light`, `medium`, `heavy`) against `/calculator`.

### What gets captured per scenario

`scenarioId`, exact `inputs`, `recommendedTool`, `alternatives[]`,
`pricingText`, `confidenceText`, `freshnessText`, `explanation`,
the raw visible result block (`resultText`), and a screenshot path.
Failed scenarios get `error` plus a `-FAIL.png` screenshot and a small
DOM excerpt.

### Trust-risk summary

`out/decision-audit/summary.md` highlights:
- recommendations shared across many scenarios (one-tool-fits-all risk),
- scenarios with weak/missing explanation,
- scenarios with no pricing context,
- scenarios with no alternatives,
- generic-sounding outputs,
- failures.

---

## Tuning

- **Crawl size:** `--maxPages` (site audit). Start small (`20`), then grow.
- **Scenario count:** `--maxScenarios` (decision audit). 30–60 is usually
  enough to spot patterns; raise to 120+ before launches.
- **Screenshots:** disable with `--noScreenshots` for fast smoke runs.
- **Headed debugging:** add `--headless=false` to either script to watch
  what Playwright is doing in real time.

---

## Troubleshooting

**`Executable doesn't exist at .../chromium-XXXX/...`**
Run `npx playwright install` (one-time browser download).

**`net::ERR_CONNECTION_REFUSED` / timeouts**
The target host may be down or behind a WAF. Try:
- `--headless=false` to confirm visually,
- a single seed: `--seeds=https://overpayingforai.com/`,
- `--timeout=60000`.

**Empty `recommendedTool` everywhere**
The harvester targets common landmarks (`section`, `article`,
`[data-result]`, `[data-recommendation]`, `[data-testid*=result]`). If the
decision-engine UI uses different markup, extend the selector list inside
`harvestResultBlock()` in `scripts/decision-engine-audit.js`.

**Calculator inputs not discovered**
`discoverCalcInputs()` matches labels with regex (`tokens`, `model`).
If your calculator uses different copy, edit those regexes at the top of
`scripts/decision-engine-audit.js`.

**Replit-specific: long first run**
The first `npx playwright install` downloads ~150MB of browsers and may
take 1–2 minutes. Subsequent runs are fast.

**Scripts halt on first failure**
They don't — both scripts continue past per-page / per-scenario errors and
record them in the output. If the entire process exits, look at the final
stack trace; usually it's a missing browser binary.
