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
}: {
  scenarios: ScenarioPreset[];
  onSelect: (scenario: ScenarioPreset) => void;
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
            className="text-left border border-border rounded-lg p-3 sm:p-4 bg-muted/30 hover:bg-muted transition-colors"
            data-testid={`scenario-${scenario.id}`}
          >
            <p className="font-medium text-foreground text-sm">{scenario.name}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{scenario.description}</p>
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
