/**
 * generateSitemap.ts
 *
 * Generates public/sitemap.xml and public/llms.txt from the site's data sources.
 *
 * Run from the artifact root (artifacts/overpaying-for-ai/):
 *   npx tsx src/utils/generateSitemap.ts
 *
 * ─── WHERE URLS COME FROM ────────────────────────────────────────────────────
 *
 * Static pages:  Hardcoded in STATIC_PAGES below. Add new top-level marketing
 *                pages here when they graduate from internal/dev-only status.
 *
 * Dynamic pages (derived from data files in src/data/):
 *   /ai-types/:slug      ← src/data/aiTypes.json      (field: slug)
 *   /compare/:slug       ← src/data/comparisons.json  (field: slug)
 *   /best/:slug          ← src/data/best-of.json       (field: slug)
 *   /guides/:slug        ← src/data/guides.json        (field: slug, updatedAt)
 *
 * ─── HOW TO ADD A NEW ROUTE GROUP ────────────────────────────────────────────
 *
 * 1. Add the data file import below (readJson helper).
 * 2. Map each item to a SitemapEntry in buildEntries().
 * 3. The entry will appear automatically in both sitemap.xml and llms.txt.
 *
 * ─── INTENTIONALLY EXCLUDED ──────────────────────────────────────────────────
 *
 * /admin/*            Internal admin pages (pricing refresh, affiliate audit)
 * /home-v1            Legacy design variant — not a canonical public page
 * /design1, /design2, /design3   Internal design explorations
 * Any route not yet promoted to a stable public slug
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { fileURLToPath } from "url";
import * as path from "path";
import * as fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../data");
const PUBLIC_DIR = path.resolve(__dirname, "../../public");
const BASE_URL = "https://overpayingforai.com";
const TODAY = new Date().toISOString().split("T")[0];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
  /** Label shown in llms.txt route listing */
  label?: string;
}

interface LlmsSection {
  heading: string;
  entries: { url: string; label: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJson<T>(filename: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), "utf-8")) as T;
}

function url(p: string): string {
  return `${BASE_URL}${p}`;
}

// ─── Static pages ─────────────────────────────────────────────────────────────
// Sorted by priority descending. Do NOT include internal/admin pages here.

const STATIC_PAGES: SitemapEntry[] = [
  { loc: url("/"),                priority: 1.0, changefreq: "weekly",  lastmod: TODAY, label: "Homepage" },
  { loc: url("/calculator"),      priority: 0.9, changefreq: "weekly",  lastmod: TODAY, label: "AI Cost Calculator" },
  { loc: url("/decision-engine"), priority: 0.8, changefreq: "monthly", lastmod: TODAY, label: "Decision Engine" },
  { loc: url("/ai-types"),        priority: 0.8, changefreq: "monthly", lastmod: TODAY, label: "AI Types Index" },
  { loc: url("/compare"),         priority: 0.7, changefreq: "monthly", lastmod: TODAY, label: "Comparisons Index" },
  { loc: url("/best"),            priority: 0.7, changefreq: "monthly", lastmod: TODAY, label: "Best Lists Index" },
  { loc: url("/guides"),          priority: 0.7, changefreq: "weekly",  lastmod: TODAY, label: "Guides Index" },
  { loc: url("/resources"),       priority: 0.7, changefreq: "monthly", lastmod: TODAY, label: "Resources Hub" },
  { loc: url("/changelog"),       priority: 0.6, changefreq: "weekly",  lastmod: TODAY, label: "Changelog" },
  { loc: url("/terms"),           priority: 0.3, changefreq: "yearly",                  label: "Terms" },
  { loc: url("/media-kit"),       priority: 0.3, changefreq: "yearly",                  label: "Media Kit" },
];

// ─── Dynamic entry builders ───────────────────────────────────────────────────

interface AiType  { slug: string; label?: string }
interface Comparison { slug: string }
interface BestOf  { slug: string; updatedAt?: string }
interface Guide   { slug: string; updatedAt?: string }

