# Task-Fit Model Guidance Audit

_Generated: 2026-05-01_

## Executive Summary

This audit checked **60 pages** crawled from `public/sitemap.xml` against the local dev server.

The goal: identify pages that should carry "choose the right model for the task, not the most expensive model" guidance but currently don't.

| Metric | Count |
|--------|-------|
| Pages crawled | 60 |
| Pages with errors (timeout / 4xx) | 3 |
| Pages already aligned | 57 |
| High-priority pages missing task-fit guidance | 2 |
| Highest-priority changes needed | 1 |

## Pages Crawled (60)

| Path | Type | Status | Score | Aligned |
|------|------|--------|-------|---------|
| / | home | 200 | 67 | ✓ |
| /calculator | calculator | 200 | 25 | ✓ |
| /calculator/ai-savings-calculator | calculator | 200 | 39 | ✓ |
| /best | best | 200 | 46 | ✓ |
| /compare/chatgpt-vs-claude | compare | 200 | 28 | ✓ |
| /compare/chatgpt-vs-gemini | compare | 200 | 26 | ✓ |
| /compare/claude-vs-gemini | compare | 200 | 24 | ✓ |
| /pricing/chatgpt-pricing | pricing | 200 | 21 | ✓ |
| /pricing/claude-pricing | pricing | 200 | 20 | ✓ |
| /pricing/gemini-pricing | pricing | 200 | 18 | ✓ |
| /worth-it/is-chatgpt-plus-worth-it | worth-it | 200 | 21 | ✓ |
| /worth-it/which-ai-subscription-is-worth-paying-for | worth-it | 200 | 22 | ✓ |
| /alternatives/best-chatgpt-alternatives | alternatives | 200 | 35 | ✓ |
| /compare | compare | 200 | 28 | ✓ |
| /compare/claude-vs-gpt-cost | compare | 200 | 51 | ✓ |
| /compare/chatgpt-vs-cursor-cost | compare | 200 | 28 | ✓ |
| /compare/subscription-vs-api-ai-cost | compare | 200 | 39 | ✓ |
| /compare/gpt-4o-vs-gpt-4o-mini-cost | compare | 200 | 42 | ✓ |
| /compare/gemini-vs-gpt4o-cost | compare | 200 | 36 | ✓ |
| /compare/deepseek-vs-gpt4o-cost | compare | 200 | 30 | ✓ |
| /compare/claude-vs-gemini-cost | compare | 200 | 16 | ✓ |
| /compare/mistral-vs-gpt4o-cost | compare | 200 | 16 | ✓ |
| /compare/mistral-vs-openai-cost | compare | 200 | 36 | ✓ |
| /compare/claude-vs-cursor-for-coding | compare | 200 | 32 | ✓ |
| /compare/perplexity-vs-chatgpt-cost | compare | 200 | 25 | ✓ |
| /compare/claude-haiku-vs-gpt4o-mini | compare | 200 | 32 | ✓ |
| /compare/writesonic-vs-jasper | compare | 200 | 32 | ✓ |
| /ai-types | ai-type | 200 | 19 | ✓ |
| /ai-types/general-ai | ai-type | 200 | 36 | ✓ |
| /ai-types/coding-ai | ai-type | 200 | 38 | ✓ |
| /ai-types/writing-ai | ai-type | 200 | 42 | ✓ |
| /ai-types/research-ai | ai-type | 200 | 37 | ✓ |
| /ai-types/customer-support-ai | ai-type | 200 | 48 | ✓ |
| /ai-types/productivity-ai | ai-type | 200 | 33 | ✓ |
| /guides | guide | 200 | 40 | ✓ |
| /guides/cheapest-ai-content-workflow | guide | 200 | 29 | ✓ |
| /guides/cheapest-ai-writing-tools | guide | 200 | 24 | ✓ |
| /guides/best-ai-tools-under-20 | guide | 200 | 26 | ✓ |
| /guides/is-jasper-worth-it | guide | 200 | 29 | ✓ |
| /guides/when-to-use-api-vs-subscription | guide | 200 | 36 | ✓ |
| /guides/how-to-reduce-ai-cost | guide | 200 | 59 | ✓ |
| /guides/token-cost-explained | guide | 200 | 22 | ✓ |
| /decision-engine | other | 200 | 18 | ✓ |
| /models | models | 200 | 43 | ✓ |
| /contact | static | 200 | 17 | ✓ |
| /about | static | 200 | 31 | ✓ |
| /affiliate-disclosure | static | 200 | 21 | ✓ |
| /privacy-policy | static | 200 | 16 | ✓ |
| /audit/ai-cost-reliability-audit | audit | 200 | 28 | ✓ |
| /pricing/gpt-5-5-pricing | pricing | 200 | 39 | ✓ |
| /best/best-ai-tools-for-freelancers | best | 200 | 19 | ✓ |
| /best/best-ai-tools-for-founders | best | 200 | 19 | ✓ |
| /best/best-ai-tools-for-developers | best | 200 | 22 | ✓ |
| /best/best-value-ai-tools | best | 200 | 26 | ✓ |
| /best/best-ai-tools-by-budget | best | 200 | 28 | ✓ |
| /compare/chatgpt-free-vs-plus | compare | 200 | 32 | ✓ |
| /compare/claude-free-vs-paid | compare | 200 | 32 | ✓ |
| /compare/gemini-free-vs-paid | compare | ERR | 0 | ✗ needs work |
| /pricing/cheapest-ai-tools | pricing | ERR | 0 | ✗ needs work |
| /decision/which-ai-tool-should-i-buy | decision | ERR | 0 | — |

