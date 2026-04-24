# Commercial Fix Priority — overpayingforai.com
**Date:** 2026-04-24  
**Based on:** latest-commercial-audit.md  
**Priority order:** P0 → P5

---

## P0 — Trust-breaking errors (fix before any traffic)

### P0-1: Free tiers pollute every calculator recommendation
**File:** `artifacts/overpaying-for-ai/src/pages/Calculator.tsx` + calculator engine  
**Problem:** `ChatGPT Free` and `Gemini Free` have `monthlySubscriptionCostIfAny = null/undefined`, computed as $0, so they are always the cheapest "alternative" shown. Every result shows "100% savings" with a free tier — making the calculator feel like a joke.  
**Fix:** Exclude free tiers from the "cheaper alternatives" list entirely. Only show paid alternatives with a calculable positive cost. A separate block can note "Free options exist — see `/best`."  
**Files to change:**
```
artifacts/overpaying-for-ai/src/pages/Calculator.tsx — filter out planType=subscription && !monthlySubscriptionCostIfAny in apiCandidates/subCandidates
artifacts/overpaying-for-ai/src/engine/calculator.ts — exclude free models from cheaperAlternatives
```

### P0-2: S7 scenario recommends Rytr for 50M-token API workloads
**Problem:** At massive API scale, the subscription winner becomes Rytr ($9/mo writing tool) because it's the cheapest subscription in the model list. Subscription models and API models must not be compared in the same "winner" race — they serve different purchase intent.  
**Fix:** In the `verdict` logic (Calculator.tsx lines 218–226), only allow API models in the "API winner" slot and subscription models in the "subscription winner" slot. Never pick a subscription writing tool as the winner when the user has selected an API model at scale usage.

### P0-3: S8 calculator recommends Gemini Flash as its own cheaper alternative
**Problem:** When Gemini Flash is the selected model, the global API cheapest is still Gemini Flash — so it appears in its own alternatives list.  
**Fix:** Filter `cheaperAlts` to exclude the currently-selected model ID before displaying.  
**File:** `artifacts/overpaying-for-ai/src/pages/Calculator.tsx` — add `filter(a => a.model.id !== modelId)` to `apiCandidates` before deriving cheapestApi for the verdict.

---

## P1 — Missing first-10 pages or broken indexability

### P1-1: 8 of 10 priority pages do not exist — routes or slugs missing
**Problem:** These high-traffic URL patterns return NotFound content despite HTTP 200:
- `/pricing/chatgpt-pricing`, `/pricing/claude-pricing`, `/pricing/gemini-pricing` — no `/pricing` route
- `/alternatives/best-chatgpt-alternatives` — no `/alternatives` route
- `/worth-it/is-chatgpt-plus-worth-it`, `/worth-it/which-ai-subscription-is-worth-paying-for` — no `/worth-it` route
- `/compare/chatgpt-vs-claude`, `/compare/chatgpt-vs-gemini`, `/compare/claude-vs-gemini` — slugs not in comparisons.json
- `/calculator/ai-savings-calculator` — route mismatch (real route is `/calculator`)

**Fix options (choose one approach per type):**

**Option A — Add redirects** (fastest, no new code):  
Add a `_redirects` file (Cloudflare Pages) mapping each missing path to the best existing equivalent:
```
/pricing/chatgpt-pricing         /calculator?scenario=content-team  301
/pricing/claude-pricing          /calculator?scenario=developer-coding-workflow  301
/pricing/gemini-pricing          /calculator  301
/alternatives/best-chatgpt-alternatives  /best  301
/worth-it/is-chatgpt-plus-worth-it       /guides/is-jasper-worth-it  301
/worth-it/which-ai-subscription-is-worth-paying-for  /guides/when-to-use-api-vs-subscription  301
/compare/chatgpt-vs-claude       /compare/claude-vs-gpt-cost  301
/compare/chatgpt-vs-gemini       /compare/gemini-vs-gpt4o-cost  301
/compare/claude-vs-gemini        /compare  301
/calculator/ai-savings-calculator  /calculator  301
```

**Option B — Add new slugs to comparisons.json** (higher SEO value):  
Add comparison entries with slugs `chatgpt-vs-claude`, `chatgpt-vs-gemini`, `claude-vs-gemini` that point to existing model IDs. These are high-search-volume slugs.

