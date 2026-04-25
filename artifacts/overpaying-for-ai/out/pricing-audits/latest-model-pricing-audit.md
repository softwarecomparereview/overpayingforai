# Pricing Audit Report

**Audit date:** 2026-04-25
**Branch:** developphase2
**Auditor:** automated pricing agent

---

## Files Inspected

| File | Path |
|---|---|
| Model data | `artifacts/overpaying-for-ai/src/data/models.json` |
| Comparison data | `artifacts/overpaying-for-ai/src/data/comparisons.json` |
| Pricing page data | `artifacts/overpaying-for-ai/src/data/pricing-pages.json` |

---

## Summary

| Category | Count |
|---|---|
| Total entries audited | 44 |
| **Price corrections applied** | **5** |
| Sources updated to official provider URL | 24 |
| `last_updated` dates refreshed to 2026-04-25 | 33 |
| Comparisons with stale pricing claims fixed | 6 |
| Entries flagged for manual review | 7 |

---

## Price Corrections Applied (`models.json`)

| ID | Model | Stored Input/1M | Corrected Input/1M | Stored Output/1M | Corrected Output/1M | costScore change | Source |
|---|---|---|---|---|---|---|---|
| `deepseek-v3` | DeepSeek V3 | $0.40 | **$0.27** | $0.89 | **$1.10** | 64 → 65 | api-docs.deepseek.com |
| `deepseek-r1` | DeepSeek R1 | $1.35 | **$0.55** | $4.00 | **$2.19** | 50 → 60 | api-docs.deepseek.com |
| `mistral-large` | Mistral Large | $4.00 | **$0.50** | $12.00 | **$1.50** | 40 → 74 | mistral.ai/pricing |
| `mistral-small` | Mistral Small | $0.20 | **$0.10** | $0.60 | **$0.30** | 71 → 85 | mistral.ai/pricing |
| `command-r-plus` | Command R+ | $3.00 | **$2.50** | $15.00 | **$10.00** | 40 → 45 | cohere.com/pricing |

**Verification sources:** All corrections verified against official provider pricing pages via live web search on 2026-04-25.

---

## All Prices Verified Correct (no change to values)

| ID | Verified Input/1M | Verified Output/1M | Verified Sub/mo |
|---|---|---|---|
| gpt-4o | $2.50 | $10.00 | — |
| gpt-4o-mini | $0.15 | $0.60 | — |
| gpt-4-turbo | $10.00 | $30.00 | — (legacy) |
| o3 | $2.00 | $8.00 | — |
| o3-mini | $1.10 | $4.40 | — |
| chatgpt-plus | — | — | $20 |
| chatgpt-free | — | — | $0 |
| claude-3-5-sonnet | $3.00 | $15.00 | — |
| claude-3-5-haiku | $0.80 | $4.00 | — |
| claude-3-opus | $15.00 | $75.00 | — (legacy) |
| claude-3-haiku | $0.25 | $1.25 | — (legacy) |
| claude-pro | — | — | $20 |
| gemini-1-5-pro | $1.25 | $5.00 | — (deprecated) |
| gemini-1-5-flash | $0.075 | $0.30 | — (deprecated) |
| gemini-2-5-pro | $1.25 | $10.00 | — |
| gemini-2-5-flash | $0.30 | $2.50 | — |
| gemini-advanced | — | — | $20 |
| gemini-free | — | — | $0 |
| codestral | $0.30 | $0.90 | — |
| grok-4 | $3.00 | $15.00 | — |
| grok-4-fast | $0.20 | $0.50 | — |
| groq-llama | $0.59 | $0.79 | — |
| llama-3-1-70b | $0.59 | $0.79 | — |
| cursor-pro | — | — | $20 |
| cursor-free | — | — | $0 |
| perplexity-pro | — | — | $20 |
| copilot-free | — | — | $0 |
| jasper-creator | — | — | $49 |

---

## Source Updates Summary (`models.json`)

**24 entries** previously sourcing from the third-party aggregator `artificialanalysis.ai` were updated to official provider pricing pages:

| Provider | Official Source URL | Entries Updated |
|---|---|---|
| OpenAI | https://openai.com/api/pricing/ | gpt-4o, gpt-4o-mini, gpt-4-turbo, o3, o3-mini |
| Anthropic | https://www.anthropic.com/pricing | claude-3-5-sonnet, claude-3-5-haiku, claude-3-opus, claude-3-haiku |
| Google | https://ai.google.dev/gemini-api/docs/pricing | gemini-1-5-pro, gemini-1-5-flash, gemini-2-5-pro, gemini-2-5-flash |
| Mistral | https://mistral.ai/pricing | mistral-large, mistral-small, codestral |
| DeepSeek | https://api-docs.deepseek.com/quick_start/pricing | deepseek-v3, deepseek-r1, deepseek-coder-v2 |
| xAI | https://docs.x.ai/api/ | grok-4, grok-4-fast |
| Cohere | https://cohere.com/pricing | command-r-plus |
| Groq | https://groq.com/pricing/ | groq-llama, llama-3-1-70b |

Three entries still use the third-party aggregator source due to no official API pricing page being available for these models: `llama-3-1-instruct-70b`, `qwen-coder`, `qwen-general`.

---

## `last_updated` Refresh Summary

**33 entries** refreshed from stale dates (earliest: 2025-04-01) to `2026-04-25`. This covers all entries where the source was changed to an official URL, plus the following subscription-based entries whose plans were re-verified:

`chatgpt-plus`, `chatgpt-free`, `claude-pro`, `gemini-advanced`, `gemini-free`, `cursor-pro`, `cursor-free`, `perplexity-pro`, `groq-llama`, `llama-3-1-70b`, `copilot-free`.

---

