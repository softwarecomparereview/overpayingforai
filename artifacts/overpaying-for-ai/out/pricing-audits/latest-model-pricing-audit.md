# Pricing Audit Report — April 25, 2026

**Scope:** All 44 entries in `models.json`, all 4 pages in `pricing-pages.json`, all 14 comparisons in `comparisons.json`.
**Sources checked:** OpenAI, Anthropic, Google AI, Mistral, DeepSeek, xAI, Groq, Cohere, Cursor, Perplexity, Jasper, Rytr, Copy.ai, Writesonic (official pricing pages via live web search, April 2026).

---

## Summary

| Category | Count |
|---|---|
| Entries audited | 44 |
| **Price corrections applied** | **5** |
| Source updated to official URL | 24 |
| Date refreshed (was stale 2025-04-01) | 33 |
| Entries needing manual review | 7 |
| Comparisons with stale price claims fixed | 6 |
| Build result | ✅ Pass (typecheck + vite build) |

---

## Price Corrections Applied (`models.json`)

| ID | Model | Stored Input/1M | Corrected Input/1M | Stored Output/1M | Corrected Output/1M | New costScore | Notes |
|---|---|---|---|---|---|---|---|
| `deepseek-v3` | DeepSeek V3 | $0.40 | **$0.27** | $0.89 | **$1.10** | 65 (was 64) | Original V3 (Dec 2024) official pricing |
| `deepseek-r1` | DeepSeek R1 | $1.35 | **$0.55** | $4.00 | **$2.19** | 60 (was 50) | R1 (Jan 2025) official pricing |
| `mistral-large` | Mistral Large | $4.00 | **$0.50** | $12.00 | **$1.50** | 74 (was 40) | Mistral Large 3 (Dec 2025) — major drop |
| `mistral-small` | Mistral Small | $0.20 | **$0.10** | $0.60 | **$0.30** | 85 (was 71) | Mistral Small 3.1 |
| `command-r-plus` | Command R+ | $3.00 | **$2.50** | $15.00 | **$10.00** | 45 (was 40) | Command R+ 08-2024 version |

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

## Entries Needing Manual Review (pricing not confirmed from official source)

| ID | Stored Price | Issue |
|---|---|---|
| `deepseek-coder-v2` | $0.50/$1.50/1M | DeepSeek has moved to V4 family; Coder V2 pricing unclear. Check api-docs.deepseek.com |
| `llama-3-1-instruct-70b` | $0.56/$0.56/1M | Equal input/output cost is unusual; sourced via third-party aggregator only |
| `qwen-coder` | $0.35/$1.20/1M | No official Alibaba/Qwen API pricing page verified |
| `qwen-general` | $0.60/$3.60/1M | No official Alibaba/Qwen API pricing page verified |
| `writesonic-basic` | $20/mo | Writesonic has restructured plans; current cheapest paid tier may differ |
| `copyai-free` | $36/mo | Copy.ai Pro is $49/mo monthly or $36/mo annually — stored price is annual rate |
| `rytr-saver` | $9/mo | Could not fully verify; likely still correct per search results |

---

## Sources Updated to Official URLs

All 24 entries that were previously sourcing from `artificialanalysis.ai` have been updated to the official provider pricing page. Three entries still use third-party sources due to no official pricing page available:

- `llama-3-1-instruct-70b` — artificialanalysis.ai
- `qwen-coder` — artificialanalysis.ai
- `qwen-general` — artificialanalysis.ai

---

## Comparisons Updated (`comparisons.json`)

All 6 comparisons that contained stale GPT-4o price claims (`$5/1M input, $15/1M output`) have been corrected to the current `$2.50/1M input, $10/1M output`. The Mistral Large comparison was also corrected from `$2/$6` to `$0.50/$1.50` and Mistral Small from `$0.20/$0.60` to `$0.10/$0.30`.

| Comparison Slug | Fix Applied |
|---|---|
| `claude-vs-gpt-cost` | GPT-4o price corrected; avoidB editorial updated (GPT-4o now cheaper per input than Claude) |
| `subscription-vs-api-ai-cost` | GPT-4o API price + monthly cost math updated |
| `gpt-4o-vs-gpt-4o-mini-cost` | GPT-4o pricingComparison + output token math corrected |
| `deepseek-vs-gpt4o-cost` | GPT-4o price corrected; monthly cost math updated |
| `gemini-vs-gpt4o-cost` | GPT-4o price corrected |
| `mistral-vs-openai-cost` | GPT-4o, Mistral Large, Mistral Small prices all corrected |

Stale "as of our last review" phrases updated to "as of April 2026" across all relevant pricingNotes fields.

---

## Pricing Pages (`pricing-pages.json`)

No price corrections needed. All 4 pages (`chatgpt-pricing`, `claude-pricing`, `gemini-pricing`, `gpt-5-5-pricing`) already carried April 2026 dates and correct plan descriptions. No changes made.

---

## Key Market Context (April 2026)

- **Mistral Large** dropped ~87% from $4/$12 to $0.50/$1.50 per 1M tokens (Dec 2025 version). It is now cheaper per token than GPT-4o mini for output.
- **GPT-4o** price was cut in half (from $5/$10 to $2.50/$10), making it cheaper per input than Claude 3.5 Sonnet. The comparisons `claude-vs-gpt-cost` now correctly reflect this reversal.
- **DeepSeek R1** dropped 59% on input from $1.35 to $0.55/1M. DeepSeek has since released V4 (flash/pro) models — the site tracks the original R1 and V3 anchors.
- **Cursor** restructured to credit-based pricing in June 2025; the $20/month Pro price is confirmed correct.
- **Google Gemini 1.5** family is deprecated (shutdown announced); entries remain as historical reference models on the site.

---

## Recommended Follow-Up Actions

1. **Add Mistral Large 3 deprecation note** to the `mistral-large` entry (the model is "Mistral Large" but specifically the Dec 2025 "2512" version).
2. **Verify Copy.ai pricing** — stored value ($36/mo) is the annual rate; consider showing monthly rate ($49/mo) for consistency with other subscription tools.
3. **Consider adding newer models**: Gemini 3.1 Pro ($2/$12/1M), Claude Haiku 4.5 ($1/$5/1M), DeepSeek V4 Flash/Pro — all released in 2025–2026.
4. **DeepSeek Coder V2**: Confirm whether to retain or replace with a current DeepSeek model (V3.2 or V4).
5. **Qwen pricing**: Official Qwen API pricing is available via Alibaba Cloud; verify and update source.

---

*Audit completed: 2026-04-25 | Auditor: automated pricing agent*
