# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Overpaying for AI (`artifacts/overpaying-for-ai`)
Static-first React + Vite web app. No backend dependency.

**Purpose**: SEO-first decision engine for finding the cheapest viable AI model, plan, or workflow.

**Routes**:
- `/` — Homepage with hero, comparisons, best lists, guides, FAQ
- `/calculator` — Cost calculator (model × tokens → monthly estimate + cheaper alternatives)
- `/decision-engine` — 5-step guided wizard → 3 ranked recommendations
- `/compare/:slug` — 13 comparison pages (includes chatgpt-vs-claude, chatgpt-vs-gemini, claude-vs-gemini)
- `/pricing/:slug` — 3 pricing breakdown pages (chatgpt-pricing, claude-pricing, gemini-pricing)
- `/worth-it/:slug` — 2 "is it worth it" pages
- `/alternatives/:slug` — 1 alternatives guide (best-chatgpt-alternatives)
- `/calculator/ai-savings-calculator` — redirects to `/calculator`
- `/best/:slug` — 10 pre-seeded best-of lists
- `/guides/:slug` — 10 pre-seeded practical guides

**Data layer** (`src/data/`):
- `models.json` — 20 AI models with pricing, quality, cost, latency scores
- `comparisons.json` — 13 comparison pages (slug, content, FAQ, links)
- `pricing-pages.json` — 3 pricing breakdown pages (chatgpt, claude, gemini)
- `worth-it-pages.json` — 2 "is it worth it" editorial pages
- `alternatives-pages.json` — 1 alternatives guide
- `best-of.json` — 10 best-of lists (picks, FAQs, links)
- `guides.json` — 10 guides (sections, key takeaways, links)
- `faqs.json` — 12 global FAQs

**Engine** (`src/engine/`):
- `types.ts` — Shared TypeScript types (`AIModel` includes optional `source?` and `last_updated?` fields)
- `calculator.ts` — Token-based cost calculation + alternative model comparison
- `recommender.ts` — Deterministic scoring engine (budget fit, use-case match, quality preference)

**Utils** (`src/utils/`):
- `analytics.ts` — Allowlisted event tracker; events: `calculator_*`, `affiliate_clicked`, `seo_page_viewed`, `seo_cta_clicked`, `pricing_refresh_*`
- `pricingFreshness.ts` — Freshness helpers: `getDaysSinceUpdate`, `isPricingStale`, `freshnessLabel`
- `pricingDiff.ts` — Diff engine: `computePricingDiff`, `applyApprovedDiffs`, `generateChangelogEntry`, `generateSampleCandidates`
- `providerPricing/` — Provider adapter layer (admin-only; never imported on public pages)
  - `types.ts` — `ProviderFetchResult`, `FetchDataQuality` types
  - `openai.ts` — `fetchOpenAIPricingCandidates()` — source: openai.com/api/pricing
  - `anthropic.ts` — `fetchAnthropicPricingCandidates()` — source: anthropic.com/pricing
  - `google.ts` — `fetchGooglePricingCandidates()` — source: ai.google.dev/pricing
  - `index.ts` — barrel export
  - **CORS note**: Provider pricing pages are JS-rendered SPAs; direct browser fetch returns HTML shells without data. Each adapter returns `status: "known-good"` reference data. To enable live fetch, implement a serverless layer (e.g. Cloudflare Worker) per the in-code upgrade instructions and update `tryLiveFetch()` in each adapter.

**SEO components** (`src/components/seo/`):
- `PageSeo.tsx` — Sets title, meta description, JSON-LD schema, and canonical `<link>` tag. Props: `title?`, `description?`, `schema?`, `canonicalUrl?`. All optional with fallbacks.
- `InternalLinks.tsx` — Renders a "Related" link strip. `links` prop is optional; falls back to site-wide FALLBACK_LINKS if omitted. `maxLinks` defaults to 8.
- `SeoContentBlock.tsx` — Reusable editorial content block (audience, not-for, pricing insights, alternatives, final verdict). All props optional with defaults.

**SEO pages**:
- `/best` — `BestAiTools.tsx` pillar page (1500+ words, category grid, cheapest models, how-to guide, subscription vs API comparison). Replaced the old `BestIndex`.
- Canonical tags injected on all pages via `PageSeo`
- Pricing freshness badge (`freshnessLabel`/`isPricingStale`) on AI Type pages' pricing section
- `InternalLinks` and `SeoContentBlock` injected on: AiTypePage, AiTypeIndex, GuidePage, ComparePage, BestPage, BestIndex

**Lean Sitemap system** (`src/seo/`):
- `leanSitemap.ts` — `LEAN_SITEMAP_ROUTES` (18 high-trust URLs) + `CANONICAL_SITE_URL`
- `generateLeanSitemapXml.ts` — XML generator (runs validation before building)
- `validateSitemapEntries.ts` — Guards: paths start with `/`, no `www.`, no full URLs, no duplicates
- `fullSitemapCandidates.ts` — Non-active expansion candidates grouped by bestPages/guidePages/comparePages
- `generateLeanSitemap.ts` — Runner script: `npx tsx src/seo/generateLeanSitemap.ts` → writes `public/sitemap.xml`
- `public/sitemap.xml` — Static file served by Vite; currently contains 18 lean URLs only
- Admin preview: `/admin/sitemap-preview` — Shows route table, validation checks, generated XML

**Legacy sitemap** (`src/utils/generateSitemap.ts`):
- Kept for reference; filters out low-quality pages (coming-soon/draft/empty). Not used for active sitemap.

**Admin** (`src/pages/admin/`):
- `PricingRefreshPage.tsx` — Maintainer-only pricing refresh workflow at `/admin/pricing-refresh`
  - Guard: `localStorage.getItem("overpaying_admin") === "1"`; unlock key is `"refresh"`
  - Lock button clears the localStorage key
  - 3-step flow: (1) Load/paste candidate JSON → (2) Review diff per model with approve/reject/mark-reviewed → (3) Export updated models.json + changelog
  - Bulk actions: "Approve all changed", "Mark all unchanged reviewed", "Clear all"
  - Filters: All / Changed / Stale / Added / Removed
  - Rendered outside the public `<Layout>` wrapper (no nav bar)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
