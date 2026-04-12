export type AffiliateTarget = {
  key: string;
  label: string;
  url?: string;
  fallbackInternalUrl: string;
};

const AFFILIATE_MAP: Record<string, AffiliateTarget> = {
  linguix: {
    key: "linguix",
    label: "Linguix",
    fallbackInternalUrl: "/best/ai-writing-tools-cheap",
  },
  serpstat: {
    key: "serpstat",
    label: "Serpstat",
    fallbackInternalUrl: "/best/ai-writing-tools-cheap",
  },
  fireflies: {
    key: "fireflies",
    label: "Fireflies.ai",
    fallbackInternalUrl: "/best/ai-tools-under-20",
  },
  mailmunch: {
    key: "mailmunch",
    label: "Mailmunch",
    fallbackInternalUrl: "/best",
  },
  brightlocal: {
    key: "brightlocal",
    label: "BrightLocal",
    fallbackInternalUrl: "/best",
  },
  writesonic: {
    key: "writesonic",
    label: "Writesonic",
    fallbackInternalUrl: "/compare/writesonic-vs-jasper",
  },
  jasper: {
    key: "jasper",
    label: "Jasper",
    fallbackInternalUrl: "/compare/writesonic-vs-jasper",
  },
  openai: {
    key: "openai",
    label: "OpenAI",
    fallbackInternalUrl: "/compare/gpt-4o-vs-gpt-4o-mini-cost",
  },
  anthropic: {
    key: "anthropic",
    label: "Anthropic / Claude",
    fallbackInternalUrl: "/compare/claude-vs-gpt-cost",
  },
  deepseek: {
    key: "deepseek",
    label: "DeepSeek",
    fallbackInternalUrl: "/compare/deepseek-vs-gpt4o-cost",
  },
  google: {
    key: "google",
    label: "Google / Gemini",
    fallbackInternalUrl: "/compare/gemini-vs-gpt4o-cost",
  },
};

export function getAffiliateTarget(key?: string | null): AffiliateTarget | null {
  if (!key) return null;
  return AFFILIATE_MAP[key] ?? null;
}
