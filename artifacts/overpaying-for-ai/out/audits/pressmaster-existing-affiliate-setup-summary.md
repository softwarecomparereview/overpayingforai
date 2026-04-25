# Pressmaster.ai — Affiliate Integration Summary
**Date:** 2026-04-25
**Branch:** developphase2

---

## Existing Affiliate Setup Discovered

### Central config
`src/data/affiliates.ts` — all affiliate partners live here as a typed `Record<string, AffiliateEntry>`.

**`AffiliateEntry` schema:**
| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Lowercase, hyphen-separated |
| `name` | `string` | Human-readable display name |
| `affiliateUrl` | `string \| null` | Live tracking URL; `null` = pending |
| `directUrl` | `string` (optional) | Tool homepage; used as outbound CTA when no affiliate URL |
| `fallbackUrl` | `string` | Internal page; used only when both above are absent |
| `status` | `"active" \| "pending" \| "unavailable"` | |
| `ctaLabelPrimary` | `string` (optional) | Button label for primary CTA |
| `ctaLabelSecondary` | `string` (optional) | Button label for secondary CTA |
| `notes` | `string` (optional) | Internal notes |
| `updatedAt` | `string` (optional) | ISO date |

**Existing partners (12 before this change):** anthropic, openai, cursor, deepseek, google, github, perplexity, mistral, writesonic, jasper, copyai, rytr — all `status: "pending"`, `affiliateUrl: null`.

Pressmaster is the **first `status: "active"` entry** with a live `affiliateUrl`.

### Resolver
`src/utils/affiliateResolver.ts` — two key functions:
- `modelIdToProviderId(modelId)` — maps a pick's `modelId` string (from `best-of.json`) to an affiliate provider ID
- `providerNameToId(name)` — maps a human-readable provider name (used in `aiTypes.json`) to provider ID
- `getAffiliateTarget(toolId, context)` → `AffiliateTarget` — prefers `affiliateUrl`, then `directUrl`, then `fallbackUrl`
- `getPrimaryCta(toolId, context)` — alias for `getAffiliateTarget`, used in page components

### Component
`src/components/monetization/AffiliateCta.tsx` — renders an `<a>` (external) or `<Link>` (internal) based on `AffiliateTarget.isExternal`. Fires `trackCta()` on every click.

### Analytics
`src/utils/analytics.ts` — `trackCta()` fires two events on every CTA click:
1. `affiliate_clicked` (internal / Segment-style) — payload: `{ providerId, providerName, ctaLabel, ctaType, ctaState, pageType, sourceComponent, destinationUrl, isExternal }`
2. `affiliate_click` (GA4 via `ga4.ts`)

No `/go/` redirect route exists. The codebase uses direct outbound links (`affiliateUrl` or `directUrl`) resolved at runtime.

### How best-of CTAs flow
`BestPage.tsx` iterates `page.picks`, calls `modelIdToProviderId(pick.modelId)` → `getPrimaryCta(providerId)` → renders `<AffiliateCta>`. Tracking fires automatically with `providerId` and `pageType: "best"`.

---

## Files Changed

| File | Change |
|---|---|
| `src/data/affiliates.ts` | Added `pressmaster` entry (1 new record) |
| `src/utils/affiliateResolver.ts` | Added `pressmaster` prefix to `modelIdToProviderId()`; added `"Pressmaster"` and `"Pressmaster.ai"` to `providerNameToId()` |
| `src/data/best-of.json` | Added Pressmaster as rank 5 pick in `ai-writing-tools-cheap` and `best-ai-for-solopreneurs` |

---

## Pressmaster Data Added

### `affiliates.ts` entry
```ts
pressmaster: {
  id: "pressmaster",
  name: "Pressmaster.ai",
  affiliateUrl: "https://pressmasterai.cello.so/ivYDJwIP9XL",
  directUrl: "https://pressmaster.ai",
  fallbackUrl: "/best/ai-writing-tools-cheap",
  status: "active",
  ctaLabelPrimary: "Try Pressmaster",
  ctaLabelSecondary: "Compare writing tools",
  notes: "Active referral via Cello. Best for LinkedIn content workflows, thought leadership, and founder-led content publishing. Not for API cost optimization or coding tools.",
  updatedAt: "2026-04-25",
}
```

