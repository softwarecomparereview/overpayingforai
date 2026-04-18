# Fix Priority — Run `2026-04-18_19-07-13`

Source: `out/audits/2026-04-18_19-07-13/site/reports/issues.json` + `decision/results.json`
Branch: `latestdevelop` @ `f03cf94`
Pages crawled: 40 · Decision/calculator scenarios: 34 (4 calc presets + 30 decision scenarios)

Tag legend: **Trust** · **Conv** (conversion) · **SEO** · **UX** · **Data**

---

## P0 — Must fix before traffic push

### P0-1 — Calculator output does NOT change with token inputs
- **Affected URL:** `https://overpayingforai.com/calculator` (and all 5 `?scenario=...` variants)
- **Issue:** All 4 token presets (5K / 50K / 500K / 5M input tokens) returned the exact same hero heading "Find your cheapest viable AI setup" and the same 3 boilerplate "USE THIS IF…" bullets. Explanation text length was identical (280 chars) across every preset. From the audit's perspective, no result block ever updated.
- **Why it matters:** A cost calculator that visibly does nothing when you change inputs by 1000× is the single fastest way to lose every newsletter visitor. They will assume the whole site is a façade.
- **Fix:** Render a clearly labelled, dynamically-updating result block under the inputs (e.g. `<section data-testid="calc-result">` with `$X/mo on GPT-4o · $Y on Claude Haiku · $Z on DeepSeek`). Result text MUST mention at least one model name and at least one dollar figure that changes when inputs change. Confirm by re-running the audit and seeing >1 unique `recommendedTool`.
- **Tag:** Trust · Conv · Data

### P0-2 — Decision Engine returns the page heading, not a recommendation
- **Affected URL:** `https://overpayingforai.com/decision-engine`
- **Issue:** Across 30 different scenario combinations (use case × budget × priority × volume × team), 30/30 results harvested the heading "AI Decision Engine" as the recommendation. The harness drives the form by clicking visible options matching the scenario labels — if no labels match, nothing changes; if a result block existed, the harness would harvest it.
- **Why it matters:** Either the engine genuinely doesn't differentiate (catastrophic for a "decision engine") or the result UI uses obscure markup that no scraper or screenreader can read. Both are blockers.
- **Fix:** Implement / surface a deterministic result block on `/decision-engine` with stable hooks: `<section data-testid="decision-result">` containing `<h2>Recommended: <b>Claude Haiku</b></h2>` + `<p data-testid="decision-rationale">…</p>` + an `<ol data-testid="decision-alternatives">`. Verify by re-running `decision-engine-audit.js` and seeing ≥6 unique recommendations across the matrix.
- **Tag:** Trust · Conv · UX · Data

### P0-3 — Zero affiliate/outbound CTAs on 39 of 40 commercial pages
- **Affected URLs:** Every commercial page except `/changelog` (which has 14). Worst offenders: `/`, `/best`, `/calculator`, `/ai-types`, `/decision-engine`, `/compare`, `/resources` and every `/compare/*`, `/best/*`, `/ai-types/*`, `/guides/*` page.
- **Issue:** `outboundLinkCount=1` on 39 pages — that 1 is the LinkedIn footer link. None of the comparison or "best of" pages link out to OpenAI, Anthropic, Cursor, Perplexity, etc. with a CTA-styled element.
- **Why it matters:** This is the entire monetization model. A "best AI for coding on a budget" page that doesn't visibly link out to the recommended tool earns nothing AND looks suspicious — readers expect to click through.
- **Fix:** On every comparison and "best of" page, add a primary CTA-styled outbound button per recommended tool (e.g. `<a class="cta-primary" href="https://www.cursor.com/?ref=…" rel="sponsored noopener">Try Cursor →</a>`) directly under the verdict block. Use `rel="sponsored"` on affiliate links. Re-run the audit and target `no_outbound_cta_on_commercial_page=0`.
- **Tag:** Conv · Trust

### P0-4 — 5 high-intent pages share the bare site title "Overpaying for AI"
- **Affected URLs:** `/decision-engine`, `/compare`, `/resources`, `/changelog`, `/pricing-changelog`
- **Issue:** Identical `<title>` across 5 pages → Google will collapse them in SERP and pick its own; social shares show the same generic name.
- **Why it matters:** Half of your most-shareable URLs (decision engine, comparison hub, changelog) are unindexable as distinct pages.
- **Fix:** Set unique titles, e.g. `Decision Engine — Get a Personalized AI Pick | OverpayingForAI`, `AI Tool Comparisons | OverpayingForAI`, `Free AI Resources & Guides | OverpayingForAI`, `Site Changelog | OverpayingForAI`, `AI Pricing Changelog (Updated Weekly) | OverpayingForAI`.
- **Tag:** SEO · Trust

