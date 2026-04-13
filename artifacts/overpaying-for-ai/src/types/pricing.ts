export type ModelCategory =
  | "general"
  | "coding"
  | "writing"
  | "research"
  | "productivity"
  | "customer-support";

export type ModelPricing = {
  id: string;
  provider: string;
  model: string;
  displayName: string;
  category: ModelCategory[];
  inputCostPer1k: number;
  outputCostPer1k: number;
  contextWindow?: string;
  notes?: string;
  lastUpdated: string;
  sourceType: "static" | "live";
};

export type PricingSnapshot = {
  models: ModelPricing[];
  lastUpdated: string;
};

export type PriceChange = {
  modelId: string;
  displayName: string;
  previousInputCostPer1k: number;
  previousOutputCostPer1k: number;
  newInputCostPer1k: number;
  newOutputCostPer1k: number;
  inputChangePercent: number;
  outputChangePercent: number;
  direction: "increase" | "decrease" | "unchanged";
};
