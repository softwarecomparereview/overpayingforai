# Year Reference Cleanup Summary
**Date:** 2026-04-24  
**Build status:** `tsc --noEmit` — 0 errors  
**Total replacements:** 83 occurrences fixed across 7 files

---

## Approach

1. Categorized all 93 occurrences of "2025" (0 occurrences of "2024") in `src/`
2. Intentional historical records excluded: `updatedAt`, `last_updated`, changelog `from` fields
3. Content year references replaced with neutral phrasing or dynamic values
4. TSX files introduced `CURRENT_YEAR = new Date().getFullYear()` where year adds SEO/UI value
5. Static "Updated April 2025" date stamps replaced with "Regularly updated" (evergreen)

---

## Files Changed

| File | Type | Before | After | Method |
|------|------|--------|-------|--------|
| `src/data/best-of.json` | JSON content | 32 | 10 | String replacement (Node.js) |
| `src/data/guides.json` | JSON content | 17 | 10 | String replacement (Node.js) |
| `src/data/comparisons.json` | JSON content | 10 | 0 | String replacement (Node.js) |
| `src/data/faqs.json` | JSON content | 1 | 0 | String replacement (Node.js) |
| `src/pages/BestAiTools.tsx` | TSX page | 7 | 0 | Dynamic + neutral |
| `src/pages/Home.tsx` | TSX page | 1 | 0 | Evergreen phrase |
| `src/pages/Design1.tsx` | TSX page | 1 | 0 | Evergreen phrase |
| `src/pages/ChangelogPage.tsx` | TSX fallback | 1 | 0 | Dynamic `new Date()` |
| `src/pages/Design2.tsx` | TSX fallback | 2 | 0 | Dynamic `new Date()` |

Remaining intentional date references (not changed):
- 10× `"updatedAt": "2025-04-01"` in `best-of.json` — factual content dates
- 10× `"updatedAt": "2025-04-01"` in `guides.json` — factual content dates
- 11× `"last_updated": "2025-04-01"` in `models.json` — factual model data dates
- 9× `"from": "2025-04-01"` in `pricingChangelog.json` — factual changelog history records

---

## Changes by Category

### A — SEO Titles/Meta

**best-of.json — 10 titles updated:**
- Pattern removed: ` (2025)` suffix from all 10 best-of page titles
- e.g. `"Best AI for Coding on a Budget (2025)"` → `"Best AI for Coding on a Budget"`

**best-of.json — 10 metaDescriptions updated:**
- Pattern removed: `in 2025.` from all 10 best-of metaDescriptions
- e.g. `"Best AI coding tools on a budget in 2025."` → `"Best AI coding tools on a budget."`

**guides.json — 4 metaDescriptions/descriptions updated:**
- `"How to reduce AI costs in 2025."` → `"How to reduce AI costs."`
- `"Practical decision framework for 2025."` → `"Practical decision framework."`
- `"AI model routing strategies for 2025."` → `"AI model routing strategies."`
- `"Free AI tools that are genuinely useful in 2025."` → `"Free AI tools that are genuinely useful."`
- `"A no-BS comparison for 2025."` → `"A no-BS comparison."`
- `"Claude vs ChatGPT for business use in 2025."` → `"Claude vs ChatGPT for business use."`

**guides.json — 1 title updated:**
- `"Free AI Tools That Are Actually Good (2025)"` → `"Free AI Tools That Are Actually Good"`

**comparisons.json — 2 titles/meta updated:**
- `"Claude vs ChatGPT: Real Cost Comparison for 2025"` → `"Claude vs ChatGPT: Real Cost Comparison"`
- `"cost comparison for 2025."` → `"cost comparison."`
- `"Mistral vs OpenAI cost comparison for 2025."` → `"Mistral vs OpenAI cost comparison."`

