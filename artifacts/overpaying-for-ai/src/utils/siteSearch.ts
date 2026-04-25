/**
 * siteSearch.ts — Client-side site index and search logic.
 *
 * Builds a flat searchable index from all page data at import time.
 * No server round-trips, no crawlable search result URLs, no sitemap entries.
 *
 * Usage:
 *   import { searchSite } from "@/utils/siteSearch";
 *   const results = searchSite("chatgpt pricing");  // returns SiteSearchEntry[]
 */

import comparisonsData from "@/data/comparisons.json";
import pricingData from "@/data/pricing-pages.json";
import alternativesData from "@/data/alternatives-pages.json";
import worthItData from "@/data/worth-it-pages.json";
import bestOfData from "@/data/best-of.json";
import guidesData from "@/data/guides.json";
import aiTypesData from "@/data/aiTypes.json";

export interface SiteSearchEntry {
  href: string;
  title: string;
  description: string;
  pageType: string;
  keywords: string;
}

// ─── Label helpers ────────────────────────────────────────────────────────────

const PAGE_TYPE_LABELS: Record<string, string> = {
  compare: "Compare",
  pricing: "Pricing",
  alternatives: "Alternatives",
  "worth-it": "Worth It",
  best: "Best",
  guide: "Guide",
  "ai-type": "AI Type",
  tool: "Tool",
};

function label(type: string): string {
  return PAGE_TYPE_LABELS[type] ?? type;
}

// ─── Index builder ────────────────────────────────────────────────────────────

type ComparisonEntry = {
  slug: string;
  title: string;
  description?: string;
  modelA?: string;
  modelB?: string;
  summary?: string;
};

type PricingEntry = {
  slug: string;
  title: string;
  metaDescription?: string;
  toolName?: string;
  provider?: string;
  h1?: string;
};

type AlternativesEntry = {
  slug: string;
  title: string;
  metaDescription?: string;
  h1?: string;
  intro?: string;
};

type WorthItEntry = {
  slug: string;
  title: string;
  metaDescription?: string;
  verdict?: string;
};

type BestOfEntry = {
  slug: string;
  title: string;
  description?: string;
  category?: string;
};

type GuideEntry = {
  slug: string;
  title: string;
  description?: string;
  metaDescription?: string;
};

type AiTypeEntry = {
  slug: string;
  title: string;
  tagline?: string;
  description?: string;
};

