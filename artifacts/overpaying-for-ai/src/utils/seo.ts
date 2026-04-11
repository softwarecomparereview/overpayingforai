const YEAR = 2026;
const SITE = "OverpayingForAI";

export type SeoPageType = "compare" | "best" | "guide" | "calculator" | "ai-type" | "default";

export function generateTitle(keyword: string, pageType: SeoPageType = "default"): string {
  switch (pageType) {
    case "compare":
      return `${keyword} (${YEAR}) – Which Is Cheaper? | ${SITE}`;
    case "best":
      return `${keyword} (${YEAR}) – Ranked by Cost | ${SITE}`;
    case "guide":
      return `${keyword} (${YEAR}) | ${SITE}`;
    case "calculator":
      return `AI Cost Calculator (${YEAR}) – Compare Model Pricing | ${SITE}`;
    case "ai-type":
      return `${keyword} Cost Guide (${YEAR}) – Stop Overpaying | ${SITE}`;
    default:
      return `${keyword} (${YEAR}) | ${SITE}`;
  }
}

export function generateMetaDescription(keyword: string, pageType: SeoPageType = "default"): string {
  switch (pageType) {
    case "compare":
      return `Real pricing data for ${keyword}. Side-by-side cost breakdown, savings calculator, and a clear cheapest pick. Updated ${YEAR} — stop overpaying for AI.`;
    case "best":
      return `The best ${keyword} ranked by real cost-effectiveness. Honest picks with no sponsored rankings. Updated ${YEAR} pricing — find the cheapest option.`;
    case "guide":
      return `${keyword}. Practical, cost-first advice for reducing your AI spend — updated ${YEAR}.`;
    case "calculator":
      return `Calculate your exact AI API cost by model and token volume. Compare GPT-4o, Claude, Gemini, DeepSeek and more. Find where you are overpaying — free, no signup.`;
    case "ai-type":
      return `Compare the cheapest ${keyword} options for ${YEAR}. Ranked by real cost-per-task — find out if you're overpaying and which model fits your budget.`;
    default:
      return `Compare AI costs and find cheaper alternatives. ${keyword} — pricing data updated ${YEAR}.`;
  }
}

export function generateSchemaProduct(
  name: string,
  description: string,
  ratingValue = "4.5",
  reviewCount = "120",
): object {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
    },
  };
}

export function generateSchemaWebPage(title: string, description: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    publisher: {
      "@type": "Organization",
      name: SITE,
      url: "https://overpayingforai.com",
    },
  };
}

export function generateSchemaFAQ(faqs: { q: string; a: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

export function generateSchemaSoftwareApp(): object {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AI Cost Calculator",
    applicationCategory: "FinanceApplication",
    description: "Free tool to calculate and compare AI API costs across models. Stop overpaying for AI.",
    url: "https://overpayingforai.com/calculator",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    operatingSystem: "Web",
    creator: {
      "@type": "Organization",
      name: SITE,
      url: "https://overpayingforai.com",
    },
  };
}
