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
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">Start with a common usage scenario</h2>
        <p className="text-xs text-muted-foreground mt-1">Pick a preset to prefill the calculator.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelect(scenario)}
            className="text-left border border-border rounded-lg p-4 bg-muted/30 hover:bg-muted transition-colors"
            data-testid={`scenario-${scenario.id}`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="font-medium text-foreground text-sm">{scenario.name}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{scenario.description}</p>
              </div>
              {scenario.tags && (
                <div className="flex flex-wrap gap-1 justify-end">
                  {scenario.tags.map((tag) => (
                    <span key={tag} className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-background border border-border text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