function buildIndex(): SiteSearchEntry[] {
  const entries: SiteSearchEntry[] = [];

  // ── Static / tool pages ────────────────────────────────────────────────────
  const staticPages: SiteSearchEntry[] = [
    {
      href: "/calculator",
      title: "AI Cost Calculator",
      description: "Enter your token usage and see your exact monthly AI spend.",
      pageType: label("tool"),
      keywords: "calculator cost tokens calculate price estimate spend monthly token pricing api",
    },
    {
      href: "/decision-engine",
      title: "AI Decision Engine",
      description: "5 questions to find the cheapest AI stack for your use case.",
      pageType: label("tool"),
      keywords: "decision engine recommend recommendation quiz find cheapest which ai stack use case",
    },
    {
      href: "/models",
      title: "All AI Model Pricing",
      description: "Full pricing table for every tracked AI model — input and output costs per 1K tokens.",
      pageType: label("pricing"),
      keywords: "models pricing table all llm api price gpt claude gemini deepseek mistral llama token cost per 1k",
    },
    {
      href: "/compare",
      title: "AI Model Comparisons",
      description: "Browse all side-by-side cost comparisons between AI tools and plans.",
      pageType: label("compare"),
      keywords: "compare comparison all models tools plans cost side by side",
    },
    {
      href: "/best",
      title: "Best AI Tools by Use Case",
      description: "Curated best-of lists ranked by cost-effectiveness for every use case.",
      pageType: label("best"),
      keywords: "best top ranked tools use case budget coding writing research solopreneur free",
    },
    {
      href: "/resources",
      title: "AI Cost Resources & Guides",
      description: "Guides, explainers, and resources for reducing your AI spend.",
      pageType: label("guide"),
      keywords: "resources guides how to reduce ai cost token pricing explained",
    },
    {
      href: "/ai-types",
      title: "Browse AI Types",
      description: "Understand different categories of AI tools and their pricing patterns.",
      pageType: label("ai-type"),
      keywords: "ai types general coding writing research customer support productivity categories",
    },
  ];
  entries.push(...staticPages);

  // ── Comparisons ────────────────────────────────────────────────────────────
  for (const c of comparisonsData as ComparisonEntry[]) {
    entries.push({
      href: `/compare/${c.slug}`,
      title: c.title,
      description: c.description ?? c.summary ?? "",
      pageType: label("compare"),
      keywords: [
        c.slug.replace(/-/g, " "),
        c.title,
        c.modelA ?? "",
        c.modelB ?? "",
        c.summary ?? "",
        "compare vs cost pricing overpaying chatgpt claude openai anthropic gemini",
      ]
        .join(" ")
        .toLowerCase(),
    });
  }

  // ── Pricing pages ──────────────────────────────────────────────────────────
  for (const p of pricingData as PricingEntry[]) {
    entries.push({
      href: `/pricing/${p.slug}`,
      title: p.title,
      description: p.metaDescription ?? p.h1 ?? "",
      pageType: label("pricing"),
      keywords: [
        p.slug.replace(/-/g, " "),
        p.title,
        p.toolName ?? "",
        p.provider ?? "",
        p.h1 ?? "",
        "pricing plans cost worth overpaying subscription monthly fee openai anthropic google",
      ]
        .join(" ")
        .toLowerCase(),
    });
  }

  // ── Alternatives ───────────────────────────────────────────────────────────
  for (const a of alternativesData as AlternativesEntry[]) {
    entries.push({
      href: `/alternatives/${a.slug}`,
      title: a.title,
      description: a.metaDescription ?? a.intro?.slice(0, 120) ?? "",
      pageType: label("alternatives"),
      keywords: [
        a.slug.replace(/-/g, " "),
        a.title,
        a.h1 ?? "",
        a.intro?.slice(0, 200) ?? "",
        "alternatives cheaper better compare overpaying cheaper than chatgpt free option switch",
      ]
        .join(" ")
        .toLowerCase(),
    });
  }

  // ── Worth It pages ─────────────────────────────────────────────────────────
  for (const w of worthItData as WorthItEntry[]) {
    entries.push({
      href: `/worth-it/${w.slug}`,
      title: w.title,
      description: w.metaDescription ?? w.verdict?.slice(0, 120) ?? "",
      pageType: label("worth-it"),
      keywords: [
        w.slug.replace(/-/g, " "),
        w.title,
        w.verdict?.slice(0, 200) ?? "",
        "worth it should i pay is it worth value overpaying ai subscription monthly fee chatgpt openai anthropic claude",
      ]
        .join(" ")
        .toLowerCase(),
    });
  }

  // ── Best-of pages ──────────────────────────────────────────────────────────
  for (const b of bestOfData as BestOfEntry[]) {
    entries.push({
      href: `/best/${b.slug}`,
      title: b.title,
      description: b.description ?? "",
      pageType: label("best"),
      keywords: [
        b.slug.replace(/-/g, " "),
        b.title,
        b.description ?? "",
        b.category ?? "",
        "best top budget free cheap",
      ]
        .join(" ")
        .toLowerCase(),
    });
  }

  // ── Guides ─────────────────────────────────────────────────────────────────
  for (const g of guidesData as GuideEntry[]) {
    entries.push({
      href: `/guides/${g.slug}`,
      title: g.title,
      description: g.description ?? g.metaDescription ?? "",
      pageType: label("guide"),
      keywords: [
        g.slug.replace(/-/g, " "),
        g.title,
        g.description ?? "",
        "guide how to tutorial reduce cost token",
      ]
        .join(" ")
        .toLowerCase(),
    });
  }

  // ── AI Type pages ──────────────────────────────────────────────────────────
  for (const t of aiTypesData as AiTypeEntry[]) {
    entries.push({
      href: `/ai-types/${t.slug}`,
      title: t.title,
      description: t.tagline ?? t.description?.slice(0, 120) ?? "",
      pageType: label("ai-type"),
      keywords: [
        t.slug.replace(/-/g, " "),
        t.title,
        t.tagline ?? "",
        t.description?.slice(0, 200) ?? "",
        "ai type category",
      ]
        .join(" ")
        .toLowerCase(),
    });
  }

  return entries;
}

// Built once at module load time — cheap to hold in memory, all static data
const SITE_INDEX: SiteSearchEntry[] = buildIndex();

// ─── Search ────────────────────────────────────────────────────────────────

/**
 * Score an index entry against a list of query tokens.
 * Word-boundary matches score 3, substring matches score 1.
 * Returns 0 if no tokens match.
 */
function scoreEntry(entry: SiteSearchEntry, tokens: string[]): number {
  const haystack = entry.keywords;
  let score = 0;
  for (const token of tokens) {
    if (!token) continue;
    // Count ALL word-boundary occurrences so pages with the term in slug + title + toolName
    // rank above pages that only have it once in a generic suffix.
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const wordBoundary = new RegExp(`(?:^|\\s)${escaped}`, "gi");
    const wbCount = (haystack.match(wordBoundary) ?? []).length;
    if (wbCount > 0) {
      score += wbCount * 3;
    } else if (haystack.includes(token)) {
      score += 1;
    }
  }
  return score;
}

/**
 * Search the site index.
 * @param query — Raw user query string
 * @param limit — Max results to return (default 8)
 */
export function searchSite(query: string, limit = 8): SiteSearchEntry[] {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 1) return [];

  const tokens = trimmed.toLowerCase().split(/\s+/).filter((t) => t.length >= 1);

  const scored = SITE_INDEX.map((entry) => ({
    entry,
    score: scoreEntry(entry, tokens),
  }));

  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.entry);
}

export { SITE_INDEX };
