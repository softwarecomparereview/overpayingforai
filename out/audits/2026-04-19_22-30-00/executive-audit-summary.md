# Executive Audit Summary — `2026-04-19_22-30-00`

**Branch:** `latestdevelop` @ `d342901`
**Pages crawled:** 56 · **Decision-engine scenarios:** 20/20 · **Calculator presets:** 4
**Compared against:** `2026-04-19_14-00-00`

## Headline

Both remaining P0 blockers from the previous audit are **resolved**:

| Metric                                           | Before (14-00) | After (22-30) | Target  | Status |
|--------------------------------------------------|---------------:|--------------:|---------|--------|
| Site issues                                      | 13             | **0**         | 0       | ✅ |
| Decision-engine unique recommendations           | 2 (of 20)      | **10** (of 20) | ≥ 6    | ✅ |
| Pages with no outbound sponsored CTA             | 13             | **0**         | 0       | ✅ |
| Calculator unique totals (4 presets)             | 4              | **4**         | 4       | ✅ |
| Duplicate titles / missing canonicals / dup H1s  | 0              | **0**         | 0       | ✅ |

## What changed

### P0-A — Decision-engine scoring diversity (2 → 10 recs)

Refactored `src/engine/recommender.ts`:

- `scoreModel()` now composes 5 explicit weighted axes (`useCaseFitScore`, `budgetFitScore`, `qualityCostScore`, `planFitScore`, `freeTierScore`) instead of one tangled function.
- Added `USE_CASE_TAGS` aliases so `research` matches `long-context`/`rag`/`reasoning`, `automation` matches `high-volume`, etc.
- Heavy usage now meaningfully penalises free subscriptions (rate-limit risk) and rewards API plans.
- `quality=best` increases qualityScore weight to 0.65; `quality=cheap` increases costScore weight to 0.55.
- Eligibility filter softened — over-budget models get a graded penalty instead of being excluded outright when the pool would collapse.
- Balanced/premium tiers are derived from independent picks: `premium` = highest qualityScore in the use-case-fit pool; `cheapest` = lowest spend in the use-case-fit pool; `balanced` = highest score that isn't either of those.
- `buildReasoning()` now explicitly cites budget, frequency, quality, and use case in every recommendation.

Also fixed `qa/full-audit.mjs` decision-engine sampling: stride was `floor(360/20)=18`, which is even and divides 18, so `freeTier=true / quality=cheap / frequency=light` were locked across all 20 samples. Switched to stride `19` (coprime to 360) so all five axes vary independently.

**Distribution across the 20 sampled scenarios:**

| Recommendation         | Count |
|------------------------|------:|
| Gemini Free            | 5     |
| GitHub Copilot Free    | 4     |
| Rytr                   | 2     |
| Groq (Llama 3.1 70B)   | 2     |
| Claude 3.5 Sonnet      | 1     |
| Llama 3.1 70B          | 1     |
| Cursor Free            | 1     |
| DeepSeek R1            | 1     |
| ChatGPT Free           | 1     |
| ChatGPT Plus           | 1     |

### P0-B — Outbound sponsored CTAs on commercial pages (13 → 0 failing)

Data-only fixes (`src/data/guides.json`):
- Added `winnerBlock` to 9 guides that had none.
- Fixed `how-to-reduce-ai-cost` (had a `winnerBlock` with empty `providerId`, which resolved to an internal `/calculator` link and counted as 0 outbound).

Page-level fixes (added Featured-tools strips wired through `getPrimaryCta()`):
- `src/pages/GuidePage.tsx` → `GuideIndex` (the `/guides` hub)
- `src/pages/ResourcesHub.tsx` → `/resources`
- `src/pages/AiTypeIndex.tsx` → `/ai-types` hub

All four strips use the existing `affiliateResolver.ts` path (no parallel CTA registry). Each card is `<a target="_blank" rel="noopener noreferrer sponsored">` with a stable `data-testid="*-cta-<providerId>"` for tracking.

## Files changed

```
artifacts/overpaying-for-ai/src/engine/recommender.ts          (rewritten — weighted scoring)
artifacts/overpaying-for-ai/src/data/guides.json               (+9 winnerBlocks, 1 fix)
artifacts/overpaying-for-ai/src/pages/GuidePage.tsx            (+ Featured-tools strip on hub)
artifacts/overpaying-for-ai/src/pages/ResourcesHub.tsx         (+ Recommended-tools strip)
artifacts/overpaying-for-ai/src/pages/AiTypeIndex.tsx          (+ Featured-tools strip)
artifacts/overpaying-for-ai/src/pages/DecisionEngine.tsx       (liveRationale extended)
qa/full-audit.mjs                                              (stride 18 → 19 + mod-bound)
```

## Remaining items (not in this pass)

- **P1 — calculator verdict copy** still produces `uniqueVerdicts=1/4`. Out of scope for this pass; tracked.
- **All 12 affiliate providers still use `directUrl` (homepage) fallbacks** — no live `affiliateUrl` yet. Outbound + `rel="sponsored"` is still emitted (so audits pass), but swap each as programs are approved in `src/data/affiliates.ts`. No page edits required.

## Files in this run

```
out/audits/2026-04-19_22-30-00/
├── run-meta.json
├── top-5-issues.json
├── executive-audit-summary.md   ← this file
├── site/reports/issues.json     ← []
├── site/reports/pages.json      ← 56 pages
├── decision/results.json        ← 20/20 scenarios, 10 unique
└── decision/calc.json           ← 4/4 unique totals
```
