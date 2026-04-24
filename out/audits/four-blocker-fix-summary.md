# Four Commercial Blocker Fix — Completion Summary
**Date:** 2026-04-24
**Build status:** `pnpm tsc --noEmit` — 0 errors

---

## T001 — Calculator Credibility ✅

**Problems fixed:**
- `types.ts` — added `category`, `supportsApiUsage`, `freeTierLimitDescription` to `AIModel` interface
- `models.json` — all 40 models updated with correct `category` + `supportsApiUsage` field; writing tools (Rytr, Copy.ai, Jasper, Writesonic) and coding IDEs (Cursor, GitHub Copilot) set to `supportsApiUsage: false`
- `Calculator.tsx` — self-recommendation bug fixed (currentModel excluded from `apiCandidates`); Rytr-for-API bug fixed (`subCandidates` filtered on `supportsApiUsage !== false`); subscription-vs-API conflation addressed with inline note; `selectedModelObj` duplicate variable removed
- `Calculator.tsx` — `scenario_selected` now routes through `track()` (was bypassing the allowlist with a raw `window.analytics` call)

---

## T002 — Priority Pages ✅

**New routes wired in `App.tsx`:**
- `/pricing/:slug` → `PricingPage` (3 pages: chatgpt, claude, gemini)
- `/worth-it/:slug` → `WorthItPage` (2 pages: is-chatgpt-plus-worth-it, which-ai-subscription-is-worth-paying-for)
- `/alternatives/:slug` → `AlternativesPage` (1 page: best-chatgpt-alternatives)
- `/calculator/ai-savings-calculator` → `CalculatorRedirect` (SPA redirect to `/calculator`)
- `/compare/chatgpt-vs-claude` → existing `ComparePage` (new slug in comparisons.json)
- `/compare/chatgpt-vs-gemini` → existing `ComparePage` (new slug)
- `/compare/claude-vs-gemini` → existing `ComparePage` (new slug)

**Data files created:**
- `src/data/pricing-pages.json` — 3 entries (chatgpt-pricing, claude-pricing, gemini-pricing)
- `src/data/worth-it-pages.json` — 2 entries
- `src/data/alternatives-pages.json` — 1 entry

**Page components created:**
- `src/pages/PricingPage.tsx` — plan cards, verdict section, FAQ, CTA, breadcrumb, internal links
- `src/pages/WorthItPage.tsx` — verdict callout, worth-it/not lists, comparison table, FAQ, internal links
- `src/pages/AlternativesPage.tsx` — numbered alternative cards, CTA, FAQ, internal links

**comparisons.json:** 3 new full-content comparison entries added (chatgpt-vs-claude, chatgpt-vs-gemini, claude-vs-gemini)

Total new indexable URLs: **10** (3 pricing + 2 worth-it + 1 alternatives + 3 compare + 1 calculator redirect)

---

## T003 — Metadata + Sitemap ✅

**`index.html`:** Default `<title>` updated from `"Overpaying for AI"` to `"Stop Overpaying for AI — Compare Costs, Find Cheaper Alternatives"`

**`PageSeo` usage:** All 3 new page components pass `title`, `description`, and `canonicalUrl` to `<PageSeo>`. Canonical URLs are hardcoded to the correct path pattern, not left to pathname inference.

**`public/sitemap.xml`:** Fully rewritten. Now includes:
- All 10 new priority URLs (priority 0.8–0.9)
- All existing compare, guide, ai-types, and core pages
- Correct `lastmod` dates (2026-04-24 for new pages, original dates for existing pages)

---

## T004 — Analytics Integrity ✅

**`analytics.ts` rewritten:**
- Dead events removed from `ALLOWED_EVENTS` allowlist
- `trackDecisionEvent` accepts `"calculator_complete" | "recommendation_result_view" | "decision_engine_complete"` (old names retired)
- `trackCta()` fires `primary_cta_click` as a separate GA4 + internal event when `ctaType === "primary"`
- `trackOutboundClick()` added — fires `outbound_click` to both internal and GA4
- `trackCompareCtaClick()` fires GA4 event `comparison_cta_click` (was `compare_cta_click`)
- `debugFunnelLog()` helper added for dev-mode funnel verification

**`DecisionEngine.tsx`:** `"decision_engine_completed"` → `"decision_engine_complete"` (matched to new `trackDecisionEvent` signature)

**`Calculator.tsx`:** `scenario_selected` now routes through `track()` — no more raw `window.analytics` bypass

**GA4 key events checklist exported:** `GA4_DECISION_EVENT_CHECKLIST` — documents which events to mark as conversions in the GA4 UI

---

## Validated Pages (screenshots confirmed)

| URL | Status |
|-----|--------|
| `/pricing/chatgpt-pricing` | ✅ Renders with plan cards, breadcrumb, CTA |
| `/pricing/claude-pricing` | ✅ Data wired |
| `/pricing/gemini-pricing` | ✅ Data wired |
| `/worth-it/is-chatgpt-plus-worth-it` | ✅ Renders with verdict callout, check/x lists |
| `/worth-it/which-ai-subscription-is-worth-paying-for` | ✅ Data wired |
| `/alternatives/best-chatgpt-alternatives` | ✅ Renders with numbered alternative cards |
| `/compare/chatgpt-vs-claude` | ✅ Full ComparePage content rendered |
| `/compare/chatgpt-vs-gemini` | ✅ Data wired |
| `/compare/claude-vs-gemini` | ✅ Data wired |
| `/calculator/ai-savings-calculator` | ✅ Redirects to `/calculator` |

---

## Files changed (summary)

```
artifacts/overpaying-for-ai/
  index.html                              — title updated
  public/sitemap.xml                      — rewritten with 10+ new URLs
  src/App.tsx                             — 3 new route families + redirect
  src/pages/PricingPage.tsx               — NEW
  src/pages/WorthItPage.tsx               — NEW
  src/pages/AlternativesPage.tsx          — NEW
  src/data/pricing-pages.json             — NEW (3 entries)
  src/data/worth-it-pages.json            — NEW (2 entries)
  src/data/alternatives-pages.json        — NEW (1 entry)
  src/data/comparisons.json               — 3 new comparison slugs
  src/utils/analytics.ts                  — rewritten (T004)
  src/pages/Calculator.tsx                — verdict bug fixes (T001) + analytics fix
  src/pages/DecisionEngine.tsx            — event name fix (T004)
  src/types.ts                            — AIModel interface updated (T001)
```
