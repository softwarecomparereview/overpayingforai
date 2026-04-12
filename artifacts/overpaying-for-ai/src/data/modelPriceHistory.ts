export type HistoricalPricePoint = {
  modelId: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
  timestamp: string;
};

const _history: HistoricalPricePoint[] = [];

export function appendHistoryFromSnapshot(models: { id: string; inputCostPer1k: number; outputCostPer1k: number }[]): void {
  const timestamp = new Date().toISOString();
  for (const m of models) {
    _history.push({
      modelId: m.id,
      inputCostPer1k: m.inputCostPer1k,
      outputCostPer1k: m.outputCostPer1k,
      timestamp,
    });
  }
}

export function getHistoryForModel(modelId: string): HistoricalPricePoint[] {
  return _history.filter((p) => p.modelId === modelId);
}
