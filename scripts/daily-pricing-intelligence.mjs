/**
 * daily-pricing-intelligence.mjs
 *
 * Fetches each trusted source URL, extracts visible text, sends it to OpenAI
 * for classification/summarisation, and writes output files.
 *
 * Modes (pass via --mode <mode>):
 *   full              — fetch + classify + write digest + append history + log run (default)
 *   dry_run           — fetch + classify + log only, no public files written
 *   manual_no_update  — fetch + classify + dedupe + write out/manual-autopilot-preview.json
 *                       + append run log. Does NOT touch digest, history, or freshness.
 *   reprocess         — re-route existing digest items without re-fetching. Append log only.
 *
 * Guardrails (all modes):
 *   - Never treats OpenAI output as source of truth — it classifies only
 *   - Always rejects items with no source URL
 *   - Never overwrites pricing-history.json — append only (full mode only)
 *   - Deduplicates by vendor+tool+changeType+sourceUrl+detectedDate
 *   - Fails gracefully if OPENAI_API_KEY is missing
 */

import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const SOURCES_PATH    = path.join(REPO_ROOT, "data", "trusted-pricing-sources.json");
const NEWS_PATH       = path.join(REPO_ROOT, "artifacts", "overpaying-for-ai", "src", "data", "ai-pricing-news.json");
const HISTORY_PATH    = path.join(REPO_ROOT, "artifacts", "overpaying-for-ai", "src", "data", "pricing-history.json");
const RUN_LOG_PATH    = path.join(REPO_ROOT, "artifacts", "overpaying-for-ai", "src", "data", "pipeline-run-log.json");
const PREVIEW_PATH    = path.join(REPO_ROOT, "out", "manual-autopilot-preview.json");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const TODAY   = new Date().toISOString().slice(0, 10);
const NOW_ISO = new Date().toISOString();

// ─── Parse CLI args ───────────────────────────────────────────────────────────

const VALID_MODES = ["full", "dry_run", "manual_no_update", "reprocess"];

function parseMode() {
  const idx = process.argv.indexOf("--mode");
  if (idx !== -1 && process.argv[idx + 1]) {
    const m = process.argv[idx + 1];
    if (!VALID_MODES.includes(m)) {
      err(`Unknown mode: "${m}". Valid modes: ${VALID_MODES.join(", ")}`);
      process.exit(1);
    }
    return m;
  }
  return "full";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) {
  process.stdout.write(`[${new Date().toISOString()}] ${msg}\n`);
}

function err(msg) {
  process.stderr.write(`[ERROR] ${msg}\n`);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function fetchUrl(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: timeoutMs, headers: { "User-Agent": "OverpayingForAI-PricingBot/1.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location, timeoutMs).then(resolve).catch(reject);
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      res.on("error", reject);
    });
    req.on("timeout", () => { req.destroy(); reject(new Error(`Timeout fetching ${url}`)); });
    req.on("error", reject);
  });
}

function extractText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000);
}