function buildEntries(): { sitemap: SitemapEntry[]; sections: LlmsSection[] } {
  const aiTypes    = readJson<AiType[]>("aiTypes.json");
  const comparisons = readJson<Comparison[]>("comparisons.json");
  const bestOf     = readJson<BestOf[]>("best-of.json");
  const guides     = readJson<Guide[]>("guides.json");

  const aiTypeEntries: SitemapEntry[] = aiTypes.map((t) => ({
    loc: url(`/ai-types/${t.slug}`),
    priority: 0.8,
    changefreq: "monthly",
    lastmod: TODAY,
    label: t.slug,
  }));

  const comparisonEntries: SitemapEntry[] = comparisons.map((c) => ({
    loc: url(`/compare/${c.slug}`),
    priority: 0.8,
    changefreq: "monthly",
    lastmod: TODAY,
    label: c.slug,
  }));

  const bestEntries: SitemapEntry[] = bestOf.map((b) => ({
    loc: url(`/best/${b.slug}`),
    priority: 0.7,
    changefreq: "monthly",
    lastmod: b.updatedAt ?? TODAY,
    label: b.slug,
  }));

  const guideEntries: SitemapEntry[] = guides.map((g) => ({
    loc: url(`/guides/${g.slug}`),
    priority: 0.7,
    changefreq: "monthly",
    lastmod: g.updatedAt ?? TODAY,
    label: g.slug,
  }));

  const sections: LlmsSection[] = [
    {
      heading: "AI Type pages",
      entries: aiTypeEntries.map((e) => ({ url: e.loc, label: e.label ?? e.loc })),
    },
    {
      heading: "Model comparison pages",
      entries: comparisonEntries.map((e) => ({ url: e.loc, label: e.label ?? e.loc })),
    },
    {
      heading: "Best-of list pages",
      entries: bestEntries.map((e) => ({ url: e.loc, label: e.label ?? e.loc })),
    },
    {
      heading: "Guide pages",
      entries: guideEntries.map((e) => ({ url: e.loc, label: e.label ?? e.loc })),
    },
  ];

  return {
    sitemap: [...aiTypeEntries, ...comparisonEntries, ...bestEntries, ...guideEntries],
    sections,
  };
}

// ─── XML generator ────────────────────────────────────────────────────────────

function buildSitemapXml(all: SitemapEntry[]): string {
  const seen = new Set<string>();
  const unique = all.filter((e) => {
    if (seen.has(e.loc)) return false;
    seen.add(e.loc);
    return true;
  });

  const urlTags = unique
    .map((e) => {
      const lastmod = e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : "";
      return (
        `  <url>\n` +
        `    <loc>${e.loc}</loc>${lastmod}\n` +
        `    <changefreq>${e.changefreq}</changefreq>\n` +
        `    <priority>${e.priority.toFixed(1)}</priority>\n` +
        `  </url>`
      );
    })
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urlTags +
    `\n</urlset>\n`
  );
}

// ─── llms.txt generator ───────────────────────────────────────────────────────

function buildLlmsTxt(sections: LlmsSection[]): string {
  const staticKeyUrls = STATIC_PAGES.filter((p) => p.label).map(
    (p) => `- ${p.loc}  (${p.label})`
  );

  const dynamicSections = sections
    .map((s) => {
      const lines = s.entries.map((e) => `- ${e.url}`).join("\n");
      return `### ${s.heading}\n${lines}`;
    })
    .join("\n\n");

  return `# OverpayingForAI

## What this site is

OverpayingForAI.com helps individuals, developers, and teams find the cheapest AI model for their workload. It provides:
- A token-based AI cost calculator for real monthly spend estimation
- Side-by-side model price comparisons
- Best-of lists by use case and budget
- Practical guides on reducing AI API and subscription costs

Owned by Aniruddh Consultancy Pty Ltd. Contact: partners@overpayingforai.com

## Canonical URL

${BASE_URL}

## Key URLs

${staticKeyUrls.join("\n")}

## Route groups

${dynamicSections}

## Authoritative content

The most reliable and frequently updated content on this site is:
- /calculator — real-time token cost calculator across 20+ AI models
- /compare/* — direct price comparisons with sourced pricing data
- /best/* — ranked model picks by use case and budget
- /guides/* — practical cost-reduction guides for API and subscription users

Pricing data is sourced from official provider pages and reviewed regularly.
All recommendations are ranked by cost efficiency, not affiliate relationships.

## Excluded / private areas

The following paths are excluded from this index and from the sitemap.
They are internal tools and are not intended for public crawling or citation:
- /admin/*  (pricing refresh tools, affiliate management)
- /home-v1  (legacy design variant)
- /design1, /design2, /design3  (internal UI explorations)
`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const { sitemap: dynamicEntries, sections } = buildEntries();
  const allEntries = [...STATIC_PAGES, ...dynamicEntries];

  const sitemapXml = buildSitemapXml(allEntries);
  const llmsTxt = buildLlmsTxt(sections);

  const sitemapPath = path.join(PUBLIC_DIR, "sitemap.xml");
  const llmsPath = path.join(PUBLIC_DIR, "llms.txt");

  fs.writeFileSync(sitemapPath, sitemapXml, "utf-8");
  fs.writeFileSync(llmsPath, llmsTxt, "utf-8");

  const totalUrls = new Set(allEntries.map((e) => e.loc)).size;
  console.log(`✓ sitemap.xml written — ${totalUrls} unique URLs`);
  console.log(`✓ llms.txt written`);
  console.log(`  Sections: ${sections.map((s) => s.heading).join(", ")}`);
}

main();