## Pages Already Aligned (57)

These pages already reference task-fit model choice, cost signals, and link to the calculator or compare pages.

- **/** (home) — score 67, signals: right model, model routing, choose.*model
- **/calculator** (calculator) — score 25, signals: overpay, overpaying, cheaper.*equivalent
- **/calculator/ai-savings-calculator** (calculator) — score 39, signals: model.*task, task.*model, cheaper.*model
- **/best** (best) — score 46, signals: task fit, choose.*model, model.*task
- **/compare/chatgpt-vs-claude** (compare) — score 28, signals: model.*task, cheaper.*option, overpay
- **/compare/chatgpt-vs-gemini** (compare) — score 26, signals: cheaper.*option, overpay, overpaying
- **/compare/claude-vs-gemini** (compare) — score 24, signals: cheaper.*option, overpay, overpaying
- **/pricing/chatgpt-pricing** (pricing) — score 21, signals: overpay, overpaying, simple.*task
- **/pricing/claude-pricing** (pricing) — score 20, signals: overpay, overpaying, simple.*task
- **/pricing/gemini-pricing** (pricing) — score 18, signals: overpay, overpaying
- **/worth-it/is-chatgpt-plus-worth-it** (worth-it) — score 21, signals: overpay, overpaying, good enough
- **/worth-it/which-ai-subscription-is-worth-paying-for** (worth-it) — score 22, signals: cheaper.*alternative, overpay, overpaying
- **/alternatives/best-chatgpt-alternatives** (alternatives) — score 35, signals: task.*model, cheaper.*model, overpay
- **/compare** (compare) — score 28, signals: overpay, overpaying, cost.*quality
- **/compare/claude-vs-gpt-cost** (compare) — score 51, signals: route.*model, pick.*model, model.*task
- **/compare/chatgpt-vs-cursor-cost** (compare) — score 28, signals: cheaper.*option, overpay, overpaying
- **/compare/subscription-vs-api-ai-cost** (compare) — score 39, signals: route.*model, model.*task, task.*model
- **/compare/gpt-4o-vs-gpt-4o-mini-cost** (compare) — score 42, signals: model.*task, task.*model, cheaper.*option
- **/compare/gemini-vs-gpt4o-cost** (compare) — score 36, signals: model.*task, task.*model, cheaper.*option
- **/compare/deepseek-vs-gpt4o-cost** (compare) — score 30, signals: cheaper.*option, overpay, overpaying
- **/compare/claude-vs-gemini-cost** (compare) — score 16, signals: overpay, overpaying
- **/compare/mistral-vs-gpt4o-cost** (compare) — score 16, signals: overpay, overpaying
- **/compare/mistral-vs-openai-cost** (compare) — score 36, signals: model.*task, task.*model, cheaper.*option
- **/compare/claude-vs-cursor-for-coding** (compare) — score 32, signals: cheaper.*alternative, cheaper.*option, overpay
- **/compare/perplexity-vs-chatgpt-cost** (compare) — score 25, signals: cheaper.*option, overpay, overpaying
- **/compare/claude-haiku-vs-gpt4o-mini** (compare) — score 32, signals: model.*task, task.*model, cheaper.*option
- **/compare/writesonic-vs-jasper** (compare) — score 32, signals: cheaper.*alternative, cheaper.*option, overpay
- **/ai-types** (ai-type) — score 19, signals: overpay, overpaying
- **/ai-types/general-ai** (ai-type) — score 36, signals: choose.*model, model.*task, overpay
- **/ai-types/coding-ai** (ai-type) — score 38, signals: model routing, route.*model, model.*task
- **/ai-types/writing-ai** (ai-type) — score 42, signals: right model, model routing, model.*task
- **/ai-types/research-ai** (ai-type) — score 37, signals: right model, model.*task, task.*model
- **/ai-types/customer-support-ai** (ai-type) — score 48, signals: model routing, choose.*model, match.*model
- **/ai-types/productivity-ai** (ai-type) — score 33, signals: choose.*model, overpay, overpaying
- **/guides** (guide) — score 40, signals: model routing, route.*model, choose.*model
- **/guides/cheapest-ai-content-workflow** (guide) — score 29, signals: cheaper.*alternative, overpay, overpaying
- **/guides/cheapest-ai-writing-tools** (guide) — score 24, signals: overpay, overpaying, cost.*quality
- **/guides/best-ai-tools-under-20** (guide) — score 26, signals: overpay, overpaying, cost.*quality
- **/guides/is-jasper-worth-it** (guide) — score 29, signals: cheaper.*alternative, overpay, overpaying
- **/guides/when-to-use-api-vs-subscription** (guide) — score 36, signals: model routing, choose.*model, model.*task
- **/guides/how-to-reduce-ai-cost** (guide) — score 59, signals: right model, model routing, route.*model
- **/guides/token-cost-explained** (guide) — score 22, signals: overpay, overpaying, cost.*quality
- **/decision-engine** (other) — score 18, signals: overpay, overpaying
- **/models** (models) — score 43, signals: route.*model, choose.*model, model.*task
- **/contact** (static) — score 17, signals: overpay, overpaying
- **/about** (static) — score 31, signals: task fit, model.*task, cheaper.*alternative
- **/affiliate-disclosure** (static) — score 21, signals: task fit, overpay, overpaying
- **/privacy-policy** (static) — score 16, signals: overpay, overpaying
- **/audit/ai-cost-reliability-audit** (audit) — score 28, signals: route.*model, cheaper.*model, cheaper.*alternative
- **/pricing/gpt-5-5-pricing** (pricing) — score 39, signals: model routing, route.*model, model.*task
- **/best/best-ai-tools-for-freelancers** (best) — score 19, signals: overpay, overpaying
- **/best/best-ai-tools-for-founders** (best) — score 19, signals: overpay, overpaying
- **/best/best-ai-tools-for-developers** (best) — score 22, signals: overpay, overpaying, quality.*cost
- **/best/best-value-ai-tools** (best) — score 26, signals: not.*expensive, overpay, overpaying
- **/best/best-ai-tools-by-budget** (best) — score 28, signals: overpay, overpaying, cost.*quality
- **/compare/chatgpt-free-vs-plus** (compare) — score 32, signals: cheaper.*option, overpay, overpaying
- **/compare/claude-free-vs-paid** (compare) — score 32, signals: cheaper.*option, overpay, overpaying

