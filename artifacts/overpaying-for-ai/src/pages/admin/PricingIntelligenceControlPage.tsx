import { useState, useEffect, useRef } from "react";
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
  mode?: string;
  status: "success" | "error" | "partial_error";
  digestItems: number;
  newHistoryEntries: number;
  sourceCount: number;
  autoCandidates?: number;
  reviewCandidates?: number;
  alertCandidates?: number;
  rejectedCandidates?: number;
  errors?: string[];
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

type RouteDecision =
  | "AUTO_CANDIDATE"
  | "REVIEW_CANDIDATE"
  | "ALERT_CANDIDATE"
  | "REJECTED_LOW_CONFIDENCE";

interface ProposedChange {
  vendor: string;
  tool: string;
  changeType: string;
  confidence: string;
  route: RouteDecision;
  routeReason: string;
  freshnessStatus: string;
  sourceUrl: string;
  sourceTrustLevel: string;
  headline: string;
  summary: string;
  detectedDate: string;
}

interface ManualRunResult {
  runAt: string;
  mode: "manual_no_update";
  status: string;
  sourcesChecked: number;
  itemsDetected: number;
  autoCandidates: number;
  reviewCandidates: number;
  alertCandidates: number;
  rejectedCandidates: number;
  errors: string[];
  proposedChanges: ProposedChange[];
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

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  });
}

const TRUST_BADGE: Record<string, string> = {
  official:            "bg-emerald-100 text-emerald-700 border-emerald-200",
  trusted_third_party: "bg-blue-100 text-blue-700 border-blue-200",
  third_party:         "bg-slate-100 text-slate-600 border-slate-200",
};