### `modelIdToProviderId` mapping
```ts
if (id.startsWith("pressmaster")) return "pressmaster";
```

### `providerNameToId` entries
```ts
Pressmaster: "pressmaster",
"Pressmaster.ai": "pressmaster",
```

---

## Pages / Components Where CTA Appears

| Page | Slug | Pick Rank | Badge |
|---|---|---|---|
| Best AI Writing Tools on a Budget | `/best/ai-writing-tools-cheap` | 5 | Best for LinkedIn & Thought Leadership |
| Best AI Stack for Solopreneurs | `/best/best-ai-for-solopreneurs` | 5 | Best for Founder Content Publishing |

Both picks use `modelId: "pressmaster-pro"` which resolves to affiliate ID `"pressmaster"` via `modelIdToProviderId()`. CTA label: `"Try Pressmaster.ai →"` (constructed by `BestPage.tsx` pattern `Try ${pick.title}`).

---

## Pages Deliberately Excluded

| Page | Reason |
|---|---|
| `/calculator` | Token/API cost calculator — not relevant |
| `/models` (pricing table) | Model-cost comparison — not relevant |
| `/compare/*` | Head-to-head model API comparisons — not relevant |
| `/best/best-ai-for-coding-on-a-budget` | Coding focus — not relevant |
| `/best/best-ai-api-for-startups` | API/token optimization — not relevant |
| `/best/best-ai-for-automation` | Automation pipelines — not relevant |
| `/best/best-ai-for-research-on-a-budget` | Research focus — not relevant |
| `/best/best-ai-for-chat-on-a-budget` | Chat assistants — not relevant |
| `/best/best-open-source-ai-models` | Self-hosted models — not relevant |
| `/best/best-free-ai-tools-for-builders` | Developer/builder focus — not relevant |
| `aiTypes` pages | None of the 6 AI type pages match content publishing |
| `comparisons.json` | No Pressmaster comparison added |
| `models.json` | Pressmaster has no token pricing; not added as an AIModel |

---

## Analytics Event Used

**Primary event:** `affiliate_clicked` (fired by `trackCta()` in `AffiliateCta.tsx`)
**GA4 event:** `affiliate_click`

No new events were created. Pressmaster clicks will appear in analytics with:
- `providerId: "pressmaster"`
- `providerName: "Pressmaster.ai"`
- `ctaState: "affiliate"` (because `affiliateUrl` is set and `status: "active"`)
- `ctaLabel: "Try Pressmaster.ai →"`
- `pageType: "best"`
- `sourceComponent: undefined` (BestPage does not set sourceComponent on picks)
- `destinationUrl: "https://pressmasterai.cello.so/ivYDJwIP9XL"`
- `isExternal: true`

---

## Disclosure Behavior

`AffiliateCta.tsx` always renders external affiliate links with `rel="noopener noreferrer sponsored"` — the `sponsored` rel attribute is the standard affiliate disclosure signal for all links where `affiliateUrl` is set. No separate inline disclosure text is added by the component; this matches the existing pattern for all other partners.

---

## Validation Results

| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ EXIT:0, zero errors |
| `pnpm build` | ✅ EXIT:0, 8.19s |
| Grep: "pressmaster" in source | ✅ 9 lines — only in `affiliates.ts`, `affiliateResolver.ts`, `best-of.json` |
| Grep: raw referral URL `pressmasterai.cello.so` | ✅ 1 line — only in `affiliates.ts` |
| Absent from comparisons.json, models.json, Calculator, aiTypes | ✅ 0 hits |
| Absent from coding / API / chat / research best-of pages | ✅ 0 hits |
| No new affiliate architecture created | ✅ Confirmed |
| No new analytics events invented | ✅ Uses `affiliate_clicked` / `affiliate_click` as before |

---

## Remaining TODOs

- None. Pressmaster is live (`status: "active"`, `affiliateUrl` set). No further activation step needed.
- Optional future: if Pressmaster provides a dedicated landing page or discount link, update `affiliateUrl` in `affiliates.ts` and set `updatedAt`.
- Optional future: if an `aiTypes` category for "content publishing" or "LinkedIn tools" is added, add Pressmaster to its `affiliate_picks` array using `providerNameToId("Pressmaster")`.