## Pages Missing Task-Fit Guidance (2)

These pages are in a high-priority category but lack clear task-fit model guidance.

| Path | Type | Score | Missing signals |
|------|------|-------|-----------------|
| /compare/gemini-free-vs-paid | comparison | 0 | no task-fit signals |
| /pricing/cheapest-ai-tools | pricing | 0 | no task-fit signals |

## Recommended Copy Blocks by Page Type

These blocks should be inserted near the top of the relevant page section, above the main content or below the H1.

### compare

**Heading:** Choose the right model for the task, not the most expensive

**Body:** Most users default to the flagship model for every job — but frontier models cost 10–50× more than mid-tier alternatives with comparable quality on simple tasks. Before committing to a subscription or API, use the calculator below to see what your actual monthly bill looks like across models.

**CTA:** [Calculate your real cost →](/calculator)

### pricing

**Heading:** Is this model right for your tasks?

**Body:** Before paying for the highest tier, check whether a cheaper model handles your specific workload. For routine tasks like summarisation, classification, and drafting, GPT-4o mini, Claude Haiku, or Gemini Flash cost 10–100× less with minimal quality difference.

**CTA:** [Compare models for your use case →](/decision-engine)

### calculator

**Heading:** Routing matters as much as choosing a model

**Body:** If you route all tasks to one model, you're paying frontier prices for tasks that don't need frontier quality. A two-tier strategy — budget model for simple tasks, premium model for complex reasoning — typically cuts API spend by 60–80%.

