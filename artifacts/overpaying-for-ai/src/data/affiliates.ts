/**
 * AFFILIATE CONFIG — Central data source for all affiliate URLs and provider metadata.
 *
 * HOW TO ADD A NEW PROVIDER:
 *   1. Add an entry below with a unique id (lowercase, hyphen-separated).
 *   2. Set affiliateUrl to null initially and status to "pending".
 *   3. When your affiliate program is approved, set affiliateUrl to the tracking URL
 *      and change status to "active".
 *
 * HOW TO ACTIVATE AN AFFILIATE LINK LATER:
 *   - Set affiliateUrl to the full tracking URL (e.g. "https://example.com?ref=overpaying")
 *   - Change status from "pending" to "active"
 *   - Update updatedAt to today's date
 *
 * HOW FALLBACK WORKS:
 *   - If affiliateUrl is null, the resolver uses fallbackUrl (an internal page).
 *   - fallbackUrl should be the most relevant internal comparison/details page.
 *   - If neither is suitable, "/decision-engine" is the safe universal fallback.
 */

export interface AffiliateEntry {
  id: string;
  name: string;
  affiliateUrl: string | null;
  directUrl?: string;
  fallbackUrl: string;
  status: "active" | "pending" | "unavailable";
  ctaLabelPrimary?: string;
  ctaLabelSecondary?: string;
  notes?: string;
  updatedAt?: string;
}

export const affiliates: Record<string, AffiliateEntry> = {
  anthropic: {
    id: "anthropic",
    name: "Anthropic / Claude",
    affiliateUrl: null,
    directUrl: "https://claude.ai",
    fallbackUrl: "/compare/claude-vs-gpt-cost",
    status: "pending",
    ctaLabelPrimary: "Start with Claude",
    ctaLabelSecondary: "Compare alternatives",
    notes: "Affiliate program application in progress.",
    updatedAt: "2026-04-11",
  },
  openai: {
    id: "openai",
    name: "OpenAI / ChatGPT",
    affiliateUrl: null,
    directUrl: "https://openai.com",
    fallbackUrl: "/compare/gpt-4o-vs-gpt-4o-mini-cost",
    status: "pending",
    ctaLabelPrimary: "Start with OpenAI",
    ctaLabelSecondary: "Compare alternatives",
    notes: "No public affiliate program as of 2026-04.",
    updatedAt: "2026-04-11",
  },
  cursor: {
    id: "cursor",
    name: "Cursor",
    affiliateUrl: null,
    directUrl: "https://cursor.com",
    fallbackUrl: "/compare/chatgpt-vs-cursor-cost",
    status: "pending",
    ctaLabelPrimary: "Start with Cursor",
    ctaLabelSecondary: "Compare alternatives",
    notes: "Affiliate program application in progress.",
    updatedAt: "2026-04-11",
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    affiliateUrl: null,
    directUrl: "https://deepseek.com",
    fallbackUrl: "/compare/deepseek-vs-gpt4o-cost",
    status: "pending",
    ctaLabelPrimary: "Start with DeepSeek",
    ctaLabelSecondary: "Compare alternatives",
    notes: "Affiliate program not available as of 2026-04.",
    updatedAt: "2026-04-11",
  },
  google: {
    id: "google",
    name: "Google / Gemini",
    affiliateUrl: null,
    directUrl: "https://gemini.google.com",
    fallbackUrl: "/compare/gemini-vs-gpt4o-cost",
    status: "pending",
    ctaLabelPrimary: "Start with Gemini",
    ctaLabelSecondary: "Compare alternatives",
    notes: "No affiliate program for Gemini API as of 2026-04.",
    updatedAt: "2026-04-11",
  },
  github: {
    id: "github",
    name: "GitHub Copilot",
    affiliateUrl: null,
    directUrl: "https://github.com/features/copilot",
    fallbackUrl: "/compare/cursor-vs-copilot",
    status: "pending",
    ctaLabelPrimary: "Try GitHub Copilot",
    ctaLabelSecondary: "Compare alternatives",
    notes: "GitHub affiliate program under review.",
    updatedAt: "2026-04-11",
  },
  perplexity: {
    id: "perplexity",
    name: "Perplexity",
    affiliateUrl: null,
    directUrl: "https://perplexity.ai",
    fallbackUrl: "/decision-engine",
    status: "pending",
    ctaLabelPrimary: "Try Perplexity",
    ctaLabelSecondary: "Find alternatives",
    updatedAt: "2026-04-11",
  },
  mistral: {
    id: "mistral",
    name: "Mistral",
    affiliateUrl: null,
    directUrl: "https://mistral.ai",
    fallbackUrl: "/decision-engine",
    status: "pending",
    ctaLabelPrimary: "Try Mistral",
    ctaLabelSecondary: "Find alternatives",
    updatedAt: "2026-04-11",
  },
  writesonic: {
    id: "writesonic",
    name: "Writesonic",
    affiliateUrl: null,
    directUrl: "https://writesonic.com",
    fallbackUrl: "/compare/writesonic-vs-jasper",
    status: "pending",
    ctaLabelPrimary: "Try Writesonic",
    ctaLabelSecondary: "Compare alternatives",
    notes: "Affiliate program application pending.",
    updatedAt: "2026-04-11",
  },
  jasper: {
    id: "jasper",
    name: "Jasper",
    affiliateUrl: null,
    directUrl: "https://jasper.ai",
    fallbackUrl: "/compare/writesonic-vs-jasper",
    status: "pending",
    ctaLabelPrimary: "Try Jasper",
    ctaLabelSecondary: "Compare alternatives",
    notes: "Affiliate program application pending.",
    updatedAt: "2026-04-11",
  },
  copyai: {
    id: "copyai",
    name: "Copy.ai",
    affiliateUrl: null,
    directUrl: "https://copy.ai",
    fallbackUrl: "/best/ai-writing-tools-cheap",
    status: "pending",
    ctaLabelPrimary: "Try Copy.ai",
    ctaLabelSecondary: "Compare alternatives",
    notes: "Affiliate program application pending.",
    updatedAt: "2026-04-11",
  },
  rytr: {
    id: "rytr",
    name: "Rytr",
    affiliateUrl: null,
    directUrl: "https://rytr.me",
    fallbackUrl: "/best/ai-writing-tools-cheap",
    status: "pending",
    ctaLabelPrimary: "Try Rytr",
    ctaLabelSecondary: "Compare alternatives",
    notes: "Affiliate program application pending.",
    updatedAt: "2026-04-11",
  },
};
