import { Link } from "wouter";
import { track } from "@/utils/analytics";
import { freshnessLabel, getDaysSinceUpdate, isPricingStale } from "@/utils/pricingFreshness";
import modelsData from "@/data/models.json";
import { PageSeo } from "@/components/seo/PageSeo";

interface ModelEntry {
  id: string;
  name: string;
  provider: string;
  last_updated?: string;
  last_reviewed?: string;
  source?: string;
  inputCostPer1k?: number | null;
  outputCostPer1k?: number | null;
  monthlySubscriptionCostIfAny?: number | null;
  notes?: string;
}

const models = modelsData as ModelEntry[];

// Group models by provider
const byProvider: Record<string, ModelEntry[]> = {};
for (const m of models) {
  const key = m.provider ?? "Other";
  if (!byProvider[key]) byProvider[key] = [];
  byProvider[key].push(m);
}

// Get most-recent overall update
const allDates = models.map((m) => m.last_updated).filter(Boolean) as string[];
allDates.sort();
const FRESHEST_DATE = allDates[allDates.length - 1] ?? new Date().toISOString().slice(0, 10);
const FRESHNESS_MSG = freshnessLabel(FRESHEST_DATE);
const IS_STALE = isPricingStale(FRESHEST_DATE, 30);

function fmtCost(v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  return `$${v}`;
}

function freshnessColor(dateStr?: string) {
  if (!dateStr) return "text-muted-foreground";
  const days = getDaysSinceUpdate(dateStr);
  if (days <= 14) return "text-emerald-700";
  if (days <= 30) return "text-amber-600";
  return "text-red-600";
}

export function ChangelogPage() {
  return (
    <div className="bg-white">
      <PageSeo
        title="Site Changelog | OverpayingForAI"
        description="Current pricing for every tracked AI model — sourced from official provider pages, dated, and reviewed regularly. See what's fresh and what's stale at a glance."
      />
      {/* Header */}
      <section className="border-b border-border bg-slate-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">Pricing Changelog</p>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">AI pricing data</h1>
              <p className="text-white/60 text-sm max-w-xl leading-relaxed">
                Current pricing for every tracked model. All data sourced from official provider pages and reviewed regularly.
              </p>
            </div>
            <div className={`rounded-xl border p-4 ${IS_STALE ? "border-orange-400/30 bg-orange-900/20" : "border-emerald-400/30 bg-emerald-900/20"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${IS_STALE ? "bg-orange-400" : "bg-emerald-400"}`} />
                <span className={`text-xs font-semibold ${IS_STALE ? "text-orange-300" : "text-emerald-300"}`}>
                  {IS_STALE ? "Data may be outdated" : "Up to date"}
                </span>
              </div>
              <p className="text-xs text-white/60">{FRESHNESS_MSG}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Freshness key */}
      <section className="border-b border-border bg-slate-50 py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Freshness key:</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Updated within 14 days</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Updated within 30 days</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Older than 30 days</span>
          <Link href="/admin/pricing-refresh" className="ml-auto text-primary font-medium hover:underline">
            Update prices →
          </Link>
        </div>
      </section>

      {/* Model tables by provider */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          {Object.entries(byProvider).map(([provider, providerModels]) => (
            <div key={provider}>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                {provider}
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                  {providerModels.length} model{providerModels.length !== 1 ? "s" : ""}
                </span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Model</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Input / 1k tokens</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Output / 1k tokens</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Monthly sub</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Last reviewed</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {providerModels.map((m) => {
                      const dateToShow = m.last_reviewed ?? m.last_updated;
                      const colorClass = freshnessColor(dateToShow);
                      const stale = dateToShow ? isPricingStale(dateToShow, 30) : false;
                      return (
                        <tr key={m.id} className={`hover:bg-muted/20 transition-colors ${stale ? "bg-orange-50/30" : ""}`}>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-foreground text-xs">{m.name}</p>
                            {m.notes && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-xs">{m.notes}</p>}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-foreground">
                            {fmtCost(m.inputCostPer1k)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-foreground">
                            {fmtCost(m.outputCostPer1k)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-foreground">
                            {m.monthlySubscriptionCostIfAny ? `$${m.monthlySubscriptionCostIfAny}/mo` : "—"}
                          </td>
                          <td className={`px-4 py-3 text-right text-xs font-medium ${colorClass}`}>
                            {dateToShow ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {m.source ? (
                              <a
                                href={m.source}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => track("card_clicked", { sourceSurface: "changelog", cardType: "source_link", model: m.id })}
                                className="text-xs text-primary hover:underline"
                              >
                                Source →
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Admin / update note */}
      <section className="border-t border-border bg-muted/20 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Spotted an outdated price?</p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              Use the admin pricing refresh tool to fetch the latest data from providers, review the diff, and approve changes before publishing.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/pricing-refresh"
              className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-foreground/80 transition-colors"
            >
              Update prices →
            </Link>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-foreground font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Open calculator
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
