# Commercial Audit — overpayingforai.com
**Date:** 2026-04-24  
**Audited against:** DontOverpayAI.com commercial execution plan  
**Baseline:** First 10 priority pages

---

## A. Page Existence

> **⚠️ Critical note on HTTP status:** The site is a React SPA (Single-Page Application). Every URL returns HTTP 200 with `index.html`. This means HTTP status codes are unreliable — a page that renders "not found" in React still shows 200 to crawlers. Actual page existence must be verified by slug match in the data layer.

| # | Path | HTTP | Slug exists in data? | Actual rendered state | Title (raw HTML) | Meta description (raw HTML) | Canonical (raw HTML) | H1 (JS-rendered) | Indexable | In sitemap.xml | Blocked by robots.txt |
|---|------|------|---------------------|----------------------|-------------------|------------------------------|----------------------|-------------------|-----------|---------------|-----------------------|
| 1 | /compare/chatgpt-vs-claude | 200 | ❌ NO — slug not in comparisons.json | Renders "Comparison not found" | `Overpaying for AI` (generic) | None in HTML | None in HTML | "Comparison not found" | ❌ No (404 content) | ❌ Missing | No |
| 2 | /pricing/chatgpt-pricing | 200 | ❌ NO — no /pricing route exists | Renders NotFound component | `Overpaying for AI` (generic) | None in HTML | None in HTML | — | ❌ No (404 content) | ❌ Missing | No |
| 3 | /pricing/claude-pricing | 200 | ❌ NO — no /pricing route | Renders NotFound component | `Overpaying for AI` (generic) | None in HTML | None in HTML | — | ❌ No (404 content) | ❌ Missing | No |
| 4 | /alternatives/best-chatgpt-alternatives | 200 | ❌ NO — no /alternatives route | Renders NotFound component | `Overpaying for AI` (generic) | None in HTML | None in HTML | — | ❌ No (404 content) | ❌ Missing | No |
| 5 | /worth-it/is-chatgpt-plus-worth-it | 200 | ❌ NO — no /worth-it route | Renders NotFound component | `Overpaying for AI` (generic) | None in HTML | None in HTML | — | ❌ No (404 content) | ❌ Missing | No |
| 6 | /pricing/gemini-pricing | 200 | ❌ NO — no /pricing route | Renders NotFound component | `Overpaying for AI` (generic) | None in HTML | None in HTML | — | ❌ No (404 content) | ❌ Missing | No |
| 7 | /compare/chatgpt-vs-gemini | 200 | ❌ NO — slug not in comparisons.json | Renders "Comparison not found" | `Overpaying for AI` (generic) | None in HTML | None in HTML | "Comparison not found" | ❌ No (404 content) | ❌ Missing | No |
| 8 | /compare/claude-vs-gemini | 200 | ❌ NO — slug not in comparisons.json | Renders "Comparison not found" | `Overpaying for AI` (generic) | None in HTML | None in HTML | "Comparison not found" | ❌ No (404 content) | ❌ Missing | No |
| 9 | /worth-it/which-ai-subscription-is-worth-paying-for | 200 | ❌ NO — no /worth-it route | Renders NotFound component | `Overpaying for AI` (generic) | None in HTML | None in HTML | — | ❌ No (404 content) | ❌ Missing | No |
| 10 | /calculator/ai-savings-calculator | 200 | ❌ NO — route is /calculator only | Renders NotFound component | `Overpaying for AI` (generic) | None in HTML | None in HTML | — | ❌ No (404 content) | ❌ Missing | No |

**Score: 0/10 priority pages exist as specified.** All 10 are either missing routes or missing data slugs.

### What actually exists (closest real pages):
| Target page | Closest real URL |
|-------------|-----------------|
| /compare/chatgpt-vs-claude | `/compare/claude-vs-gpt-cost` |
| /pricing/chatgpt-pricing | No direct equivalent — covered by `/calculator` and `/models` |
| /pricing/claude-pricing | No direct equivalent |
| /alternatives/best-chatgpt-alternatives | No direct equivalent |
| /worth-it/is-chatgpt-plus-worth-it | `/guides/is-jasper-worth-it` (Jasper only, not ChatGPT) |
| /pricing/gemini-pricing | No direct equivalent |
| /compare/chatgpt-vs-gemini | `/compare/gemini-vs-gpt4o-cost` (exists but different slug) |
| /compare/claude-vs-gemini | Missing — no slug in data |
| /worth-it/which-ai-subscription-is-worth-paying-for | `/guides/when-to-use-api-vs-subscription` (partial) |
| /calculator/ai-savings-calculator | `/calculator` |

