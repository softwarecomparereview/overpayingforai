import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminNav } from "@/components/admin/AdminNav";
import { FreshnessIndicator } from "@/components/FreshnessIndicator";
import { trackGaEvent } from "@/utils/ga4";
import newsDataRaw from "@/data/ai-pricing-news.json";
import runLogRaw from "@/data/pipeline-run-log.json";
import sourcesRaw from "@/data/trusted-pricing-sources.json";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsDigest {
  lastChecked: string | null;
  generatedAt: string | null;
  sourceCount: number;
  items: Array<{
    vendor: string;
    tool: string;
    changeType: string;
    confidence: string;
    requiresReview: boolean;
    sourceTrustLevel: string;
  }>;
  auditLog?: Array<{ url: string; status: string; itemCount?: number; error?: string }>;
}

interface RunEntry {
  runAt: string;
  status: "success" | "error";
  digestItems: number;
  newHistoryEntries: number;
  sourceCount: number;
  auditLog?: Array<{ url: string; status: string; itemCount?: number; error?: string }>;
}

interface RunLog {
  runs: RunEntry[];
  lastRunAt: string | null;
  lastRunStatus: string | null;
}

interface TrustedSource {
  vendor: string;
  tool: string;
  sourceType: string;
  url: string;
  trustLevel: string;
  allowedForAutoDraft: boolean;
  notes: string;
}

const digest = newsDataRaw as NewsDigest;
const runLog = runLogRaw as RunLog;
const sources = sourcesRaw as TrustedSource[];

const SIM_LOG_KEY = "pricing_intel_sim_log";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtShort(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function loadSimLog(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SIM_LOG_KEY) ?? "[]");
  } catch { return []; }
}

function appendSimLog(entry: string) {
  const log = loadSimLog();
  const updated = [...log.slice(-99), entry];
  localStorage.setItem(SIM_LOG_KEY, JSON.stringify(updated));
  return updated;
}

