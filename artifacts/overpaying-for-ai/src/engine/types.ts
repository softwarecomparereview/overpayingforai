export type ModelCategory =
  | "chat"
  | "api"
  | "writing"
  | "coding"
  | "image"
  | "productivity"
  | "research";

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  planType: "api" | "subscription";
  inputCostPer1k: number;
  outputCostPer1k: number;
  monthlySubscriptionCostIfAny: number | null;
  hasFreeTier: boolean;
  bestFor: string[];
  qualityScore: number;
  costScore: number;
  latencyScore: number;
  notes: string;
  source?: string;
  last_updated?: string;
  category?: ModelCategory;
  supportsApiUsage?: boolean;
  freeTierLimitDescription?: string;
  cachedInputCostPer1k?: number | null;
  contextWindow?: string;
  releaseDate?: string;
  overpayRisk?: string;
  sourceLabel?: string;
  needsManualReview?: boolean;
  verificationStatus?: "verified" | "manual-review" | "legacy" | "third-party-source";
  pricingDisplayNote?: string;
}

export interface CalculatorInputs {
  modelId: string;
  monthlyInputTokens: number;
  monthlyOutputTokens: number;
  mode: "api" | "subscription";
}

export interface CalculatorResult {
  model: AIModel;
  estimatedMonthlyCost: number;
  inputCost: number;
  outputCost: number;
  cheaperAlternatives: AlternativeModel[];
  savingsEstimate: number | null;
  recommendation: string;
}

export interface AlternativeModel {
  model: AIModel;
  estimatedCost: number;
  savings: number;
  savingsPercent: number;
  tradeOff: string;
}

export type UseCase = "coding" | "writing" | "research" | "automation" | "chat";
export type Budget = "free" | "under20" | "under50" | "premium";
export type UsageFrequency = "light" | "medium" | "heavy";
export type QualityPreference = "cheap" | "balanced" | "best";

export interface DecisionInputs {
  useCase: UseCase;
  budget: Budget;
  usageFrequency: UsageFrequency;
  qualityPreference: QualityPreference;
  freeTierRequired: boolean;
}

export interface RecommendationResult {
  cheapest: ModelRecommendation;
  balanced: ModelRecommendation;
  premium: ModelRecommendation;
  routingStrategy: string;
}

export interface ModelRecommendation {
  model: AIModel;
  reasoning: string;
  estimatedMonthlySpend: string;
  score: number;
}
