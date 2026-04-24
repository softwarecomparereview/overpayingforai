import { useState, useEffect, useCallback, useRef } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminNav } from "@/components/admin/AdminNav";

import { getAdminApiBase } from "@/utils/adminApi";

const ADMIN_KEY_HEADER = "refresh";
const BASE = `${getAdminApiBase()}/api/admin/audit`;

type RunStatus = "running" | "complete" | "failed" | "unknown";
type AuditMode = "quick" | "full";

interface AuditRun {
  runId: string;
  status: RunStatus;
  mode: string;
  domain: string;
  startedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
  screenshotCount: number;
  issueCount: number | null;
  hasZip: boolean;
  hasSummary: boolean;
}

function apiHeaders() {
  return { "x-admin-key": ADMIN_KEY_HEADER, "Content-Type": "application/json" };
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function StatusBadge({ status }: { status: RunStatus }) {
  const styles: Record<RunStatus, string> = {
    running: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 animate-pulse",
    complete: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    unknown: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
}

function SummaryModal({ runId, onClose }: { runId: string; onClose: () => void }) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/runs/${runId}/summary`, { headers: apiHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(setText)
      .catch((e) => setError(e.message));
  }, [runId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="font-bold text-sm text-foreground">Summary — {runId}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>
        <div className="overflow-auto flex-1 p-5">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {!text && !error && <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>}
          {text && (
            <pre className="text-xs font-mono whitespace-pre-wrap text-foreground leading-relaxed">{text}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

function RunCard({
  run,
  onDownload,
  onViewSummary,
}: {
  run: AuditRun;
  onDownload: (runId: string) => void;
  onViewSummary: (runId: string) => void;
}) {
  return (
    <div className="border border-border rounded-lg p-4 bg-card space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-xs text-muted-foreground">{run.runId}</span>
            <StatusBadge status={run.status} />
            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
              {run.mode}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{run.domain}</span>
            {run.startedAt && <> · Started {fmtDate(run.startedAt)}</>}
            {run.completedAt && <> · Finished {fmtDate(run.completedAt)}</>}
          </p>
          {run.status === "failed" && run.failureReason && (
            <p className="text-xs text-red-500 mt-1">Error: {run.failureReason}</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0 flex-wrap">
          {run.hasSummary && (
            <button
              onClick={() => onViewSummary(run.runId)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary hover:text-primary text-muted-foreground transition-colors"
            >
              View Summary
            </button>
          )}
          {run.hasZip && (
            <button
              onClick={() => onDownload(run.runId)}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
            >
              Download ZIP
            </button>
          )}
          {run.status === "complete" && !run.hasZip && (
            <button
              onClick={() => onDownload(run.runId)}
              className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              Generate ZIP
            </button>
          )}
        </div>
      </div>

      {(run.screenshotCount > 0 || run.issueCount !== null) && (
        <div className="flex gap-4 text-xs text-muted-foreground border-t border-border pt-2 mt-2">
          {run.screenshotCount > 0 && (
            <span><span className="font-semibold text-foreground">{run.screenshotCount}</span> screenshots</span>
          )}
          {run.issueCount !== null && (
            <span>
              <span className={`font-semibold ${run.issueCount > 0 ? "text-amber-600" : "text-green-600"}`}>
                {run.issueCount}
              </span> issues found
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function AuditRunnerContent() {
  const [runs, setRuns] = useState<AuditRun[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [mode, setMode] = useState<AuditMode>("quick");
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [summaryRunId, setSummaryRunId] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRuns = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}/runs`, { headers: apiHeaders() });
      if (!r.ok) return;
      const data = await r.json();
      setRuns(data.runs ?? []);
      setActiveRunId(data.activeRunId ?? null);
    } catch {
      // network error — ignore silently
    }
  }, []);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  useEffect(() => {
    if (activeRunId) {
      pollRef.current = setInterval(fetchRuns, 3000);
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeRunId, fetchRuns]);

  const handleRunAudit = async () => {
    setIsLaunching(true);
    setLaunchError(null);
    try {
      const r = await fetch(`${BASE}/run`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ mode }),
      });
      const data = await r.json();
      if (!r.ok) {
        setLaunchError(data.message ?? `Error ${r.status}`);
        return;
      }
      await fetchRuns();
    } catch (e) {
      setLaunchError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLaunching(false);
    }
  };

  const handleDownload = async (runId: string) => {
    setIsDownloading(runId);
    try {
      const r = await fetch(`${BASE}/runs/${runId}/download`, { headers: apiHeaders() });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        alert(`Download failed: ${data.message ?? r.status}`);
        return;
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${runId}_audit.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      await fetchRuns();
    } catch (e) {
      alert(`Download error: ${e instanceof Error ? e.message : "Unknown"}`);
    } finally {
      setIsDownloading(null);
    }
  };

  const isRunning = !!activeRunId;
  const canRun = !isRunning && !isLaunching;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <meta name="robots" content="noindex, nofollow" />
      <AdminNav title="Site Audit Runner" />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Launch panel */}
        <div className="border border-border rounded-xl p-6 bg-card space-y-4">
          <div>
            <h2 className="text-sm font-bold mb-0.5">Run Live Production Audit</h2>
            <p className="text-xs text-muted-foreground">
              Target: <span className="font-mono text-foreground">https://overpayingforai.com</span> · Read-only · No production writes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Mode</label>
              <div className="flex rounded-lg border border-border overflow-hidden text-xs">
                {(["quick", "full"] as AuditMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    disabled={!canRun}
                    className={`px-4 py-2 font-medium transition-colors capitalize ${
                      mode === m
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground bg-background"
                    } ${!canRun ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-transparent select-none">Action</label>
              <button
                onClick={handleRunAudit}
                disabled={!canRun}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-opacity ${
                  canRun
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {isLaunching ? "Starting…" : isRunning ? "Audit in progress…" : "Run live audit"}
              </button>
            </div>
          </div>

          {isRunning && (
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              <span className="animate-spin inline-block">⟳</span>
              <span>Audit running — refreshing every 3 seconds…</span>
            </div>
          )}

          {launchError && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded px-3 py-2">
              {launchError}
            </p>
          )}

          <div className="text-xs text-muted-foreground border-t border-border pt-3 space-y-0.5">
            <p><strong>Quick</strong> — 15 pages, no screenshots. Fast check (~30–60s).</p>
            <p><strong>Full</strong> — up to 100 pages with screenshots. Comprehensive (~5–15min).</p>
          </div>
        </div>

        {/* Run history */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">Run History</h2>
            <button
              onClick={fetchRuns}
              className="text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1"
            >
              Refresh
            </button>
          </div>

          {runs.length === 0 ? (
            <div className="border border-border rounded-lg p-8 text-center text-sm text-muted-foreground bg-card">
              No audit runs yet. Start one above.
            </div>
          ) : (
            <div className="space-y-3">
              {runs.map((run) => (
                <RunCard
                  key={run.runId}
                  run={{
                    ...run,
                    hasZip: run.hasZip || isDownloading === run.runId,
                  }}
                  onDownload={isDownloading ? () => {} : handleDownload}
                  onViewSummary={setSummaryRunId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {summaryRunId && (
        <SummaryModal runId={summaryRunId} onClose={() => setSummaryRunId(null)} />
      )}
    </div>
  );
}

export function AuditRunnerPage() {
  return (
    <AdminGuard title="Site Audit Runner">
      <AuditRunnerContent />
    </AdminGuard>
  );
}