**Option C — Add /pricing and /worth-it routes** (highest SEO value, most work):  
Add route handlers for `/pricing/:slug` and `/worth-it/:slug` in `App.tsx`, backed by data in a new `pricing-pages.json` or by filtering the existing `models.json` and `guides.json`.

**Recommended:** Do Option A immediately (unblocks indexability within hours), then Option B for comparisons (adds real content), then Option C over time.

### P1-2: Sitemap missing 10+ priority pages
**Problem:** sitemap.xml at overpayingforai.com/sitemap.xml is generated from a static list. It is missing:
- All `/compare/:slug` entries beyond 4 (11 total slugs exist)
- All `/guides/:slug` entries beyond 4 (16 total slugs exist)
- No `/pricing/*`, `/worth-it/*`, `/alternatives/*`
**Fix:** Update the sitemap generation to include ALL comparison and guide slugs from their data files. If the sitemap is hardcoded, generate it from `comparisons.json` and `guides.json`.  
**File:** Find sitemap source (likely `artifacts/overpaying-for-ai/public/sitemap.xml` or a build script) and add all slugs.

### P1-3: No SEO metadata in raw HTML (SPA gap)
**Problem:** All pages serve `<title>Overpaying for AI</title>` and no `<meta name="description">` in static HTML. PageSeo sets these via JS, which works for Googlebot but fails for:
- Social media link preview scrapers (LinkedIn, Slack, Twitter)
- Non-JS crawlers (Bing Image Search, many aggregators)
- AI training crawlers (GPTBot, Claude-Web)

**Fix options:**
- **Short term:** Add per-route `<meta>` tags in `index.html` for the most critical pages using Cloudflare Pages redirect rules or Workers to inject metadata server-side.
- **Medium term:** Move to a static site generator (Astro, Next.js) or pre-rendering (vite-plugin-ssr) to generate static HTML with correct per-page metadata.
- **Immediate:** At minimum ensure the default title and description in `index.html` are meaningful ("AI Cost Comparison Tool | OverpayingForAI") rather than the brand name alone.

---

## P2 — Missing CTAs / monetization path

### P2-1: Calculator result has no affiliate CTA for the recommended winner
**Problem:** The calculator verdict block (lines 532–551 in Calculator.tsx) shows the winner model name and cost but does not include an affiliate link to try that model. The AffiliateCta below only fires for the bestSetup alternative (lines 194–197), not for the `verdictWinner`. If the user's usage points to Gemini Flash, there's no "Try Gemini Flash" link.  
**Fix:** Add an AffiliateCta for `verdictWinner` in the verdict block, with `trackingContext.sourceComponent = "Calculator/VerdictBlock"`.

### P2-2: Subscription-selecting users get no upgrade/switch path
**Problem:** When a user selects ChatGPT Plus or Claude Pro, the calculator correctly computes $20/month but then recommends API models with no guidance on the switching process. No CTA exists for "How to cancel ChatGPT Plus" or "Compare Claude Pro vs API".  
**Fix:** Add a contextual CTA when a subscription model is selected: "Considering switching to API? →" linking to `/compare/subscription-vs-api-ai-cost`.

### P2-3: /compare pages lack affiliate CTA for Model A and Model B (non-cheapest)
**Problem:** The ComparePage only adds an affiliate CTA for the cheapest option (`cheapestOption`). Model A and Model B individual model cards have no outbound affiliate links. Users who prefer the more expensive option have no direct signup path.  
**Fix:** Add `AffiliateCta` or a "Try [Model]" link inside each `ModelCard` component, using `modelIdToProviderId()` to resolve the affiliate.

### P2-4: No referral CTA on /guides/* pages
**Problem:** Guide pages (`GuidePage.tsx`) have no affiliate CTAs in the audit. High-intent guides like "is-jasper-worth-it" and "best-ai-tools-under-20" are prime monetization surfaces.  
**Fix:** Add a `CTABlock` or `AffiliateCta` at the bottom of each guide, resolving the affiliate based on the guide's subject matter or defaulting to DeepSeek as cheapest winner.

---

## P3 — Weak internal linking

### P3-1: Compare pages link to a hardcoded slug (claude-vs-gpt-cost)
**Problem:** In ComparePage.tsx line 254, every comparison page's "Recommendation" section links to `/compare/claude-vs-gpt-cost` regardless of the page being viewed. The copy says "See the highest-intent comparison →" — this makes sense from some pages but is generic from others.  
**Fix:** Derive the secondary comparison link from the comparison's own `internalLinks` data array, or make the fallback `/compare` (index) rather than a specific slug.