### P0-5 — All 6 calculator scenario URLs share title + H1
- **Affected URLs:** `/calculator`, `/calculator?scenario=chatgpt-plus-user`, `?scenario=developer-coding-workflow`, `?scenario=startup-support-bot`, `?scenario=content-team`, `?scenario=solo-founder`
- **Issue:** Identical `<title>` ("AI Cost Calculator (2026)…") and identical `<h1>` ("Find your cheapest viable AI setup") on all 6.
- **Why it matters:** The whole point of pre-loaded scenarios is targeted, shareable landings ("Calculator for ChatGPT Plus users…"). Right now they're invisible to search and look identical to humans.
- **Fix:** Per-scenario H1 + title + meta description. Either render server-side from the `scenario` query param, or add canonical+Open-Graph variants per scenario. Add a one-line subhead like "Pre-filled for: ChatGPT Plus heavy user (200K input / 40K output tokens, $20/mo)".
- **Tag:** SEO · Conv

---

## P1 — High-value fixes this week

### P1-1 — 7 pages missing canonical tags
- **Affected URLs:** `/decision-engine`, `/compare`, `/resources`, `/changelog`, `/pricing-changelog`, `/terms`, `/media-kit`
- **Why it matters:** Without canonicals, Google may pick an arbitrary URL variant, especially once newsletter UTMs land. Easy to fix, free SEO win.
- **Fix:** Add `<link rel="canonical" href="https://overpayingforai.com/<path>" />` via the existing `PageSeo` helper used elsewhere on the site.
- **Tag:** SEO

### P1-2 — 5 pages missing meta description
- **Affected URLs:** Same as P0-4 (`/decision-engine`, `/compare`, `/resources`, `/changelog`, `/pricing-changelog`)
- **Why it matters:** Google will scrape arbitrary text. Newsletter-driven shares to LinkedIn/Twitter will lack a coherent preview.
- **Fix:** 140–160-char descriptions per page, each leading with the verb the user is doing ("Compare every major AI model on real cost…", "Get a personalized AI pick in 30 seconds…").
- **Tag:** SEO · Conv

### P1-3 — 14 outbound domains discovered, but most pages link only to LinkedIn
- **Affected URLs:** All commercial pages except `/changelog` (`/changelog` linked to all 14 outbound domains).
- **Why it matters:** The site KNOWS about anthropic.com, openai.com, cursor.com, perplexity.ai, gemini.google.com, groq.com, deepseek/copy/jasper/rytr/writesonic — but they only appear on the changelog. Comparison pages naming these tools should link them with affiliate refs.
- **Fix:** Build a small "tool registry" with `{ name, homepage, affiliateUrl, rel }` and require every comparison/best-of card to render its primary CTA from this registry. Forces no-affiliate links to be a deliberate (not accidental) choice.
- **Tag:** Conv · Data

### P1-4 — Every `/calculator?scenario=*` page is double-counted as missing canonical
- **Affected URLs:** All `?scenario=…` variants
- **Why it matters:** Pre-filled calculator URLs are valuable landing pages but currently appear as duplicates of `/calculator` to Google.
- **Fix:** Decide intent — either canonicalize to `/calculator` (lose the SEO juice but cleaner) OR canonicalize each variant to itself with unique title/H1/description (recommended; ties to P0-5).
- **Tag:** SEO

### P1-5 — Decision engine returns only 2 unique strings across 34 scenarios — investigate trust impact even after P0-2
- **Affected URLs:** `/decision-engine`, `/calculator`
- **Why it matters:** Once P0-2 surfaces a real result block, the next risk is over-recommending a single tool. If after fixing the harness 25/30 scenarios still recommend "Claude Haiku" or similar, write copy that explicitly explains the bias ("For light writing under $20, Claude Haiku wins on cost+quality in every case we tested — see methodology").
- **Fix:** After P0-2 ships, re-run the decision audit. If `uniqueRecommendations < 5`, add a methodology page explaining the convergence. Don't try to manufacture diversity.
- **Tag:** Trust

---

## P2 — Later improvements

### P2-1 — `/changelog` and `/pricing-changelog` likely overlap
- Both share the title "Overpaying for AI" and serve changelog-like content.
- **Fix:** Decide which is canonical, 301 the other, OR clearly differentiate (site changelog vs model-pricing changelog) with separate H1/title/meta.
- **Tag:** SEO · UX

### P2-2 — `firstCtaText` on the homepage is generic ("Calculate cost", "Get my pick", etc. — not measured here, but worth A/B-ing)
- 16 CTAs were detected on `/`. That's a lot of competing asks.
- **Fix:** Reduce to one primary CTA above the fold ("Find your cheapest stack →") with secondary nav-style links.
- **Tag:** Conv · UX

### P2-3 — Add JSON-LD `Product`/`SoftwareApplication` schema to every comparison page
- Audit detected JSON-LD on most pages but not whether `Product` schema exists per recommended tool. Adding it unlocks rich SERP results.
- **Fix:** Per recommended tool in a comparison, emit `<script type="application/ld+json">{"@type":"Product","name":"Cursor",...}</script>`.
- **Tag:** SEO

### P2-4 — Crawler hit max=40 with queue=22 still pending
- 22+ URLs unvisited (mostly `/best/*`, `/compare/*`, `/guides/*`). Re-run with `--maxPages=200` after P0/P1 to confirm coverage.
- **Fix:** No code change — operational. Just rerun.
- **Tag:** Data
