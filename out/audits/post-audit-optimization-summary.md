# Post-Audit Optimization Summary
**Date:** 2026-04-24  
**Source:** `/out/audits/post-fix-quality-audit.md`  
**Build status:** `tsc --noEmit` — 0 errors

---

## Files Changed

| File | Change |
|------|--------|
| `src/data/comparisons.json` | Added contextual internal links to 3 compare slugs |
| `src/data/alternatives-pages.json` | Replaced hardcoded DeepSeek pricing with safer wording |
| `src/pages/Calculator.tsx` | Added interaction gate to `recommendation_result_view` |

---

## Task 1 — Internal Linking Imbalance Fixed

### Links added

**`/compare/chatgpt-vs-claude`** — added:
- `{ "text": "Claude Pricing Breakdown", "href": "/pricing/claude-pricing" }`

**`/compare/chatgpt-vs-gemini`** — added:
- `{ "text": "Gemini Pricing Breakdown", "href": "/pricing/gemini-pricing" }`

**`/compare/claude-vs-gemini`** — added both:
- `{ "text": "Claude Pricing Breakdown", "href": "/pricing/claude-pricing" }`
- `{ "text": "Gemini Pricing Breakdown", "href": "/pricing/gemini-pricing" }`

### Inbound link counts (after)

| Page | Before | After | Sources |
|------|--------|-------|---------|
| `/pricing/claude-pricing` | 1 | **3** | chatgpt-vs-claude, claude-vs-gemini, which-ai-subscription-is-worth-paying-for |
| `/pricing/gemini-pricing` | 1 | **3** | chatgpt-vs-gemini, claude-vs-gemini, which-ai-subscription-is-worth-paying-for |

All links are contextually relevant — the compare pages directly discuss the tools whose pricing pages they now link to.

---

## Task 2 — Analytics Gating Changed

### What changed

Added a single guard line to the `recommendation_result_view` useEffect in `Calculator.tsx`:

```ts
// Before (line 158):
useEffect(() => {
  if (!result) return;
  const sig = ...

// After:
useEffect(() => {
  if (!result) return;
  // Only fire after the user has interacted with any input (model, tokens, preset, scenario)
  // or has explicitly clicked Calculate. Prevents firing on the default pre-loaded result.
  if (!startedRef.current && calculationCountRef.current === 0) return;
  const sig = ...
```

### Mechanism

`startedRef.current` is set to `true` inside `fireStartOnce()`, which is already called by every user interaction path:
- Model dropdown `onChange`
- Input token slider `onChange`
- Output token slider `onChange`
- Preset button click (`applyPreset`)
- Scenario card click (`applyScenario`)

`calculationCountRef.current` increments when the user explicitly clicks the Calculate button.

The gate fires only if at least one of these is true — i.e., the user has done something.

### Behaviour after change

| Event | Fresh page load | After any input change |
|-------|----------------|----------------------|
| `calculator_open` | **Fires** (unchanged) | — |
| `recommendation_result_view` | **Does not fire** | Fires on first unique input signature |
| `calculator_result_view` | **Does not fire** | Fires alongside recommendation_result_view |

### Browser console confirmation

Before (previous session):
```
analytics calculator_open      {...}
analytics recommendation_result_view  {selected_model: gpt-4o, ...}   ← on load
analytics calculator_result_view      {selected_model: gpt-4o, ...}   ← on load
```

After (live screenshot session):
```
analytics calculator_open      {...}
                                                                        ← nothing else on load
```

`calculator_result_view` was NOT removed — it remains and fires after user interaction, alongside `recommendation_result_view`. This matches the instruction to not remove it unless clearly duplicate/noisy.

---

## Task 3 — DeepSeek Pricing Wording

### Before
```json
"pricingSummary": "API only: ~$0.0004 per 1K input tokens, ~$0.00089 per 1K output tokens."
```

### After
```json
"pricingSummary": "API only. Often among the lowest-cost capable models, but pricing changes frequently — check current DeepSeek pricing before building."
```

No hardcoded token price. Wording is directionally accurate ("among the lowest-cost capable models") without committing to a number that may be stale.

---

## Task 4 — Validation Results

### TypeScript
```
cd artifacts/overpaying-for-ai && pnpm tsc --noEmit
→ (no output) = 0 errors — PASS
```

### Grep: `recommendation_result_view`
```
Calculator.tsx:176:    trackDecisionEvent("recommendation_result_view", viewPayload);
analytics.ts:72:    "recommendation_result_view",   ← allowlist entry
analytics.ts:205:   | "recommendation_result_view"  ← type signature
```
Present in exactly the right places. Not duplicated. Gate confirmed on line 159.

### Grep: `claude-pricing` inbound links
```
comparisons.json: 2 occurrences (chatgpt-vs-claude + claude-vs-gemini)
worth-it-pages.json: 1 occurrence
pricing-pages.json: 1 (self-reference)
Total contextual inbound: 3
```

### Grep: `gemini-pricing` inbound links
```
comparisons.json: 2 occurrences (chatgpt-vs-gemini + claude-vs-gemini)
worth-it-pages.json: 1 occurrence
pricing-pages.json: 1 (self-reference)
Total contextual inbound: 3
```

### `calculator_open` still fires on load
Confirmed in browser console: `analytics calculator_open {pageType: calculator, sourceComponent: Calculator/PageOpen}` — fires unconditionally in its own `useEffect(fn, [])` which is untouched.

---

## Acceptance Criteria — Status

| Criterion | Status |
|-----------|--------|
| Build/typecheck passes | **PASS** — 0 errors |
| Claude pricing has additional inbound links | **PASS** — 1 → 3 |
| Gemini pricing has additional inbound links | **PASS** — 1 → 3 |
| `calculator_open` still fires on page load | **PASS** — confirmed in browser console |
| `recommendation_result_view` no longer fires on untouched default load | **PASS** — confirmed not present in console on fresh load |
| No broad redesign or unrelated changes | **PASS** — 3 files, 5 targeted edits |
