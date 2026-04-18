# Executive Audit Summary — `2026-04-18_19-07-13`

Branch: `latestdevelop` @ `f03cf94`
Crawled: 40 pages of `overpayingforai.com` · Drove 34 calculator/decision-engine scenarios.

---

## 1. Overall verdict

The site **looks** finished — every page has a CTA, every commercial page has a recommendation block, no page is visually bare, no broken links, no missing titles. Structurally it is well above the bar for a typical newsletter-launched affiliate site.

But two things are wrong at the foundation, and they are the two things the entire product premise rests on:

1. **The Calculator does not visibly respond to inputs.** Four token presets ranging across three orders of magnitude (5K → 5M input tokens) produced identical harvested output — same heading, same 3-bullet "USE THIS IF" block, identical 280-character explanation. A cost calculator that doesn't visibly recompute when you 1000× the inputs will be dismissed as fake within 15 seconds by any technical reader.
2. **The Decision Engine returns its own page title as the "recommendation."** Across 30 distinct scenarios, the only thing surfaced was the literal string "AI Decision Engine." Either the engine truly doesn't render a result block, or it renders it in a way that's invisible to scrapers and screen readers. Both interpretations are bad.

Until those two surfaces actually return per-input answers, the site's headline value prop ("decide what AI to use, see real costs") is not delivered. Everything else in this report is secondary.

## 2. Top trust issues

- **Calculator and Decision Engine appear non-functional from the outside (P0-1, P0-2).** This is the trust killer. A reader sent here from a newsletter expects a 30-second "ah, $14/mo on Claude Haiku for my use case" experience. They get a static landing page with seemingly no working tool.
- **5 pages share the bare title "Overpaying for AI"** (`/decision-engine`, `/compare`, `/resources`, `/changelog`, `/pricing-changelog`). When a reader Googles the site or sees a LinkedIn share preview, half the surface area looks like the same page.
- **6 calculator scenario URLs are indistinguishable** in title and H1 — labeled as personalized landings but visually generic.

## 3. Top conversion issues

- **39 of 40 commercial pages have zero outbound/affiliate CTAs.** The site discovered 14 outbound domains in total — but 13 of those 14 only appear on `/changelog`. The actual money pages (`/best/best-ai-for-coding-on-a-budget`, `/compare/claude-vs-gpt-cost`, etc.) link out only to LinkedIn. Conversions can't happen because the click-out path doesn't exist.
- **Calculator results don't update**, so even if a "Try this tool" button existed, there's nothing for it to attach to.
- **Homepage has 16 detected CTAs** — too many competing asks. No single primary "do this next."

## 4. Top SEO/indexability issues

- **11 duplicate titles** across two clusters: 6 calculator-scenario URLs share one title, 5 hub pages share the bare "Overpaying for AI" title.
- **6 duplicate H1s** ("Find your cheapest viable AI setup") across the calculator family.
- **7 pages missing `<link rel=canonical>`**: `/decision-engine`, `/compare`, `/resources`, `/changelog`, `/pricing-changelog`, `/terms`, `/media-kit`.
- **5 pages missing meta description.**
- No 404s, no `noindex` issues, no broken canonical loops detected — the structural hygiene is otherwise OK.

## 5. Top calculator / decision-engine credibility issues

- The audit captured **2 unique "recommendations" across 34 scenarios.** Both of those strings are page headings, not actual tool picks ("Find your cheapest viable AI setup" and "AI Decision Engine"). To a user, that means: the calculator UI does not visibly compute, and the decision engine UI does not visibly answer.
- Even if the engine internally ranks tools, the result block is either absent, hidden, or rendered with markup so non-semantic that no scraper or assistive tech can read it.
- **Verdict on credibility: gimmicky, not credible — currently.** The fix is small in code but huge in perceived value: surface a stable, semantic result block on both surfaces, with at least one model name and one dollar figure that visibly change with inputs.

## 6. Highest-intent pages to fix first

These are the URLs that get the most newsletter clicks AND have the worst current state:

1. `/calculator` — fix P0-1 (results don't change), P0-5 (all scenarios share title/H1)
2. `/decision-engine` — fix P0-2 (returns nothing usable), P0-4 (bare title), P1-1 (no canonical)
3. `/best` and `/best/best-ai-for-coding-on-a-budget`, `/best/best-ai-under-20-per-month`, `/best/best-ai-for-writing-on-a-budget` — fix P0-3 (no outbound CTAs)
4. `/compare` and the top 5 `/compare/*` pages (`claude-vs-gpt-cost`, `gpt-4o-vs-gpt-4o-mini-cost`, `subscription-vs-api-ai-cost`, `chatgpt-vs-cursor-cost`, `claude-vs-cursor-for-coding`) — fix P0-3 + P0-4
5. Homepage `/` — fix P0-3 (only LinkedIn outbound) and P2-2 (16 competing CTAs)

## 7. Pages that look visually bare

**Zero pages flagged as visually bare** by the heuristic (which looks for a combination of low body text, no tables, no sections, no CTAs, no recommendation block, sparse above-the-fold text). Structurally, every crawled page is "filled in." This is good.

The risk is the opposite — pages look full of content but the interactive primitives at the heart of those pages (calculator, decision engine) don't actually work. Visual completeness without functional completeness is worse than a bare page, because it's deceptive.

## 8. Pages with no CTA

**Zero.** Every page has at least one CTA pattern detected. Not the problem.

## 9. Commercial pages with no outbound/affiliate CTA

**40 of 40 commercial pages.** Effectively the whole site.

The only page with real outbound link diversity is `/changelog` (14 outbound domains). On every other commercial page, the only outbound link is the LinkedIn icon in the footer. This is the single highest-leverage monetization gap in the audit.

## 10. Duplicate titles or H1s

| Cluster | Count | URLs |
|---|---|---|
| Title: "AI Cost Calculator (2026) – Compare Model Pricing \| OverpayingForAI" | 6 | `/calculator` + 5 `?scenario=*` variants |
| Title: "Overpaying for AI" | 5 | `/decision-engine`, `/compare`, `/resources`, `/changelog`, `/pricing-changelog` |
| H1: "Find your cheapest viable AI setup" | 6 | All calculator URLs above |

## 11. Is the site ready for serious traffic right now? — **No.**

Reasons (in order of severity):

1. The two flagship interactive surfaces (`/calculator`, `/decision-engine`) appear inert from a user's perspective. A newsletter audience will not return.
2. The site cannot earn affiliate revenue on its money pages — outbound CTAs don't exist on 39/40 commercial pages.
3. Half the high-intent landings collide on `<title>` so social shares and SERPs will look indistinguishable.

What IS ready: page structure, content depth (no bare pages), recommendation blocks present everywhere, working internal navigation, no broken links, sensible URL structure. So the lift to "ready" is small and surgical — see "Immediate recommendation" below.

## 12. Top 5 changes most likely to improve affiliate CTR

1. Add a single CTA-styled outbound button beneath every comparison verdict ("Try Cursor →", `rel="sponsored noopener"`).
2. On every `/best/*` page, render the #1 pick as a card with a big affiliate button, not a paragraph.
3. Make the calculator result block end with "Recommended: <Tool> — [Try it →]" using the cheapest model in the result.
4. Make the decision engine result include a primary "Try <Tool>" CTA above any "see alternatives" copy.
5. Add a sticky bottom-of-page CTA bar on `/best/*` and `/compare/*` ("Pick a tool: [Cursor] [Claude] [ChatGPT]") so the user always has a one-click exit to a paying action.

## 13. Top 5 changes most likely to improve trust

1. Make the calculator visibly recompute when inputs change — show the dollar number animating, change the recommended-model name, change the underline of "API vs subscription" verdict.
2. Make the decision engine surface a real `<section data-testid="decision-result">` with a named tool, a dollar figure, a one-sentence rationale, and 2 alternatives.
3. Stop sharing the title "Overpaying for AI" across 5 hub pages — every page should have a title that names what it is.
4. Add a visible "Last updated: <date>" stamp on every comparison page (and pull it from the same source the changelog uses).
5. On comparison pages, show the methodology in one line ("Prices from official APIs as of <date>; subscription prices from each vendor's pricing page; affiliate links marked with rel=sponsored").

## 14. Top 5 pages to improve first

1. `/calculator` (and all 5 `?scenario=*` variants) — the centerpiece. Fix P0-1 and P0-5 together.
2. `/decision-engine` — second-most-promised functionality. Fix P0-2 and P0-4 together.
3. `/best/best-ai-under-20-per-month` — high-intent budget query, currently no outbound CTA.
4. `/compare/claude-vs-gpt-cost` — likely top organic comparison; fix P0-3 first.
5. Homepage `/` — only outbound link is LinkedIn; reduce 16 CTAs to 1 primary + nav.

---

## Immediate recommendation for next iteration

Do these in order on `latestdevelop`. Each is small. Together they unblock the launch.

1. **Calculator result block (P0-1).** Add `<section data-testid="calc-result">` under the inputs that re-renders on every input change. Must contain at least one model name, one `$X / mo` figure, and one "API vs subscription" verdict line.
2. **Decision-engine result block (P0-2).** Add `<section data-testid="decision-result">` with `<h2>Recommended: <b>Tool</b></h2>`, `<p data-testid="decision-rationale">…</p>`, and `<ol data-testid="decision-alternatives">`. Must change with selected use case + budget + priority.
3. **Tool registry + outbound CTAs (P0-3).** Add a `tools.ts` registry (`name`, `homepage`, `affiliateUrl`, `rel`). Render `<a class="cta-primary" rel="sponsored noopener">` on every `/best/*` and `/compare/*` verdict, and on the calculator result block.
4. **Per-page titles (P0-4 + P0-5).** Set unique titles + meta descriptions for `/decision-engine`, `/compare`, `/resources`, `/changelog`, `/pricing-changelog`, and each `/calculator?scenario=*` variant via the existing `PageSeo` helper.
5. **Canonicals (P1-1).** Add `<link rel="canonical">` to the 7 pages currently missing one.
6. **Re-run this audit.** Use `node scripts/site-audit.js --runId=<new> --maxPages=200` and `node scripts/decision-engine-audit.js --runId=<new> --maxScenarios=60`. Targets to hit:
   - `no_outbound_cta_on_commercial_page` ≤ 5
   - `duplicate_title` = 0
   - `missing_canonical` = 0
   - decision engine `uniqueRecommendations` ≥ 6
   - calculator: at least one numeric `$X` token in the harvested `resultText`, varying across the 4 token presets

Only after step 6 is green should the newsletter push happen.
