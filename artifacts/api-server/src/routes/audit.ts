/**
 * Admin audit runner routes
 *
 * Triggers the existing site-audit.js script against the live production domain,
 * stores results under out/audits/<runId>/, zips on completion, and serves the
 * run list + zip download to authorized admin clients.
 *
 * Auth: x-admin-key header must equal ADMIN_KEY.
 *
 * Endpoints (all under /api/admin/audit):
 *   POST /run                      — start a new audit run
 *   GET  /runs                     — list all past runs (newest first)
 *   GET  /runs/:runId/summary      — return the site summary.md as text
 *   GET  /runs/:runId/download     — stream the run's zip file
 */

import { Router, Request, Response, NextFunction } from "express";
import { spawn } from "node:child_process";
import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  statSync,
  createWriteStream,
} from "node:fs";
import { resolve, join } from "node:path";
import archiver from "archiver";

const router: Router = Router();

// ── Config ────────────────────────────────────────────────────────────────────

const ADMIN_KEY = "refresh";
// __dirname is set by the esbuild banner to point at dist/
// → resolve 3 levels up: dist → api-server → artifacts → workspace root
const PROJECT_ROOT = resolve(__dirname, "..", "..", "..");
const AUDITS_DIR = join(PROJECT_ROOT, "out", "audits");
const SCRIPTS_DIR = join(PROJECT_ROOT, "scripts");

const RUN_ID_RE = /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/;
const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes between runs

// ── In-memory run state ───────────────────────────────────────────────────────

interface ActiveRun {
  runId: string;
  startedAt: string;
  mode: "quick" | "full";
}

let activeRun: ActiveRun | null = null;
let lastRunCompletedAt: number = 0;

// ── Helpers ───────────────────────────────────────────────────────────────────

function authGuard(req: Request, res: Response, next: NextFunction): void {
  if (req.headers["x-admin-key"] !== ADMIN_KEY) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}

function nowRunId(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
  );
}

function runDir(runId: string): string {
  return join(AUDITS_DIR, runId);
}

function statusPath(runId: string): string {
  return join(runDir(runId), "run-status.json");
}

function zipPath(runId: string): string {
  return join(runDir(runId), `${runId}.zip`);
}

function writeRunStatus(
  runId: string,
  status: "running" | "complete" | "failed",
  extra?: Record<string, unknown>,
): void {
  try {
    const dir = runDir(runId);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const data = JSON.stringify({ status, updatedAt: new Date().toISOString(), ...extra }, null, 2);
    writeFileSync(statusPath(runId), data, "utf8");
  } catch {
    // best-effort
  }
}

