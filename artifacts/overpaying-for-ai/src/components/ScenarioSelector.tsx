import type { AIModel } from "@/engine/types";

export type ScenarioPreset = {
  id: string;
  name: string;
  description: string;
  inputs: {
    modelId: string;
    monthlyInputTokens: number;
    monthlyOutputTokens: number;
  };
  tags?: string[];
};

export function ScenarioSelector({
  scenarios,
  onSelect,
  selectedId,
}: {
  scenarios: ScenarioPreset[];
  onSelect: (scenario: ScenarioPreset) => void;
  selectedId?: string | null;
}) {
  return (
    <div className="mb-6">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-foreground">Start with a common usage scenario</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Pick a preset to prefill the calculator.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelect(scenario)}
            className={`text-left border rounded-lg p-3 sm:p-4 transition-all ${
              selectedId === scenario.id
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                : "border-border bg-muted/30 hover:bg-muted"
            }`}
            data-testid={`scenario-${scenario.id}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground text-sm">{scenario.name}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{scenario.description}</p>
              </div>
              {selectedId === scenario.id && (
                <span className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full bg-primary text-primary-foreground">
                  Selected
                </span>
              )}
            </div>
            {scenario.tags && scenario.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {scenario.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-background border border-border text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