## Comparisons Updated (`comparisons.json`)

### GPT-4o pricing corrections (6 comparisons)

All 6 comparisons that quoted the stale GPT-4o rate of `$5/1M input, $15/1M output` were corrected to the current `$2.50/1M input, $10/1M output`. Related in-body math was recalculated.

| Comparison Slug | Fields Updated |
|---|---|
| `claude-vs-gpt-cost` | `pricingComparison`, `costBreakdown`, `avoidB` — GPT-4o is now cheaper per input token than Claude 3.5 Sonnet, so the "67% more expensive" claim was corrected |
| `subscription-vs-api-ai-cost` | `pricingComparison`, monthly cost math ($8/mo → $6/mo at 500K tokens; $30/mo → $25/mo at 2M tokens) |
| `gpt-4o-vs-gpt-4o-mini-cost` | `pricingComparison`, output cost comparison ($15 → $10 per 1M output tokens) |
| `deepseek-vs-gpt4o-cost` | `pricingComparison`, monthly cost math ($150 → $100 for GPT-4o baseline) |
| `gemini-vs-gpt4o-cost` | `pricingComparison` |
| `mistral-vs-openai-cost` | `pricingComparison`, `summary` — see below |

### Mistral comparison corrected (`mistral-vs-openai-cost`)

- Mistral Large: `$2/1M input, $6/1M output` → **`$0.50/1M input, $1.50/1M output`** (Mistral Large 3, Dec 2025)
- Mistral Small: `$0.20/1M input, $0.60/1M output` → **`$0.10/1M input, $0.30/1M output`** (Mistral Small 3.1)
- `"roughly 60% cheaper"` claim updated to **`"roughly 80% cheaper"`** (Mistral Large input is now 80% cheaper than GPT-4o, not 60%)

### `pricingNotes` date freshness

All `pricingNotes` fields containing the vague phrase `"as of our last review"` or `"as last reviewed"` were updated to `"as of April 2026"`.

---

## Manual Review List

The following 7 entries could not be price-verified against an official source and retain their previously stored values:

| ID | Stored Price | Reason Unverified |
|---|---|---|
| `deepseek-coder-v2` | $0.50/$1.50/1M | DeepSeek has moved to the V4 model family; Coder V2 status and pricing unclear. Verify at api-docs.deepseek.com |
| `llama-3-1-instruct-70b` | $0.56/$0.56/1M | Equal input/output cost is unusual; only third-party aggregator data found, no official Meta API pricing page |
| `qwen-coder` | $0.35/$1.20/1M | No official Alibaba/Qwen international pricing page verified |
| `qwen-general` | $0.60/$3.60/1M | No official Alibaba/Qwen international pricing page verified |
| `writesonic-basic` | $20/mo | Writesonic has restructured its plans; current cheapest paid tier may have changed |
| `copyai-free` | $36/mo | Stored value appears to be the annual billing rate; monthly rate is $49/mo. Clarify which to display for consistency |
| `rytr-saver` | $9/mo | Search results confirm $9/mo is likely still correct, but could not reach official pricing page directly |

---

## Validation

| Check | Result |
|---|---|
| TypeScript typecheck (`tsc --noEmit`) | ✅ Pass — zero errors |
| Production build (`vite build`) | ✅ Pass — built in 7.72s |
| JSON validity (`models.json`) | ✅ Valid — 44 entries, no duplicate IDs |
| JSON validity (`comparisons.json`) | ✅ Valid |
| JSON validity (`pricing-pages.json`) | ✅ Valid — no changes required |

### Skipped items and why

| Item | Reason Skipped |
|---|---|
| `pricing-pages.json` price values | All 4 pages already carried April 2026 dates and correct plan descriptions. No corrections needed. |
| `llama-3-1-instruct-70b`, `qwen-coder`, `qwen-general` source update | No official provider API pricing URL available to link; kept third-party aggregator source with note |
| Complex editorial rewrites in comparison body text | Targeted factual price corrections were made; broader prose rewrites (e.g. rewriting complete savings examples with new arithmetic) are outside the scope of a data-accuracy audit and should be reviewed by a human |
| Subscription tool confirmations for Rytr/Copy.ai/Writesonic | Official pricing pages could not be definitively scraped; stored prices are plausible but flagged for manual confirmation |

---

## Key Market Context (April 2026)

- **Mistral Large** price dropped ~87% (from $4/$12 to $0.50/$1.50 per 1M tokens) with the December 2025 "Large 3" release. It now beats GPT-4o mini on output price.
- **GPT-4o** was cut from $5/$15 to $2.50/$10 per 1M tokens. It is now cheaper per input token than Claude 3.5 Sonnet ($3/1M).
- **DeepSeek R1** input dropped 59% (from $1.35 to $0.55/1M). DeepSeek has since released V4 models — the site tracks the original V3 and R1 anchors.
- **Cursor** restructured to a credit-based pricing model in June 2025; the $20/month Pro headline price is confirmed correct.
- **Gemini 1.5** family is deprecated (shutdown scheduled); entries remain as historical reference models on the site.

---

## Recommended Follow-Up Actions

1. **Verify Copy.ai pricing convention** — decide whether to show monthly ($49/mo) or annual ($36/mo) rate for consistency with other tools.
2. **Confirm Writesonic current plan** — their plan names have changed; the $20/mo tier may no longer exist.
3. **Consider adding newer models**: Gemini 3.1 Pro ($2/$12/1M), Claude Haiku 4.5 ($1/$5/1M), DeepSeek V4 Flash ($0.14/$0.28/1M).
4. **DeepSeek Coder V2**: Decide whether to retain as a historical reference or replace with a current DeepSeek model.
5. **Qwen pricing**: Official international pricing is available via Alibaba Cloud — verify and update source URL.