const TRUST_BADGE: Record<string, string> = {
  official:            "bg-emerald-100 text-emerald-700 border-emerald-200",
  trusted_third_party: "bg-blue-100 text-blue-700 border-blue-200",
  third_party:         "bg-slate-100 text-slate-600 border-slate-200",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function PricingIntelligenceControlPage() {
  return (
    <AdminGuard title="Pricing Intelligence Control">
      <ControlPageInner />
    </AdminGuard>
  );
}

function ControlPageInner() {
  const [simLog, setSimLog] = useState<string[]>(loadSimLog);
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<string[] | null>(null);
  const [activeTab, setActiveTab] = useState<"status" | "sources" | "logs">("status");

  useEffect(() => {
    trackGaEvent("pipeline_control_viewed", { source_count: sources.length });
  }, []);

  const pendingReview = digest.items.filter((i) => i.requiresReview).length;
  const highConf = digest.items.filter((i) => i.confidence === "high").length;
  const officialCount = digest.items.filter((i) => i.sourceTrustLevel === "official").length;

  // Combine static run log with localStorage simulation entries
  const allRuns: RunEntry[] = [
    ...runLog.runs,
    ...loadSimLog().map((entry) => JSON.parse(entry) as RunEntry),
  ].sort((a, b) => new Date(b.runAt).getTime() - new Date(a.runAt).getTime());

  function simulateDryRun() {
    setIsDryRunning(true);
    setDryRunResult(null);
    trackGaEvent("pipeline_dry_run_triggered", { source_count: sources.length });

    const lines: string[] = [
      `[DRY RUN] ${new Date().toISOString()} — Simulating pipeline`,
      `[DRY RUN] ${sources.length} trusted source(s) would be fetched`,
      ...sources.map((s) =>
        `[DRY RUN] → ${s.vendor} / ${s.tool} (${s.trustLevel}) — ${s.url}`
      ),
      `[DRY RUN] Each URL would be passed to OpenAI gpt-4o-mini for classification`,
      `[DRY RUN] Items with confidence=high from official sources → requiresReview=false`,
      `[DRY RUN] All other items → requiresReview=true`,
      `[DRY RUN] New entries appended to pricing-history.json (append-only, no overwrites)`,
      `[DRY RUN] Daily digest written to ai-pricing-news.json`,
      `[DRY RUN] Run log appended to pipeline-run-log.json`,
      `[DRY RUN] --- Simulation complete (no data was modified) ---`,
    ];

    setTimeout(() => {
      setIsDryRunning(false);
      setDryRunResult(lines);

      const entry = JSON.stringify({
        runAt: new Date().toISOString(),
        status: "success",
        digestItems: 0,
        newHistoryEntries: 0,
        sourceCount: sources.length,
        dryRun: true,
      } as RunEntry & { dryRun: boolean });
      const updated = appendSimLog(entry);
      setSimLog(updated);
    }, 2000);
  }

  function reprocessData() {
    trackGaEvent("pipeline_reprocess_triggered", {});
    const entry = JSON.stringify({
      runAt: new Date().toISOString(),
      status: "success",
      digestItems: digest.items.length,
      newHistoryEntries: 0,
      sourceCount: sources.length,
      reprocess: true,
    } as RunEntry & { reprocess: boolean });
    const updated = appendSimLog(entry);
    setSimLog(updated);
    alert("Reprocess logged. In production, this triggers a re-classification of existing digest items. No data was modified in this environment.");
  }

  function clearSimLog() {
    localStorage.removeItem(SIM_LOG_KEY);
    setSimLog([]);
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav title="Pricing Intelligence Control" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Status cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Last run",       value: fmtShort(digest.lastChecked ?? runLog.lastRunAt), sub: "date" },
            { label: "Digest items",   value: String(digest.items.length),        sub: "from last run" },
            { label: "Pending review", value: String(pendingReview),              sub: pendingReview > 0 ? "need attention" : "all clear" },
            { label: "Sources",        value: String(sources.length),             sub: "trusted" },
          ].map((s) => (
            <div key={s.label} className="border border-border rounded-xl p-4 bg-card">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Freshness + last run summary */}
        <div className="border border-border rounded-xl bg-card p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Last pipeline run</p>
              <p className="font-semibold text-foreground">{fmtDate(digest.generatedAt ?? runLog.lastRunAt)}</p>
            </div>
            <FreshnessIndicator
              forceLive={!!digest.lastChecked}
              dateStr={digest.lastChecked}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center border-t border-border pt-4">
            <div>
              <p className="text-2xl font-bold text-foreground">{digest.items.length}</p>
              <p className="text-xs text-muted-foreground">Digest items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{highConf}</p>
              <p className="text-xs text-muted-foreground">High confidence</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{officialCount}</p>
              <p className="text-xs text-muted-foreground">From official sources</p>
            </div>
          </div>
        </div>

        {/* Action panel */}
        <div className="border border-border rounded-xl bg-card p-5 mb-8">
          <p className="text-sm font-semibold text-foreground mb-4">Pipeline actions</p>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={simulateDryRun}
              disabled={isDryRunning}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {isDryRunning ? "Running simulation…" : "Dry Run (Simulate)"}
            </button>
            <button
              onClick={reprocessData}
              className="inline-flex items-center gap-2 border border-border text-muted-foreground hover:text-foreground font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Reprocess existing data
            </button>
            <a
              href="https://github.com/features/actions"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Trigger via GitHub Actions ↗
            </a>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
            <span className="font-semibold">Guardrails: </span>
            History is append-only · Low-confidence items always require review ·
            No auto-publish without official source + high confidence · All runs logged
          </div>
          {isDryRunning && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              Simulating pipeline — fetching {sources.length} sources…
            </div>
          )}
          {dryRunResult && (
            <div className="mt-4 bg-slate-900 rounded-lg p-4 text-xs text-green-400 font-mono overflow-x-auto">
              {dryRunResult.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
          {([
            { key: "status",  label: "Last run audit" },
            { key: "sources", label: `Sources (${sources.length})` },
            { key: "logs",    label: `Run log (${allRuns.length})` },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "status" && <AuditLogTab digest={digest} />}
        {activeTab === "sources" && <SourcesTab sources={sources} />}
        {activeTab === "logs" && (
          <LogsTab runs={allRuns} onClearSim={clearSimLog} simCount={simLog.length} />
        )}
      </div>
    </div>
  );
}

// ─── AuditLogTab ──────────────────────────────────────────────────────────────

function AuditLogTab({ digest }: { digest: NewsDigest }) {
  const auditLog = digest.auditLog ?? [];

  if (auditLog.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 px-6 py-12 text-center">
        <p className="text-2xl mb-3">📋</p>
        <p className="text-sm font-semibold text-foreground mb-1">No audit log available</p>
        <p className="text-xs text-muted-foreground">The pipeline hasn't run yet, or the digest was generated without an audit log.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Source URL</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Items</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Error</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {auditLog.map((entry, i) => (
            <tr key={i} className="hover:bg-muted/20">
              <td className="px-4 py-2 text-xs text-primary max-w-xs truncate">
                <a href={entry.url} target="_blank" rel="noreferrer" className="hover:underline">{entry.url}</a>
              </td>
              <td className="px-4 py-2 text-center">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  entry.status === "ok"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600"
                }`}>
                  {entry.status}
                </span>
              </td>
              <td className="px-4 py-2 text-center text-xs font-semibold text-foreground">
                {entry.itemCount ?? "—"}
              </td>
              <td className="px-4 py-2 text-xs text-red-500 max-w-xs truncate">
                {entry.error ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── SourcesTab ───────────────────────────────────────────────────────────────

function SourcesTab({ sources }: { sources: TrustedSource[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Vendor / Tool</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Trust level</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Auto-draft</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">URL</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {sources.map((src, i) => (
            <tr key={i} className="hover:bg-muted/20 align-top">
              <td className="px-4 py-3">
                <p className="font-semibold text-xs text-foreground">{src.vendor}</p>
                <p className="text-xs text-muted-foreground">{src.tool}</p>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${TRUST_BADGE[src.trustLevel] ?? TRUST_BADGE.third_party}`}>
                  {src.trustLevel}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {src.allowedForAutoDraft
                  ? <span className="text-xs font-semibold text-emerald-600">Yes</span>
                  : <span className="text-xs text-muted-foreground">No</span>}
              </td>
              <td className="px-4 py-3 max-w-xs">
                <a href={src.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate block">
                  {src.url}
                </a>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs">{src.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── LogsTab ──────────────────────────────────────────────────────────────────

function LogsTab({
  runs,
  onClearSim,
  simCount,
}: {
  runs: (RunEntry & { dryRun?: boolean; reprocess?: boolean })[];
  onClearSim: () => void;
  simCount: number;
}) {
  if (runs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 px-6 py-12 text-center">
        <p className="text-2xl mb-3">📋</p>
        <p className="text-sm font-semibold text-foreground mb-1">No runs logged yet</p>
        <p className="text-xs text-muted-foreground">Run the pipeline or use Dry Run to see entries here.</p>
      </div>
    );
  }

  return (
    <div>
      {simCount > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground">{simCount} simulation entries in local storage</p>
          <button onClick={onClearSim} className="text-xs text-red-500 hover:underline">Clear simulation log</button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Run time</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Mode</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Digest</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">New history</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Sources</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {runs.map((run, i) => (
              <tr key={i} className="hover:bg-muted/20">
                <td className="px-4 py-2 text-xs text-foreground whitespace-nowrap">
                  {fmtDate(run.runAt)}
                </td>
                <td className="px-4 py-2 text-center">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    run.status === "success"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-600"
                  }`}>
                    {run.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <span className="text-xs text-muted-foreground">
                    {(run as { dryRun?: boolean }).dryRun
                      ? "Dry run"
                      : (run as { reprocess?: boolean }).reprocess
                        ? "Reprocess"
                        : "Live"}
                  </span>
                </td>
                <td className="px-4 py-2 text-center text-xs font-semibold text-foreground">{run.digestItems}</td>
                <td className="px-4 py-2 text-center text-xs font-semibold text-foreground">{run.newHistoryEntries}</td>
                <td className="px-4 py-2 text-center text-xs text-muted-foreground">{run.sourceCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