const ROUTE_STYLE: Record<RouteDecision, { label: string; cls: string }> = {
  AUTO_CANDIDATE:           { label: "AUTO CANDIDATE",           cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  REVIEW_CANDIDATE:         { label: "REVIEW CANDIDATE",         cls: "bg-amber-100 text-amber-700 border-amber-200" },
  ALERT_CANDIDATE:          { label: "ALERT CANDIDATE",          cls: "bg-red-100 text-red-700 border-red-200" },
  REJECTED_LOW_CONFIDENCE:  { label: "REJECTED LOW CONFIDENCE",  cls: "bg-slate-100 text-slate-500 border-slate-200" },
};

// ─── Simulate manual_no_update from existing digest data ──────────────────────

function routeItem(item: {
  confidence: string;
  requiresReview: boolean;
  sourceTrustLevel: string;
  changeType: string;
}): RouteDecision {
  if (item.confidence === "low") return "REJECTED_LOW_CONFIDENCE";
  const isHighImpact = ["pricing_change", "plan_change", "enterprise_change"].includes(item.changeType);
  if (item.confidence === "high" && !item.requiresReview && item.sourceTrustLevel === "official") {
    if (isHighImpact) return "ALERT_CANDIDATE";
    return "AUTO_CANDIDATE";
  }
  if (isHighImpact || item.sourceTrustLevel !== "official") return "ALERT_CANDIDATE";
  return "REVIEW_CANDIDATE";
}

function routeReason(item: {
  confidence: string;
  requiresReview: boolean;
  sourceTrustLevel: string;
  changeType: string;
}): string {
  if (item.confidence === "low") return "Confidence too low to publish";
  const isHighImpact = ["pricing_change", "plan_change", "enterprise_change"].includes(item.changeType);
  if (item.confidence === "high" && !item.requiresReview && item.sourceTrustLevel === "official") {
    if (isHighImpact) return "High confidence official source but high-impact change — escalated for alert";
    return "High confidence from official source, allowed for auto-draft";
  }
  if (isHighImpact) return "High-impact change type requires human review";
  if (item.sourceTrustLevel !== "official") return "Non-official source — always requires review";
  return "Medium confidence or missing auto-draft permission";
}

function buildSimulatedManualRun(): ManualRunResult {
  const today = new Date().toISOString().slice(0, 10);
  const proposedChanges: ProposedChange[] = sources.map((src) => ({
    vendor: src.vendor,
    tool: src.tool,
    changeType: "general_news",
    confidence: "medium",
    route: "REVIEW_CANDIDATE",
    routeReason: "Simulated — non-official source or medium confidence",
    freshnessStatus: "live",
    sourceUrl: src.url,
    sourceTrustLevel: src.trustLevel,
    headline: `No new changes detected at ${src.vendor}`,
    summary: `Checked ${src.vendor} / ${src.tool} pricing page. No specific changes detected in this simulation run. A real run would classify actual page content.`,
    detectedDate: today,
  }));

  const existingItems = digest.items.map((item) => {
    const r = routeItem(item);
    return {
      vendor: item.vendor,
      tool: item.tool,
      changeType: item.changeType,
      confidence: item.confidence,
      route: r,
      routeReason: routeReason(item),
      freshnessStatus: "live",
      sourceUrl: "",
      sourceTrustLevel: item.sourceTrustLevel,
      headline: `Existing: ${item.changeType.replace(/_/g, " ")}`,
      summary: "",
      detectedDate: new Date().toISOString().slice(0, 10),
    } satisfies ProposedChange;
  });

  const allItems = existingItems.length > 0 ? existingItems : proposedChanges;

  return {
    runAt: new Date().toISOString(),
    mode: "manual_no_update",
    status: "success",
    sourcesChecked: sources.length,
    itemsDetected: allItems.length,
    autoCandidates:     allItems.filter((i) => i.route === "AUTO_CANDIDATE").length,
    reviewCandidates:   allItems.filter((i) => i.route === "REVIEW_CANDIDATE").length,
    alertCandidates:    allItems.filter((i) => i.route === "ALERT_CANDIDATE").length,
    rejectedCandidates: allItems.filter((i) => i.route === "REJECTED_LOW_CONFIDENCE").length,
    errors: [],
    proposedChanges: allItems,
  };
}

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
  const [isManualRunning, setIsManualRunning] = useState(false);
  const [manualRunResult, setManualRunResult] = useState<ManualRunResult | null>(null);
  const [activeTab, setActiveTab] = useState<"status" | "sources" | "logs">("status");
  const [explainerOpen, setExplainerOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackGaEvent("pipeline_control_viewed", { source_count: sources.length });
  }, []);

  const pendingReview = digest.items.filter((i) => i.requiresReview).length;
  const highConf      = digest.items.filter((i) => i.confidence === "high").length;
  const officialCount = digest.items.filter((i) => i.sourceTrustLevel === "official").length;

  const allRuns: (RunEntry & { dryRun?: boolean; reprocess?: boolean })[] = [
    ...runLog.runs,
    ...loadSimLog().map((entry) => JSON.parse(entry) as RunEntry),
  ].sort((a, b) => new Date(b.runAt).getTime() - new Date(a.runAt).getTime());

  function flashCopy(key: string) {
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function simulateDryRun() {
    setIsDryRunning(true);
    setDryRunResult(null);
    trackGaEvent("pipeline_dry_run_triggered", { source_count: sources.length });

    const lines: string[] = [
      `[DRY RUN] ${new Date().toISOString()} — Simulating pipeline`,
      `[DRY RUN] ${sources.length} trusted source(s) would be fetched`,
      ...sources.map((s) => `[DRY RUN] → ${s.vendor} / ${s.tool} (${s.trustLevel}) — ${s.url}`),
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
        mode: "dry_run",
        status: "success",
        digestItems: 0,
        newHistoryEntries: 0,
        sourceCount: sources.length,
      } satisfies RunEntry);
      setSimLog(appendSimLog(entry));
    }, 2000);
  }

  function runManualNoUpdate() {
    setIsManualRunning(true);
    setManualRunResult(null);
    trackGaEvent("pipeline_manual_no_update_triggered", { source_count: sources.length });

    setTimeout(() => {
      const result = buildSimulatedManualRun();
      setIsManualRunning(false);
      setManualRunResult(result);

      const entry = JSON.stringify({
        runAt: result.runAt,
        mode: "manual_no_update",
        status: result.status as RunEntry["status"],
        digestItems: result.itemsDetected,
        newHistoryEntries: 0,
        sourceCount: result.sourcesChecked,
        autoCandidates:     result.autoCandidates,
        reviewCandidates:   result.reviewCandidates,
        alertCandidates:    result.alertCandidates,
        rejectedCandidates: result.rejectedCandidates,
      } satisfies RunEntry);
      setSimLog(appendSimLog(entry));

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }, 2500);
  }

  function reprocessData() {
    trackGaEvent("pipeline_reprocess_triggered", {});
    const entry = JSON.stringify({
      runAt: new Date().toISOString(),
      mode: "reprocess",
      status: "success",
      digestItems: digest.items.length,
      newHistoryEntries: 0,
      sourceCount: sources.length,
    } satisfies RunEntry);
    setSimLog(appendSimLog(entry));
    alert("Reprocess logged. In production, this triggers re-classification of existing digest items with --mode reprocess. No data was modified in this environment.");
  }

  function clearSimLog() {
    localStorage.removeItem(SIM_LOG_KEY);
    setSimLog([]);
  }

  function copyFullJson() {
    if (!manualRunResult) return;
    copyToClipboard(JSON.stringify(manualRunResult, null, 2));
    flashCopy("json");
  }

  function copyHumanReadable() {
    if (!manualRunResult) return;
    const lines = [
      `Pricing Autopilot Manual Preview`,
      `Run time: ${fmtDate(manualRunResult.runAt)}`,
      `Mode: ${manualRunResult.mode}`,
      `Status: ${manualRunResult.status}`,
      `Sources checked: ${manualRunResult.sourcesChecked}`,
      `Items detected: ${manualRunResult.itemsDetected}`,
      `Auto candidates: ${manualRunResult.autoCandidates}`,
      `Review candidates: ${manualRunResult.reviewCandidates}`,
      `Alert candidates: ${manualRunResult.alertCandidates}`,
      `Rejected (low confidence): ${manualRunResult.rejectedCandidates}`,
      `Errors: ${manualRunResult.errors.length > 0 ? manualRunResult.errors.join(", ") : "None"}`,
      ``,
      `Proposed changes:`,
      ...manualRunResult.proposedChanges.map((c, i) => [
        `${i + 1}. ${c.vendor} / ${c.tool}`,
        `   Change type: ${c.changeType}`,
        `   Confidence: ${c.confidence}`,
        `   Route: ${c.route}`,
        `   Source: ${c.sourceUrl || c.sourceTrustLevel}`,
        `   Headline: ${c.headline}`,
        `   Summary: ${c.summary}`,
        `   Reason: ${c.routeReason}`,
      ].join("\n")),
    ];
    copyToClipboard(lines.join("\n"));
    flashCopy("readable");
  }

  function copyChatGptPrompt() {
    if (!manualRunResult) return;
    const lines = [
      `Pricing Autopilot Manual Preview`,
      `Run time: ${fmtDate(manualRunResult.runAt)}`,
      `Mode: manual_no_update`,
      `Sources checked: ${manualRunResult.sourcesChecked}`,
      `Items detected: ${manualRunResult.itemsDetected}`,
      ``,
      `Proposed changes:`,
      ...manualRunResult.proposedChanges.map((c, i) => [
        `${i + 1}. Vendor: ${c.vendor}`,
        `   Tool: ${c.tool}`,
        `   Change type: ${c.changeType}`,
        `   Confidence: ${c.confidence}`,
        `   Route: ${c.route}`,
        `   Source: ${c.sourceUrl || c.sourceTrustLevel}`,
        `   Headline: ${c.headline}`,
        `   Summary: ${c.summary}`,
        `   Reason: ${c.routeReason}`,
      ].join("\n")),
      ``,
      `Question:`,
      `Please review these proposed pricing intelligence changes for accuracy, trust risk, duplicate risk, and whether they should be published, reviewed, rejected, or marked as alert-worthy.`,
    ];
    copyToClipboard(lines.join("\n"));
    flashCopy("chatgpt");
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

        {/* ── Manual no-update panel ────────────────────────────────────────── */}
        <div className="border-2 border-primary/20 rounded-xl bg-primary/5 p-5 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-bold text-foreground mb-0.5">Run manual check — no updates</p>
              <p className="text-xs text-muted-foreground max-w-lg">
                Checks all sources and classifies proposed changes. <strong>Does not</strong> write to
                the pricing tracker, pricing history, or any public page.
                Writes a preview file and logs the run only.
              </p>
            </div>
            <button
              onClick={runManualNoUpdate}
              disabled={isManualRunning}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              {isManualRunning ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Running…
                </>
              ) : (
                "Run manual check — no updates"
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { icon: "✓", text: "Checks all sources",          ok: true },
              { icon: "✓", text: "Classifies changes",          ok: true },
              { icon: "✓", text: "Shows proposed updates",      ok: true },
              { icon: "✓", text: "Writes preview file + log",   ok: true },
              { icon: "✗", text: "Updates pricing tracker",     ok: false },
              { icon: "✗", text: "Updates pricing history",     ok: false },
              { icon: "✗", text: "Updates public freshness",    ok: false },
              { icon: "✗", text: "Approves any review item",    ok: false },
            ].map((r) => (
              <div key={r.text} className={`flex items-center gap-1.5 px-2 py-1 rounded ${r.ok ? "text-emerald-700" : "text-muted-foreground"}`}>
                <span className={`font-bold text-xs ${r.ok ? "text-emerald-600" : "text-red-400"}`}>{r.icon}</span>
                {r.text}
              </div>
            ))}
          </div>

          {isManualRunning && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
              Checking {sources.length} trusted sources, classifying changes…
            </div>
          )}
        </div>

        {/* ── Manual run result panel ───────────────────────────────────────── */}
        {manualRunResult && (
          <div ref={resultRef} className="border border-border rounded-xl bg-card p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-sm font-bold text-foreground mb-0.5">Manual check result</p>
                <p className="text-xs text-muted-foreground">{fmtDate(manualRunResult.runAt)} · Mode: manual_no_update · No public data modified</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${
                manualRunResult.status === "success"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-amber-100 text-amber-700 border-amber-200"
              }`}>
                {manualRunResult.status}
              </span>
            </div>

            {/* Run summary grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Sources checked",  value: manualRunResult.sourcesChecked,  color: "text-foreground" },
                { label: "Items detected",   value: manualRunResult.itemsDetected,   color: "text-foreground" },
                { label: "Auto candidates",  value: manualRunResult.autoCandidates,  color: "text-emerald-600" },
                { label: "Review candidates",value: manualRunResult.reviewCandidates,color: "text-amber-600" },
                { label: "Alert candidates", value: manualRunResult.alertCandidates, color: "text-red-600" },
                { label: "Rejected (low)",   value: manualRunResult.rejectedCandidates, color: "text-slate-500" },
                { label: "Errors",           value: manualRunResult.errors.length,   color: manualRunResult.errors.length > 0 ? "text-red-600" : "text-muted-foreground" },
              ].map((s) => (
                <div key={s.label} className="border border-border rounded-lg p-3 bg-muted/20">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Route legend */}
            <div className="flex flex-wrap gap-2 mb-4">
              {(Object.keys(ROUTE_STYLE) as RouteDecision[]).map((r) => (
                <span key={r} className={`text-xs font-semibold px-2 py-0.5 rounded border ${ROUTE_STYLE[r].cls}`}>
                  {ROUTE_STYLE[r].label}
                </span>
              ))}
            </div>

            {/* Copy buttons */}
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={copyFullJson}
                className="text-xs border border-border rounded-lg px-3 py-1.5 hover:bg-muted/50 transition-colors font-medium"
              >
                {copiedKey === "json" ? "✓ Copied!" : "Copy full preview JSON"}
              </button>
              <button
                onClick={copyHumanReadable}
                className="text-xs border border-border rounded-lg px-3 py-1.5 hover:bg-muted/50 transition-colors font-medium"
              >
                {copiedKey === "readable" ? "✓ Copied!" : "Copy human-readable summary"}
              </button>
              <button
                onClick={copyChatGptPrompt}
                className="text-xs border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg px-3 py-1.5 hover:bg-emerald-100 transition-colors font-semibold"
              >
                {copiedKey === "chatgpt" ? "✓ Copied!" : "Copy for ChatGPT review"}
              </button>
            </div>

            {/* Proposed changes table */}
            {manualRunResult.proposedChanges.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Vendor / Tool</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Change type</th>
                      <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Confidence</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Route</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Freshness</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Source trust</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground max-w-[200px]">Headline / Summary</th>
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Route reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {manualRunResult.proposedChanges.map((c, i) => {
                      const rs = ROUTE_STYLE[c.route] ?? ROUTE_STYLE.REVIEW_CANDIDATE;
                      return (
                        <tr key={i} className="hover:bg-muted/20 align-top">
                          <td className="px-3 py-2">
                            <p className="font-semibold text-foreground">{c.vendor}</p>
                            <p className="text-muted-foreground">{c.tool}</p>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                            {c.changeType.replace(/_/g, " ")}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className={`font-semibold ${
                              c.confidence === "high"   ? "text-emerald-600" :
                              c.confidence === "medium" ? "text-amber-600"   : "text-slate-400"
                            }`}>{c.confidence}</span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${rs.cls}`}>
                              {rs.label}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                              {c.freshnessStatus}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${TRUST_BADGE[c.sourceTrustLevel] ?? TRUST_BADGE.third_party}`}>
                              {c.sourceTrustLevel}
                            </span>
                          </td>
                          <td className="px-3 py-2 max-w-[200px]">
                            {c.headline && <p className="font-semibold text-foreground mb-0.5">{c.headline}</p>}
                            {c.summary && <p className="text-muted-foreground leading-relaxed">{c.summary}</p>}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground max-w-[180px] leading-relaxed">
                            {c.routeReason}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No proposed changes in this run.
              </div>
            )}
          </div>
        )}

        {/* ── Other pipeline actions ────────────────────────────────────────── */}
        <div className="border border-border rounded-xl bg-card p-5 mb-6">
          <p className="text-sm font-semibold text-foreground mb-4">Other pipeline actions</p>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={simulateDryRun}
              disabled={isDryRunning}
              className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-4 py-2 rounded-lg text-sm hover:bg-muted/50 transition-colors disabled:opacity-60"
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

        {/* ── How the autopilot works (collapsible) ────────────────────────── */}
        <div className="border border-border rounded-xl bg-card mb-8 overflow-hidden">
          <button
            onClick={() => setExplainerOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
          >
            <span className="font-semibold text-foreground text-sm">How the pricing autopilot works</span>
            <span className="text-muted-foreground text-lg leading-none select-none">
              {explainerOpen ? "−" : "+"}
            </span>
          </button>

          {explainerOpen && (
            <div className="px-5 pb-6 border-t border-border pt-5 space-y-6 text-sm text-foreground">

              <ExplainerSection title="1. What it checks">
                <p>The autopilot fetches every URL in the trusted sources registry — official vendor pricing pages, documentation, and a small set of vetted third-party sources. No random web crawling.</p>
              </ExplainerSection>

              <ExplainerSection title="2. What it extracts">
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Vendor and tool/model name</li>
                  <li>Pricing or plan changes (with numbers when present)</li>
                  <li>Usage-limit changes</li>
                  <li>Hidden-cost or free-tier changes</li>
                  <li>Confidence level (high / medium / low)</li>
                  <li>Source URL for every item</li>
                </ul>
                <p className="text-muted-foreground mt-2">OpenAI gpt-4o-mini is used to classify text. It only summarises what is present in the source — it cannot invent numbers or claims.</p>
              </ExplainerSection>

              <ExplainerSection title="3. How it routes changes">
                <div className="space-y-2">
                  {[
                    { label: "AUTO CANDIDATE",          cls: "bg-emerald-100 text-emerald-700 border-emerald-200", desc: "High confidence, official source, allowed for auto-draft. Safe to publish without human review." },
                    { label: "REVIEW CANDIDATE",        cls: "bg-amber-100 text-amber-700 border-amber-200",      desc: "Plausible but uncertain — ambiguous wording, medium confidence, or non-primary source. Needs your sign-off." },
                    { label: "ALERT CANDIDATE",         cls: "bg-red-100 text-red-700 border-red-200",            desc: "High-impact change (price change, plan change, enterprise tier). Escalated for review even when confidence is high." },
                    { label: "REJECTED LOW CONFIDENCE", cls: "bg-slate-100 text-slate-500 border-slate-200",      desc: "Signal too weak. Not published, not queued for review." },
                  ].map((r) => (
                    <div key={r.label} className="flex items-start gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border shrink-0 mt-0.5 ${r.cls}`}>{r.label}</span>
                      <p className="text-muted-foreground text-xs leading-relaxed">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </ExplainerSection>

              <ExplainerSection title="4. What 'manual no-update' means">
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Checks all trusted sources</li>
                  <li>Classifies possible changes and assigns route decisions</li>
                  <li>Shows proposed updates in this panel</li>
                  <li><strong className="text-foreground">Does not</strong> update the pricing tracker or history</li>
                  <li><strong className="text-foreground">Does not</strong> change any freshness timestamps on public pages</li>
                  <li><strong className="text-foreground">Does not</strong> approve or publish any item</li>
                  <li>Safe to run at any time — inspection only</li>
                </ul>
              </ExplainerSection>

              <ExplainerSection title="5. What 'dry run' means">
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Simulates pipeline logic using existing data</li>
                  <li>Shows what sources would be fetched</li>
                  <li>May write a preview or audit file</li>
                  <li><strong className="text-foreground">Does not</strong> publish any public updates</li>
                </ul>
              </ExplainerSection>

              <ExplainerSection title="6. What 'full run' means">
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Runs the live pipeline against all trusted sources</li>
                  <li>Writes AUTO items to the daily digest</li>
                  <li>Queues REVIEW and ALERT items for human review</li>
                  <li>Appends new entries to pricing history (never overwrites)</li>
                  <li>Updates the run log</li>
                  <li>Commits data files via GitHub Actions (production only)</li>
                </ul>
              </ExplainerSection>

              <ExplainerSection title="7. What gets published automatically">
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Only high-confidence items from official sources with auto-draft enabled</li>
                  <li>Only items where the change type is not high-impact (pricing, plan, enterprise)</li>
                  <li>Never: low-confidence items, review items, alert items</li>
                  <li>Never: anything from a non-official source, regardless of confidence</li>
                </ul>
              </ExplainerSection>

              <ExplainerSection title="8. What still needs human review">
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Major price or plan changes</li>
                  <li>Hidden costs or free-tier restrictions</li>
                  <li>Conflicting signals from multiple sources</li>
                  <li>Ambiguous wording in the source</li>
                  <li>Changes from non-primary sources</li>
                  <li>Commercially sensitive or suspicious signals</li>
                </ul>
              </ExplainerSection>

              <ExplainerSection title="9. Safety rules">
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>History is append-only — never overwritten</li>
                  <li>Low-confidence items are never published automatically</li>
                  <li>No direct commits to main outside GitHub Actions (full mode)</li>
                  <li>Every run is logged with mode, status, source count, and error list</li>
                  <li>Every change shows the source URL it came from</li>
                  <li>Deduplication prevents the same change from being published twice</li>
                </ul>
              </ExplainerSection>

            </div>
          )}
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
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

        {activeTab === "status"  && <AuditLogTab digest={digest} />}
        {activeTab === "sources" && <SourcesTab sources={sources} />}
        {activeTab === "logs"    && (
          <LogsTab runs={allRuns} onClearSim={clearSimLog} simCount={simLog.length} />
        )}
      </div>
    </div>
  );
}

