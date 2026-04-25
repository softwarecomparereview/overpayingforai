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

  // Priority commercial cluster — first cluster
  { path: "/compare/chatgpt-vs-claude", priority: "0.9", changefreq: "weekly" },
  { path: "/pricing/chatgpt-pricing", priority: "0.9", changefreq: "weekly" },
  { path: "/pricing/claude-pricing", priority: "0.9", changefreq: "weekly" },
  { path: "/alternatives/best-chatgpt-alternatives", priority: "0.8", changefreq: "weekly" },
  { path: "/worth-it/is-chatgpt-plus-worth-it", priority: "0.8", changefreq: "weekly" },

  // Second commercial cluster — Gemini + savings calculator
  { path: "/pricing/gemini-pricing", priority: "0.9", changefreq: "weekly" },
  { path: "/compare/chatgpt-vs-gemini", priority: "0.9", changefreq: "weekly" },
  { path: "/compare/claude-vs-gemini", priority: "0.9", changefreq: "weekly" },
  { path: "/worth-it/which-ai-subscription-is-worth-paying-for", priority: "0.8", changefreq: "weekly" },
  { path: "/calculator/ai-savings-calculator", priority: "0.8", changefreq: "weekly" },

  { path: "/compare/claude-vs-gpt-cost", priority: "0.8", changefreq: "weekly" },
  { path: "/compare/chatgpt-vs-cursor-cost", priority: "0.8", changefreq: "weekly" },
  { path: "/compare/subscription-vs-api-ai-cost", priority: "0.8", changefreq: "weekly" },
  { path: "/compare/gpt-4o-vs-gpt-4o-mini-cost", priority: "0.8", changefreq: "weekly" },

  { path: "/guides/cheapest-ai-content-workflow", priority: "0.7", changefreq: "weekly" },
  { path: "/guides/cheapest-ai-writing-tools", priority: "0.7", changefreq: "weekly" },
  { path: "/guides/best-ai-tools-under-20", priority: "0.7", changefreq: "weekly" },
  { path: "/guides/is-jasper-worth-it", priority: "0.7", changefreq: "weekly" },

  // Third commercial cluster — role-based, free-vs-paid, budget, and decision content
  { path: "/best/best-ai-tools-for-freelancers", priority: "0.9", changefreq: "weekly" },
  { path: "/best/best-ai-tools-for-founders", priority: "0.9", changefreq: "weekly" },
  { path: "/best/best-ai-tools-for-developers", priority: "0.9", changefreq: "weekly" },
  { path: "/best/best-value-ai-tools", priority: "0.8", changefreq: "weekly" },
  { path: "/best/best-ai-tools-by-budget", priority: "0.8", changefreq: "weekly" },
  { path: "/compare/chatgpt-free-vs-plus", priority: "0.9", changefreq: "weekly" },
  { path: "/compare/claude-free-vs-paid", priority: "0.9", changefreq: "weekly" },
  { path: "/compare/gemini-free-vs-paid", priority: "0.9", changefreq: "weekly" },
  { path: "/pricing/cheapest-ai-tools", priority: "0.9", changefreq: "weekly" },
  { path: "/decision/which-ai-tool-should-i-buy", priority: "0.9", changefreq: "weekly" },
];

export const CANONICAL_SITE_URL = "https://overpayingforai.com";