function readRunStatus(runId: string): { status: string; [k: string]: unknown } | null {
  try {
    const p = statusPath(runId);
    if (!existsSync(p)) return null;
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function readRunMeta(runId: string): Record<string, unknown> | null {
  try {
    const p = join(runDir(runId), "run-meta.json");
    if (!existsSync(p)) return null;
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function countScreenshots(runId: string): number {
  try {
    const screensDir = join(runDir(runId), "site", "screenshots", "full");
    if (!existsSync(screensDir)) return 0;
    return readdirSync(screensDir).filter((f) => f.endsWith(".png")).length;
  } catch {
    return 0;
  }
}

function readIssueSummary(runId: string): { issueCount: number } | null {
  try {
    const p = join(runDir(runId), "site", "reports", "issues.json");
    if (!existsSync(p)) return null;
    const raw = JSON.parse(readFileSync(p, "utf8"));
    return { issueCount: raw.issueCount ?? (raw.issues ?? []).length };
  } catch {
    return null;
  }
}

function listRuns(): Array<Record<string, unknown>> {
  try {
    if (!existsSync(AUDITS_DIR)) return [];
    return readdirSync(AUDITS_DIR)
      .filter((name) => RUN_ID_RE.test(name))
      .filter((name) => statSync(join(AUDITS_DIR, name)).isDirectory())
      .sort()
      .reverse()
      .map((runId) => {
        const meta = readRunMeta(runId);
        const statusInfo = readRunStatus(runId);
        const screenshotCount = countScreenshots(runId);
        const issueSummary = readIssueSummary(runId);
        const hasZip = existsSync(zipPath(runId));
        const isActive = activeRun?.runId === runId;

        let status = statusInfo?.status ?? "unknown";
        if (isActive) status = "running";

        const mode = (statusInfo?.mode as string) ?? (meta as Record<string, unknown> | null)?.mode ?? "unknown";

        return {
          runId,
          status,
          mode,
          domain: "https://overpayingforai.com",
          startedAt: (statusInfo?.startedAt as string) ?? null,
          completedAt: (statusInfo?.completedAt as string) ?? null,
          failureReason: (statusInfo?.failureReason as string) ?? null,
          screenshotCount,
          issueCount: issueSummary?.issueCount ?? null,
          hasZip,
          hasSummary: existsSync(join(runDir(runId), "site", "reports", "summary.md")),
        };
      });
  } catch {
    return [];
  }
}

async function createZip(runId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const dir = runDir(runId);
    const out = zipPath(runId);
    const output = createWriteStream(out);
    const archive = archiver("zip", { zlib: { level: 6 } });

    output.on("close", resolve);
    output.on("error", reject);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(dir, runId, (entry) => {
      // Exclude the zip file itself from being zipped
      if (entry.name.endsWith(".zip")) return false;
      return entry;
    });
    archive.finalize();
  });
}

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/admin/audit/run
router.post("/run", authGuard, (req: Request, res: Response): void => {
  if (activeRun) {
    res.status(409).json({
      error: "run_in_progress",
      message: "An audit is already running.",
      runId: activeRun.runId,
    });
    return;
  }

  const now = Date.now();
  if (lastRunCompletedAt > 0 && now - lastRunCompletedAt < COOLDOWN_MS) {
    const remainingSec = Math.ceil((COOLDOWN_MS - (now - lastRunCompletedAt)) / 1000);
    res.status(429).json({
      error: "cooldown",
      message: `Please wait ${remainingSec}s before starting another run.`,
      remainingSec,
    });
    return;
  }

  const mode: "quick" | "full" = req.body?.mode === "full" ? "full" : "quick";
  const runId = nowRunId();
  const dir = runDir(runId);
  mkdirSync(dir, { recursive: true });

  const startedAt = new Date().toISOString();
  writeRunStatus(runId, "running", { mode, startedAt });

  activeRun = { runId, startedAt, mode };

  // Build args for site-audit.js
  const scriptArgs: string[] = [];
  if (mode === "quick") {
    scriptArgs.push("--maxPages=15");
  } else {
    scriptArgs.push("--maxPages=100");
  }
  scriptArgs.push(`--runId=${runId}`);
  scriptArgs.push("--headless=true");
  scriptArgs.push("--seeds=https://overpayingforai.com/");

  const child = spawn(
    "node",
    [join(SCRIPTS_DIR, "site-audit.js"), ...scriptArgs],
    {
      cwd: PROJECT_ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NODE_ENV: "production" },
    },
  );

  const logLines: string[] = [];
  child.stdout?.on("data", (chunk: Buffer) => {
    logLines.push(chunk.toString());
  });
  child.stderr?.on("data", (chunk: Buffer) => {
    logLines.push("[stderr] " + chunk.toString());
  });

  child.on("close", async (code: number | null) => {
    const completedAt = new Date().toISOString();
    lastRunCompletedAt = Date.now();
    activeRun = null;

    if (code === 0) {
      // Write log file
      try {
        writeFileSync(join(dir, "audit-log.txt"), logLines.join(""), "utf8");
      } catch {}
      // Generate zip
      try {
        await createZip(runId);
        writeRunStatus(runId, "complete", { mode, startedAt, completedAt });
      } catch (zipErr) {
        writeRunStatus(runId, "complete", {
          mode,
          startedAt,
          completedAt,
          zipError: String(zipErr),
        });
      }
    } else {
      try {
        writeFileSync(join(dir, "audit-log.txt"), logLines.join(""), "utf8");
      } catch {}
      writeRunStatus(runId, "failed", {
        mode,
        startedAt,
        completedAt,
        failureReason: `Process exited with code ${code}`,
      });
    }
  });

  child.on("error", (err: Error) => {
    const completedAt = new Date().toISOString();
    lastRunCompletedAt = Date.now();
    activeRun = null;
    writeRunStatus(runId, "failed", {
      mode,
      startedAt,
      completedAt,
      failureReason: err.message,
    });
  });

  res.status(202).json({
    runId,
    mode,
    startedAt,
    message: `Audit started (${mode} mode). Poll /api/admin/audit/runs for status.`,
  });
});

// GET /api/admin/audit/runs
router.get("/runs", authGuard, (_req: Request, res: Response): void => {
  const runs = listRuns();
  res.json({ runs, activeRunId: activeRun?.runId ?? null });
});

// GET /api/admin/audit/runs/:runId/summary
router.get("/runs/:runId/summary", authGuard, (req: Request, res: Response): void => {
  const { runId } = req.params;
  if (!RUN_ID_RE.test(runId)) {
    res.status(400).json({ error: "invalid_run_id" });
    return;
  }
  const summaryPath = join(runDir(runId), "site", "reports", "summary.md");
  if (!existsSync(summaryPath)) {
    res.status(404).json({ error: "summary_not_found" });
    return;
  }
  const text = readFileSync(summaryPath, "utf8");
  res.type("text/plain").send(text);
});

// GET /api/admin/audit/runs/:runId/download
router.get("/runs/:runId/download", authGuard, async (req: Request, res: Response): Promise<void> => {
  const { runId } = req.params;
  if (!RUN_ID_RE.test(runId)) {
    res.status(400).json({ error: "invalid_run_id" });
    return;
  }
  const dir = runDir(runId);
  if (!existsSync(dir)) {
    res.status(404).json({ error: "run_not_found" });
    return;
  }

  const zip = zipPath(runId);

  // Regenerate zip if missing (e.g. for older runs without it)
  if (!existsSync(zip)) {
    try {
      await createZip(runId);
    } catch (err) {
      res.status(500).json({ error: "zip_failed", message: String(err) });
      return;
    }
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename="${runId}_audit.zip"`);
  const { createReadStream } = await import("node:fs");
  createReadStream(zip).pipe(res);
});

export default router;
