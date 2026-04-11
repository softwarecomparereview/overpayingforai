import { Link } from "wouter";
import changelogData from "@/data/pricingChangelog.json";

interface ChangedField {
  field: string;
  from: string | number;
  to: string | number;
}

interface ChangeEntry {
  id: string;
  name: string;
  provider: string;
  status: "changed" | "added";
  changedFields: ChangedField[];
}

interface ReviewEntry {
  date: string;
  reviewedBy: string;
  summary: string;
  approvedChanges: ChangeEntry[];
}

const entries = changelogData as ReviewEntry[];

function formatValue(v: string | number): string {
  if (typeof v === "number") {
    if (v > 0 && v < 0.01) return `$${v}`;
    if (typeof v === "number" && Number.isInteger(v)) return String(v);
    return `$${v}`;
  }
  if (typeof v === "string" && v.startsWith("http")) {
    const host = new URL(v).hostname.replace(/^www\./, "");
    return host;
  }
  return String(v);
}

function isNumericField(field: string) {
  return field.toLowerCase().includes("$") || field.toLowerCase().includes("score");
}

function numericDirection(from: number, to: number): "up" | "down" | "same" {
  if (to > from) return "up";
  if (to < from) return "down";
  return "same";
}

export function PricingChangelogPage() {
  const latest = entries[0];
  if (!latest) return null;

  const changed = latest.approvedChanges.filter((c) => c.status === "changed");
  const added = latest.approvedChanges.filter((c) => c.status === "added");

  const addedByProvider: Record<string, ChangeEntry[]> = {};
  for (const m of added) {
    if (!addedByProvider[m.provider]) addedByProvider[m.provider] = [];
    addedByProvider[m.provider].push(m);
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="border-b border-border bg-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">Pricing Review</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Pricing Changelog</h1>
          <p className="text-white/60 text-sm max-w-xl leading-relaxed">
            A record of every approved pricing review — what changed, what was added, and when.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link
              href="/changelog"
              className="inline-flex items-center gap-1.5 border border-white/20 text-white/70 hover:text-white hover:border-white/40 px-4 py-2 rounded-lg transition-colors"
            >
              View current pricing →
            </Link>
          </div>
        </div>
      </section>

      {/* Latest entry */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">

          {/* Entry meta */}
          <div className="border border-border rounded-xl p-5 bg-muted/20">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Latest review</p>
                <p className="text-2xl font-bold text-foreground">{latest.date}</p>
                <p className="text-sm text-muted-foreground mt-1">Reviewed by {latest.reviewedBy}</p>
              </div>
              <div className="text-right sm:text-left">
                <p className="text-xs text-muted-foreground mb-1">Summary</p>
                <p className="text-sm font-medium text-foreground leading-snug max-w-xs">{latest.summary}</p>
              </div>
            </div>
          </div>

          {/* Updated models */}
          {changed.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-xl font-bold text-foreground">Updated models</h2>
                <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded">
                  {changed.length} changed
                </span>
              </div>

              <div className="space-y-4">
                {changed.map((model) => (
                  <div key={model.id} className="border border-border rounded-xl overflow-hidden">
                    {/* Model header */}
                    <div className="flex items-center justify-between gap-3 px-5 py-3 bg-muted/30 border-b border-border">
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-semibold text-foreground text-sm">{model.name}</h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{model.provider}</span>
                      </div>
                      <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                        {model.changedFields.length} field{model.changedFields.length !== 1 ? "s" : ""} changed
                      </span>
                    </div>

                    {/* Changed fields */}
                    <div className="divide-y divide-border/50">
                      {model.changedFields.map((cf, i) => {
                        const isNum = isNumericField(cf.field) && typeof cf.from === "number" && typeof cf.to === "number";
                        const dir = isNum ? numericDirection(cf.from as number, cf.to as number) : null;
                        const isCostField = cf.field.toLowerCase().includes("$");
                        const isPositive = isCostField ? dir === "down" : dir === "up";
                        const isNegative = isCostField ? dir === "up" : dir === "down";

                        return (
                          <div key={i} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <p className="text-xs font-medium text-muted-foreground w-40 shrink-0">{cf.field}</p>
                            <div className="flex items-center gap-2 flex-1 flex-wrap">
                              <span className="text-xs text-muted-foreground line-through font-mono bg-muted/60 px-2 py-0.5 rounded">
                                {formatValue(cf.from)}
                              </span>
                              <span className="text-xs text-muted-foreground">→</span>
                              <span className={`text-xs font-semibold font-mono px-2 py-0.5 rounded ${
                                dir === null
                                  ? "bg-slate-100 text-slate-700"
                                  : isPositive
                                  ? "bg-emerald-100 text-emerald-700"
                                  : isNegative
                                  ? "bg-red-100 text-red-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}>
                                {formatValue(cf.to)}
                                {dir && dir !== "same" && (
                                  <span className="ml-1">{dir === "up" ? "↑" : "↓"}</span>
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Added models */}
          {added.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-xl font-bold text-foreground">Added models</h2>
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                  {added.length} new
                </span>
              </div>

              <div className="space-y-6">
                {Object.entries(addedByProvider).map(([provider, models]) => (
                  <div key={provider}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">{provider}</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {models.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between gap-2 border border-emerald-100 bg-emerald-50/50 rounded-lg px-4 py-2.5"
                        >
                          <span className="text-sm font-medium text-foreground">{m.name}</span>
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                            Added
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past entries note */}
          <div className="border border-border/60 rounded-xl p-5 bg-muted/10 text-center">
            <p className="text-sm text-muted-foreground">
              This log grows with each review cycle. Only the most recent entry is shown above.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-3 text-sm">
              <Link href="/changelog" className="text-primary font-medium hover:underline">
                View current pricing table →
              </Link>
              <Link href="/calculator" className="text-muted-foreground hover:text-foreground hover:underline">
                Open cost calculator →
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