### P3-2: Calculator internal links are static, not scenario-driven
**Problem:** `CALCULATOR_RELATED_LINKS` in Calculator.tsx is a hardcoded list of 4 links that doesn't change based on the selected scenario or model. A user who selected DeepSeek V3 should see a link to the DeepSeek comparison page, not always the same 4 generic links.  
**Fix:** Make `CALCULATOR_RELATED_LINKS` dynamic — when a model is selected, include a link to its most relevant comparison page.

### P3-3: /best and /ai-types pages have no links to /compare or /calculator
**Problem:** BestPage and AiTypePage components were not found to contain AffiliateCta or InternalLinks components in a spot-check. These are content pages that should funnel users to the calculator.  
**Fix:** Add `InternalLinks` or `CTABlock` at the bottom of BestPage and AiTypePage pointing to `/calculator` and the most relevant comparison.

---

## P4 — Analytics gaps

### P4-1: `outbound_click` event missing for non-affiliate external links
**Problem:** The "Verify with provider" staleness link, guide source links, and any non-affiliate external link fire no analytics event.  
**Fix:** Add a lightweight `trackGaEvent("outbound_click", { url, sourceComponent, pageType })` to all `target="_blank"` links via an `OutboundLink` wrapper component.

### P4-2: Guide page analytics blind spot
**Problem:** `/guides/:slug` pages fire only `page_view`. No CTA events, no read-depth, no internal link click tracking.  
**Fix:** Add `seo_cta_clicked` tracking to guide CTAs (already in the allowlist). Add `guide_view` or `seo_page_viewed` (already in allowlist) on guide mount.

### P4-3: Event name inconsistency — dual naming
**Problem:** Calculator fires both `calculator_complete` (internal) and `calculator_completed` (GA4) for the same click. `recommendation_result_view` is in the allowlist but never fired (the actual event is `calculator_result_view`).  
**Fix:** Align GA4 and internal event names. Standardize on `calculator_complete` (remove trailing "d" from GA4 event or rename internal). Remove `recommendation_result_view` from the allowlist and replace with `calculator_result_view`.

### P4-4: `primary_cta_click` is not a distinct event
**Problem:** The spec requires a separate `primary_cta_click` event. Currently all CTA clicks — primary, secondary, tertiary — fire `affiliate_click` with a `ctaType` parameter. This requires GA4 filtering to isolate, making dashboards harder to build.  
**Fix:** Either add a dedicated `primary_cta_click` event name (fire it in addition to `affiliate_click` when `ctaType === "primary"`), or document in the event map that `affiliate_click` with `cta_type=primary` is the canonical signal.

### P4-5: `scenario_selected` bypasses tracking allowlist
**Problem:** In Calculator.tsx line 138, `scenario_selected` is fired directly via `window.analytics?.track?.()` instead of through the centralized `track()` function. It is also in the ALLOWED_EVENTS set but the bypass means it could fire even if the event name changes.  
**Fix:** Replace the direct `window.analytics` call with `track("scenario_selected", {...})`.

---

## P5 — Copy/design polish

### P5-1: Default title in index.html is weak
**Current:** `<title>Overpaying for AI</title>`  
**Better:** `<title>AI Cost Comparison Tool — Stop Overpaying for AI | OverpayingForAI.com</title>`  
This is the fallback seen by all non-JS scrapers and social preview cards.

### P5-2: Calculator "Best fit: API" verdict copy is too generic
**Current:** `Recommended: Gemini 1.5 Flash (Google) — $0.04/month at your usage. Best fit: API.`  
**Problem:** For low-usage scenarios (< $1/month), this copy is technically accurate but commercially weak. Users don't care about saving $0.07/month.  
**Fix:** For scenarios where the savings < $5/month, change the copy to emphasize quality/capability rather than cost: "At this usage level, cost is negligible. Pick based on quality."

### P5-3: "Comparison not found" page has no recovery CTA
**Current:** `/compare/chatgpt-vs-claude` shows a minimal "Comparison not found" message with a link to home.  
**Fix:** Add a `<CompareIndex>` preview or links to the 3 most relevant comparisons when a slug is not found. This recovers user intent rather than dead-ending them.

### P5-4: robots.txt has no `Crawl-delay` for aggressive bots
**Current:** All bots are allowed with no rate limiting.  
**Consideration:** If server load becomes an issue, add `Crawl-delay: 2` for lower-priority crawlers. Not urgent.
