interface LatestCostInsightsProps {
  insights?: string[];
  title?: string;
}

export function LatestCostInsights({ insights, title }: LatestCostInsightsProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-4">{title ?? "Latest AI Cost Insights"}</h2>
      <div className="space-y-2">
        {insights.slice(0, 5).map((insight, i) => (
          <div
            key={i}
            className="flex items-start gap-3 border border-border rounded-lg px-4 py-3 bg-muted/30"
          >
            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
            <p className="text-sm text-foreground leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
