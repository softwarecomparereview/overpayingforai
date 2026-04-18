import scenarios from "@/data/scenarios.json";
import type { ScenarioPreset } from "@/components/ScenarioSelector";

const YEAR = 2026;
const SITE = "OverpayingForAI";

export interface ScenarioSeo {
  title: string;
  metaDescription: string;
  h1: string;
  subhead: string;
  intro: string;
}

const SCENARIO_SEO: Record<string, ScenarioSeo> = {
  "solo-founder": {
    title: `Cheapest AI for Solo Founders (${YEAR}) | ${SITE}`,
    metaDescription: `Lean solo-founder AI cost: pre-filled calculator with ${YEAR} pricing for GPT-4o mini, Claude, Gemini, and DeepSeek. Find your cheapest viable setup.`,
    h1: "Cheapest AI setup for solo founders",
    subhead: "Pre-filled for: solo founder · ~250K input + ~120K output tokens/month",
    intro: "Lean daily usage for shipping, support, and planning — calculated on the cheapest viable model first.",
  },
  "startup-support-bot": {
    title: `Support Bot AI Cost Calculator (${YEAR}) | ${SITE}`,
    metaDescription: `High-volume support bot AI cost compared: Gemini Flash, GPT-4o mini, Claude Haiku, DeepSeek. Pre-filled at 1.5M tokens/month — find the cheapest provider.`,
    h1: "Support bot AI cost at scale",
    subhead: "Pre-filled for: high-volume support bot · ~1.5M input + ~600K output tokens/month",
    intro: "High-volume support and FAQ automation — see which provider is actually cheapest at this load.",
  },
  "developer-coding-workflow": {
    title: `Coding AI Cost Calculator (${YEAR}) | ${SITE}`,
    metaDescription: `Daily coding AI cost: Claude 3.5 Sonnet vs Cursor vs Copilot vs GPT-4o for ${YEAR}. Pre-filled at developer usage — find the cheapest stack that still ships.`,
    h1: "Cheapest AI for daily coding work",
    subhead: "Pre-filled for: developer coding workflow · ~800K input + ~300K output tokens/month",
    intro: "Coding, refactoring, and debugging with balanced quality — ranked by real per-token cost.",
  },
  "content-team": {
    title: `AI Cost Calculator for Content Teams (${YEAR}) | ${SITE}`,
    metaDescription: `Writing-heavy team AI cost for ${YEAR}: ChatGPT Plus, Claude Pro, GPT-4o, and cheaper alts. See if a subscription beats per-token at content-team usage.`,
    h1: "Cheapest AI for writing-heavy teams",
    subhead: "Pre-filled for: content team · ~1M input + ~500K output tokens/month",
    intro: "Writing-heavy workflow for briefs, drafts, and edits — subscription vs API verdict included.",
  },
};

// Coverage guard: warn (in dev) if a scenario in scenarios.json lacks SEO entries.
// Without this, a new scenario silently inherits the default metadata and would
// re-introduce duplicate titles/descriptions across calculator URLs.
if (typeof window !== "undefined" && import.meta.env?.DEV) {
  const missing = (scenarios as ScenarioPreset[])
    .map((s) => s.id)
    .filter((id) => !SCENARIO_SEO[id]);
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `[scenarioSeo] Missing SEO metadata for scenarios: ${missing.join(", ")}. ` +
        `Add entries in src/utils/scenarioSeo.ts to avoid duplicate calculator titles.`,
    );
  }
}

const DEFAULT_SCENARIO_SEO: ScenarioSeo = {
  title: `AI Cost Calculator (${YEAR}) – Compare Model Pricing | ${SITE}`,
  metaDescription: `Calculate your exact AI API cost by model and token volume. Compare GPT-4o, Claude, Gemini, DeepSeek and more. Find where you are overpaying — free, no signup.`,
  h1: "Find your cheapest viable AI setup",
  subhead: "Estimate your real monthly AI spend and immediately see lower-cost alternatives.",
  intro: "Estimate your real monthly AI spend and immediately see lower-cost alternatives.",
};

export function getScenarioSeo(scenarioId: string | null | undefined): ScenarioSeo {
  if (!scenarioId) return DEFAULT_SCENARIO_SEO;
  return SCENARIO_SEO[scenarioId] ?? DEFAULT_SCENARIO_SEO;
}

export function listScenarioSeo(): Array<{ id: string; seo: ScenarioSeo; preset: ScenarioPreset }> {
  return (scenarios as ScenarioPreset[])
    .filter((s) => SCENARIO_SEO[s.id])
    .map((s) => ({ id: s.id, seo: SCENARIO_SEO[s.id], preset: s }));
}

export { DEFAULT_SCENARIO_SEO };
