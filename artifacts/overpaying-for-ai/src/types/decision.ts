export type DecisionUseCase =
  | "coding"
  | "writing"
  | "research"
  | "general"
  | "productivity"
  | "customer-support";

export type UsageLevel = "low" | "medium" | "high";
export type BudgetMode = "cheapest" | "balanced" | "best-performance";

export type DecisionRule = {
  useCase: DecisionUseCase;
  usageLevel: UsageLevel;
  budgetMode: BudgetMode;
  recommendedTool: string;
  recommendedModelId: string;
  setupType: "API" | "Subscription" | "Hybrid" | "Single-tool setup";
  rationale: string;
  estimatedCost: number;
  secondaryOption?: string;
  affiliateKey?: string | null;
};

export type DecisionResult = {
  recommendedTool: string;
  recommendedModelId: string;
  recommendedModelName: string;
  setupType: string;
  rationale: string;
  estimatedCost: number;
  currentCost: number;
  monthlySavings: number;
  savingsPercent: number;
  secondaryOption?: string;
  affiliateKey?: string | null;
};