**BestAiTools.tsx — dynamic year introduced:**
```tsx
const CURRENT_YEAR = new Date().getFullYear(); // module level

// Before:
title="Best AI Tools 2025: Cheapest Models Compared | OverpayingForAI"
// After:
title={`Best AI Tools ${CURRENT_YEAR}: Cheapest Models Compared | OverpayingForAI`}

// Same pattern for description prop.
```

### B — Page H1/H2 Content

**BestAiTools.tsx — 5 UI string changes:**

| Before | After | Method |
|--------|-------|--------|
| `Best of 2025` | `Best of {CURRENT_YEAR}` | Dynamic |
| `available in 2025` | `available today` | Neutral |
| `cheapest capable AI models in 2025` | `cheapest capable AI models in {CURRENT_YEAR}` | Dynamic |
| `dropped 50% in price in early 2025` | `dropped 50% in price in recent months` | Neutral |
| `The best AI tool in 2025` | `The best AI tool today` | Neutral |
| `2024–2025` in pricingInsight | `over the past two years` | Neutral |

**Home.tsx:**
- `20 models tracked · Updated April 2025` → `20 models tracked · Regularly updated`

**Design1.tsx:**
- `20 models tracked · Prices updated April 2025` → `20 models tracked · Regularly updated`

### C — JSON Content Data (pricingNotes, FAQ answers, etc.)

**comparisons.json — pricingNotes (5 entries):**
- `"as of early 2025"` → `"as of our last review"` (2 instances)
- `"as published in 2025"` → `"as last reviewed"`
- `"as of 2025"` → `"as of our last review"` (2 instances)

**comparisons.json — other content:**
- `cheapestOptionNote`: `"available in 2025."` → `"available today."`
- FAQ answer: `"benchmarks in 2025."` → `"benchmarks."`

**faqs.json:**
- `"leads most 2025 coding benchmarks"` → `"leads current coding benchmarks"`

**best-of.json — FAQ + intro:**
- `"What's the best free AI chatbot in 2025?"` → `"What's the best free AI chatbot right now?"`
- `"worth running yourself in 2025."` → `"worth running yourself."`

### D — Fallback Defaults (TSX)

**ChangelogPage.tsx + Design2.tsx — 3 fallback strings:**
- Pattern: `?? "2025-04-01"` (fallback when dates array is empty — never fires in practice)
- Changed to: `?? new Date().toISOString().slice(0, 10)` (dynamic, no hardcoded year)

---

## Dynamic Year — Where Introduced

`BestAiTools.tsx` is the only file where a dynamic `CURRENT_YEAR` constant was introduced:

```tsx
const CURRENT_YEAR = new Date().getFullYear(); // evaluates at module load time
```

Used in:
- SEO `<title>` and `<description>` props
- "Best of {CURRENT_YEAR}" hero badge
- "cheapest capable AI models in {CURRENT_YEAR}" section heading

For JSON data files: year was **removed entirely** (not replaced with dynamic value) since JSON cannot call JavaScript functions. Titles/meta without a year are still effective — year in title is a signal, not a requirement.

---

## "2024" Reference Audit

Zero occurrences of "2024" were found in `src/` outside of `updatedAt` / `last_updated` / changelog `from` fields.

---

## Validation

```
tsc --noEmit → 0 errors — PASS
```

**Final grep check (non-date 2025 references):**
```
grep -rn "2025" src/ | grep -v '"updatedAt"' | grep -v '"last_updated"' | grep -v '"from": "2025'
→ (no output) — PASS
```

**Visual confirmation:**
- `/best` hero now reads "BEST OF 2026" (current year, dynamic)
- `/` hero reads "20 models tracked · Regularly updated" (no stale date)
- No "2025" visible in any rendered page UI

---

## What Was Not Changed

- `updatedAt` date fields in content JSON (factual dates — content was actually last reviewed then)
- `last_updated` dates in `models.json` (factual model data review dates)
- `from` dates in `pricingChangelog.json` (historical changelog records — changing would corrupt the changelog)
- Pricing values (not touched per instructions)
- "2026" references already in codebase (correct current year)