**CTA:** [See routing guide →](/guides/how-to-reduce-ai-cost)

### coding-ai-type

**Heading:** Not every coding task needs the best model

**Body:** Code completion, docstring generation, and simple refactors work well with Claude Haiku or GPT-4o mini. Save Sonnet or GPT-4o for complex multi-file refactors and architectural reasoning. Cursor Pro's model routing already does this automatically.

**CTA:** [Best AI for coding on a budget →](/best/best-ai-for-coding-on-a-budget)

### worth-it

**Heading:** The right model depends on what you're actually doing

**Body:** Subscriptions make sense when you use AI heavily every day. If your usage is moderate, pay-per-token API access costs $2–5/month instead of $20. Use the calculator to see which side of the line you're on.

**CTA:** [Calculate my real cost →](/calculator)

### alternatives

**Heading:** The cheapest alternative that fits your tasks is the best one

**Body:** Switching models saves money only if the cheaper model handles your workload well. Use our decision engine to match your specific tasks to the right model — not just the cheapest one available.

**CTA:** [Find the right model for your tasks →](/decision-engine)


## Highest-Priority Changes

These are the pages where adding task-fit guidance would have the highest commercial impact (comparison and pricing pages drive the most purchase intent).

### 1. `/pricing/cheapest-ai-tools` (pricing)

- **Current score:** 0 / recommended ≥ 12
- **H1:** (none detected)
- **Has CTA:** no
- **Links to calculator/compare:** no
- **Suggested block:** "Is this model right for your tasks?"
- **Suggested CTA:** [Compare models for your use case →](/decision-engine)

### 2. `/compare/gemini-free-vs-paid` (comparison)

- **Current score:** 0 / recommended ≥ 12
- **H1:** (none detected)
- **Has CTA:** no
- **Links to calculator/compare:** no
- **Suggested block:** "Use the right model for the task"
- **Suggested CTA:** [Find your cheapest viable setup →](/calculator)


## Suggested Internal Links

- Add link to /calculator from /compare/gemini-free-vs-paid
- Add link to /decision-engine from /compare/gemini-free-vs-paid
- Add link to /calculator from /pricing/cheapest-ai-tools
- Add link to /decision-engine from /pricing/cheapest-ai-tools

## Risks / Notes

- **Scoring threshold:** Alignment score ≥ 12 was used as the pass threshold. Adjust in `scripts/audit-task-fit-model-guidance.mjs` if needed.
- **Crawl environment:** This audit ran against the local dev server (`http://localhost:18972`). Some pages may render differently on production.
- **Dynamic content:** React pages were given 800ms to hydrate. Pages with long load times may have been scored on partial content.
- **Error pages:** 3 page(s) returned an error or timed out — check the JSON output for details.
- **Scope:** This is a read-only audit. No UI changes were made.

### Error pages

- `/compare/gemini-free-vs-paid` — status 0: Error: page.goto: Target page, context or browser has been closed
Call log:
[2m  - navigating to "http://localhost:1897
- `/pricing/cheapest-ai-tools` — status 0: Error: page.goto: Target page, context or browser has been closed
- `/decision/which-ai-tool-should-i-buy` — status 0: Error: page.goto: Target page, context or browser has been closed

---
_OverpayingForAI task-fit audit · 2026-05-01_