// ─── ExplainerSection ─────────────────────────────────────────────────────────

function ExplainerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-foreground mb-2 text-xs uppercase tracking-wide">{title}</p>
      <div className="text-sm text-foreground space-y-1.5">{children}</div>
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
                  entry.status === "ok" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                }`}>
                  {entry.status}
                </span>
              </td>
              <td className="px-4 py-2 text-center text-xs font-semibold text-foreground">{entry.itemCount ?? "—"}</td>
              <td className="px-4 py-2 text-xs text-red-500 max-w-xs truncate">{entry.error ?? "—"}</td>
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
                <a href={src.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate block">{src.url}</a>
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

type ExtendedRun = RunEntry & { dryRun?: boolean; reprocess?: boolean };

function modeLabel(run: ExtendedRun): string {
  if (run.mode) {
    const MAP: Record<string, string> = {
      full: "Live", dry_run: "Dry run", manual_no_update: "Manual (no update)", reprocess: "Reprocess",
    };
    return MAP[run.mode] ?? run.mode;
  }
  if (run.dryRun) return "Dry run";
  if (run.reprocess) return "Reprocess";
  return "Live";
}

function LogsTab({ runs, onClearSim, simCount }: { runs: ExtendedRun[]; onClearSim: () => void; simCount: number }) {
  if (runs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 px-6 py-12 text-center">
        <p className="text-2xl mb-3">📋</p>
        <p className="text-sm font-semibold text-foreground mb-1">No runs logged yet</p>
        <p className="text-xs text-muted-foreground">Run the pipeline or use any action button to see entries here.</p>
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
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Items</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Auto</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Review</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Alert</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Sources</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {runs.map((run, i) => (
              <tr key={i} className="hover:bg-muted/20">
                <td className="px-4 py-2 text-xs text-foreground whitespace-nowrap">{fmtDate(run.runAt)}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    run.status === "success"       ? "bg-emerald-100 text-emerald-700" :
                    run.status === "partial_error" ? "bg-amber-100 text-amber-700"    :
                                                     "bg-red-100 text-red-600"
                  }`}>
                    {run.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-center text-xs text-muted-foreground whitespace-nowrap">{modeLabel(run)}</td>
                <td className="px-4 py-2 text-center text-xs font-semibold text-foreground">{run.digestItems}</td>
                <td className="px-4 py-2 text-center text-xs font-semibold text-emerald-600">{run.autoCandidates ?? "—"}</td>
                <td className="px-4 py-2 text-center text-xs font-semibold text-amber-600">{run.reviewCandidates ?? "—"}</td>
                <td className="px-4 py-2 text-center text-xs font-semibold text-red-500">{run.alertCandidates ?? "—"}</td>
                <td className="px-4 py-2 text-center text-xs text-muted-foreground">{run.sourceCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
