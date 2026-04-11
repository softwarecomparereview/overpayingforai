# SEO & Crawl/Indexing Setup

This document describes how sitemap.xml, llms.txt, and robots.txt are maintained
for OverpayingForAI.com.

---

## Files and their locations

| File | Location | Served at |
|------|----------|-----------|
| `sitemap.xml` | `public/sitemap.xml` | `/sitemap.xml` |
| `robots.txt` | `public/robots.txt` | `/robots.txt` |
| `llms.txt` | `public/llms.txt` | `/llms.txt` |
| Generator script | `src/utils/generateSitemap.ts` | (build tool only) |
| SEO component | `src/components/seo/PageSeo.tsx` | (React, per-page) |

All files in `public/` are served as-is by Vite in development and as static
assets in production — no server-side rendering required.

---

## Where sitemap URLs come from

### Static pages
Defined in `STATIC_PAGES` inside `src/utils/generateSitemap.ts`.
Add new permanent top-level pages there when they're promoted out of internal status.

### Dynamic pages (auto-derived from data files)
| Route pattern | Source file | Field used |
|---------------|-------------|------------|
| `/ai-types/:slug` | `src/data/aiTypes.json` | `slug` |
| `/compare/:slug` | `src/data/comparisons.json` | `slug` |
| `/best/:slug` | `src/data/best-of.json` | `slug`, `updatedAt` |
| `/guides/:slug` | `src/data/guides.json` | `slug`, `updatedAt` |

Adding a new entry to any of these JSON files automatically includes it in
the next sitemap regeneration.

---

## Where llms.txt entries come from

`llms.txt` is generated from the same data sources as `sitemap.xml` via the
same generator script. The "Key URLs" section uses the `STATIC_PAGES` list;
the "Route groups" section uses the four dynamic data sources above.

---

## How to regenerate (after adding new routes or data)

```bash
# from artifacts/overpaying-for-ai/
pnpm run generate:sitemap
# or
npx tsx src/utils/generateSitemap.ts
```

This overwrites `public/sitemap.xml` and `public/llms.txt` in place.
Commit the updated files after regenerating.

---

## How to add a new route group

1. Create the data JSON file under `src/data/`.
2. Open `src/utils/generateSitemap.ts`.
3. Add a `readJson<YourType[]>("your-file.json")` call in `buildEntries()`.
4. Map each item to a `SitemapEntry` (loc, priority, changefreq, lastmod, label).
5. Push the entries into the `sitemap` array and add an `LlmsSection`.
6. Regenerate: `pnpm run generate:sitemap`.

---

## robots.txt policy

- Global `Allow: /` for all crawlers
- Global `Disallow: /admin/` to keep admin tools out of search indexes
- Explicit `Allow: /` for Googlebot, Bingbot, OAI-SearchBot, GPTBot,
  Claude-Web, PerplexityBot — ensures no accidental block by a permissive
  global rule being overridden by a crawler-specific rule
- Sitemap reference included at the bottom

`robots.txt` is a static file and does not need to be regenerated when
routes change.

---

## Intentionally excluded from sitemap and llms.txt

| Path pattern | Reason |
|--------------|--------|
| `/admin/*` | Internal tools — pricing refresh, affiliate management, audit |
| `/home-v1` | Legacy design variant, not a canonical public page |
| `/design1`, `/design2`, `/design3` | Internal UI explorations |

These paths are also disallowed in `robots.txt`.

---

## Per-page SEO (React components)

Each major page uses `src/components/seo/PageSeo.tsx`, which:
- Sets `document.title` via `useEffect`
- Upserts `<meta name="description">` in the document `<head>`
- Injects/removes JSON-LD structured data scripts on mount/unmount

SEO utility functions (title generators, schema generators) live in
`src/utils/seo.ts`.
