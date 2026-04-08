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
- `/compare/:slug` — 10 pre-seeded AI tool comparison pages
- `/best/:slug` — 10 pre-seeded best-of lists
- `/guides/:slug` — 10 pre-seeded practical guides

**Data layer** (`src/data/`):
- `models.json` — 20 AI models with pricing, quality, cost, latency scores
- `comparisons.json` — 10 comparison pages (slug, content, FAQ, links)
- `best-of.json` — 10 best-of lists (picks, FAQs, links)
- `guides.json` — 10 guides (sections, key takeaways, links)
- `faqs.json` — 12 global FAQs

**Engine** (`src/engine/`):
- `types.ts` — Shared TypeScript types
- `calculator.ts` — Token-based cost calculation + alternative model comparison
- `recommender.ts` — Deterministic scoring engine (budget fit, use-case match, quality preference)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