function callOpenAI(systemPrompt, userContent) {
  const body = JSON.stringify({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf8");
        if (res.statusCode !== 200) {
          return reject(new Error(`OpenAI API error ${res.statusCode}: ${raw.slice(0, 300)}`));
        }
        try {
          const parsed = JSON.parse(raw);
          const content = parsed.choices?.[0]?.message?.content;
          resolve(JSON.parse(content));
        } catch (e) {
          reject(new Error(`Failed to parse OpenAI response: ${e.message}`));
        }
      });
      res.on("error", reject);
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ─── Classification system prompt ─────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a pricing intelligence classifier for an AI cost-comparison site.

You will receive extracted text from a trusted source URL about AI tools/products.
Your job is to identify any pricing, plan, model, or feature changes mentioned.

Return STRICT JSON only — no markdown, no prose.

Schema:
{
  "items": [
    {
      "vendor": "string — e.g. OpenAI, Anthropic, Google",
      "tool": "string — specific product e.g. GPT-4o, Claude 3.5",
      "changeType": "pricing_change | plan_change | model_launch | free_tier_change | enterprise_change | general_news",
      "summary": "string — 1-3 sentence factual summary. Include numbers where mentioned.",
      "headline": "string — concise headline (≤12 words)",
      "confidence": "high | medium | low",
      "requiresReview": true | false,
      "notes": "string — optional extra context or caveats"
    }
  ]
}

Classification rules:
- confidence=high only when the text is from an official vendor source AND mentions a clear, specific price or plan change with numbers
- confidence=medium when the source is official but the change is described ambiguously
- confidence=low for third-party sources or unclear signals
- requiresReview=false ONLY when confidence=high AND the source is marked as official in the prompt
- requiresReview=true for everything else
- If no relevant pricing/plan/model changes are found, return { "items": [] }
- Never invent numbers or claims not present in the source text
- Always base summaries strictly on the provided text`;

// ─── Routing logic ────────────────────────────────────────────────────────────

/**
 * Assign a route decision to each classified item.
 * Returns one of: AUTO_CANDIDATE | REVIEW_CANDIDATE | ALERT_CANDIDATE | REJECTED_LOW_CONFIDENCE
 */
function routeItem(item) {
  const { confidence, requiresReview, sourceTrustLevel, changeType } = item;

  if (confidence === "low") return "REJECTED_LOW_CONFIDENCE";

  const isHighImpact = ["pricing_change", "plan_change", "enterprise_change"].includes(changeType);

  if (confidence === "high" && !requiresReview && sourceTrustLevel === "official") {
    if (isHighImpact) return "ALERT_CANDIDATE"; // Even auto items with major price changes get escalated
    return "AUTO_CANDIDATE";
  }

  if (isHighImpact || sourceTrustLevel !== "official") return "ALERT_CANDIDATE";

  return "REVIEW_CANDIDATE";
}

// ─── Deduplication ────────────────────────────────────────────────────────────

function makeDedupeKey(item) {
  return [
    (item.vendor || "").toLowerCase(),
    (item.tool || "").toLowerCase(),
    (item.changeType || ""),
    (item.sourceUrl || ""),
    (item.detectedDate || ""),
  ].join("|");
}

// ─── Append run log ───────────────────────────────────────────────────────────

function appendRunLog(entry) {
  const existing = readJson(RUN_LOG_PATH) ?? { runs: [], lastRunAt: null, lastRunStatus: null };
  const updated = {
    runs: [...(existing.runs ?? []).slice(-49), entry],
    lastRunAt: entry.runAt,
    lastRunStatus: entry.status,
  };
  writeJson(RUN_LOG_PATH, updated);
}

// ─── Mode: full / dry_run / manual_no_update ──────────────────────────────────

async function runFetchClassify(sources, existingHistory) {
  const existingKeys = new Set((existingHistory ?? []).map(makeDedupeKey));
  const digestItems = [];
  const newHistoryEntries = [];
  const auditLog = [];
  const errors = [];

  for (const source of sources) {
    const { vendor, tool, url, trustLevel, allowedForAutoDraft } = source;
    log(`Fetching: ${vendor} / ${tool} — ${url}`);

    let rawHtml;
    try {
      rawHtml = await fetchUrl(url);
    } catch (fetchErr) {
      err(`Failed to fetch ${url}: ${fetchErr.message}`);
      auditLog.push({ url, status: "fetch_error", error: fetchErr.message });
      errors.push(`fetch_error: ${url}`);
      continue;
    }

    const visibleText = extractText(rawHtml);
    log(`  Extracted ${visibleText.length} chars of text`);

    const userContent = `Source URL: ${url}
Trust level: ${trustLevel}
Allowed for auto-draft: ${allowedForAutoDraft}
Vendor: ${vendor}
Tool: ${tool}

Extracted page text:
${visibleText}`;

    let classification;
    try {
      classification = await callOpenAI(SYSTEM_PROMPT, userContent);
    } catch (aiErr) {
      err(`OpenAI classification failed for ${url}: ${aiErr.message}`);
      auditLog.push({ url, status: "ai_error", error: aiErr.message });
      errors.push(`ai_error: ${url}`);
      continue;
    }

    const items = classification?.items ?? [];
    log(`  Classified ${items.length} item(s)`);
    auditLog.push({ url, status: "ok", itemCount: items.length });

    for (const item of items) {
      if (!url) continue;
      if (!["high", "medium", "low"].includes(item.confidence)) continue;

      const isOfficial = trustLevel === "official";
      const requiresReview = !(item.confidence === "high" && isOfficial && allowedForAutoDraft);

      const enriched = {
        vendor: item.vendor || vendor,
        tool: item.tool || tool,
        changeType: item.changeType || "general_news",
        summary: item.summary || "",
        headline: item.headline || "",
        confidence: item.confidence,
        requiresReview,
        sourceUrl: url,
        sourceTrustLevel: trustLevel,
        detectedDate: TODAY,
        freshnessTimestamp: NOW_ISO,
        freshnessStatus: "live",
        notes: item.notes || "",
        route: routeItem({ ...item, requiresReview, sourceTrustLevel: trustLevel }),
        routeReason: buildRouteReason({ ...item, requiresReview, sourceTrustLevel: trustLevel }),
      };

      digestItems.push(enriched);

      const key = makeDedupeKey(enriched);
      if (!existingKeys.has(key)) {
        newHistoryEntries.push(enriched);
        existingKeys.add(key);
      } else {
        log(`  Skipping duplicate: ${key}`);
      }
    }
  }

  return { digestItems, newHistoryEntries, auditLog, errors };
}

function buildRouteReason(item) {
  const { confidence, requiresReview, sourceTrustLevel, changeType } = item;
  if (confidence === "low") return "Confidence too low to publish";
  const isHighImpact = ["pricing_change", "plan_change", "enterprise_change"].includes(changeType);
  if (confidence === "high" && !requiresReview && sourceTrustLevel === "official") {
    if (isHighImpact) return "High confidence official source but high-impact change — escalated for alert";
    return "High confidence from official source, allowed for auto-draft";
  }
  if (isHighImpact) return "High-impact change type requires human review";
  if (sourceTrustLevel !== "official") return "Non-official source — always requires review";
  return "Medium confidence or missing auto-draft permission";
}

// ─── Mode implementations ─────────────────────────────────────────────────────

async function runFull(sources, existingHistory) {
  log("Mode: full — fetching, classifying, writing digest + history");

  const { digestItems, newHistoryEntries, auditLog, errors } = await runFetchClassify(sources, existingHistory);

  const digest = {
    lastChecked: TODAY,
    generatedAt: NOW_ISO,
    sourceCount: sources.length,
    auditLog,
    items: digestItems,
  };
  writeJson(NEWS_PATH, digest);
  log(`Wrote ${digestItems.length} item(s) to daily digest: ${NEWS_PATH}`);

  if (newHistoryEntries.length > 0) {
    const updatedHistory = [...existingHistory, ...newHistoryEntries];
    writeJson(HISTORY_PATH, updatedHistory);
    log(`Appended ${newHistoryEntries.length} new entry/entries to history: ${HISTORY_PATH}`);
  } else {
    log("No new history entries to append.");
  }

  appendRunLog({
    runAt: NOW_ISO,
    mode: "full",
    status: errors.length > 0 ? "partial_error" : "success",
    digestItems: digestItems.length,
    newHistoryEntries: newHistoryEntries.length,
    sourceCount: sources.length,
    errors,
    auditLog,
  });

  log(`Pipeline complete. ${digestItems.length} digest items, ${newHistoryEntries.length} new history entries`);
}

async function runDryRun(sources, existingHistory) {
  log("Mode: dry_run — fetching and classifying only, no public files written");

  const { digestItems, auditLog, errors } = await runFetchClassify(sources, existingHistory);

  log(`[DRY RUN] Would write ${digestItems.length} item(s) to digest`);
  log(`[DRY RUN] No files modified.`);

  appendRunLog({
    runAt: NOW_ISO,
    mode: "dry_run",
    status: "success",
    digestItems: digestItems.length,
    newHistoryEntries: 0,
    sourceCount: sources.length,
    errors,
    auditLog,
  });

  log("Dry run complete.");
}

async function runManualNoUpdate(sources, existingHistory) {
  log("Mode: manual_no_update — inspect only, no public files written");

  const { digestItems, auditLog, errors } = await runFetchClassify(sources, existingHistory);

  const autoCandidates      = digestItems.filter((i) => i.route === "AUTO_CANDIDATE");
  const reviewCandidates    = digestItems.filter((i) => i.route === "REVIEW_CANDIDATE");
  const alertCandidates     = digestItems.filter((i) => i.route === "ALERT_CANDIDATE");
  const rejectedCandidates  = digestItems.filter((i) => i.route === "REJECTED_LOW_CONFIDENCE");

  const preview = {
    runAt: NOW_ISO,
    mode: "manual_no_update",
    status: errors.length > 0 ? "partial_error" : "success",
    sourcesChecked: sources.length,
    itemsDetected: digestItems.length,
    autoCandidates: autoCandidates.length,
    reviewCandidates: reviewCandidates.length,
    alertCandidates: alertCandidates.length,
    rejectedCandidates: rejectedCandidates.length,
    errors,
    auditLog,
    proposedChanges: digestItems,
  };

  writeJson(PREVIEW_PATH, preview);
  log(`Wrote preview to: ${PREVIEW_PATH}`);

  appendRunLog({
    runAt: NOW_ISO,
    mode: "manual_no_update",
    status: preview.status,
    digestItems: digestItems.length,
    newHistoryEntries: 0,
    sourceCount: sources.length,
    autoCandidates: autoCandidates.length,
    reviewCandidates: reviewCandidates.length,
    alertCandidates: alertCandidates.length,
    rejectedCandidates: rejectedCandidates.length,
    errors,
    auditLog,
  });

  log(`Manual no-update complete. Preview written. No public data modified.`);
  log(`Summary: ${autoCandidates.length} auto, ${reviewCandidates.length} review, ${alertCandidates.length} alert, ${rejectedCandidates.length} rejected`);
}

async function runReprocess(sources, existingHistory) {
  log("Mode: reprocess — re-routing existing digest items, no re-fetch");

  const existingDigest = readJson(NEWS_PATH);
  if (!existingDigest || !existingDigest.items) {
    err("No existing digest found to reprocess.");
    process.exit(1);
  }

  const rerouted = existingDigest.items.map((item) => ({
    ...item,
    route: routeItem(item),
    routeReason: buildRouteReason(item),
  }));

  log(`Re-routed ${rerouted.length} existing item(s).`);

  appendRunLog({
    runAt: NOW_ISO,
    mode: "reprocess",
    status: "success",
    digestItems: rerouted.length,
    newHistoryEntries: 0,
    sourceCount: sources.length,
    auditLog: [],
    errors: [],
  });

  log("Reprocess complete. Run log updated.");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const mode = parseMode();
  log(`Daily pricing intelligence pipeline starting — mode: ${mode}`);

  if (!OPENAI_API_KEY && mode !== "reprocess") {
    err("OPENAI_API_KEY environment variable is not set. Cannot proceed.");
    err("Set OPENAI_API_KEY as a secret in GitHub Actions or your local environment.");
    process.exit(1);
  }

  if (!fs.existsSync(SOURCES_PATH)) {
    err(`Trusted sources file not found: ${SOURCES_PATH}`);
    process.exit(1);
  }

  const sources = readJson(SOURCES_PATH);
  log(`Loaded ${sources.length} trusted source(s)`);

  const existingHistory = readJson(HISTORY_PATH) ?? [];
  log(`Loaded ${existingHistory.length} existing history entries for deduplication`);

  switch (mode) {
    case "full":           await runFull(sources, existingHistory); break;
    case "dry_run":        await runDryRun(sources, existingHistory); break;
    case "manual_no_update": await runManualNoUpdate(sources, existingHistory); break;
    case "reprocess":      await runReprocess(sources, existingHistory); break;
  }
}

main().catch((e) => {
  err(`Unhandled error: ${e.message}`);
  process.exit(1);
});
