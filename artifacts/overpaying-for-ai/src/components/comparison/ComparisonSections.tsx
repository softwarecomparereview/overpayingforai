/**
 * ComparisonSections.tsx
 * New optional content sections for the comparison page.
 * All sections are fully conditional — they render nothing if data is absent.
 */

interface QuickDecisionBlockProps {
  quickVerdict?: string;
  nameA: string;
  nameB: string;
  bestForA?: string[];
  bestForB?: string[];
}

export function QuickDecisionBlock({ quickVerdict, nameA, nameB, bestForA, bestForB }: QuickDecisionBlockProps) {
  if (!quickVerdict && !bestForA?.length && !bestForB?.length) return null;
  return (
    <section className="mb-8 rounded-xl border border-border bg-muted/30 overflow-hidden">
      <div className="border-b border-border px-5 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Quick Decision
        </h2>
      </div>
      {quickVerdict && (
        <div className="px-5 py-4 border-b border-border">
          <p className="font-medium text-foreground leading-snug">{quickVerdict}</p>
        </div>
      )}
      {(bestForA?.length || bestForB?.length) && (
        <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {bestForA && bestForA.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                Choose {nameA} if…
              </p>
              <ul className="space-y-1.5">
                {bestForA.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground leading-snug">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {bestForB && bestForB.length > 0 && (
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                Choose {nameB} if…
              </p>
              <ul className="space-y-1.5">
                {bestForB.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground leading-snug">
                    <span className="text-primary mt-0.5 shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

interface CostBreakdownSectionProps {
  costBreakdown?: string;
}

export function CostBreakdownSection({ costBreakdown }: CostBreakdownSectionProps) {
  if (!costBreakdown) return null;
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-3">Real-World Cost Implications</h2>
      <div className="rounded-lg border border-border bg-card px-5 py-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{costBreakdown}</p>
      </div>
    </section>
  );
}

interface QualityTradeoffSectionProps {
  nameA: string;
  nameB: string;
  qualityNotesA?: string;
  qualityNotesB?: string;
}

export function QualityTradeoffSection({ nameA, nameB, qualityNotesA, qualityNotesB }: QualityTradeoffSectionProps) {
  if (!qualityNotesA && !qualityNotesB) return null;
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">Output Quality & Workflow Tradeoffs</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {qualityNotesA && (
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{nameA}</p>
            <p className="text-sm text-foreground leading-relaxed">{qualityNotesA}</p>
          </div>
        )}
        {qualityNotesB && (
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{nameB}</p>
            <p className="text-sm text-foreground leading-relaxed">{qualityNotesB}</p>
          </div>
        )}
      </div>
    </section>
  );
}

interface AvoidSectionProps {
  nameA: string;
  nameB: string;
  avoidA?: string[];
  avoidB?: string[];
}

export function AvoidSection({ nameA, nameB, avoidA, avoidB }: AvoidSectionProps) {
  if (!avoidA?.length && !avoidB?.length) return null;
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">When NOT to Use Each Tool</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {avoidA && avoidA.length > 0 && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-5">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">
              Avoid {nameA} if…
            </p>
            <ul className="space-y-2">
              {avoidA.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/80 leading-snug">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {avoidB && avoidB.length > 0 && (
          <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-5">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">
              Avoid {nameB} if…
            </p>
            <ul className="space-y-2">
              {avoidB.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/80 leading-snug">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

interface CheapestStackSectionProps {
  cheapestStack?: string;
}

export function CheapestStackSection({ cheapestStack }: CheapestStackSectionProps) {
  if (!cheapestStack) return null;
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-3">Cheapest Viable Alternative</h2>
      <div className="rounded-lg border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/20 px-5 py-4">
        <p className="text-sm text-foreground/80 leading-relaxed">{cheapestStack}</p>
      </div>
    </section>
  );
}

interface FinalVerdictSectionProps {
  finalVerdict?: {
    quality?: string;
    budget?: string;
    hybrid?: string;
  };
}

export function FinalVerdictSection({ finalVerdict }: FinalVerdictSectionProps) {
  if (!finalVerdict) return null;
  const rows = [
    { icon: "🏆", label: "Best for Quality", value: finalVerdict.quality },
    { icon: "💰", label: "Best for Budget", value: finalVerdict.budget },
    { icon: "⚖️", label: "Best Hybrid Option", value: finalVerdict.hybrid },
  ].filter((r) => r.value);

  if (!rows.length) return null;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold mb-4">Final Verdict</h2>
      <div className="rounded-xl border border-border overflow-hidden">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex items-start gap-4 px-5 py-4 ${i < rows.length - 1 ? "border-b border-border" : ""}`}
          >
            <span className="text-xl shrink-0 mt-0.5">{row.icon}</span>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{row.label}</p>
              <p className="text-sm text-foreground font-medium leading-snug">{row.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

interface EditorialInsightProps {
  editorialInsight?: string;
  pricingNotes?: string;
}

export function EditorialInsight({ editorialInsight, pricingNotes }: EditorialInsightProps) {
  if (!editorialInsight && !pricingNotes) return null;
  return (
    <aside className="mb-10 rounded-xl border border-dashed border-border px-5 py-4">
      {editorialInsight && (
        <>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Editor's Take</p>
          <p className="text-sm text-muted-foreground leading-relaxed italic">"{editorialInsight}"</p>
        </>
      )}
      {pricingNotes && (
        <p className="text-xs text-muted-foreground/60 mt-3 leading-relaxed">{pricingNotes}</p>
      )}
    </aside>
  );
}
