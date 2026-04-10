import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Link } from "wouter";
import modelsData from "@/data/models.json";
import type { AIModel } from "@/engine/types";
import {
  computePricingDiff,
  applyApprovedDiffs,
  generateChangelogEntry,
  generateSampleCandidates,
  type ModelDiffRow,
  type DiffStatus,
} from "@/utils/pricingDiff";
import { freshnessLabel, isPricingStale } from "@/utils/pricingFreshness";
import { track } from "@/utils/analytics";

const CURRENT_MODELS = modelsData as AIModel[];
const ADMIN_KEY = "overpaying_admin";
const TODAY = new Date().toISOString().split("T")[0];

type Decision = "approved" | "rejected" | "reviewed";
type Filter = "all" | "changed" | "stale" | "added" | "removed";

function fmt(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}

function PriceVal({ v }: { v: number | null | undefined }) {
  if (v === null || v === undefined) return <span className="text-muted-foreground">—</span>;
  return <span>${v}</span>;
}

function StatusBadge({ status }: { status: DiffStatus | "stale" }) {
  const styles: Record<string, string> = {
    changed: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    added: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    removed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    unchanged: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    stale: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${styles[status] ?? styles.unchanged}`}>
      {status}
    </span>
  );
}

function GuardScreen({ onUnlock }: { onUnlock: () => void }) {
  const [key, setKey] = useState("");
  const [err, setErr] = useState(false);

  const attempt = () => {
    if (key === "refresh") {
      localStorage.setItem(ADMIN_KEY, "1");
      onUnlock();
    } else {
      setErr(true);
      setTimeout(() => setErr(false), 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm border border-border rounded-xl p-8 bg-card shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Maintainer access</p>
        <h1 className="text-2xl font-bold mb-6 text-foreground">Pricing Admin</h1>
        <label className="block text-sm font-medium text-foreground mb-2">Maintainer key</label>
        <input
          type="password"
          className={`w-full border ${err ? "border-red-400" : "border-border"} rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4`}
          placeholder="Enter key to unlock"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && attempt()}
          autoFocus
        />
        {err && <p className="text-xs text-red-500 mb-3">Incorrect key.</p>}
        <button
          onClick={attempt}
          className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Unlock
        </button>
        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to public site</Link>
        </div>
      </div>
    </div>
  );
}

function DiffRowCard({
  row,
  decision,
  onDecide,
}: {
  row: ModelDiffRow;
  decision: Decision | undefined;
  onDecide: (id: string, d: Decision | null) => void;
}) {
  const cur = row.current;
  const cand = row.candidate;
  const isStale = cur?.last_updated ? isPricingStale(cur.last_updated) : false;

  return (
    <div
      className={`border rounded-lg p-4 ${
        decision === "approved"
          ? "border-green-300 bg-green-50/50 dark:bg-green-950/20"
          : decision === "rejected"
          ? "border-red-300 bg-red-50/50 dark:bg-red-950/20 opacity-60"
          : decision === "reviewed"
          ? "border-blue-300 bg-blue-50/50 dark:bg-blue-950/20"
          : "border-border bg-card"
      }`}
      data-testid={`diff-row-${row.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground text-sm">{row.name}</span>
            <span className="text-xs text-muted-foreground">{row.provider}</span>
            <StatusBadge status={row.status} />
            {isStale && row.status === "unchanged" && <StatusBadge status="stale" />}
          </div>
          {cur?.last_updated ? (
            <p className="text-xs text-muted-foreground mt-1">{freshnessLabel(cur.last_updated)}</p>
          ) : (
            <p className="text-xs text-orange-500 mt-1">No review date on record</p>
          )}
          {cur?.source && (
            <a href={cur.source} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-0.5 block truncate">
              {cur.source}
            </a>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onDecide(row.id, decision === "approved" ? null : "approved")}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              decision === "approved"
                ? "bg-green-600 text-white"
                : "border border-border hover:border-green-400 hover:text-green-700 text-muted-foreground"
            }`}
          >
            ✓ Approve
          </button>
          <button
            onClick={() => onDecide(row.id, decision === "reviewed" ? null : "reviewed")}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              decision === "reviewed"
                ? "bg-blue-600 text-white"
                : "border border-border hover:border-blue-400 hover:text-blue-700 text-muted-foreground"
            }`}
          >
            ↺ Mark Reviewed
          </button>
          <button
            onClick={() => onDecide(row.id, decision === "rejected" ? null : "rejected")}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              decision === "rejected"
                ? "bg-red-600 text-white"
                : "border border-border hover:border-red-400 hover:text-red-700 text-muted-foreground"
            }`}
          >
            ✕ Reject
          </button>
        </div>
      </div>

      {(row.status === "changed" || row.status === "added") && (
        <div className="mt-2 space-y-1">
          {row.status === "changed" && row.fieldDiffs.map((fd) => (
            <div key={fd.field} className="flex flex-wrap items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded px-2 py-1">
              <span className="font-medium text-foreground">{fd.label}:</span>
              <span className="line-through text-red-600 dark:text-red-400">{fmt(fd.oldValue)}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-semibold text-green-700 dark:text-green-400">{fmt(fd.newValue)}</span>
            </div>
          ))}
          {row.status === "added" && cand && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div><span className="text-muted-foreground">Input:</span> <strong>${cand.inputCostPer1k}/1k</strong></div>
              <div><span className="text-muted-foreground">Output:</span> <strong>${cand.outputCostPer1k}/1k</strong></div>
              {cand.monthlySubscriptionCostIfAny !== null && (
                <div><span className="text-muted-foreground">Sub:</span> <strong>${cand.monthlySubscriptionCostIfAny}/mo</strong></div>
              )}
            </div>
          )}
        </div>
      )}

      {row.status === "unchanged" && cur && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground mt-1">
          {cur.planType === "api" ? (
            <>
              <div>In: <strong className="text-foreground">${cur.inputCostPer1k}/1k</strong></div>
              <div>Out: <strong className="text-foreground">${cur.outputCostPer1k}/1k</strong></div>
            </>
          ) : (
            <div>Sub: <strong className="text-foreground"><PriceVal v={cur.monthlySubscriptionCostIfAny} />/mo</strong></div>
          )}
        </div>
      )}
    </div>
  );
}

export function PricingRefreshPage() {
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(ADMIN_KEY) === "1");
  const [pasteValue, setPasteValue] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<AIModel[] | null>(null);
  const [diffRows, setDiffRows] = useState<ModelDiffRow[]>([]);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [exported, setExported] = useState<{ json: string; changelog: string } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);

  const decisionsRef = useRef(decisions);
  const diffRowsRef = useRef(diffRows);
  useEffect(() => { decisionsRef.current = decisions; }, [decisions]);
  useEffect(() => { diffRowsRef.current = diffRows; }, [diffRows]);

  const handleUnlock = useCallback(() => setUnlocked(true), []);
  const handleLock = useCallback(() => {
    localStorage.removeItem(ADMIN_KEY);
    setUnlocked(false);
  }, []);

  const handleLoadSample = useCallback(() => {
    const sample = generateSampleCandidates(CURRENT_MODELS);
    const rows = computePricingDiff(CURRENT_MODELS, sample);
    setCandidates(sample);
    setDiffRows(rows);
    setDecisions({});
    setExported(null);
    setPasteValue(JSON.stringify(sample, null, 2));
    track("pricing_refresh_started", { source: "sample", modelCount: sample.length });
  }, []);

  const handleParsePaste = useCallback(() => {
    setParseError(null);
    try {
      const parsed = JSON.parse(pasteValue) as AIModel[];
      if (!Array.isArray(parsed)) throw new Error("Expected a JSON array.");
      if (parsed.length === 0) throw new Error("Array is empty.");
      if (!parsed[0].id || !parsed[0].name) throw new Error("Records must have 'id' and 'name' fields.");
      const rows = computePricingDiff(CURRENT_MODELS, parsed);
      setCandidates(parsed);
      setDiffRows(rows);
      setDecisions({});
      setExported(null);
      track("pricing_refresh_started", { source: "paste", modelCount: parsed.length });
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Invalid JSON.");
    }
  }, [pasteValue]);

  const handleDecide = useCallback((id: string, d: Decision | null) => {
    setDecisions((prev) => {
      const next = { ...prev };
      if (d === null) delete next[id];
      else next[id] = d;
      return next;
    });
    setExported(null);
    if (d) track("pricing_diff_reviewed", { id, decision: d });
  }, []);

  const handleApproveAllChanged = useCallback(() => {
    const next: Record<string, Decision> = { ...decisions };
    diffRows.filter((r) => r.status === "changed" || r.status === "added").forEach((r) => { next[r.id] = "approved"; });
    setDecisions(next);
    setExported(null);
  }, [diffRows, decisions]);

  const handleReviewAllUnchanged = useCallback(() => {
    const next: Record<string, Decision> = { ...decisions };
    diffRows.filter((r) => r.status === "unchanged").forEach((r) => { next[r.id] = "reviewed"; });
    setDecisions(next);
    setExported(null);
  }, [diffRows, decisions]);

  const handleClearAll = useCallback(() => {
    setDecisions({});
    setExported(null);
  }, []);

  const handleGenerateExport = useCallback(() => {
    setExportError(null);
    try {
      const latestDecisions = decisionsRef.current;
      const latestDiffRows = diffRowsRef.current;
      const approvedIds = new Set(
        Object.entries(latestDecisions).filter(([, v]) => v === "approved").map(([k]) => k)
      );
      const reviewedIds = new Set(
        Object.entries(latestDecisions).filter(([, v]) => v === "reviewed").map(([k]) => k)
      );
      if (approvedIds.size === 0 && reviewedIds.size === 0) {
        setExportError("No rows approved or reviewed yet. Approve or mark rows reviewed before exporting.");
        return;
      }
      const updated = applyApprovedDiffs(CURRENT_MODELS, latestDiffRows, approvedIds, reviewedIds, TODAY);
      const changelog = generateChangelogEntry(latestDiffRows, approvedIds, reviewedIds, TODAY);
      setExported({
        json: JSON.stringify(updated, null, 2),
        changelog: JSON.stringify(changelog, null, 2),
      });
      track("pricing_refresh_approved", {
        approvedCount: approvedIds.size,
        reviewedCount: reviewedIds.size,
      });
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Unexpected error generating export.");
      console.error("Export error:", e);
    }
  }, []);

  const handleCopy = useCallback((text: string, type: "json" | "log") => {
    navigator.clipboard.writeText(text);
    if (type === "json") { setCopiedJson(true); setTimeout(() => setCopiedJson(false), 2000); }
    else { setCopiedLog(true); setTimeout(() => setCopiedLog(false), 2000); }
  }, []);

  const filteredRows = useMemo(() => {
    return diffRows.filter((r) => {
      if (filter === "changed") return r.status === "changed" || r.status === "added" || r.status === "removed";
      if (filter === "stale") return r.current?.last_updated ? isPricingStale(r.current.last_updated) : true;
      if (filter === "added") return r.status === "added";
      if (filter === "removed") return r.status === "removed";
      return true;
    });
  }, [diffRows, filter]);

  const stats = useMemo(() => {
    const changed = diffRows.filter((r) => r.status === "changed").length;
    const added = diffRows.filter((r) => r.status === "added").length;
    const removed = diffRows.filter((r) => r.status === "removed").length;
    const stale = CURRENT_MODELS.filter((m) => m.last_updated ? isPricingStale(m.last_updated) : true).length;
    const approvedCount = Object.values(decisions).filter((v) => v === "approved").length;
    const reviewedCount = Object.values(decisions).filter((v) => v === "reviewed").length;
    return { changed, added, removed, stale, approvedCount, reviewedCount };
  }, [diffRows, decisions]);

  if (!unlocked) return <GuardScreen onUnlock={handleUnlock} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">Admin</span>
          <h1 className="font-bold text-foreground text-sm sm:text-base">Pricing Refresh Workflow</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground hidden sm:block">{TODAY}</span>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">← Public site</Link>
          <button onClick={handleLock} className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1">Lock</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total models", value: CURRENT_MODELS.length },
            { label: "No review date", value: stats.stale, warn: stats.stale > 0 },
            { label: "Candidates loaded", value: candidates ? candidates.length : "—" },
            { label: "Changed in diff", value: diffRows.length > 0 ? stats.changed + stats.added + stats.removed : "—", warn: stats.changed + stats.added > 0 },
          ].map((s) => (
            <div key={s.label} className="border border-border rounded-lg p-3 bg-card">
              <p className={`text-xl font-bold ${s.warn ? "text-amber-600" : "text-foreground"}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="text-base font-bold mb-1">1. Load Candidate Pricing</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Paste a refreshed <code className="bg-muted px-1 rounded text-xs">models.json</code>-compatible array, or load a generated sample to test the workflow.
          </p>
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleLoadSample}
              className="text-sm border border-primary text-primary px-4 py-2 rounded-lg font-medium hover:bg-primary/5 transition-colors"
              data-testid="load-sample-btn"
            >
              Load sample candidates
            </button>
          </div>
          <textarea
            className={`w-full h-40 border ${parseError ? "border-red-400" : "border-border"} rounded-lg px-3 py-2 text-xs font-mono bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y`}
            placeholder='Paste a JSON array of model records here — same schema as models.json...'
            value={pasteValue}
            onChange={(e) => { setPasteValue(e.target.value); setParseError(null); }}
            data-testid="candidate-paste"
          />
          {parseError && <p className="text-xs text-red-500 mt-1">{parseError}</p>}
          <button
            onClick={handleParsePaste}
            disabled={!pasteValue.trim()}
            className="mt-2 text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            data-testid="parse-candidates-btn"
          >
            Parse and compute diff
          </button>
        </section>

        {diffRows.length > 0 && (
          <section data-testid="diff-section">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold">2. Review Diff</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {stats.changed} changed · {stats.added} added · {stats.removed} removed · {diffRows.length - stats.changed - stats.added - stats.removed} unchanged
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleApproveAllChanged} className="text-xs border border-green-400 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg font-medium hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors">
                  Approve all changed
                </button>
                <button onClick={handleReviewAllUnchanged} className="text-xs border border-blue-400 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors">
                  Mark all unchanged reviewed
                </button>
                <button onClick={handleClearAll} className="text-xs border border-border text-muted-foreground px-3 py-1.5 rounded-lg font-medium hover:bg-muted/50 transition-colors">
                  Clear all
                </button>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
              {(["all", "changed", "stale", "added", "removed"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  {f === "changed" && stats.changed + stats.added + stats.removed > 0 && (
                    <span className="ml-1 bg-amber-500 text-white rounded-full px-1.5 py-0.5 text-[10px]">
                      {stats.changed + stats.added + stats.removed}
                    </span>
                  )}
                </button>
              ))}
              {stats.approvedCount + stats.reviewedCount > 0 && (
                <span className="text-xs text-muted-foreground self-center ml-auto">
                  {stats.approvedCount} approved · {stats.reviewedCount} reviewed
                </span>
              )}
            </div>

            <div className="space-y-3">
              {filteredRows.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No rows match this filter.</p>
              ) : (
                filteredRows.map((row) => (
                  <DiffRowCard
                    key={row.id}
                    row={row}
                    decision={decisions[row.id]}
                    onDecide={handleDecide}
                  />
                ))
              )}
            </div>

            {exportError && (
              <p className="mt-4 text-sm text-red-500 border border-red-200 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">{exportError}</p>
            )}

            {(stats.approvedCount + stats.reviewedCount > 0) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleGenerateExport}
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
                  data-testid="generate-export-btn"
                >
                  Generate export ({stats.approvedCount} approved + {stats.reviewedCount} reviewed)
                </button>
              </div>
            )}
          </section>
        )}

        {exported && (
          <section data-testid="export-section">
            <h2 className="text-base font-bold mb-1">3. Export</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Copy the updated dataset below and replace <code className="bg-muted px-1 rounded text-xs">src/data/models.json</code> in your repository. Then copy the changelog entry for your records.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Updated models.json</p>
                  <button
                    onClick={() => handleCopy(exported.json, "json")}
                    className="text-xs border border-border px-3 py-1 rounded font-medium hover:bg-muted/50 transition-colors"
                    data-testid="copy-json-btn"
                  >
                    {copiedJson ? "Copied!" : "Copy JSON"}
                  </button>
                </div>
                <pre className="bg-muted/50 border border-border rounded-lg p-4 text-xs font-mono overflow-auto max-h-64 text-foreground">
                  {exported.json.slice(0, 2000)}{exported.json.length > 2000 ? "\n... (truncated for display)" : ""}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Changelog entry</p>
                  <button
                    onClick={() => handleCopy(exported.changelog, "log")}
                    className="text-xs border border-border px-3 py-1 rounded font-medium hover:bg-muted/50 transition-colors"
                    data-testid="copy-changelog-btn"
                  >
                    {copiedLog ? "Copied!" : "Copy changelog"}
                  </button>
                </div>
                <pre className="bg-muted/50 border border-border rounded-lg p-4 text-xs font-mono overflow-auto max-h-48 text-foreground">
                  {exported.changelog}
                </pre>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
