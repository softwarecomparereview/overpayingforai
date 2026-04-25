export type SitemapEntry = {
  path: string;
  priority?: string;
  changefreq?: string;
};

export const LEAN_SITEMAP_ROUTES: SitemapEntry[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/best", priority: "0.9", changefreq: "weekly" },
  { path: "/calculator", priority: "0.9", changefreq: "weekly" },
  { path: "/ai-types", priority: "0.8", changefreq: "weekly" },

  { path: "/ai-types/general-ai", priority: "0.8", changefreq: "weekly" },
  { path: "/ai-types/coding-ai", priority: "0.8", changefreq: "weekly" },
  { path: "/ai-types/writing-ai", priority: "0.8", changefreq: "weekly" },
  { path: "/ai-types/research-ai", priority: "0.8", changefreq: "weekly" },
  { path: "/ai-types/customer-support-ai", priority: "0.8", changefreq: "weekly" },
  { path: "/ai-types/productivity-ai", priority: "0.8", changefreq: "weekly" },

  // Priority commercial cluster
  { path: "/compare/chatgpt-vs-claude", priority: "0.9", changefreq: "weekly" },
  { path: "/pricing/chatgpt-pricing", priority: "0.9", changefreq: "weekly" },
  { path: "/pricing/claude-pricing", priority: "0.9", changefreq: "weekly" },
  { path: "/alternatives/best-chatgpt-alternatives", priority: "0.8", changefreq: "weekly" },
  { path: "/worth-it/is-chatgpt-plus-worth-it", priority: "0.8", changefreq: "weekly" },

  { path: "/compare/claude-vs-gpt-cost", priority: "0.8", changefreq: "weekly" },
  { path: "/compare/chatgpt-vs-cursor-cost", priority: "0.8", changefreq: "weekly" },
  { path: "/compare/subscription-vs-api-ai-cost", priority: "0.8", changefreq: "weekly" },
  { path: "/compare/gpt-4o-vs-gpt-4o-mini-cost", priority: "0.8", changefreq: "weekly" },

  { path: "/guides/cheapest-ai-content-workflow", priority: "0.7", changefreq: "weekly" },
  { path: "/guides/cheapest-ai-writing-tools", priority: "0.7", changefreq: "weekly" },
  { path: "/guides/best-ai-tools-under-20", priority: "0.7", changefreq: "weekly" },
  { path: "/guides/is-jasper-worth-it", priority: "0.7", changefreq: "weekly" },
];

export const CANONICAL_SITE_URL = "https://overpayingforai.com";