### Sitemap.xml Coverage
The sitemap contains 18 URLs. Missing from sitemap:
- All `/pricing/*` pages (route doesn't exist)
- All `/alternatives/*` pages (route doesn't exist)
- All `/worth-it/*` pages (route doesn't exist)
- `/compare/chatgpt-vs-claude`, `/compare/chatgpt-vs-gemini`, `/compare/claude-vs-gemini` (slugs don't exist)
- `/calculator/ai-savings-calculator` (route doesn't match)
- Most `/compare/*` slugs (only 4 of 11 comparisons are in sitemap)
- Most `/guides/*` slugs (only 4 of 16 guides are in sitemap)

### SPA SEO Warning
All pages render the same generic `<title>Overpaying for AI</title>` in the static HTML. PageSeo sets correct titles via JavaScript, but raw HTML served to non-JS crawlers contains no page-specific title, meta description, or canonical. Google's Googlebot will execute JS, but Bing, social scrapers, and AI crawlers may not. This is a structural P1 risk.

### robots.txt
Well-configured. Allows all crawlers (Googlebot, Bingbot, GPTBot, Claude-Web, PerplexityBot). Only `/admin/` is disallowed. No issues.

---

## B. Commercial Page Quality

### Pages that exist and could be assessed:

#### /compare/claude-vs-gpt-cost (closest to #1 priority)
| Signal | Finding |
|--------|---------|
| Above-fold value prop | ✅ Clear: quick verdict box, cost savings badge present |
| Pricing clarity | ✅ Side-by-side model cards with API pricing |
| Comparison table | ✅ Two-column model cards with planType, pricing, best-for |
| Who this is for / not for | ✅ "Best for A / Best for B" sections (QuickDecisionBlock) |
| Recommendation logic | ✅ Cheapest option highlighted with savings label |
| Internal links | ✅ InternalLinks component; links to /calculator, /decision-engine |
| Primary CTA | ✅ "Calculate your exact cost →" above the fold |
| Affiliate/referral CTA | ✅ WinnerBlock with AffiliateCta for cheapest provider |
| Fallback CTA | ✅ Falls back to internal /calculator if no affiliate link |

#### /calculator (closest to #10 priority)
| Signal | Finding |
|--------|---------|
| Above-fold value prop | ✅ "Use this if…" callout box with 3 clear bullets |
| Pricing clarity | ✅ Real-time cost calculation with cost displayed prominently |
| Comparison/value | ✅ Shows cheapest API vs cheapest subscription verdict |
| Who this is for | ✅ Explicit "Use this if…" callout |
| Recommendation logic | ✅ Deterministic, input-driven verdict per scenario |
| Internal links | ✅ CALCULATOR_RELATED_LINKS at page bottom |
| Primary CTA | ⚠️ No outbound CTA on calculator result — only internal links |
| Affiliate CTA | ⚠️ AffiliateCta only shown for top alternative, not for the cheapest winner |
| Fallback CTA | ✅ Falls back to /best if no affiliate target |

#### /compare (index)
| Signal | Finding |
|--------|---------|
| Above-fold value prop | ✅ Dark hero section with clear "fastest paths" sidebar |
| Primary CTA | ✅ "Skip comparison — try the cheap winner" with DeepSeek affiliate CTA |
| Affiliate CTA | ✅ AffiliateCta for DeepSeek |
| Internal links | ✅ Links to /calculator, /decision-engine, /resources |
| Comparison table | ✅ Featured 3 high-intent comparisons + full library grid |

### Missing pages — commercial quality cannot be assessed:
The following 7 priority page types do not exist in the current codebase:
- All `/pricing/:tool-pricing` pages
- All `/alternatives/:topic` pages
- `/worth-it/is-chatgpt-plus-worth-it`
- `/worth-it/which-ai-subscription-is-worth-paying-for`
- `/compare/chatgpt-vs-gemini`
- `/compare/claude-vs-gemini`

These are the highest-intent commercial pages. A user searching "ChatGPT Plus pricing" or "is ChatGPT worth it" lands on a 404-equivalent — no content, no CTA, no affiliate path.

---

## C. Calculator and Decision Engine — 22 Scenario Test

### Test Methodology
Scenarios run against the live calculator engine using actual models.json pricing data. Results reflect what the rendered page shows.

| # | Scenario | Model | Input | Output | Monthly Cost | Verdict | Recommended Winner | Savings | Credible? | Issues |
|---|----------|-------|-------|--------|-------------|---------|-------------------|---------|-----------|--------|
| S1 | Solo Founder (preset) | gpt-4o-mini | 250K | 120K | $0.11/mo | API | Gemini Flash $0.05 | $0.11 (100%) | ⚠️ PARTIAL | "ChatGPT Free $0.00" shown as top alt — trust-breaking |
| S2 | Freelancer (light, GPT-4o) | gpt-4o | 100K | 50K | $0.75/mo | API | Gemini Flash $0.02 | $0.75 (100%) | ⚠️ PARTIAL | Free tiers distort "100% savings" claim |
| S3 | Developer (Claude Sonnet) | claude-3-5-sonnet | 800K | 300K | $6.90/mo | API | Gemini Flash $0.15 | $6.90 (100%) | ✅ YES | Strong: real savings, credible alt |
| S4 | Marketer (ChatGPT Plus) | chatgpt-plus | 500K | 200K | $20.00/mo | API | Gemini Flash $0.10 | $20.00 (100%) | ⚠️ PARTIAL | Comparing subscription vs API at low usage is apples/oranges |
| S5 | Agency (GPT-4o, scale) | gpt-4o | 10M | 4M | $65.00/mo | API | Gemini Flash $1.95 | $65.00 (100%) | ✅ YES | Credible — dramatic, real API gap |
| S6 | Small Team (Claude Pro) | claude-pro | 1M | 500K | $20.00/mo | API | Gemini Flash $0.22 | $20.00 (100%) | ⚠️ PARTIAL | Same subscription vs API apples/oranges issue |
| S7 | API-heavy (GPT-4o, massive) | gpt-4o | 50M | 20M | $325.00/mo | subscription | Rytr $9.00 | $325.00 (100%) | ❌ FLAG | At 50M tokens, recommending Rytr ($9 writing tool) is absurd. Wrong comparison set. |
| S8 | Low-budget (Gemini Flash) | gemini-1-5-flash | 200K | 100K | $0.04/mo | API | Gemini Flash $0.04 | $0.04 (100%) | ❌ FLAG | Recommends itself as "cheaper alt" — circular. Cost so low the calculator is meaningless. |
| S9 | High-usage (GPT-4 Turbo) | gpt-4-turbo | 5M | 2M | $110.00/mo | API | Gemini Flash $0.97 | $110.00 (100%) | ✅ YES | Credible — large legacy model vs modern API |
| S10 | Undecided buyer (Gemini Advanced) | gemini-advanced | 500K | 200K | $20.00/mo | API | Gemini Flash $0.10 | $20.00 (100%) | ⚠️ PARTIAL | $20 subscription vs $0.10 API misleads — usage limits not factored |
| S11 | Dev (DeepSeek V3) | deepseek-v3 | 2M | 800K | $1.51/mo | API | Gemini Flash $0.39 | $1.51 (100%) | ✅ YES | Both cheap — reasonable recommendation |
| S12 | Solo Founder (Claude Haiku) | claude-3-5-haiku | 300K | 100K | $0.64/mo | API | Gemini Flash $0.05 | $0.64 (100%) | ✅ YES | Clean cost comparison |
| S13 | Content Team (ChatGPT Plus) | chatgpt-plus | 1M | 500K | $20.00/mo | API | Gemini Flash $0.22 | $20.00 (100%) | ⚠️ PARTIAL | See S4 — subscription/API conflation |
| S14 | Startup (Gemini 1.5 Pro) | gemini-1-5-pro | 1.5M | 600K | $4.88/mo | API | Gemini Flash $0.29 | $4.88 (100%) | ✅ YES | Credible within-family upgrade |
| S15 | Researcher (o3) | o3 | 200K | 100K | $1.20/mo | API | Gemini Flash $0.04 | $1.20 (100%) | ⚠️ PARTIAL | Capability gap ignored — o3 vs Gemini Flash is a quality tradeoff |
| S16 | Low-budget (Rytr sub) | rytr-saver | 200K | 100K | $9.00/mo | API | Gemini Flash $0.04 | $9.00 (100%) | ✅ YES | Fair — Rytr is overpriced vs commodity API |
| S17 | Agency (Jasper) | jasper-creator | 2M | 1M | $49.00/mo | API | Gemini Flash $0.45 | $49.00 (100%) | ✅ YES | Strong case against Jasper subscription |
| S18 | Coder (Codestral) | codestral | 1M | 400K | $0.66/mo | API | Gemini Flash $0.20 | $0.66 (100%) | ⚠️ PARTIAL | Comparing code model to general-purpose Flash is misleading |
| S19 | Cost-conscious (Llama 70B) | llama-3-1-70b | 500K | 200K | $0.45/mo | API | Gemini Flash $0.10 | $0.45 (100%) | ✅ YES | Reasonable comparison |
| S20 | High-vol (Mistral Small) | mistral-small | 3M | 1M | $1.20/mo | API | Gemini Flash $0.52 | $1.20 (100%) | ✅ YES | Credible |
| S21 | Subscription switcher (Perplexity Pro) | perplexity-pro | 500K | 200K | $20.00/mo | API | Gemini Flash $0.10 | $20.00 (100%) | ⚠️ PARTIAL | Same subscription vs API problem |
| S22 | Budget dev (Grok 4 Fast) | grok-4-fast | 2M | 800K | $0.80/mo | API | Gemini Flash $0.39 | $0.80 (100%) | ✅ YES | Reasonable |

### Summary of Calculator Issues

**P0 — Trust-breaking problems:**

1. **Free tiers always win** — `ChatGPT Free` and `Gemini Free` appear as the #1 "cheaper alternative" in every scenario where any paid model is selected. They cost $0.00 (no subscriptionCostIfAny), so they trivially win every comparison. This is mathematically correct but commercially worthless and erodes trust. A user selecting "ChatGPT Plus" should not see "Switch to ChatGPT Free" as the top recommendation.

2. **"100% savings" on every scenario** — Because the free tier always appears, every scenario shows savings of exactly the model's cost (100%). This makes the savings figure meaningless and gimmicky.

3. **S7 (massive API usage) recommends Rytr** — At 50M input + 20M output tokens/month, the calculator recommends Rytr ($9/month subscription for copywriting). This is nonsensical. Rytr is a writing app, not an API provider. The subscription set includes tools that are categorically wrong for API-heavy workloads.

4. **S8 (Gemini Flash selected) recommends itself** — Gemini Flash appears in its own "cheaper alternatives" list because the verdict logic compares all API candidates globally, including the selected model.

**P1 — Weak commercial logic:**

5. **Subscription vs API conflation** — Scenarios S4, S6, S10, S13, S21 select subscription models (ChatGPT Plus, Claude Pro, Gemini Advanced, Perplexity Pro) and compare them against API pricing. The comparison is structurally misleading — a ChatGPT Plus subscriber doesn't "switch to Gemini Flash API" with no friction. The recommendation ignores lock-in, integration effort, and usage limits.

6. **CTA after recommendation is weak for calculator results** — No affiliate/outbound CTA fires automatically when results load. The AffiliateCta only renders for the top alternative's provider, and the mapping from "Gemini 1.5 Flash" → affiliate link is often empty (falls back to `/best`).

7. **Only 4 preset scenarios** — "Solo Founder", "Startup Support Bot", "Developer Coding Workflow", "Content Team". Missing: freelancer, marketer, agency, API-heavy, low-budget. These are common self-identification archetypes that are absent.

8. **CTA does not match recommendation** — When the verdict says "Best fit: API" and winner is "Gemini Flash", the CTA often goes to `/best` (generic) instead of the Gemini sign-up page.

---

## D. Analytics Event Audit

### Codebase inspection — event inventory

| Spec Event Name | Actual Event Name | Where Fired | Status |
|-----------------|-------------------|-------------|--------|
| `page_view` | `page_view` (GA4) | `App.tsx → PageViewTracker` on every route change | ✅ Present |
| `outbound_click` | Not tracked by this name | — | ❌ Missing |
| `affiliate_click` | `affiliate_click` (GA4) | `ga4.ts → trackCtaClickGa()` via `analytics.ts → trackCta()` | ✅ Present |
| `primary_cta_click` | Merged into `affiliate_click` with `ctaType: "primary"` | `AffiliateCta`, `WinnerBlock`, `StandardCtaGroup` | ⚠️ Not separate event |
| `comparison_cta_click` | `compare_cta_click` (GA4) | `ComparePage.tsx → trackCompareCtaClick()` | ⚠️ Name mismatch |
| `calculator_start` | `calculator_start` (internal allowlist) | `Calculator.tsx → fireStartOnce()` on first input | ✅ Present |
| `calculator_complete` | `calculator_complete` (internal) + `calculator_completed` (GA4) | `Calculator.tsx → calculate()` on button click | ✅ Present (dual name) |
| `recommendation_result_view` | `calculator_results_viewed` (GA4) + `calculator_result_view` (internal) | `Calculator.tsx` on unique input change | ⚠️ Name mismatch |

### Page type coverage

| Page type | `page_view` | CTA clicks | Feature events | Missing |
|-----------|-------------|------------|----------------|---------|
| `/compare/:slug` | ✅ | ✅ (`compare_cta_click`, `affiliate_click`) | — | `recommendation_result_view` on compare pages |
| `/calculator` | ✅ | ✅ | ✅ (`calculator_open`, `calculator_start`, `calculator_complete`, `calculator_results_viewed`) | Affiliate CTA click after result |
| `/decision-engine` | ✅ | ✅ | ✅ (`decision_engine_open`, `decision_engine_completed`) | — |
| `/best`, `/best/:slug` | ✅ | — | — | CTA tracking on best-of pages |
| `/ai-types/:slug` | ✅ | — | — | Any event tracking |
| `/guides/:slug` | ✅ | — | — | Any event tracking — full blind spot |
| `/models` | ✅ | ✅ (tracked) | ✅ (models_primary_cta_click etc.) | — |
| `/pricing/*` | N/A — page doesn't exist | — | — | — |

### GA4 naming inconsistencies

| Issue | Detail |
|-------|--------|
| Duplicate event for same action | `calculator_complete` (internal allowlist) and `calculator_completed` (GA4 key event) fire for the same button click |
| `recommendation_result_view` in allowlist | Not fired — the actual internal event is `calculator_result_view` |
| `calculator_results_viewed` | GA4 key event, but not in the internal allowlist |
| Internal `affiliate_clicked` vs GA4 `affiliate_click` | Two different names for the same user action across two systems |
| `compare_cta_click` vs spec `comparison_cta_click` | Minor naming mismatch against spec |

### Missing events
- `outbound_click` — no generic event for non-affiliate external links (e.g., "Verify with provider" staleness link)
- `guide_view` — no event for guide page views beyond `page_view`
- `internal_link_click` — no tracking on InternalLinks component clicks
- `scenario_selected` is tracked but only via raw `window.analytics`, not via the centralized `track()` function — bypasses the allowlist
- No tracking on `/worth-it`, `/pricing`, `/alternatives` — though these pages don't exist yet

---

## E. Summary Scorecard

| Category | Score | Grade |
|----------|-------|-------|
| Priority page existence (10/10 target) | 0/10 | ❌ F |
| Sitemap coverage of priority pages | 0/10 | ❌ F |
| SEO metadata in raw HTML | 0/10 | ❌ F |
| Calculator credibility | 14/22 scenarios credible | ⚠️ D |
| Analytics completeness (8 spec events) | 4/8 exact match | ⚠️ C |
| Commercial quality (pages that exist) | Good on compare/calculator | ✅ B |
| Affiliate CTA coverage | Partial — free tiers dominate | ⚠️ D |
