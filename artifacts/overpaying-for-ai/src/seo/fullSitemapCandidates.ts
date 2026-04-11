/**
 * fullSitemapCandidates.ts
 *
 * Holds all known route candidates for future sitemap expansion.
 * NOT used by /sitemap.xml yet — this is for growth planning only.
 *
 * To promote a route, move it into LEAN_SITEMAP_ROUTES in leanSitemap.ts
 * and re-run the sitemap generator.
 */

export const bestPages = [
  "/best/best-ai-for-coding-on-a-budget",
  "/best/best-ai-under-20-per-month",
  "/best/best-free-ai-tools-for-builders",
  "/best/best-ai-for-writing-on-a-budget",
  "/best/best-ai-for-research-on-a-budget",
  "/best/best-ai-for-automation",
  "/best/best-ai-api-for-startups",
  "/best/ai-writing-tools-cheap",
  "/best/best-ai-for-chat-on-a-budget",
  "/best/best-open-source-ai-models",
  "/best/best-ai-for-solopreneurs",
];

export const guidePages = [
  "/guides/how-to-reduce-ai-cost",
  "/guides/token-cost-explained",
  "/guides/when-to-use-api-vs-subscription",
  "/guides/ai-routing-strategies",
  "/guides/hidden-ai-costs",
  "/guides/gpt-4o-mini-vs-full-when-to-upgrade",
  "/guides/ai-cost-for-saas-founders",
  "/guides/compare-ai-models-for-your-use-case",
  "/guides/free-ai-tools-that-are-actually-good",
  "/guides/claude-vs-chatgpt-for-business",
  "/guides/cheapest-ai-for-students",
  "/guides/chatgpt-vs-claude-cost",
];

export const comparePages = [
  "/compare/claude-vs-cursor-for-coding",
  "/compare/deepseek-vs-gpt4o-cost",
  "/compare/gemini-vs-gpt4o-cost",
  "/compare/perplexity-vs-chatgpt-cost",
  "/compare/claude-haiku-vs-gpt4o-mini",
  "/compare/writesonic-vs-jasper",
  "/compare/mistral-vs-openai-cost",
];

/**
 * Explicitly excluded from active sitemap (low-trust, thin, or utility pages):
 * - /resources
 * - /changelog
 * - /media-kit
 * - /terms
 * - /decision-engine (utility tool, not a content page)
 * - /admin/*
 * - /design1, /design2, /design3 (internal only)
 * - /home-v1 (legacy)
 */
