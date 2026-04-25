import { affiliates, AffiliateEntry } from "@/data/affiliates";

export interface AffiliateTarget {
  href: string;
  isExternal: boolean;
  isAffiliate: boolean;
  status: AffiliateEntry["status"];
  label: string;
  fallbackUsed: boolean;
  rel?: string;
  target?: string;
}

const DEFAULT_FALLBACK = "/decision-engine";

/**
 * Map a model ID (from models.json) to an affiliate provider ID.
 * Extend this list as new providers are added.
 */
export function modelIdToProviderId(modelId: string): string {
  if (!modelId) return "";
  const id = modelId.toLowerCase();
  if (id.startsWith("claude") || id.startsWith("anthropic")) return "anthropic";
  if (
    id.startsWith("gpt") ||
    id.startsWith("chatgpt") ||
    id.startsWith("openai") ||
    id.startsWith("o1") ||
    id.startsWith("o3") ||
    id.startsWith("o4")
  )
    return "openai";
  if (id.startsWith("cursor")) return "cursor";
  if (id.startsWith("deepseek")) return "deepseek";
  if (id.startsWith("gemini") || id.startsWith("google")) return "google";
  if (id.startsWith("copilot") || id.startsWith("github")) return "github";
  if (id.startsWith("perplexity")) return "perplexity";
  if (id.startsWith("mistral")) return "mistral";
  if (id.startsWith("writesonic")) return "writesonic";
  if (id.startsWith("jasper")) return "jasper";
  if (id.startsWith("copyai") || id.startsWith("copy.ai") || id.startsWith("copy-ai")) return "copyai";
  if (id.startsWith("rytr")) return "rytr";
  if (id.startsWith("pressmaster")) return "pressmaster";
  return id;
}

/**
 * Map a human-readable provider name (e.g. "Anthropic") to an affiliate provider ID.
 */
export function providerNameToId(providerName: string): string {
  const map: Record<string, string> = {
    Anthropic: "anthropic",
    OpenAI: "openai",
    Google: "google",
    "Google DeepMind": "google",
    DeepSeek: "deepseek",
    Cursor: "cursor",
    GitHub: "github",
    "GitHub / Microsoft": "github",
    Perplexity: "perplexity",
    Mistral: "mistral",
    "Mistral AI": "mistral",
    Pressmaster: "pressmaster",
    "Pressmaster.ai": "pressmaster",
  };
  return map[providerName] ?? providerName.toLowerCase().replace(/\s+/g, "-");
}

type CtaContext = "cheapest" | "winner" | "recommendation" | "default";

/**
 * Resolve the best outbound or internal link for a given provider.
 * Prefers affiliateUrl when present; falls back to fallbackUrl.
 *
 * @param toolId      - Provider ID from affiliates.ts (e.g. "anthropic")
 * @param context     - Optional rendering context that affects the default label
 * @param overrideFallback - Override the fallbackUrl for this specific call
 */
export function getAffiliateTarget(
  toolId: string,
  context: CtaContext = "default",
  overrideFallback?: string,
): AffiliateTarget {
  const entry = affiliates[toolId];

  if (!entry) {
    return {
      href: overrideFallback ?? DEFAULT_FALLBACK,
      isExternal: false,
      isAffiliate: false,
      status: "unavailable",
      label: context === "cheapest" ? "See cheapest options" : "Find alternatives",
      fallbackUsed: true,
    };
  }

  if (entry.affiliateUrl) {
    return {
      href: entry.affiliateUrl,
      isExternal: true,
      isAffiliate: true,
      status: entry.status,
      label: buildPrimaryLabel(entry, context),
      fallbackUsed: false,
      rel: "noopener noreferrer sponsored",
      target: "_blank",
    };
  }

  // No affiliate URL yet — prefer the tool's homepage (directUrl) as a real
  // outbound CTA so commercial pages always link out to the recommended tool.
  // We still tag rel="sponsored" because the link is editorially placed for
  // monetization intent (and will be swapped to an affiliate URL once approved).
  // `overrideFallback` only replaces the *internal* fallback below; it does
  // NOT suppress the outbound homepage CTA, which is always preferred.
  if (entry.directUrl) {
    return {
      href: entry.directUrl,
      isExternal: true,
      isAffiliate: false,
      status: entry.status,
      label: buildPrimaryLabel(entry, context),
      fallbackUsed: true,
      rel: "noopener noreferrer sponsored",
      target: "_blank",
    };
  }

  return {
    href: overrideFallback ?? entry.fallbackUrl,
    isExternal: false,
    isAffiliate: false,
    status: entry.status,
    label: buildPrimaryLabel(entry, context),
    fallbackUsed: true,
  };
}

function buildPrimaryLabel(entry: AffiliateEntry, context: CtaContext): string {
  if (context === "cheapest") return "See cheapest options";
  if (context === "winner") return "See pricing breakdown";
  return entry.ctaLabelPrimary ?? `Compare ${entry.name}`;
}

/** Returns true only if a live affiliate link exists for the given tool. */
export function hasAffiliateLink(toolId: string): boolean {
  return !!(affiliates[toolId]?.affiliateUrl);
}

/** Convenience alias for getAffiliateTarget — primary CTA. */
export function getPrimaryCta(
  toolId: string,
  context?: CtaContext,
  overrideFallback?: string,
): AffiliateTarget {
  return getAffiliateTarget(toolId, context ?? "default", overrideFallback);
}

/**
 * Secondary CTA for a provider:
 * - If affiliate is the primary, secondary goes to the comparison/details fallback page.
 * - If fallback is the primary, secondary goes to /calculator.
 */
export function getSecondaryCta(toolId: string): AffiliateTarget {
  const entry = affiliates[toolId];

  if (!entry) {
    return {
      href: "/calculator",
      isExternal: false,
      isAffiliate: false,
      status: "unavailable",
      label: "Calculate your cost",
      fallbackUsed: true,
    };
  }

  if (entry.affiliateUrl) {
    return {
      href: entry.fallbackUrl,
      isExternal: false,
      isAffiliate: false,
      status: entry.status,
      label: entry.ctaLabelSecondary ?? "Compare alternatives",
      fallbackUsed: false,
    };
  }

  // No affiliate URL — internal "compare alternatives" page is a sensible
  // secondary action alongside the new outbound primary CTA (which now points
  // to the tool's homepage). Falls back to /calculator if no fallbackUrl is set.
  return {
    href: entry.fallbackUrl ?? "/calculator",
    isExternal: false,
    isAffiliate: false,
    status: entry.status,
    label: entry.ctaLabelSecondary ?? "Compare alternatives",
    fallbackUsed: true,
  };
}
