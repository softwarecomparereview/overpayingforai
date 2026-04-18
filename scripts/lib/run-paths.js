// scripts/lib/run-paths.js
// Versioned run-folder layout for audit outputs.
//
// Every audit run writes into:
//   out/audits/<runId>/site/...
//   out/audits/<runId>/decision/...
//
// runId format: YYYY-MM-DD_HH-mm-ss (local time, filesystem-safe)
//
// Both audit scripts can either:
//   - auto-generate a fresh runId (default), OR
//   - share an existing runId via --runId=<...> (so site + decision land in one folder)
//
// Latest-run pointers are written as plain text files (NOT symlinks) for
// maximum portability on Replit/Linux containers:
//   out/audits/latest-run        -> just the runId string
//   out/audits/latest-site       -> absolute path to site/ folder of latest site-audit run
//   out/audits/latest-decision   -> absolute path to decision/ folder of latest decision-audit run

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, resolve } from "node:path";
import { ensureDir } from "./utils.js";

/**
 * Filesystem-safe local timestamp: YYYY-MM-DD_HH-mm-ss
 */
export function nowRunId(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
  );
}

/** Validate user-supplied runId. Falls back to nowRunId() if invalid. */
export function normalizeRunId(input) {
  if (!input) return nowRunId();
  const s = String(input).trim();
  if (/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/.test(s)) return s;
  // Allow alphanumeric + - + _ for flexibility, but warn callers via return value.
  if (/^[A-Za-z0-9_\-]{1,64}$/.test(s)) return s;
  return nowRunId();
}

/**
 * Build the canonical layout for a runId.
 * No directories are created here — call ensureRunDirs(...).
 */
export function resolveRunPaths(runId, projectRoot = process.cwd()) {
  const id = normalizeRunId(runId);
  const auditsRoot = resolve(projectRoot, "out", "audits");
  const runDir = join(auditsRoot, id);
  const siteRoot = join(runDir, "site");
  const decisionRoot = join(runDir, "decision");
  return {
    runId: id,
    auditsRoot,
    runDir,
    metaPath: join(runDir, "run-meta.json"),
    site: {
      root: siteRoot,
      reports: join(siteRoot, "reports"),
      screensFull: join(siteRoot, "screenshots", "full"),
      screensHero: join(siteRoot, "screenshots", "hero"),
    },
    decision: {
      root: decisionRoot,
      screens: join(decisionRoot, "screenshots"),
    },
    pointers: {
      latestRun: join(auditsRoot, "latest-run"),
      latestSite: join(auditsRoot, "latest-site"),
      latestDecision: join(auditsRoot, "latest-decision"),
    },
  };
}

/** Ensure the directories needed for the requested kind ("site" | "decision" | "all"). */
export function ensureRunDirs(paths, kind = "all") {
  ensureDir(paths.auditsRoot);
  ensureDir(paths.runDir);
  if (kind === "site" || kind === "all") {
    ensureDir(paths.site.root);
    ensureDir(paths.site.reports);
    ensureDir(paths.site.screensFull);
    ensureDir(paths.site.screensHero);
  }
  if (kind === "decision" || kind === "all") {
    ensureDir(paths.decision.root);
    ensureDir(paths.decision.screens);
  }
}

/**
 * Update the latest-* pointer files. Plain text (one absolute path per file).
 * `kinds` controls which pointers to refresh: any subset of ["run","site","decision"].
 */
export function updateLatestPointers(paths, kinds = ["run"]) {
  ensureDir(paths.auditsRoot);
  if (kinds.includes("run")) {
    writeFileSync(paths.pointers.latestRun, paths.runId + "\n", "utf8");
  }
  if (kinds.includes("site")) {
    writeFileSync(paths.pointers.latestSite, paths.site.root + "\n", "utf8");
  }
  if (kinds.includes("decision")) {
    writeFileSync(paths.pointers.latestDecision, paths.decision.root + "\n", "utf8");
  }
}

/** Read a plain-text pointer file. Returns null if missing. */
export function readPointer(path) {
  try {
    if (!existsSync(path)) return null;
    return readFileSync(path, "utf8").trim() || null;
  } catch {
    return null;
  }
}

/** Best-effort git info — branch + short commit. Empty strings if unavailable. */
export function getGitInfo() {
  const exec = (cmd) => {
    try {
      return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    } catch { return ""; }
  };
  return {
    branch: exec("git rev-parse --abbrev-ref HEAD"),
    commit: exec("git rev-parse --short HEAD"),
    commitFull: exec("git rev-parse HEAD"),
  };
}

/**
 * Read-modify-write the run-meta.json file safely. Multiple scripts can
 * append themselves to `scripts` without clobbering each other's entries.
 *
 * partial shape: { script: "site-audit.js", target, args, ... }
 */
export function updateRunMeta(paths, partial) {
  ensureDir(paths.runDir);
  let current = null;
  try {
    if (existsSync(paths.metaPath)) {
      current = JSON.parse(readFileSync(paths.metaPath, "utf8"));
    }
  } catch { current = null; }

  if (!current || typeof current !== "object") {
    const git = getGitInfo();
    current = {
      runId: paths.runId,
      createdAt: new Date().toISOString(),
      branch: git.branch,
      commit: git.commit,
      commitFull: git.commitFull,
      runDir: paths.runDir,
      scripts: [],
    };
  }

  current.updatedAt = new Date().toISOString();

  if (partial && partial.script) {
    const entry = {
      script: partial.script,
      ranAt: new Date().toISOString(),
      target: partial.target || null,
      args: partial.args || {},
      ...(partial.extra || {}),
    };
    // Dedupe: if same script appears already, replace it (latest wins).
    current.scripts = (current.scripts || []).filter((s) => s.script !== partial.script);
    current.scripts.push(entry);
  }

  writeFileSync(paths.metaPath, JSON.stringify(current, null, 2), "utf8");
  return current;
}
