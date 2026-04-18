# Fix Priority — Run `2026-04-19_14-00-00`

Source: `out/audits/2026-04-19_14-00-00/site/reports/issues.json` + `decision/results.json` + `decision/calc.json`
Branch: `feature/sitewide-interaction-hardening` @ `6f6de1e`
Pages crawled: 56 · Decision scenarios: 20 (evenly sampled across 360-combo matrix) · Calculator presets: 4

Tag legend: **Trust** · **Conv** · **SEO** · **UX** · **Data**

---

## Status vs prior baseline `2026-04-18_19-07-13`

| Prior P0/P1               | Status this run | Evidence |
|---------------------------|-----------------|----------|
| P0-1 calculator static    | ✅ FIXED         | uniqueTotals = 4/4 across 5K → 5M token presets; total-cost text changes |
| P0-2 decision = page heading | ⚠️ PARTIAL    | result block + testids ship, but only 2 unique recommendations across 20 scenarios — see new P0-A |
| P0-3 zero outbound CTAs (39 pages) | ⚠️ PARTIAL  | /best/*, /compare/*, /calculator, /decision-engine fixed (✓). 13 commercial pages still missing — see new P0-B |
| P0-4 / P0-5 duplicate titles (5 hub pages) | ✅ FIXED | duplicate_title count = 0 |
| P1-1 missing canonicals    | ✅ FIXED         | missing_canonical = 0 (after /guides hub fix shipped this run) |

---

## P0 — Must fix before traffic push

### P0-A — Decision Engine recommends only 2 unique models across 20 scenarios
- **Affected URL:** `/decision-engine`
- **Evidence:** Even-stride sample of the 5×4×3×3×2 (=360) input matrix returned `GitHub Copilot Free` for every coding scenario and `Gemini Free` for every other use case — regardless of budget (`free` ↔ `premium`), frequency (`light` ↔ `heavy`), or quality preference (`cheap` ↔ `best`).
- **Why it matters:** The structural fix from the prior cycle made the recommendation visible and scrape-able, but the underlying scorer still collapses to 2 outputs. A premium-budget user told to use a free tier loses trust instantly, and every conversion path leads to a non-revenue-generating tool.
- **Fix:** In `src/pages/DecisionEngine.tsx` (or its scoring helper), make `budget`, `frequency`, and `quality` actually shift the picked model. Concretely: `budget=premium && quality=best` → premium paid models (Claude Opus, GPT-4o); `frequency=heavy && budget=free` → flag rate-limit risk and recommend a paid tier. Target ≥6 unique recommendedNames across the 20-scenario matrix.
- **Tag:** Trust · Conv · UX · Data

### P0-B — 13 commercial pages still have zero outbound sponsored CTAs
- **Affected URLs:** `/ai-types`, `/guides` (hub), `/resources`, plus 11 `/guides/*` articles
- **Evidence:** Outbound-link count = 0 after filtering Replit dev banner, LinkedIn footer, GitHub repo. Audit confirms `/best/*`, `/compare/*`, `/calculator`, `/decision-engine` all carry sponsored CTAs ✓.
- **Why it matters:** The `/guides/*` corpus is the highest-volume organic landing surface (long-tail SEO). A 2,000-word guide that recommends Claude Haiku without a clickable affiliate button is the largest revenue gap on the site. The `/ai-types` index and `/resources` hub are also primary CTAs from the homepage.
- **Fix:** For each `/guides/*` article, render a `WinnerBlock` (or equivalent) below the verdict that calls `getPrimaryCta(providerId)` and emits a `<a rel="sponsored" target="_blank">` button. For `/ai-types` and `/resources`, add a sponsored-link grid mirroring `/best`. Re-run audit and target `no_outbound_cta_on_commercial_page = 0`.
- **Tag:** Conv · Trust

---

## P1 — Polish before launch

### P1-A — Calculator verdict text is identical for $0.02/mo and $850/mo
- **Affected URL:** `/calculator`
- **Evidence:** uniqueTotals = 4/4 ✓ but uniqueVerdicts = 1/4 — the qualitative copy beneath the dollar figure does not change as inputs scale 1000×.
- **Why it matters:** Hobbyist and CTO get the same framing; both feel mis-served. The calculator looks half-finished even though the math works.
- **Fix:** In `Calculator.tsx`, derive verdict copy from the computed monthly cost: <$5 → "Stay on free tier"; <$50 → "Subscription is fine"; <$500 → "API + routing pays off"; >$500 → "Negotiate enterprise / volume discount". Target uniqueVerdicts ≥ 3.
- **Tag:** Trust · UX

### P1-B — `/guides` hub had no SEO meta tags (FIXED in this run)
- **Affected URL:** `/guides`
- **Evidence:** First crawl pass: title=`Overpaying for AI`, no description, no canonical. After fix: title=`AI Cost Guides — Cut Your AI Spend | OverpayingForAI`, description set, canonical=`https://overpayingforai.com/guides`.
- **Fix shipped:** `PageSeo` added to `GuideIndex` in `artifacts/overpaying-for-ai/src/pages/GuidePage.tsx` (lines 152–155).
- **Follow-up:** Add a coverage check / shared `HubIndexLayout` so every `/x` index page automatically renders `PageSeo`.
- **Tag:** SEO · Conv

---

## P2 — Audit harness reliability

### P2-A — Long sequential crawls exhaust the headless browser around route ~37
- **Symptom:** Pages 38+ returned `page.goto: Target page, context or browser has been closed`, producing false `missing_h1` / `missing_canonical` flags.
- **Fix shipped:** `qa/full-audit.mjs` now (a) restarts the browser every 25 routes, (b) waits for `h1, main, [data-testid]` before harvesting, (c) filters Replit's dev-banner from the outbound-link count.
- **Tag:** Tooling

---

## Calculator and Decision Engine snapshot

```
calculator: { uniqueTotals: 4/4, uniqueVerdicts: 1/4, dynamic: true }
decision:   { scenarios: 20/20, uniqueRecommendations: 2 }
recommendations seen: ["GitHub Copilot Free", "Gemini Free"]
```
